
const app = require('./app');

// Si no estamos en entorno de pruebas, encendemos el servidor normalmente
if (process.env.NODE_ENV !== 'test') {
    app.listen(app.get('port'), '0.0.0.0', () => {
      console.log("Servidor API escuchando en el puerto", app.get("port"), "y disponible en la red local");
    });
}

module.exports = app;