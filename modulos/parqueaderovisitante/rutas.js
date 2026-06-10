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
router.post('/arqueo', obtenerArqueo);

function formatMySQLDatetime(dateStrOrObj) {
    if (!dateStrOrObj) return null;
    const date = new Date(dateStrOrObj);
    if (isNaN(date.getTime())) return null;
    
    const pad = (num) => String(num).padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}

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
async function agregarParqueaderoVisitante(req, res, next) {
    try {
        // 1. Extraemos la placa y la hora de ingreso que vienen del formulario
        const { placa, horaIngreso } = req.body;

        // 2. Ejecutamos la consulta interna con el nombre correcto en español:
        const registrosExistentes = await controlador.consultarExistenteParqueaderoVisitante(placa, horaIngreso);

        // 3. Creamos una copia del body para manipular los campos de forma segura
        const datosParaGuardar = { ...req.body };

        // 4. Convertimos la hora de ingreso para evaluar la franja horaria
        const fechaIn = new Date(horaIngreso);
        const horaExactaIngreso = fechaIn.getHours(); 

        // REGLA 1: ¿El ingreso es en la Jornada Plena Nocturna? (8:00 PM a 5:59 AM)
        if (horaExactaIngreso >= 20 || horaExactaIngreso < 6) {
            datosParaGuardar.horasDescuento = 0;
            console.log(`🌙 [Jornada Nocturna] Vehículo ${placa} ingresa a las ${horaExactaIngreso}:00. Horas descuento forzadas a 0.`);
        } else {
            // REGLA 2: Si es de día, evaluamos el historial de ingresos diarios
            if (registrosExistentes && registrosExistentes.length > 0) {
                datosParaGuardar.horasDescuento = 0;
                console.log(`🚗 [Jornada Diurna] El vehículo ${placa} ya registra ingresos hoy. Horas descuento: 0`);
            } else {
                datosParaGuardar.horasDescuento = 2;
                console.log(`🎁 [Jornada Diurna] Primer ingreso del día para ${placa}. Horas descuento otorgadas: 2`);
            }
        }

        // 5. Enviamos el objeto modificado al controlador para hacer el INSERT INTO
        const items = await controlador.agregarParqueaderoVisitante(datosParaGuardar);
        
        const mensaje = 'Parqueadero de visitante guardado con éxito';
        respuesta.success(req, res, mensaje, 201);

    } catch (err) {
        next(err);
    }
}

async function liquidarParqueaderoVisitante(req, res, next) {
    try {
        // 1. Extraemos los datos que envía el cliente y los formateamos para MySQL
        const { placa, horaIngreso: rawHoraIngreso, horaSalida: rawHoraSalida, vigilanteSalida } = req.body; 
        const horaIngreso = formatMySQLDatetime(rawHoraIngreso);
        const horaSalida = formatMySQLDatetime(rawHoraSalida);

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
        } else {
            horasCalculadasConAproximacion = horasCalculadas;
        }
        
        // Restar el descuento al tiempo de parqueo ya redondeado
        let tiempoMenosDescuento = horasCalculadasConAproximacion - horasDescuento;

        // Validamos que el descuento no deje las horas en negativo
        if (tiempoMenosDescuento < 0) {
            tiempoMenosDescuento = 0;
        }

        // --- NUEVA LÓGICA: CONSULTA Y CÁLCULO DE TARIFAS ---
        
        // Extraemos la hora exacta del ingreso (Número de 0 a 23)
        const horaExactaIngreso = fechaIn.getHours();
        let valorAFacturar = 0;

        // EVALUACIÓN DE LA REGLA DE NEGOCIO JORNADA PLENA NOCTURNA
        if (horaExactaIngreso >= 20 || horaExactaIngreso < 6) {
            
            // REGLA NOCTURNA: Si ingresó entre las 8:00 PM (20) y las 6:00 AM (5:59), tarifa única
            valorAFacturar = 4000;
            console.log(`🌙 Aplica Tarifa Nocturna Única para ${placa}. Ingreso: ${horaExactaIngreso}:00`);

        } else {
            
            // REGLA DIURNA ORDINARIA: Consumimos las tarifas normales de la base de datos
            const respuestaTarifas = await controladorValores.todosValoresParqueaderoVisitantes();
            let tarifaCorrespondiente = null;

            const tarifas = Array.isArray(respuestaTarifas)
                ? respuestaTarifas
                : (respuestaTarifas && respuestaTarifas.body)
                    ? respuestaTarifas.body
                    : [];

            if (tarifas && tarifas.length > 0) {
                tarifaCorrespondiente = tarifas.find(
                    tarifa => String(tarifa.tipoVehiculo).toLowerCase() === String(tipoParqueadero).toLowerCase()
                );

                if (tarifaCorrespondiente) {
                    const horasPorCobrar = Math.max(0, horasCalculadasConAproximacion - horasDescuento);
                    valorAFacturar = tarifaCorrespondiente.valor * horasPorCobrar;
                }
            } else {
                console.log('No se obtuvieron tarifas desde el controlador de valores.');
            }
        }

        const estado = 0; // Nuevo campo para indicar el estado del registro
        const valorParqueadero = valorAFacturar; // Aquí se asigna el valor calculado para facturar
        
        const minutosFormateados = String(minutosRestantes).padStart(2, '0');
        const tiempoParqueoReal = `${horasCalculadas}:${minutosFormateados}`;
        const tiempoParqueoConAproximacion = horasCalculadasConAproximacion; 

        // 4. Enviamos los datos finales ya calculados al controlador de liquidación
        await controlador.liquidarParqueaderoVisitante(
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

        // 4.1. Construimos el cuerpo de la respuesta con exactamente los campos que necesitas
        const dataRespuesta = {
            placa,
            horaIngreso,
            horaSalida,
            tiempoMenosDescuento,
            valorParqueadero,
            tiempoParqueoReal,
            tiempoParqueoConAproximacion,
            vigilanteSalida,
            estado,
            horasDescuento
        };

        // 5. Enviamos la respuesta exitosa al frontend con el objeto lleno de información
        respuesta.success(req, res, dataRespuesta, 200);

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

async function obtenerArqueo(req, res, next) {
    try {
        const { fechaInicio, fechaFin } = req.body;

        // Validación básica por si la administradora olvida un campo en el formulario
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({
                error: true,
                status: 400,
                body: 'La fecha de inicio y la fecha de fin son obligatorias.'
            });
        }

        // Llamamos al controlador pasándole el rango de horas
        const datosArqueo = await controlador.obtenerArqueo(fechaInicio, fechaFin);

        // Estructuramos la respuesta final estéticamente
        const respuestaFinal = {
            rangoConsulta: {
                desde: fechaInicio,
                hasta: fechaFin
            },
            // Si la base de datos devuelve nulos (porque no hubo datos en esa fecha), los convertimos a 0
            totales: {
                totalCarros: datosArqueo.totalCarrosLiquidados || 0,
                totalMotos: datosArqueo.totalMotosLiquidados || 0,
                totalVehiculos: datosArqueo.totalVehiculosLiquidados || 0,
                dineroCarros: Number(datosArqueo.recaudadoCarros) || 0,
                dineroMotos: Number(datosArqueo.recaudadoMotos) || 0,
                dineroTotal: Number(datosArqueo.recaudadoTotal) || 0,
                descuentosOtorgados: Number(datosArqueo.totalHorasDescuentoAplicadas) || 0
            }
        };

        // Usamos tu manejador personalizado de respuestas exitosas
        respuesta.success(req, res, respuestaFinal, 200);

    } catch (err) {
        next(err);
    }
}
module.exports = router;