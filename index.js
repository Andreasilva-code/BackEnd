const app = require('./app');

// Agregamos '0.0.0.0' para que escuche en todas las IPs de la red local
app.listen(app.get('port'), '0.0.0.0', () => {
  console.log("Servidor API escuchando en el puerto", app.get("port"), "y disponible en la red local");
});

