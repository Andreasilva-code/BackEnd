const express = require('express');
const respuesta =  require('../../red/respuestas.js');
const controlador = require('./index.js');
const router = express.Router();
const controladorValores = require('../valoresparqueaderovisitantes/index.js');

router.get('/', todosParqueaderoVisitante);
//router.get('/:id', uno);
router.post('/', agregarParqueaderoVisitante);
//router.delete('/:id', eliminar);
//router.put('/', actualizarArrendatario);
router.post('/liquidar', liquidarParqueaderoVisitante);
router.get('/:placa/:horaIngreso', consultarExistenteParqueaderoVisitante);
router.get('/consultarregistroporfiltro/:placa/:horaIngreso', consultarRegistroPorFiltroParqueaderoVisitante);


async function todosParqueaderoVisitante (req, res, next) {
    try{
        const items = await controlador.todosParqueaderoVisitante();
        console.log("entro a la funcion todos dentro de rutas")
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

/* async function uno (req, res, next) {
    try{ 
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200);
    }catch(err){
         next(err);
    }
};
*/
 async function agregarParqueaderoVisitante (req, res, next) {
    try{ 
        const items = await controlador.agregarParqueaderoVisitante(req.body);
        mensaje = 'parqueadero de visitante guardardado con exito';

        respuesta.success(req, res, mensaje, 201);
    }catch(err){
        next(err);
    }
};

async function liquidarParqueaderoVisitante(req, res, next) {
    try {
        // 1. Extraemos los datos que envía el cliente
        const { placa, horaIngreso, horaSalida, vigilanteSalida } = req.body; 

        // 2. Buscamos el registro de ingreso en la base de datos
        const registros = await controlador.consultarRegistroPorFiltroParqueaderoVisitante(placa, horaIngreso);

        if (!registros || registros.length === 0) {
            return respuesta.success(req, res, 'No se encontró un registro de ingreso para esta placa en la fecha especificada', 206);
        }

        const registroIngreso = registros[0];
        
        // Extraemos las horas de descuento y el tipo de parqueadero del registro encontrado
        const horasDescuento = registroIngreso.horasDescuento || 0; 
        const tipoParqueadero = registroIngreso.tipoParqueadero; 

        // 3. Calculamos la diferencia de tiempo real
        const fechaIn = new Date(horaIngreso);
        const fechaOut = new Date(horaSalida);
        const diferenciaMs = fechaOut - fechaIn;

        if (diferenciaMs < 0) {
            return respuesta.success(req, res, 'La hora de salida no puede ser menor a la hora de ingreso', 400);
        }

        const minutosTotales = Math.floor(diferenciaMs / (1000 * 60));
        let horasCalculadas = Math.floor(minutosTotales / 60);
        const minutosRestantes = minutosTotales % 60;

        var horasCalculadasConAproximacion = 0;


        // Si hay "fracción" (1 minuto o más), se aproxima a la siguiente hora entera
        if (minutosRestantes > 0) {
            horasCalculadasConAproximacion = horasCalculadas + 1;
        }
        
        // Restar el descuento al tiempo de parqueo ya redondeado
        let tiempoMenosDescuento = horasCalculadasConAproximacion - horasDescuento;

        // Validamos que el descuento no deje las horas en negativo
        if (tiempoMenosDescuento < 0) {
            tiempoMenosDescuento = 0;
        }

        // --- NUEVA LÓGICA: CONSULTA Y CÁLCULO DE TARIFAS ---
        
        // Consumimos las tarifas de la base de datos
        const respuestaTarifas = await controladorValores.todosValoresParqueaderoVisitantes();
        let valorAFacturar = 0;
        let tarifaCorrespondiente = null; // Declarar fuera del bloque if

        // El controlador devuelve directamente las filas de la consulta,
        // no un objeto con propiedad body.
        const tarifas = Array.isArray(respuestaTarifas)
            ? respuestaTarifas
            : (respuestaTarifas && respuestaTarifas.body)
                ? respuestaTarifas.body
                : [];
     

        // Validamos que la respuesta contenga el arreglo de tarifas esperado
        if (tarifas && tarifas.length > 0) {
            // Buscamos la tarifa cuyo 'tipoVehiculo' sea igual al 'tipoParqueadero' del registro
            tarifaCorrespondiente = tarifas.find(
                tarifa => String(tarifa.tipoVehiculo).toLowerCase() === String(tipoParqueadero).toLowerCase()
            );

            if (tarifaCorrespondiente) {
                // Multiplicamos el valor de la tarifa por el tiempo con descuento
                valorAFacturar = tarifaCorrespondiente.valor * tiempoMenosDescuento;
            }
        } else {
            console.log('No se obtuvieron tarifas desde el controlador de valores.');
        }


        const estado = 0; // Nuevo campo para indicar el estado del registro
        const valorParqueadero = valorAFacturar; // Aquí se asigna el valor calculado para facturar
        // Usamos String().padStart(2, '0') para que si los minutos son menores a 10, les ponga un cero a la izquierda.
        const minutosFormateados = String(minutosRestantes).padStart(2, '0');
        // Juntamos las horas y los minutos con el formato de dos puntos (:)
        const tiempoParqueoReal = `${horasCalculadas}:${minutosFormateados}`;
        const tiempoParqueoConAproximacion = horasCalculadasConAproximacion; // Tiempo con aproximación por fracción
        // 4. Enviamos los datos finales ya calculados al controlador de liquidación


        const resultadoLiquidacion = await controlador.liquidarParqueaderoVisitante(
            placa, 
            horaIngreso, 
            horaSalida, 
            tiempoMenosDescuento, 
            valorParqueadero,
            tiempoParqueoReal,
            tiempoParqueoConAproximacion,
            vigilanteSalida,
            estado
        );
        
        const mensaje = 'Parqueadero de visitante liquidado con éxito';

        respuesta.success(req, res, mensaje, 200);

    } catch (err) {
        next(err);
    }
}

async function consultarRegistroPorFiltroParqueaderoVisitante(req, res, next) {
    try {
        // Ejecutamos la consulta en el controlador
        const items = await controlador.consultarRegistroPorFiltroParqueaderoVisitante(req.params.placa, req.params.horaIngreso);
        
        const mensaje = 'Parqueadero de visitante encontrado con éxito';

        // Enviamos 'items' como cuarto parámetro para que viajen los datos en el body
        respuesta.success(req, res, items, 200);
        
    } catch (err) {
        next(err);
    }
}

async function consultarExistenteParqueaderoVisitante(req, res, next) {
    try {
        const items = await controlador.consultarExistenteParqueaderoVisitante(req.params.placa, req.params.horaIngreso);
        
        // Verificamos si el arreglo tiene elementos
        if (items && items.length > 0) {
            const mensaje = 'Se encontró un registro con esa placa en esta fecha';
            respuesta.success(req, res, mensaje, 200);
        } else {
            const mensaje = 'No se encontraron registros con esa placa en esa fecha';
            // Usamos tu módulo de respuesta personalizada con el código 206
            respuesta.success(req, res, mensaje, 206); 
        }
    } catch (err) {
        next(err);
    }
};
 /* async function eliminar (req, res, next) {
    try{ 
        
            const items = await controlador.eliminar(req.params.id);
            respuesta.success(req, res, 'arrendatario eliminado satisfactoriamente', 200);
            //console.log("exitoso")

           respuesta.error(req, res, 'No se encontro el idCedulaArrendatario', 206);

    }catch(err){
        //console.log("error")
        next(err);
    }
};

async function actualizarArrendatario(req, res, next) {
    try {
        // La validación de los datos completos podría hacerse aquí
        const items = await controlador.actualizarArrendatario(req.body);
        const mensaje = 'arrendatario actualizado con exito';

        respuesta.success(req, res, mensaje, 200);
    } catch (err) {
        next(err);
    }
};

*/
module.exports = router;