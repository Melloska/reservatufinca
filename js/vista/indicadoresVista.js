// Vista de los indicadores de cupos y de satisfacción. Solo dibuja lo que recibe

import { obtenerEstadoCupos } from '../modelo/reglas.js';
import { crearElemento, crearEstrellas } from './utilidadesVista.js';

const porId = (id) => document.getElementById(id);

const MENSAJES_CUPOS = {
    critico: { texto: 'Quedan muy pocos cupos. ¡Reserva ya!', clase: 'msj-critico' },
    alerta: { texto: 'Quedan pocos cupos. ¡Reserva con anticipación!', clase: 'msj-alerta' },
    ok: { texto: 'Hay buena disponibilidad para el fin de semana festivo.', clase: 'msj-ok' }
};

export function renderizarIndicadores(fincas, cupos, satisfaccion) {
    // Cupos disponibles
    const stockFincas = porId('stock-fincas');
    stockFincas.max = Math.max(fincas.length, 1);
    stockFincas.value = cupos.conCupos;
    porId('cupos-resumen').textContent =
        `${cupos.conCupos} de ${fincas.length} fincas con cupos · ${cupos.cuposLibres} de ${cupos.cuposTotales} cupos libres`;

    const mensaje = MENSAJES_CUPOS[cupos.nivel];
    const cuposMensaje = porId('cupos-mensaje');
    cuposMensaje.classList.remove('msj-ok', 'msj-alerta', 'msj-critico');
    cuposMensaje.textContent = mensaje.texto;
    cuposMensaje.classList.add(mensaje.clase);

    const cuposDetalle = porId('cupos-detalle');
    cuposDetalle.replaceChildren();
    fincas.forEach((finca) => {
        const barra = document.createElement('progress');
        barra.max = Math.max(finca.cupoMaximo, 1);
        barra.value = finca.cantidad;
        barra.classList.add('estado-' + obtenerEstadoCupos(finca.cantidad, finca.cupoMaximo));
        barra.setAttribute('aria-label', 'Cupos de ' + finca.nombre);

        const fila = document.createElement('div');
        fila.classList.add('fila-indicador');
        fila.appendChild(crearElemento('span', finca.nombre));
        fila.appendChild(barra);
        fila.appendChild(crearElemento('strong', finca.cantidad === 0 ? 'Agotada' : `${finca.cantidad} de ${finca.cupoMaximo}`));
        cuposDetalle.appendChild(fila);
    });

    // Satisfacción de clientes
    porId('score-numero').textContent = satisfaccion.promedio.toFixed(1);
    porId('score-estrellas').textContent = crearEstrellas(satisfaccion.promedio);
    porId('score-satisfaccion').value = satisfaccion.promedio;
    porId('score-resumen').textContent = satisfaccion.totalResenas === 0
        ? 'Aún no hay reseñas.'
        : `Basado en ${satisfaccion.totalResenas} reseñas de huéspedes · ${satisfaccion.nivel}`;

    const scoreDetalle = porId('score-detalle');
    scoreDetalle.replaceChildren();
    satisfaccion.mejorCalificadas.forEach((finca) => {
        const medidor = document.createElement('meter');
        medidor.min = 0;
        medidor.max = 5;
        medidor.low = 3;
        medidor.high = 4;
        medidor.optimum = 5;
        medidor.value = finca.calificacion;
        medidor.setAttribute('aria-label', 'Calificación de ' + finca.nombre);

        const fila = document.createElement('div');
        fila.classList.add('fila-indicador');
        fila.appendChild(crearElemento('span', finca.nombre));
        fila.appendChild(medidor);
        fila.appendChild(crearElemento('strong', `${finca.calificacion.toFixed(1)} ★ (${finca.resenas} reseñas)`));
        scoreDetalle.appendChild(fila);
    });
}
