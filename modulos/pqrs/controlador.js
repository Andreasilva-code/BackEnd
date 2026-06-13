const TABLA = 'pqrs';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosPqrs () {
    return db.todosPqrs(TABLA,)
}

function unoPqrs(id) {
    return db.unoPqrs(TABLA, id,)
}

function agregarPqrs (body) {
    return db.agregarPqrs(TABLA, body,)
}

function eliminarPqrs(id) {
      return db.eliminarPqrs(TABLA, id); 
}

async function actualizarEstadoPqrs(body) {
      return db.actualizarEstadoPqrs(TABLA, body); 
}
// 🌟 NUEVA FUNCIÓN:
function pqrsPorPropietario(identificacion) {
    return db.pqrsPorPropietario(TABLA, identificacion);
}

return{ 
    todosPqrs,
    unoPqrs,
    agregarPqrs,
    eliminarPqrs,
    actualizarEstadoPqrs,
    pqrsPorPropietario,
}
}

    


