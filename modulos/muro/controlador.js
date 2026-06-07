const TABLA = 'muro_social';


module.exports = function (dbInyectada) {

let db = dbInyectada;
if(!db){
    db = require('../../DB/mysql');
}

function agregarHistoria(body) {
    // Estructuramos el objeto para que coincida con los campos de tu SQL
    const objetoHistoria = {
        titulo: body.titulo,
        contenido: body.contenido,
        imagen_url: body.imagen_url || null,
        tipo_categoria: body.tipo_categoria || 'Informativo',
        idUsuario: body.idUsuario // ID del administrador que publica
    };

    return db.agregarHistoria(TABLA, objetoHistoria);
}

// Asegúrate de que TABLA esté definida como 'muro_social'
function obtenerHistorias() {
    return db.listarHistorias(TABLA);
}


return{ 
    agregarHistoria,
    obtenerHistorias,

}
}