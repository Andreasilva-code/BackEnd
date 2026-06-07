const express = require('express');
const respuesta =  require('../../red/respuestas.js');
//const { eliminar } = require('../arrendatario/index.js');
const controlador = require('./index.js');
//const controlador = require('./controlador')();
const router = express.Router();

router.get('/', todosPropietario);
router.get('/:id', unoPropietario);
router.post('/', agregarPropietario);
router.put('/', actualizarPropietario);
router.delete('/:id', eliminarPorIdPropietario);

async function todosPropietario (req, res, next) {
    try{
        const items = await controlador.todosPropietario();
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

 async function unoPropietario (req, res, next) {
    try{ 
        const items = await controlador.unoPropietario(req.params.id);
        respuesta.success(req, res, items, 200);
    }catch(err){
         next(err);
    }
};

 async function agregarPropietario (req, res, next) {
    try{ 
        const items = await controlador.agregarPropietario(req.body);
        mensaje = 'Propietario guardardado con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};


 async function eliminarPorIdPropietario (req, res, next) {
    try{ 
            const resultado = await controlador.eliminarPorIdPropietario(req.params.id);
            //console.log('Registros eliminados:', resultado.affectedRows);
            //console.log("resultado", resultado);
            if (resultado.affectedRows === 0) {
                respuesta.error(req, res, 'No se encontro el idPropietario', 206);
            }else{
                respuesta.success(req, res, 'Propietario eliminado con exito', 200);
            }

    }catch(err){
        //console.log("error")
        next(err);
    }
};

async function actualizarPropietario(req, res, next) {
    try {        
        // Obtener los datos a actualizar del cuerpo de la petición
        const datosActualizados = {
            idPropietario: req.body.idPropietario,
            cedula: req.body.cedula,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            celular: req.body.celular,
            correo: req.body.correo,
            observaciones: req.body.observaciones,
            estado: req.body.estado,
            Apartamento_idApartamento: req.body.Apartamento_idApartamento
        };

        // Validar que al menos un campo fue proporcionado
        if (Object.values(datosActualizados).every(val => val === undefined)) {
            return respuesta.error(req, res, 'Debe proporcionar al menos un campo para actualizar', 400);
        }

        // Llamar al controlador para realizar la actualización
        const resultado = await controlador.actualizarPropietario(datosActualizados);
        
        console.log('Registros actualizados:', resultado.affectedRows);
        console.log("resultado", resultado);

        if (resultado.affectedRows === 0) {
            respuesta.error(req, res, 'No se encontró el propietario con el idPropietario proporcionado', 404);
        } else {
            respuesta.success(req, res, {
                message: 'Propietario actualizado con exito',
                cambios: datosActualizados
            }, 200);
        }

    } catch(err) {
        next(err);
    }
}
module.exports = router;