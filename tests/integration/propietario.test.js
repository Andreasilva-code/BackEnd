const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const config = require('../../config');

describe('--- PRUEBAS DE INTEGRACIÓN (Propietarios) ---', () => {

    test('GET /api/propietario/1 -> Debería responder con código 200', async () => {

        // Generamos un token válido para la prueba
        const tokenString = jwt.sign(
            {
                idUsuarios: 124567432,
                correo: 'prueba@test.com',
                rol: 'propietario'
            },
            config.jwt.secret,
            {
                expiresIn: '10m'
            }
        );

        // El backend espera el JWT dentro de la cookie "token"
        const miCookie = `token=${tokenString}`;

        const response = await request(app)
            .get('/api/propietario/1')
            .set('Cookie', miCookie)
            .send();

        console.log('====== RESPUESTA REAL DEL BACKEND ======');
        console.log('Código de estado recibido:', response.statusCode);
        console.log('Cuerpo de la respuesta:', response.body);
        console.log('========================================');

        expect(response.statusCode).toBe(200);
    });

});