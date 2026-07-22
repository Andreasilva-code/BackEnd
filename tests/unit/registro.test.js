const controladorFabrica = require('../../modulos/usuarios/controlador'); 

describe('--- PRUEBA UNITARIA (Registro de Residentes) ---', () => {
    
    let dbMock;
    let controlador;

    beforeEach(() => {
        // 1. Simulamos el método exacto que llama tu controlador: db.agregarUsuarios
        dbMock = {
            agregarUsuarios: jest.fn() 
        };
        // 2. Inyectamos el mock al controlador
        controlador = controladorFabrica(dbMock);
    });

    test('agregarUsuarios -> Debería retornar éxito al registrar un nuevo propietario', async () => {
        // 3. Datos de Entrada adaptados a los campos exactos que pide tu función
        const datosCarlos = {
            idUsuarios: 99,
            nombreUsuario: "CarlosMendoza",
            clave: "Sena2026.*", // Se hasheará en la prueba usando bcrypt real
            fechaCreacion: "2026-06-23",
            correo: "carlos.mendoza@prados.com",
            Propietario_idPropietario: 1
        };

        // 4. Forzamos al simulador de la BD a responder con éxito
        dbMock.agregarUsuarios.mockResolvedValue({ 
            affectedRows: 1, 
            insertId: 99,
            mensaje: "Usuario registrado con éxito" 
        });

        // 5. LLAMADO CORRECTO: Usamos la función exacta 'agregarUsuarios' pasando solo el cuerpo
        const resultado = await controlador.agregarUsuarios(datosCarlos);

        console.log('\n====== RESPUESTA DE LA PRUEBA UNITARIA DE REGISTRO ======');
        console.log('Mensaje de simulación:', resultado.mensaje);
        console.log('ID asignado en memoria:', resultado.insertId);
        console.log('=========================================================\n');

        // 6. Afirmaciones para Jest
        expect(dbMock.agregarUsuarios).toHaveBeenCalledTimes(1); 
        expect(resultado.affectedRows).toBe(1);
    });
});