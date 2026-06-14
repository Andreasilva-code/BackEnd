const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Listar historias: permitido para todos los roles autenticados
router.get('/', listarHistorias);
// Crear historia: cualquier usuario autenticado
router.post('/', verificarJWT, agregarHistoria);

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