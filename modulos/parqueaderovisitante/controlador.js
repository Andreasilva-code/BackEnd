const TABLA = 'parqueaderovisitante';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosParqueaderoVisitante () {
    return db.todosParqueaderoVisitante(TABLA,)
}

function agregarParqueaderoVisitante (body) {
    return db.agregarParqueaderoVisitante(TABLA, body,)
}



return{ 
    todosParqueaderoVisitante,
    agregarParqueaderoVisitante,

}
}

    


