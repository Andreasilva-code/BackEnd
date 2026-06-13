const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Protegido: admin y vigilante pueden ver tarifas
router.get('/', verificarJWT, verificarRol('administrador', 'vigilante'), todosValoresParqueaderoVisitantes);
//router.get('/:id', uno);
//router.post('/', agregarParqueaderoVisitante);
//router.delete('/:id', eliminar);
//router.put('/', actualizarArrendatario);
//router.post('/liquidar', liquidarParqueaderoVisitante);
//router.get('/:placa/:horaIngreso', consultarExistenteParqueaderoVisitante);
//router.get('/consultarregistroporfiltro/:placa/:horaIngreso', consultarRegistroPorFiltroParqueaderoVisitante);


async function todosValoresParqueaderoVisitantes (req, res, next) {
    try{
        const items = await controlador.todosValoresParqueaderoVisitantes();
        console.log("entro a la funcion todos dentro de rutas")
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};


module.exports = router;