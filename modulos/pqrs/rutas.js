const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
const cargarEvidencia = upload.single('evidencia');

// Rutas protegidas: permitido para todos los roles autenticados
router.get('/', verificarJWT, verificarRol('administrador', 'vigilante', 'propietario', 'arrendatario'), todosPqrs);
// Crear PQRS: cualquier usuario autenticado
router.post('/', verificarJWT, cargarEvidencia, agregarPqrs);
// Actualizar estado: solo admin
router.put('/', verificarJWT, verificarRol('administrador'), actualizarEstadoPqrs);
// Eliminar: solo admin
router.delete('/:id', verificarJWT, verificarRol('administrador'), eliminarPqrs);
// Consultar PQRS por propietario: cualquier usuario autenticado
router.get('/propietario/:identificacion', verificarJWT, consultarPqrsPropietario);

async function todosPqrs(req, res, next) {
    try {
        const items = await controlador.todosPqrs();
        const host = `${req.protocol}://${req.get('host')}`;

        const itemsConAdjuntos = items.map(item => {
            return {
                ...item,
                // 🌟 ASEGURAMOS QUE SE INCLUYA EN EL JSON:
                numeroApartamento: item.numeroApartamento || null,
                evidenciaUrl: item.evidencia ? `${host}/modulos/pqrs/uploads/${item.evidencia}` : null
            };
        });

        console.log("Se procesaron las PQRS de forma exitosa");
        respuesta.success(req, res, itemsConAdjuntos, 200);
    } catch (err) {
        next(err);
    }
}

async function agregarPqrs(req, res, next) {
    try {
        console.log('Datos de PQRS recibidos:', req.body);
        
        if (req.file) {
            req.body.evidencia = req.file.filename;
        }

        if (!req.body.estado) {
            req.body.estado = 'Pendiente';
        }

        await controlador.agregarPqrs(req.body);
        respuesta.success(req, res, 'PQRS radicada con éxito', 201);
    } catch (err) {
        console.error("Error en agregarPqrs:", err);
        next(err);
    }
}

async function actualizarEstadoPqrs(req, res, next) {
    try {const estadosPermitidos = ['Pendiente', 'Resuelto'];
        if (!estadosPermitidos.includes(req.body.estado)) {
            return respuesta.error(req, res, "Estado no válido. Debe ser 'Pendiente' o 'Resuelto'", 400);
        }

        await controlador.actualizarEstadoPqrs(req.body);
        respuesta.success(req, res, 'Estado de la PQRS actualizado con éxito', 200);
    } catch (err) {
        next(err);
    }
}

async function consultarPqrsPropietario(req, res, next) {
    try {
        const identificacion = req.params.identificacion;
        
        // Llamamos al controlador pasándole el parámetro de filtrado
        const items = await controlador.pqrsPorPropietario(identificacion);
        const host = `${req.protocol}://${req.get('host')}`;

        // Mapeamos asegurando traer TODOS los campos crudos (incluyendo numeroApartamento)
        const itemsConAdjuntos = items.map(item => {
            return {
                idPqrs: item.idPqrs,
                fechaCreacion: item.fechaCreacion,
                idUsuario: item.idUsuario,
                tipo: item.tipo,
                descripcion: item.descripcion,
                evidencia: item.evidencia,
                estado: item.estado,
                respuestaPqrs: item.respuestaPqrs,
                fechaRespuesta: item.fechaRespuesta || null,
                // 🌟 FORZAMOS LA INCLUSIÓN AQUÍ:
                numeroApartamento: item.numeroApartamento || null, 
                evidenciaUrl: item.evidencia ? `${host}/modulos/pqrs/uploads/${item.evidencia}` : null
            };
        });

        respuesta.success(req, res, itemsConAdjuntos, 200);
    } catch (err) {
        next(err);
    }
}


async function eliminarPqrs(req, res, next) {
    try {
      await controlador.eliminarPqrs(req.params.id);
        respuesta.success(req, res, 'PQRS eliminada con éxito', 200);
    } catch (err) {
        console.error("Error en eliminarPqrs:", err);
        next(err);
    }
}
module.exports = router;