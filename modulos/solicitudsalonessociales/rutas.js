const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();


// Listar solicitudes: solo admin
router.get('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), todosSolicitudSalonesSociales);
// Crear solicitud: admin, propietario y arrendatario
router.post('/', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), agregarSolicitudSalonesSociales);
// Ruta exclusiva para que el Administrador gestione y responda los Salones Sociales
router.put('/', verificarJWT, verificarRol('administrador'), actualizarSolicitudSalonesSociales);


async function todosSolicitudSalonesSociales (req, res, next) {
    try{
        const items = await controlador.todosSolicitudSalonesSociales();
        console.log("entro a la funcion todos dentro de rutas")
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};


 async function agregarSolicitudSalonesSociales (req, res, next) {
    try{ 
        const items = await controlador.agregarSolicitudSalonesSociales(req.body);
        mensaje = 'SolicitudSalonesSociales guardardado con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

async function actualizarSolicitudSalonesSociales(req, res, next) {
    try {
        const { id, estado, observaciones } = req.body;
        
        const data = {
            id: id,
            estado: estado,
            observaciones: observaciones
        };
        
        const items = await controlador.actualizarSolicitudSalonesSociales(data);
        mensaje = 'Solicitud de salón social actualizada con éxito';
        
        respuesta.success(req, res, mensaje, 200);
    } catch(err) {
        next(err);
    }
}
module.exports = router;