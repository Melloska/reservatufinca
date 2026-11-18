// Vista de reservas y contacto: lee los formularios y dibuja los mensajes.
import { crearElemento, crearLineaDato, formatearPrecio } from './utilidadesVista.js';

const porId = (id) => document.getElementById(id);

export const elementos = {
    selectFinca: porId('finca-select'),
    selectTipo: porId('tipo-servicio'),
    inputCantidad: porId('cantidad'),
    formReserva: porId('form-reserva'),
    formContacto: porId('form-contacto')
};

const resultadoReserva = porId('resultado-reserva');

// Los mensajes de error los escribe la página (no el navegador), por eso se desactiva la validación nativa
elementos.formReserva.noValidate = true;
elementos.formContacto.noValidate = true;

// Párrafo de error que se coloca justo antes del botón de enviar
function crearAvisoError(formulario) {
    const aviso = crearElemento('p', '', 'mensaje-error');
    aviso.classList.add('oculto');
    aviso.setAttribute('role', 'alert');
    formulario.querySelector('button[type="submit"]').before(aviso);
    return aviso;
}

const avisoErrorReserva = crearAvisoError(elementos.formReserva);
const avisoErrorContacto = crearAvisoError(elementos.formContacto);

function mostrarError(aviso, error) {
    aviso.textContent = error.mensaje;
    aviso.classList.remove('oculto');
    const campo = porId(error.campo);
    campo.classList.add('campo-error');
    campo.focus();
}

function limpiarErrores(formulario, aviso) {
    aviso.classList.add('oculto');
    formulario.querySelectorAll('.campo-error').forEach((campo) => campo.classList.remove('campo-error'));
}

// ---- Reserva ----

// Opciones que afectan el precio
export function leerOpcionesReserva() {
    return {
        fincaId: elementos.selectFinca.value,
        tipoServicio: elementos.selectTipo.value,
        cantidad: parseInt(elementos.inputCantidad.value) || 0
    };
}

export function leerFormularioReserva() {
    return {
        ...leerOpcionesReserva(),
        nombre: porId('nombre').value.trim(),
        correo: porId('correo').value.trim(),
        telefono: porId('telefono').value.trim(),
        direccion: porId('direccion').value.trim(),
        metodoPago: porId('metodo-pago').value,
        instrucciones: porId('instrucciones').value.trim()
    };
}

export function mostrarErrorCampoReserva(error) {
    mostrarError(avisoErrorReserva, error);
}

export function limpiarErroresReserva() {
    limpiarErrores(elementos.formReserva, avisoErrorReserva);
}

export function actualizarPrecio(total) {
    porId('precio-calculado').textContent = formatearPrecio(total);
}

export function mostrarConfirmacion(reserva) {
    const gracias = document.createElement('p');
    gracias.appendChild(crearElemento('em', 'Gracias por confiar en nosotros y nuestros servicios. ¡Esperamos que disfrute su estadía!'));

    resultadoReserva.classList.remove('oculto', 'mensaje-error');
    resultadoReserva.classList.add('mensaje-exito');
    resultadoReserva.replaceChildren(
        crearElemento('h3', ' ¡Registro y Reserva Exitosos!....'),
        crearLineaDato('Cliente:', reserva.nombre),
        crearLineaDato('Finca:', reserva.fincaNombre),
        crearLineaDato('Modalidad:', `${reserva.tipoServicio === 'noche' ? 'Noches' : 'Día de Sol'} (${reserva.cantidad})`),
        crearLineaDato('Método de Pago:', reserva.metodoPago),
        crearLineaDato('Total Facturado:', formatearPrecio(reserva.total)),
        crearLineaDato('Instrucciones Especiales:', reserva.instrucciones || 'Ninguna'),
        gracias
    );
}

// Errores que vienen de la nube (por ejemplo, sin internet)
export function mostrarErrorReserva(mensaje) {
    resultadoReserva.classList.remove('oculto', 'mensaje-exito');
    resultadoReserva.classList.add('mensaje-error');
    resultadoReserva.replaceChildren(crearElemento('p', mensaje));
}

export function limpiarFormularioReserva() {
    elementos.formReserva.reset();
}

// ---- Contacto ----
export function leerFormularioContacto() {
    return {
        nombre: porId('contacto-nombre').value.trim(),
        correo: porId('contacto-correo').value.trim(),
        telefono: porId('contacto-telefono').value.trim(),
        mensaje: porId('contacto-texto').value.trim()
    };
}

export function mostrarErrorCampoContacto(error) {
    mostrarError(avisoErrorContacto, error);
}

export function limpiarErroresContacto() {
    limpiarErrores(elementos.formContacto, avisoErrorContacto);
}

export function mostrarContacto(nombre) {
    const resultado = porId('resultado-contacto');
    resultado.textContent = `Gracias, ${nombre}. Recibimos tu mensaje y te responderemos pronto.`;
    resultado.classList.remove('oculto');
}

export function limpiarFormularioContacto() {
    elementos.formContacto.reset();
}
