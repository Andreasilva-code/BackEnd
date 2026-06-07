const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const router = express.Router();


router.post('/', agregarHistoria);
router.get('/', listarHistorias);

async function listarHistorias(req, res, next) {
    try {
        const lista = await controlador.obtenerHistorias();
        // Usamos tu estructura de respuestas exitosas
        respuesta.success(req, res, lista, 200);
    } catch (err) {
        // Si hay un error de conexión o de tabla, pasa al middleware
        next(err);
    }
}

async function agregarHistoria(req, res, next) {
    try {
        // Llamamos al controlador pasándole el cuerpo de la petición
        const item = await controlador.agregarHistoria(req.body);
        
        respuesta.success(req, res, 'Historia publicada con éxito', 201);
    } catch (err) {
        // Si hay un error (ej: el idUsuario no existe), pasamos al middleware de errores
        next(err);
    }
}

module.exports = router;