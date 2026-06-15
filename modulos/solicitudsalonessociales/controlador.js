const TABLA = 'solicitudsalonessociales';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosSolicitudSalonesSociales  () {
    return db.todosSolicitudSalonesSociales (TABLA,)
}

/*
function uno (id) {
    return db.uno(TABLA, id,)
}
*/

function agregarSolicitudSalonesSociales (body) {
    return db.agregarSolicitudSalonesSociales(TABLA, body,)
}

function actualizarSolicitudSalonesSociales(body) {
    return db.actualizarSolicitudSalonesSociales(TABLA, body)
}

return{ 
    todosSolicitudSalonesSociales,
    agregarSolicitudSalonesSociales,
    actualizarSolicitudSalonesSociales,
    }
}

    


