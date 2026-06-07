const TABLA = 'arrendatario';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todos () {
    return db.todos(TABLA,)
}

function uno (id) {
    return db.uno(TABLA, id,)
}

function agregar (body) {
    return db.agregar(TABLA, body,)
}

function eliminar (id) {
    return db.eliminar(TABLA, id,)
}

function actualizarArrendatario(body) {
    // Aquí podrías validar que el 'body' contenga todos los campos requeridos
    
    // Asume que 'body' contiene todos los campos para el reemplazo completo
    return db.actualizarArrendatario(TABLA, body);
}

return{ 
    todos,
    uno,
    agregar,
    eliminar,
    actualizarArrendatario
}
}

    


