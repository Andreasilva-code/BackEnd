const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Listar solicitudes: admin, propietario y arrendatario
router.get('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), todosSolicitudTrasteos);
// Crear solicitud: admin, propietario y arrendatario
router.post('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), agregarSolicitudTrasteos);
// Ruta exclusiva para que el Administrador gestione y responda los trasteos
router.put('/gestionar', verificarJWT, verificarRol('administrador'), gestionarSolicitudTrasteo);

async function todosSolicitudTrasteos (req, res, next) {
    try{
        const items = await controlador.todosSolicitudTrasteos();
        console.log("entro a la funcion todos dentro de rutas")
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

/* async function uno (req, res, next) {
    try{ 
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200);
    }catch(err){
         next(err);
    }
};
*/
 async function agregarSolicitudTrasteos (req, res, next) {
    try{ 
        const items = await controlador.agregarSolicitudTrasteos(req.body);
        mensaje = 'solicitud realizada con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

 async function gestionarSolicitudTrasteo(req, res, next) {
    try {
        // Quitamos fechaRespuesta de aquí porque la genera la Base de Datos con NOW()
        const { id, estado, observaciones } = req.body;

        // 1. Validación de campos requeridos por el sistema
        if (!id || !estado || !observaciones) {
            return respuesta.error(req, res, "Los campos 'id', 'estado' y 'observaciones' son obligatorios para responder.", 400);
        }

        // 2. Control de flujo de estados admitidos para el trasteo (Criterio de Auditoría)
        const estadosPermitidos = ['Pendiente', 'Aprobado', 'Rechazado'];
        if (!estadosPermitidos.includes(estado)) {
            return respuesta.error(req, res, "Estado inválido. Debe ser 'Aprobado' o 'Rechazado'.", 400);
        }

        // 3. Empaquetado de datos limpios (Corregida la coma faltante)
        const datosGestion = {
            id: id,
            estado: estado,
            observaciones: observaciones // <--- Coma corregida
        };

        // 4. Ejecución en el controlador
        await controlador.actualizarSolicitudTrasteo(datosGestion);

        respuesta.success(req, res, 'La solicitud de mudanza ha sido gestionada y actualizada con éxito.', 200);

    } catch (err) {
        console.error("Error en gestionarSolicitudTrasteo:", err);
        next(err);
    }
}

module.exports = router;