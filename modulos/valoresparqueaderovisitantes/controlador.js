const TABLA = 'valoresparqueaderovisitantes';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}
function todosValoresParqueaderoVisitantes () {
    return db.todosValoresParqueaderoVisitantes(TABLA,)
}

return{ 
    todosValoresParqueaderoVisitantes,

}

}


