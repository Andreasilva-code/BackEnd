const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
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

router.get('/', todosPqrs);
router.post('/', cargarEvidencia, agregarPqrs);
router.put('/', actualizarEstadoPqrs);
router.delete('/:id', eliminarPqrs);
router.get('/propietario/:identificacion', consultarPqrsPropietario);

async function todosPqrs(req, res, next) {
    try {
        const items = await controlador.todosPqrs();
        const host = `${req.protocol}://${req.get('host')}`;

        const itemsConAdjuntos = items.map(item => {
            return {
                ...item,
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
    try {const estadosPermitidos = ['Pendiente', 'En Proceso', 'Resuelto'];
        if (!estadosPermitidos.includes(req.body.estado)) {
            return respuesta.error(req, res, "Estado no válido. Debe ser 'Pendiente', 'En Proceso' o 'Resuelto'", 400);
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

        // Mapeamos las evidencias exactamente igual que en tu función todosPqrs
        const itemsConAdjuntos = items.map(item => {
            return {
                ...item,
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