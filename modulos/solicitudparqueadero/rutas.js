const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Al estar rutas.js en la misma carpeta que la carpeta uploads:
        const rutaDestino = path.join(__dirname, 'uploads');
        cb(null, rutaDestino);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Definimos los campos que recibirá la API
const cargarDocumentos = upload.fields([
    { name: 'soat', maxCount: 1 },
    { name: 'tecnoMecanica', maxCount: 1 },
    { name: 'tarjetaPropiedad', maxCount: 1 }
]);

// Crear solicitud: admin, propietario y arrendatario
router.post('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), cargarDocumentos, agregarParqueadero);

// Listar: solo admin
router.get('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), todosParqueadero);
// Ver uno: solo admin
router.get('/:id', verificarJWT, verificarRol('administrador'), unoParqueadero);
// Eliminar: solo admin
router.delete('/:id', verificarJWT, verificarRol('administrador'), eliminarParqueadero);
// Actualizar: solo admin
router.put('/', verificarJWT, verificarRol('administrador'), actualizarParqueadero);
router.put('/gestionar', verificarJWT, verificarRol('administrador'), gestionarSolicitudParqueadero);


async function todosParqueadero(req, res, next) {
    try {
        const items = await controlador.todosParqueadero();
        
        // 1. Obtenemos el protocolo y el host (ej: http://localhost:4000)
        // Esto hace que tu código funcione tanto en tu PC como cuando lo subas a internet
        const host = `${req.protocol}://${req.get('host')}`;

        // 2. Mapeamos los resultados para añadir las rutas de descarga/visualización
        const itemsConArchivos = items.map(item => {
            return {
                ...item,
                // Creamos las URLs completas apuntando a la ruta estática /uploads
                soatUrl: item.soat ? `${host}/uploads/${item.soat}` : null,
                tecnoMecanicaUrl: item.tecnoMecanica ? `${host}/uploads/${item.tecnoMecanica}` : null,
                tarjetaPropiedadUrl: item.tarjetaPropiedad ? `${host}/uploads/${item.tarjetaPropiedad}` : null
            };
        });

        console.log("Se procesaron las URLs de documentos para las solicitudes");
        
        // 3. Enviamos la lista ya enriquecida con las URLs
        respuesta.success(req, res, itemsConArchivos, 200);
        
    } catch (err) {
        next(err);
    }
};

 async function unoParqueadero (req, res, next) {
    try{ 
        const items = await controlador.unoParqueadero(req.params.id);
        respuesta.success(req, res, items, 200);
    }catch(err){
         next(err);
    }
};


async function agregarParqueadero(req, res, next) {
    try {
        const archivos = req.files || {};
        
        // Log para ver qué está llegando realmente desde el Front
        console.log('Cuerpo recibido:', req.body);

        let fechaLimpia = null;
        
        // Validación de seguridad para evitar el error del .split()
        if (req.body.fechaSolicitud && typeof req.body.fechaSolicitud === 'string') {
            try {
                // Si la fecha trae la 'T' de ISO (ej: 2026-05-03T04:59:59)
                if (req.body.fechaSolicitud.includes('T')) {
                    fechaLimpia = req.body.fechaSolicitud.split('T')[0] + ' ' + req.body.fechaSolicitud.split('T')[1].split('.')[0];
                } else {
                    // Si ya viene limpia o en otro formato, la dejamos como está
                    fechaLimpia = req.body.fechaSolicitud;
                }
            } catch (e) {
                console.log("Error formateando fecha, se usará valor original");
                fechaLimpia = req.body.fechaSolicitud;
            }
        }

        const datosSolicitud = {
            ...req.body,
            fechaSolicitud: fechaLimpia,
            soat: archivos['soat'] ? archivos['soat'][0].filename : null,
            tecnoMecanica: archivos['tecnoMecanica'] ? archivos['tecnoMecanica'][0].filename : null,
            tarjetaPropiedad: archivos['tarjetaPropiedad'] ? archivos['tarjetaPropiedad'][0].filename : null,
            estado: 'pendiente' // Nueva solicitud siempre comienza como pendiente
        };

        // Remover el campo 'aprobado' ya que usamos 'estado' en su lugar
        delete datosSolicitud.aprobado;

        // Validación de documentos obligatorios (solo para Carro/Moto)
        if (datosSolicitud.tipoParqueadero !== 'Bicicleta') {
            if (!datosSolicitud.soat || !datosSolicitud.tecnoMecanica || !datosSolicitud.tarjetaPropiedad) {
                 return respuesta.error(req, res, 'Faltan documentos obligatorios (SOAT, Tecnomecánica y Tarjeta de Propiedad son requeridos)', 400);
            }
        }

        const items = await controlador.agregarParqueadero(datosSolicitud);
        respuesta.success(req, res, 'Su solicitud ha sido radicada correctamente para el próximo sorteo', 201);

    } catch (err) {
        console.error("Error en agregarParqueadero:", err);
        next(err);
    }
};
 async function eliminarParqueadero (req, res, next) {
    try{ 
        
            const items = await controlador.eliminarParqueadero(req.params.id);
            respuesta.success(req, res, 'Parqueadero eliminado satisfactoriamente', 200);
            //console.log("exitoso")

           respuesta.error(req, res, 'No se encontro el Parqueadero', 206);

    }catch(err){
        //console.log("error")
        next(err);
    }
};

async function actualizarParqueadero(req, res, next) {
    try {
        // La validación de los datos completos podría hacerse aquí
        const items = await controlador.actualizarParqueadero(req.body);
        const mensaje = 'Parqueadero actualizado con exito';

        respuesta.success(req, res, mensaje, 200);
    } catch (err) {
        next(err);
    }
};
async function gestionarSolicitudParqueadero(req, res, next) {
    try {
        const { id, estado, observaciones, fechaRespuesta } = req.body;

        // 1. Validación de campos requeridos
        if (!id || !estado || !observaciones || !fechaRespuesta) {
            return respuesta.error(req, res, "Los campos 'id', 'estado', 'observaciones' y 'fechaRespuesta' son completamente obligatorios.", 400);
        }

        // 2. Control de flujo de estados admitidos para auditoría
        const estadosPermitidos = ['Pendiente', 'Aprobado', 'Rechazado'];
        if (!estadosPermitidos.includes(estado)) {
            return respuesta.error(req, res, "Estado inválido. Debe ser 'Pendiente', 'Aprobado' o 'Rechazado'.", 400);
        }

        // 3. Estructuración de datos inyectando la sesión del administrador
        const datosGestion = {
            id: id,
            estado: estado,
            observaciones: observaciones,
            fechaRespuesta: fechaRespuesta
        };

        // 4. Ejecución del proceso en base de datos
        await controlador.actualizarSolicitudParqueadero(datosGestion);

        respuesta.success(req, res, 'La solicitud de parqueadero fue actualizada y respondida con éxito.', 200);

    } catch (err) {
        console.error("Error al gestionar solicitud de parqueadero:", err);
        next(err);
    }
}
module.exports = router;