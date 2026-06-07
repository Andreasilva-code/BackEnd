const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const router = express.Router();


router.get('/', todosUsuarios);
router.get('/:id', unoUsuarios);
router.get('/consultaporcorreo/:correo', consultaPorCorreo);
router.post('/', agregarUsuarios);       
router.put('/', actualizarUsuarios); 
router.delete('/:id', eliminarUsuarios); 
router.post('/login', loginUsuarios);

// Middleware de validación (ejemplo básico)
const validarUsuarios = (req, res, next) => {
    if (!req.body.nombre || !req.body.apellido) {
        return respuesta.error(req, res, 'Nombre y apellido son obligatorios', 400);
    }
    next();
};

async function todosUsuarios(req, res, next) {
    try {
        const items = await controlador.todosUsuarios();
        respuesta.success(req, res, items, 200);
    } catch(err) {
        next(err);
    }
}

async function unoUsuarios(req, res, next) {
    try { 
        const item = await controlador.unoUsuarios(req.params.id);
        
        if (!item) {
            return respuesta.error(req, res, 'Usuario no encontrado', 404);
        }
        
        respuesta.success(req, res, item, 200);
    } catch(err) {
        next(err);
    }
}

async function consultaPorCorreo(req, res, next) {
    try {
        // Solo llamamos a la función del controlador
        const item = await controlador.consultaPorCorreo(req.params.correo);
        respuesta.success(req, res, item, 200);
    } catch(err) {
        next(err);
    }
}

async function agregarUsuarios(req, res, next) {
    try { 
        const nuevoUsuario = await controlador.agregarUsuarios(req.body);
        respuesta.success(req, res, {
            mensaje: 'Usuario creado con éxito',
            datos: nuevoUsuario
        }, 201);
    } catch(err) {
        next(err);
    }
}

async function actualizarUsuarios(req, res, next) {
    try {
        const datosActualizados = await controlador.actualizarUsuarios(req.body);
        
        respuesta.success(req, res, {
            mensaje: 'Usuario actualizado con éxito',
            datos: datosActualizados
        }, 200);
    } catch(err) {
        next(err);
    }
}

async function eliminarUsuarios(req, res, next) {
    try { 
        const id = req.params.id;
        await controlador.eliminarUsuarios(id);
        
        console.log(respuesta.error);
        console.log(respuesta);

        respuesta.success(req, res, {
            mensaje: 'Usuario eliminado con exito',
            id: id
        }, 200);



    } catch(err) {
        next(err);
    }
}

async function loginUsuarios(req, res, next) {
    try { 
        // 1. Capturamos el resultado del controlador (que ahora debería traer el objeto del usuario)
        const datosUsuario = await controlador.loginUsuarios(req.body);
        
        if (datosUsuario) {
            // 2. Enviamos el mensaje de éxito JUNTO con la información necesaria
            respuesta.success(req, res, {
                mensaje: 'Login Exitoso',
                user: {
                    id: datosUsuario.idUsuarios,
                    nombre: datosUsuario.nombre,
                    correo: datosUsuario.correo,
                    rol: datosUsuario.rol // <-- Aquí viaja el nuevo campo
                }
            }, 200);
        } else {
            res.status(401).json({
                mensaje: 'Login Fallido'
            });
        }
        
    } catch(err) {
        next(err);
    }
}

module.exports = router;