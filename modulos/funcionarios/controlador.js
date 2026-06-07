const TABLA = 'funcionarios';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}


function unoFuncionarios (id) {
    return db.unoFuncionarios(TABLA, id,)
}


return{ 
    unoFuncionarios,
}
}

    


