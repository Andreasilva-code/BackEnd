
const TABLA = 'propietario';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}

function todosResidentesActivos() {
        // En este caso no pasamos una sola TABLA porque el query une dos
        return db.todosResidentesActivos();
    }

    return {
        todosResidentesActivos
    }
}