 const mysql = require('mysql2');
 const config = require('../config');

const bdconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port || 3306,
}

let conexion;

function conMysql(){
    conexion = mysql.createConnection(bdconfig);
    conexion.connect ((err) => {
        if(err){
          console.log('[db err]', err);
          setTimeout(conMysql, 200);
        }else{
            console.log('DB Conectada!!!')
        }
    })   
    conexion.on('err', err =>{
        console.log('[db err]', err)
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conMysql();
        }else{
            throw err;
        }
    })
}

conMysql();

/* QUERYS ARRENDATARIO*/

  function  todos(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

   function  todosUsuarios(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

function uno(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idArrendatario=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }
 function insertar(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
 function actualizarArrendatario(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idArrendatario= ?`, [data, data.idArrendatario],  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
 function agregar(tabla, data){
    //desicion para insertar si es igual a 1
    /*
    if(data && data.idCedulaArrendatario == 0){
        return insertar(tabla, data);
    }else{
        return actualizar(tabla, data);
    }
    */
    return insertar(tabla, data);
 }
 
 function eliminar(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idArrendatario = ?`, id, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function actualizarArrendatario(tabla, data) {
    return new Promise((resolve, reject) => {
        // La cláusula 'WHERE' es crucial para identificar el registro a actualizar
        const id = data.idArrendatario;
        // Elimina el id del objeto 'data' para evitar un error de SQL al intentar actualizarlo
        delete data.idArrendatario; 

        conexion.query(`UPDATE ${tabla} SET ? WHERE idArrendatario= ?`, [data, id], (error, result) => {
            // Maneja el error de la base de datos
            if (error) {
                return reject(error);
            }

            // Aquí está la solución: verifica el número de filas afectadas
            if (result.affectedRows === 0) {
                // Si ninguna fila fue afectada, significa que el registro no existe
                const err = new Error('El registro no existe para la actualización');
                err.status = 404; // Código de estado HTTP 404 Not Found
                return reject(err);
            }

            // Si se actualizó correctamente, resuelve con el resultado
            return resolve(result);
        });
    });   
}
/* QUERYS USUARIO*/

function  todosUsuarios(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

function unoUsuarios(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idUsuarios=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

// DB/mysql.js
function consultaPorCorreo(tabla, correo) {
    return new Promise((resolve, reject) => {
        // Usamos ? para evitar el error de sintaxis y por seguridad
        conexion.query(`SELECT * FROM ${tabla} WHERE correo= ?`, [correo], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

// Asegúrate de exportarla al final del archivo
module.exports = {
    // ... otras funciones
    consultaPorCorreo, 
};

function consultarCorreo(tabla, correo) {
    return new Promise((resolve, reject) => {
        // Cambiamos 'correo, clave' por '*' para traer todos los campos (incluyendo el nuevo campo ROL)
        // El ?? es para nombres de tablas y el ? para valores de texto
        const sql = `SELECT * FROM ?? WHERE correo = ?`;
        
        conexion.query(sql, [tabla, correo], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

function insertarUsuarios(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
 function agregarUsuarios(tabla, data){

    return insertar(tabla, data);
 }

 function actualizarUsuarios(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idUsuarios= ?`, [data, data.idUsuarios],  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
 function eliminarUsuarios(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idUsuarios= ?`, id,  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

/* QUERYS PROPIETARIO*/

function  todosPropietario(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

function unoPropietario(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idPropietario=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }
function AgregarPropietario(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
 function insertarPropietario(tabla, data){
    //desicion para insertar si es igual a 1
    /*
    if(data && data.idCedulaArrendatario == 0){
        return insertar(tabla, data);
    }else{
        return actualizar(tabla, data);
    }
    */
    return insertar(tabla, data);
 }
 function actualizarPropietario(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idPropietario= ?`, [data, data.idPropietario],  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

 function eliminarPorIdPropietario(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idPropietario = ?`, id,  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function unoFuncionarios(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE cedula=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 function agregarHistoria(tabla, datos) {
    return new Promise((resolve, reject) => {
        // El signo "?" se encarga de mapear el objeto "datos" a las columnas de la tabla
        conexion.query(`INSERT INTO ${tabla} SET ?`, datos, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

function listarHistorias(tabla) {
    return new Promise((resolve, reject) => {
        // Unimos con la tabla usuarios para obtener el nombre del publicador
        // Ordenamos por fecha de forma descendente (DESC) para ver lo más nuevo primero
        const sql = `
            SELECT m.*, u.nombreUsuario AS autor 
            FROM ?? m
            JOIN usuarios u ON m.idUsuario = u.idUsuarios
            ORDER BY m.fecha_creacion DESC`;

        conexion.query(sql, [tabla], (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

/* QUERY RESIDENTES UNIFICADOS */

function todosResidentesActivos() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT idPropietario AS id, nombre, apellido, cedula, celular, correo, Apartamento_idApartamento, estado, 'Propietario' AS tipo 
            FROM propietario 
            WHERE estado = 1
            UNION ALL
            SELECT idArrendatario AS id, nombre, apellido, cedula, celular, correo, Apartamento_idApartamento, estado, 'Arrendatario' AS tipo 
            FROM arrendatario 
            WHERE estado = 1
        `;
        
        conexion.query(sql, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}


/* QUERYS Parqueadero*/


  function  todosParqueadero(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }


function unoParqueadero(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idParqueadero=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 function actualizarParqueadero(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE cedula= ?`, [data, data.cedula],  (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

 function agregarParqueadero(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }
 
 function eliminarParqueadero(tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idParqueadero= ?`, 
              (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}
function actualizarSolicitudParqueadero(tabla, data) {
    return new Promise((resolve, reject) => {
        // Actualizamos estado, observaciones, fechaRespuesta y guardamos el ID del administrador que gestiona
        const query = `
            UPDATE ${tabla} 
            SET estado = ?, observaciones = ?, fechaRespuesta = ?
            WHERE idSolicitudParqueadero = ?
        `;
        
        conexion.query(
            query, 
            [data.estado, data.observaciones, data.fechaRespuesta, data.id], 
            (error, result) => {
                return error ? reject(error) : resolve(result);
            }
        );
    });
}

/* QUERYS Trasteos*/

function todosSolicitudTrasteos(tabla) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                t.*,
                COALESCE(prop.Apartamento_idApartamento, arr.Apartamento_idApartamento) AS numeroApartamento
            FROM ${tabla} t
            LEFT JOIN propietario prop ON t.idPropietario = prop.cedula
            LEFT JOIN arrendatario arr ON t.idArrendatario = arr.cedula
        `;
        
        conexion.query(sql, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

 function agregarSolicitudTrasteos(tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 function actualizarSolicitudTrasteo(tabla, data) {
    return new Promise((resolve, reject) => {
        // Actualizamos estado, Observaciones y fijamos la fechaRespuesta con la hora del servidor
        const query = `
            UPDATE ${tabla} 
            SET estado = ?, 
            observaciones = ?, fechaRespuesta = NOW() 
            WHERE idSolicitudTrasteos = ?
        `;
        
        conexion.query(
            query, 
            [data.estado, data.observaciones, data.id], 
            (error, result) => {
                return error ? reject(error) : resolve(result);
            }
        );
    });
}

 /* QUERYS Salones Sociales*/

function todosSolicitudSalonesSociales(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 function agregarSolicitudSalonesSociales (tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 /* QUERYS Salones Sociales - Actualización */

function actualizarSolicitudSalonesSociales(tabla, data) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE ${tabla} 
            SET estado = ?, 
                observaciones = ?, 
                fechaRespuesta = NOW() 
            WHERE idsolicitudsalonessociales = ?
        `;
        
        conexion.query(
            query, 
            [data.estado, data.observaciones, data.id], 
            (error, result) => {
                return error ? reject(error) : resolve(result);
            }
        );
    });
}

/* QUERYS Parqueadero Visitante */

function agregarParqueaderoVisitante (tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }
function todosParqueaderoVisitante(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

function liquidarParqueaderoVisitante(tabla, placa, horaIngreso, data) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE ${tabla} SET ? WHERE placa = ? AND DATE(horaIngreso) = DATE(?)`;
        conexion.query(sql, [data, placa, horaIngreso], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function consultarExistenteParqueaderoVisitante(tabla, placa, horaIngreso) {
    return new Promise((resolve, reject) => {
        // Usamos DATE() para extraer solo la parte de 'año-mes-día' 
        // y compararla con el parámetro recibido.
        const sql = `SELECT * FROM ${tabla} WHERE placa = ? AND DATE(horaIngreso) = DATE(?)`;
        const params = [placa, horaIngreso];

        conexion.query(sql, params, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}  

function consultarRegistroPorFiltroParqueaderoVisitante(tabla, placa, horaIngreso) {
    return new Promise((resolve, reject) => {
        // Usamos DATE() para extraer solo la parte de 'año-mes-día' 
        // y compararla con el parámetro recibido.
        const sql = `SELECT * FROM ${tabla} WHERE placa = ? AND DATE(horaIngreso) = DATE(?)`;
        const params = [placa, horaIngreso];

        conexion.query(sql, params, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        
    });
} 

function obtenerarqueo(tabla, fechaInicio, fechaFin) {
    return new Promise((resolve, reject) => {
        // SQL inteligente: Cuenta y suma según el tipo de vehículo en el rango dado
        const sql = `
            SELECT 
                COUNT(IF(tipoParqueadero = 'Carro', 1, NULL)) AS totalCarrosLiquidados,
                COUNT(IF(tipoParqueadero = 'Moto', 1, NULL)) AS totalMotosLiquidados,
                COUNT(*) AS totalVehiculosLiquidados,
                SUM(IF(tipoParqueadero = 'Carro', valorParqueadero, 0)) AS recaudadoCarros,
                SUM(IF(tipoParqueadero = 'Moto', valorParqueadero, 0)) AS recaudadoMotos,
                SUM(valorParqueadero) AS recaudadoTotal,
                SUM(horasDescuento) AS totalHorasDescuentoAplicadas
            FROM ${tabla}
            WHERE estado = 'Liquidado' 
              AND horaSalida BETWEEN ? AND ?
        `;

        conexion.query(sql, [fechaInicio, fechaFin], (error, result) => {
            if (error) return reject(error);
            // Como las funciones de agregación devuelven una sola fila, resolvemos el primer índice
            resolve(result[0] || {});
        });
    });
}

// Wrapper con camelCase para compatibilidad con los controladores
function obtenerArqueo(tabla, fechaInicio, fechaFin) {
    return obtenerarqueo(tabla, fechaInicio, fechaFin);
}


/* QUERYS Valores Parqueadero Visitante */

function todosValoresParqueaderoVisitantes(tabla){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }


/* QUERYS Pqrs*/

function todosPqrs(tabla) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                p.*,
                prop.Apartamento_idApartamento AS numeroApartamento
            FROM ${tabla} p
            INNER JOIN usuarios u ON p.idUsuario = u.idUsuarios
            LEFT JOIN propietario prop ON u.idUsuarios = prop.cedula
        `;
        
        conexion.query(sql, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function unoPqrs (tabla, id){
    return new Promise( (resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idPqrs=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }

 function agregarPqrs (tabla, data){
    return new Promise( (resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
 }
 
function eliminarPqrs(tabla, id) {
    return new Promise((resolve, reject) => {
        // Cambiamos "id" por "idpqrs" para que haga match con tu BD
        conexion.query(`DELETE FROM ${tabla} WHERE idpqrs = ?`, [id], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}
function actualizarEstadoPqrs(tabla, datos) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE ${tabla} SET estado = ?`;
        let params = [datos.estado];
        
        if (datos.respuestaPqrs !== undefined) {
            sql += `, respuestaPqrs = ?`;
            params.push(datos.respuestaPqrs);
        }

        if (datos.fechaRespuesta !== undefined) {
            sql += `, fechaRespuesta = ?`;
            params.push(datos.fechaRespuesta);
        }
        
        sql += ` WHERE idpqrs = ?`;
        params.push(datos.idpqrs);

        conexion.query(sql, params, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

// 🌟 NUEVA FUNCIÓN DE FILTRADO:
function pqrsPorPropietario(tabla, identificacion) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                p.*,
                prop.Apartamento_idApartamento AS numeroApartamento
            FROM ${tabla} p
            INNER JOIN usuarios u ON p.idUsuario = u.idUsuarios
            LEFT JOIN propietario prop ON u.idUsuarios = prop.cedula
            WHERE p.idUsuario = ?
        `;
        
        conexion.query(sql, [identificacion], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    actualizarArrendatario,
    todosUsuarios,
    unoUsuarios,
    agregarUsuarios,
    actualizarUsuarios,
    eliminarUsuarios,
    todosPropietario,
    unoPropietario,
    AgregarPropietario,
    actualizarPropietario,
    eliminarPorIdPropietario,
    consultarCorreo,
    consultaPorCorreo,
    unoFuncionarios,
    agregarHistoria,
    listarHistorias,
    todosResidentesActivos,
    todosParqueadero,
    unoParqueadero,
    agregarParqueadero,
    eliminarParqueadero,
    actualizarParqueadero,
    todosSolicitudTrasteos,
    agregarSolicitudTrasteos,
    todosSolicitudSalonesSociales,
    agregarSolicitudSalonesSociales,
    agregarParqueaderoVisitante,
    todosParqueaderoVisitante,
    liquidarParqueaderoVisitante,
    todosPqrs,
    unoPqrs,
    agregarPqrs,
    eliminarPqrs,
    actualizarEstadoPqrs,
    pqrsPorPropietario,
    consultarExistenteParqueaderoVisitante,
    consultarRegistroPorFiltroParqueaderoVisitante,
    todosValoresParqueaderoVisitantes,
    obtenerarqueo,
    obtenerArqueo,
    actualizarSolicitudParqueadero,
    actualizarSolicitudTrasteo,
    actualizarSolicitudSalonesSociales,
}
