// Modelo de reservas: guarda cada reserva en la nube y descuenta el cupo de la finca
import * as nube from '../servicios/baseDatos.js';
import { descontarCupo } from './fincaModelo.js';

// "datos" trae lo que escribió el cliente; "finca" y "total" los calcula el controlador
export async function crearReserva(datos, finca, total) {
    const reserva = {
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        direccion: datos.direccion,
        fincaNombre: finca.nombre,
        tipoServicio: datos.tipoServicio,
        cantidad: datos.cantidad,
        metodoPago: datos.metodoPago,
        instrucciones: datos.instrucciones,
        total
    };
    await nube.crearReserva({
        finca_id: Number(finca.id),
        finca_nombre: reserva.fincaNombre,
        nombre: reserva.nombre,
        correo: reserva.correo,
        telefono: reserva.telefono,
        direccion: reserva.direccion,
        tipo_servicio: reserva.tipoServicio,
        cantidad: reserva.cantidad,
        metodo_pago: reserva.metodoPago,
        instrucciones: reserva.instrucciones,
        total: reserva.total
    });
    await descontarCupo(finca.id);
    return reserva;
}
