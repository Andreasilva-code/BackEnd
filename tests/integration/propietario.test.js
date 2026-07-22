const request = require('supertest');
const app = require('../../app'); 

describe('--- PRUEBAS DE INTEGRACIÓN (Propietarios) ---', () => {

    test('GET /api/propietario/1 -> Debería responder con código 200', async () => {
        // Tu token vigente y limpio extraído de lo que me pasaste
        const tokenString = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW9zIjoxMjQ1Njc0MzIsImNvcnJlbyI6InNvZmlhY3J1ejg5QGdtYWlsLmNvbSIsInJvbCI6InByb3BpZXRhcmlvIiwiaWF0IjoxNzgyMjMwNTk3LCJleHAiOjE3ODIyNTkzOTd9.uzd56EjkkU7XuLaWoJ3OZ36sIs5YWZS-K5tqAbahiPA";
        
        // Formateamos la cookie exactamente como la pide tu backend
        const miCookie = `token=${tokenString}`;

        console.log('\n================ COOKIE ENVIADA AL SERVIDOR ================');
        console.log(miCookie);
        console.log('============================================================\n');

        // Realizamos la petición inyectando la cookie de autenticación
        const response = await request(app)
            .get('/api/propietario/1') 
            // 🔑 CAMBIO CLAVE: Cambiamos 'Authorization' por 'Cookie'
            .set('Cookie', miCookie) 
            .send();

        console.log('====== RESPUESTA REAL DEL BACKEND ======');
        console.log('Código de estado recibido:', response.statusCode);
        console.log('Cuerpo de la respuesta:', response.body);
        console.log('========================================\n');

        // Ahora que la cookie viaja en su sitio, el backend nos dará luz verde
        expect(response.statusCode).toBe(200); 
    });

});