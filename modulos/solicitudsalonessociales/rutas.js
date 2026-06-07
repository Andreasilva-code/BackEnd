const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const router = express.Router();

router.get('/', todosSolicitudSalonesSociales);
//router.get('/:id', uno);
router.post('/', agregarSolicitudSalonesSociales);
//router.delete('/:id', eliminar);
//router.put('/', actualizarArrendatario);

async function todosSolicitudSalonesSociales (req, res, next) {
    try{
        const items = await controlador.todosSolicitudSalonesSociales();
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
 async function agregarSolicitudSalonesSociales (req, res, next) {
    try{ 
        const items = await controlador.agregarSolicitudSalonesSociales(req.body);
        mensaje = 'SolicitudSalonesSociales guardardado con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

 /* async function eliminar (req, res, next) {
    try{ 
        
            const items = await controlador.eliminar(req.params.id);
            respuesta.success(req, res, 'arrendatario eliminado satisfactoriamente', 200);
            //console.log("exitoso")

           respuesta.error(req, res, 'No se encontro el idCedulaArrendatario', 206);

    }catch(err){
        //console.log("error")
        next(err);
    }
};

async function actualizarArrendatario(req, res, next) {
    try {
        // La validación de los datos completos podría hacerse aquí
        const items = await controlador.actualizarArrendatario(req.body);
        const mensaje = 'arrendatario actualizado con exito';

        respuesta.success(req, res, mensaje, 200);
    } catch (err) {
        next(err);
    }
};

*/
module.exports = router;