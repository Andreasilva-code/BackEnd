const TABLA = 'usuarios';


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

   const usuarios = {
    idUsuarios: body.idUsuarios,
    nombreUsuario: body.nombreUsuario,
    clave: body.clave,
    fechaCreacion: body.fechaCreacion,
    correo: body.correo,
    Arrendatario_idArrendatario: body.Arrendatario_idArrendatario,
    Funcionarios_idFuncionario: body.Funcionarios_idFuncionario,
    Propietario_idPropietario: body.Propietario_idPropietario
   
   }
    const respuesta = db.agregarUsuarios(TABLA, usuarios);

    return true;

}

function eliminarUsuarios (id) {
    return db.eliminarUsuarios(TABLA, id,)
}

function actualizarUsuarios(body) {
    // Aquí podrías validar que el 'body' contenga todos los campos requeridos
    
    // Asume que 'body' contiene todos los campos para el reemplazo completo
    return db.actualizarUsuarios(TABLA, body);
}

async function loginUsuarios(body) {
    try {
        // 1. Buscamos al usuario por correo
        const respuesta = await db.consultarCorreo(TABLA, body.correo);
        
        // 2. Si no hay resultados, el correo no existe
        if (!respuesta || respuesta.length === 0) {
            console.log('Correo no encontrado');
            return null; // Retornamos null en lugar de false
        }
        
        const usuario = respuesta[0];
        
        // 3. Comparamos la clave
        if (usuario.clave === body.clave) {
            console.log('Credenciales válidas para:', usuario.nombre);
          
            // Agregamos .trim() para ignorar espacios accidentales
if (usuario.clave.toString().trim() === body.clave.toString().trim()) {
    console.log('Autenticación satisfactoria');
    return usuario; 
}
        } else {
            console.log('Clave incorrecta');
            return null;
        }
    } catch (error) {
        console.error('Error en login:', error);
        throw error; // Es mejor lanzar el error para que lo atrape el 'next(err)' de la ruta
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

    


