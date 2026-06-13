const TABLA = 'usuarios';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function (dbInyectada) {

    let db = dbInyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    function todosUsuarios () {
        return db.todosUsuarios(TABLA,)
    }

    function unoUsuarios (id) {
        return db.unoUsuarios(TABLA, id,)
    }

    function consultarCorreo (correo) {
        return db.consultarCorreo(TABLA, correo,)
    }

    function consultaPorCorreo (correo) {
        return db.consultaPorCorreo(TABLA, correo,)
    }


    async function agregarUsuarios (body) {
       // Hashear la contraseña antes de guardar
       const salt = await bcrypt.genSalt(10);
       const hash = await bcrypt.hash(body.clave, salt);

       const usuarios = {
        idUsuarios: body.idUsuarios,
        nombreUsuario: body.nombreUsuario,
        clave: hash,
        fechaCreacion: body.fechaCreacion,
        correo: body.correo,
        Arrendatario_idArrendatario: body.Arrendatario_idArrendatario,
        Funcionarios_idFuncionario: body.Funcionarios_idFuncionario,
        Propietario_idPropietario: body.Propietario_idPropietario
       }

        const respuesta = await db.agregarUsuarios(TABLA, usuarios);

        return respuesta;
    }

    function eliminarUsuarios (id) {
        return db.eliminarUsuarios(TABLA, id,)
    }

    function actualizarUsuarios(body) {
        return db.actualizarUsuarios(TABLA, body);
    }

    async function loginUsuarios(body) {
        try {
            // 1. Buscamos al usuario por correo
            const respuesta = await db.consultarCorreo(TABLA, body.correo);
            
            // 2. Si no hay resultados, el correo no existe
            if (!respuesta || respuesta.length === 0) {
                console.log('Correo no encontrado');
                return null;
            }

            const usuario = respuesta[0];

            // 3. Intentamos comparar con bcrypt (hash)
            const coincide = await bcrypt.compare(body.clave, usuario.clave);

            if (coincide) {
                // Autenticación correcta
                // eliminamos la clave antes de retornar
                delete usuario.clave;

                const payload = {
                    idUsuarios: usuario.idUsuarios,
                    correo: usuario.correo,
                    rol: usuario.rol
                };

                const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

                return { usuario, token };
            }

            // 4. Compatibilidad: si la contraseña en la BD está en texto plano,
            // permitimos el login y actualizamos a hash para migrar usuarios antiguos.
            if (usuario.clave === body.clave) {
                try {
                    const nuevoHash = await bcrypt.hash(body.clave, 10);
                    await db.actualizarUsuarios(TABLA, { idUsuarios: usuario.idUsuarios, clave: nuevoHash });
                    usuario.clave = nuevoHash;
                    delete usuario.clave;

                    const payload = {
                        idUsuarios: usuario.idUsuarios,
                        correo: usuario.correo,
                        rol: usuario.rol
                    };
                    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

                    return { usuario, token };
                } catch (e) {
                    console.error('Error al re-hashear contraseña antigua:', e);
                    return null;
                }
            }

            console.log('Clave incorrecta');
            return null;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    return{ 
        todosUsuarios,
        unoUsuarios,
        agregarUsuarios,
        eliminarUsuarios,
        actualizarUsuarios,
        loginUsuarios,
        consultaPorCorreo,
    }
}

    


