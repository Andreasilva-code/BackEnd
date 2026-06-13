const jwt = require('jsonwebtoken');
const respuesta = require('../red/respuestas'); // Ajusta la ruta según tu proyecto

// Clave secreta (En producción debe estar en tu archivo .env)
const JWT_SECRET = process.env.JWT_SECRET || env.CLAVE_JWT || 'clave_secreta_para_jwt'; 

/**
 * Capa 1: JWT - Verifica si el usuario está autenticado y tiene un token válido
 */
const verificarJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // El token suele venir como: "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return respuesta.error(req, res, 'Acceso denegado. Token no proporcionado.', 401);
    }

    try {
        const verificado = jwt.verify(token, JWT_SECRET);
        req.usuario = verificado; // Inyectamos los datos del usuario descifrados en la petición
        next(); // Continuamos a la siguiente función
    } catch (err) {
        return respuesta.error(req, res, 'Token inválido o expirado.', 403);
    }
};

/**
 * Capa 2: RBAC - Verifica si el rol del usuario está autorizado para la ruta
 * @param {...string} rolesPermitidos - Lista de roles que pueden acceder (ej: 'administrador', 'propietario')
 */
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario viene de la ejecución previa de verificarJWT
        if (!req.usuario || !req.usuario.rol) {
            return respuesta.error(req, res, 'No se pudo verificar el rol del usuario.', 500);
        }

        const rolUsuario = req.usuario.rol.toLowerCase();
        const rolesValidos = rolesPermitidos.map(r => r.toLowerCase());

        if (!rolesValidos.includes(rolUsuario)) {
            return respuesta.error(req, res, 'Acceso denegado. No tienes permisos para realizar esta acción.', 403);
        }

        next(); // El usuario tiene el rol adecuado, continúa
    };
};

module.exports = {
    verificarJWT,
    verificarRol,
    JWT_SECRET
};