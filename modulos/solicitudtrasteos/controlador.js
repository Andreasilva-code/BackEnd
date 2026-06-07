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

/*
function eliminar (id) {
    return db.eliminar(TABLA, id,)
}

function actualizarArrendatario(body) {
    // Aquí podrías validar que el 'body' contenga todos los campos requeridos
    
    // Asume que 'body' contiene todos los campos para el reemplazo completo
    return db.actualizarArrendatario(TABLA, body);
}
*/
return{ 
    todosSolicitudTrasteos,
    //uno,
    agregarSolicitudTrasteos,
    //eliminar,
    //actualizarArrendatario
}
}

    


