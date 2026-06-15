const TABLA = 'solicitudtrasteos';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosSolicitudTrasteos () {
    return db.todosSolicitudTrasteos(TABLA,)
}

/*
function uno (id) {
    return db.uno(TABLA, id,)
}
*/

function agregarSolicitudTrasteos (body) {
    return db.agregarSolicitudTrasteos(TABLA, body,)
}


// 🌟 NUEVA FUNCIÓN PARA EL ROL ADMINISTRADOR:
    function actualizarSolicitudTrasteo(body) {
        return db.actualizarSolicitudTrasteo(TABLA, body);
    }

return{ 
    todosSolicitudTrasteos,
    agregarSolicitudTrasteos,
    actualizarSolicitudTrasteo,
}
}

    


