const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const router = express.Router();

router.get('/', todosResidentesActivos);

async function todosResidentesActivos(req, res, next) {
    try {
        const items = await controlador.todosResidentesActivos();
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

module.exports = router;