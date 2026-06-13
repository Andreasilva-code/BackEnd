const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();

// Rutas protegidas: admin solo puede listar todos
router.get('/', verificarJWT, verificarRol('administrador'), todos);
// Ruta protegida: cualquier usuario autenticado con roles permitidos puede ver por id
router.get('/:id', verificarJWT, verificarRol('administrador', 'propietario', 'arrendatario'), uno);
// Rutas protegidas: solo admin puede crear, actualizar y eliminar
router.post('/', verificarJWT, verificarRol('administrador'), agregar);
router.delete('/:id', verificarJWT, verificarRol('administrador'), eliminar);
router.put('/', verificarJWT, verificarRol('administrador'), actualizarArrendatario);

async function todos (req, res, next) {
    try{
        const items = await controlador.todos();
        console.log("entro a la funcion todos dentro de rutas")
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

 async function uno (req, res, next) {
    try{ 
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200);
    }catch(err){
         next(err);
    }
};

 async function agregar (req, res, next) {
    try{ 
        const items = await controlador.agregar(req.body);
        mensaje = 'arrendatario guardardado con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

 async function eliminar (req, res, next) {
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
module.exports = router;