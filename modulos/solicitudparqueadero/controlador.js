const TABLA = 'solicitudparqueadero';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosParqueadero () {
    return db.todosParqueadero(TABLA,)
}

function unoParqueadero (id) {
    return db.unoParqueadero(TABLA, id,)
}

function agregarParqueadero (body) {
    return db.agregarParqueadero(TABLA, body,)
}

function eliminarParqueadero (id) {
    return db.eliminarParqueadero(TABLA, id,)
}

function actualizarParqueadero(body) {
    // Aquí podrías validar que el 'body' contenga todos los campos requeridos
    
    // Asume que 'body' contiene todos los campos para el reemplazo completo
    return db.actualizarParqueadero(TABLA, body);
}

return{ 
    todosParqueadero,
    unoParqueadero,
    agregarParqueadero,
    eliminarParqueadero,
    actualizarParqueadero
}
}

    


