const jwt = require('jsonwebtoken');
const respuesta = require('../red/respuestas');
const config = require('../config');

function verificarJWT(req, res, next) {
  try {
    // Leer token desde cookies (migración a Cookies HttpOnly).
    // Requiere que `cookie-parser` esté configurado en `app.js`.
    const tokenFromCookie = req.cookies && req.cookies.token;
    const token = tokenFromCookie;

    if (!token) {
      return respuesta.error(req, res, 'Token no proporcionado (cookie)', 401);
    }

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return respuesta.error(req, res, 'Token inválido o expirado', 401);
      }

      // Guardamos la información del usuario decodificada en la request
      req.usuario = decoded;
      next();
    });
  } catch (error) {
    return respuesta.error(req, res, 'Error al verificar token', 500);
  }
}

function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    try {
      if (!req.usuario || !req.usuario.rol) {
        return respuesta.error(req, res, 'Acceso denegado: rol no encontrado', 403);
      }

      const rolUsuario = String(req.usuario.rol).toLowerCase();
      const permitido = rolesPermitidos
        .map(r => String(r).toLowerCase())
        .includes(rolUsuario);

      if (!permitido) {
        return respuesta.error(req, res, 'Acceso denegado: role no autorizado', 403);
      }

      next();
    } catch (err) {
      return respuesta.error(req, res, 'Error en verificación de rol', 500);
    }
  };
}

module.exports = {
  verificarJWT,
  verificarRol,
};