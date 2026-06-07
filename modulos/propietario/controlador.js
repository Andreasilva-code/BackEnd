
const TABLA = 'propietario';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosPropietario() {
    return db.todosPropietario(TABLA,)
}

function unoPropietario (id) {
    return db.unoPropietario(TABLA, id,)
}

function agregarPropietario(body) {
    return db.agregar(TABLA, body,)
}

function actualizarPropietario (id, body) {
    return db.actualizarPropietario(TABLA, id, body,)
}

function eliminarPorIdPropietario (id) {
    return db.eliminarPorIdPropietario(TABLA, id,)
}

return{ 
    todosPropietario,
    unoPropietario,
    agregarPropietario,
    actualizarPropietario,
    eliminarPorIdPropietario
}
}


