const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Protegido: cualquier usuario autenticado con roles permitidos puede ver residentes activos
router.get('/', verificarJWT, verificarRol('administrador', 'vigilante', 'propietario', 'arrendatario'), todosResidentesActivos);

async function todosResidentesActivos(req, res, next) {
    try {
        const items = await controlador.todosResidentesActivos();
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

module.exports = router;