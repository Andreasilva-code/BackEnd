const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // 1. Importar el paquete
const cookieParser = require('cookie-parser');
const config = require('./config');
// En app.js
const path = require('path');


const arrendatario = require('./modulos/arrendatario/rutas');
const usuarios = require('./modulos/usuarios/rutas');
const propietario = require('./modulos/propietario/rutas');
const funcionarios = require('./modulos/funcionarios/rutas');
const muro = require('./modulos/muro/rutas');
const residentes = require('./modulos/residentes/rutas');
const solicitudparqueadero = require('./modulos/solicitudparqueadero/rutas');
const solicitudtrasteos = require('./modulos/solicitudtrasteos/rutas');
const solicitudsalonessociales = require('./modulos/solicitudsalonessociales/rutas');
const parqueaderovisitante = require('./modulos/parqueaderovisitante/rutas');
const pqrs= require('./modulos/pqrs/rutas');
const valoresparqueaderovisitantes= require('./modulos/valoresparqueaderovisitantes/rutas');

const error = require('./red/errors');

const app = express();

// --- Middleware ---

// 2. Configurar CORS (Debe ir ANTES de las rutas)
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como postman, curl o llamadas internas)
        if (!origin) return callback(null, true);
        
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLocalIP = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
        
        if (isLocalhost || isLocalIP || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Permitir cookies y credenciales
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cookie parser: permite leer cookies desde `req.cookies`
app.use(cookieParser());


// Configuración  
app.set('port', config.app.port || 3001); // Usando tu objeto config

// Rutas URL
app.use('/api/arrendatario', arrendatario);
app.use('/api/usuarios', usuarios);
app.use('/api/propietario', propietario);
app.use('/api/funcionarios', funcionarios);
app.use('/api/muro', muro);
app.use('/api/residentes', residentes);
app.use('/api/solicitudparqueadero', solicitudparqueadero);
app.use('/api/solicitudtrasteos', solicitudtrasteos);
app.use('/api/solicitudsalonessociales', solicitudsalonessociales);
app.use('/api/parqueaderovisitante', parqueaderovisitante);
app.use('/api/pqrs', pqrs);
app.use('/api/valoresparqueaderovisitantes', valoresparqueaderovisitantes);
// Agrega esta línea para mapear la ruta de la carpeta física de uploads a una URL pública


// Middleware de errores (Siempre al final)
app.use(error);

// Ajustamos la ruta para que desde la raíz entre a modulos/...
app.use('/uploads', express.static(path.join(__dirname, 'modulos/solicitudparqueadero/uploads')));

module.exports = app;

