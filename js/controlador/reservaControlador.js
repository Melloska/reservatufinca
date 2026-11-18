// Controlador de reservas y contacto: eventos de los formularios y flujo hacia el modelo.
import { buscarFinca } from '../modelo/fincaModelo.js';
import { crearReserva } from '../modelo/reservaModelo.js';
import { calcularCostoReserva, validarReserva, validarContacto } from '../modelo/reglas.js';
import * as vista from '../vista/reservaVista.js';
import { refrescar } from './fincaControlador.js';

// Recalcula el precio cada vez que el usuario cambia una opción
export function procesarCalculo() {
    const { fincaId, tipoServicio, cantidad } = vista.leerOpcionesReserva();
    vista.actualizarPrecio(calcularCostoReserva(buscarFinca(fincaId), tipoServicio, cantidad));
}

async function reservar() {
    vista.limpiarErroresReserva();
    const datos = vista.leerFormularioReserva();
    const error = validarReserva(datos);
    if (error !== null) {
        vista.mostrarErrorCampoReserva(error);
        return;
    }
    const finca = buscarFinca(datos.fincaId);
    if (!finca) {
        vista.mostrarErrorCampoReserva({ campo: 'finca-select', mensaje: 'Esa finca ya no está disponible. Selecciona otra.' });
        return;
    }
    const total = calcularCostoReserva(finca, datos.tipoServicio, datos.cantidad);
    try {
        const reserva = await crearReserva(datos, finca, total);
        refrescar();
        vista.mostrarConfirmacion(reserva);
        vista.limpiarFormularioReserva();
        vista.actualizarPrecio(0);
    } catch (errorNube) {
        vista.mostrarErrorReserva(errorNube.message);
    }
}

function enviarContacto() {
    vista.limpiarErroresContacto();
    const datos = vista.leerFormularioContacto();
    const error = validarContacto(datos);
    if (error !== null) {
        vista.mostrarErrorCampoContacto(error);
        return;
    }
    vista.mostrarContacto(datos.nombre);
    vista.limpiarFormularioContacto();
}

export function registrarEventosReserva() {
    vista.elementos.selectFinca.addEventListener('change', procesarCalculo);
    vista.elementos.selectTipo.addEventListener('change', procesarCalculo);
    vista.elementos.inputCantidad.addEventListener('input', procesarCalculo);

    vista.elementos.formReserva.addEventListener('submit', (e) => {
        e.preventDefault();
        reservar();
    });

    vista.elementos.formContacto.addEventListener('submit', (e) => {
        e.preventDefault();
        enviarContacto();
    });
}
