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

function liquidarParqueaderoVisitante(placa, horaIngreso, horaSalida, tiempoMenosDescuento, valorParqueadero, tiempoParqueoReal, tiempoParqueoConAproximacion, vigilanteSalida, estado) {
    // Armamos el objeto con los campos que se van a actualizar
    const data = {
        horaSalida,
        tiempoMenosDescuento,
        valorParqueadero,
        tiempoParqueoReal,
        tiempoParqueoConAproximacion,
        vigilanteSalida,
        estado
    };

    // Enviamos al modelo: tabla, placa, horaIngreso (WHERE) y el objeto data (SET)
    return db.liquidarParqueaderoVisitante(TABLA, placa, horaIngreso, data);
}

function consultarExistenteParqueaderoVisitante (placa, horaIngreso) {
    return db.consultarExistenteParqueaderoVisitante(TABLA, placa, horaIngreso)
}

function consultarRegistroPorFiltroParqueaderoVisitante (placa, horaIngreso) {
    return db.consultarRegistroPorFiltroParqueaderoVisitante(TABLA, placa, horaIngreso)
}

return{ 
    todosParqueaderoVisitante,
    agregarParqueaderoVisitante,
    liquidarParqueaderoVisitante,
    consultarExistenteParqueaderoVisitante,
    consultarRegistroPorFiltroParqueaderoVisitante,

}
}

    


