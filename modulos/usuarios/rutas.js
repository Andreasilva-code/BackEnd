const express = require('express');
const respuesta = require('../../red/respuestas.js');
const controlador = require('./index.js');
const config = require('../../config');
const { verificarJWT, verificarRol } = require('../../middleware/authMiddleware');
const router = express.Router();


// Rutas públicas
router.post('/login', loginUsuarios);

// Rutas protegidas
router.get('/consultaporcorreo/:correo', verificarJWT, consultaPorCorreo);
router.get('/', verificarJWT, verificarRol('administrador'), todosUsuarios);
router.get('/:id', verificarJWT, unoUsuarios);
router.post('/', verificarJWT, verificarRol('administrador'), agregarUsuarios);
router.put('/', verificarJWT, actualizarUsuarios);
router.delete('/:id', verificarJWT, verificarRol('administrador'), eliminarUsuarios);

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
        
        if (datosUsuario && datosUsuario.usuario) {
            const usuario = datosUsuario.usuario;
            const token = datosUsuario.token;

            // Configurar cookie HttpOnly con el token
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false, // true en producción (HTTPS)
                sameSite: 'lax', // protege contra CSRF en la mayoría de flujos de login
                maxAge: 8 * 60 * 60 * 1000 // 8 horas en ms
            };

            // Seteamos la cookie; el front debe usar fetch/axios con `credentials: 'include'`
            res.cookie('token', token, cookieOptions);

            respuesta.success(req, res, {
                mensaje: 'Login Exitoso',
                user: {
                    id: usuario.idUsuarios,
                    nombre: usuario.nombreUsuario || usuario.nombre || null,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            }, 200);
        } else if (datosUsuario && datosUsuario.idUsuarios) {
            // compatibilidad: controlador antiguo que devolvía usuario directamente
            const u = datosUsuario;
            respuesta.success(req, res, {
                mensaje: 'Login Exitoso',
                user: {
                    id: u.idUsuarios,
                    nombre: u.nombreUsuario || u.nombre || null,
                    correo: u.correo,
                    rol: u.rol
                }
            }, 200);
        } else {
            respuesta.error(req, res, 'Login Fallido', 401);
        }
        
    } catch(err) {
        next(err);
    }
}

module.exports = router;