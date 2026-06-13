const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Protegido: administrador y vigilante pueden ver funcionario por id
router.get('/:id', verificarJWT, verificarRol('administrador', 'vigilante'), unoFuncionarios);

async function unoFuncionarios(req, res, next) {
    try { 
        const item = await controlador.unoFuncionarios(req.params.id);
        
        if (!item) {
            return respuesta.error(req, res, 'Funcionario no encontrado', 404);
        }
        
        respuesta.success(req, res, item, 200);
    } catch(err) {
        next(err);
    }
}

module.exports = router;