// Controlador de la tabla: búsqueda, filtros combinados, orden, paginación y CSV

import { obtenerFincas } from '../modelo/fincaModelo.js';
import { CATEGORIAS, filtrarFincas, ordenarFincas, paginar, generarCSV } from '../modelo/reglas.js';
import * as vista from '../vista/tablaVista.js';

const FILAS_POR_PAGINA = 5;

// Estado de orden y página (los filtros se leen de la vista)
const estadoTabla = { columna: null, direccion: 'asc', pagina: 1 };

// Fincas que cumplen los filtros, ya ordenadas (sin paginar)
function obtenerListaVisible() {
    const filtradas = filtrarFincas(obtenerFincas(), vista.leerFiltros());
    if (estadoTabla.columna === null) return filtradas;
    return ordenarFincas(filtradas, estadoTabla.columna, estadoTabla.direccion);
}

export function refrescarTabla() {
    const lista = obtenerListaVisible();
    const pagina = paginar(lista, estadoTabla.pagina, FILAS_POR_PAGINA);
    estadoTabla.pagina = pagina.pagina;
    vista.renderizarTabla(pagina.items);
    vista.renderizarPaginacion(pagina, lista.length, obtenerFincas().length);
    vista.marcarOrden(estadoTabla.columna, estadoTabla.direccion);
}

// Al cambiar un filtro se vuelve a la primera página
function aplicarFiltros() {
    estadoTabla.pagina = 1;
    refrescarTabla();
}

export function registrarEventosTabla() {
    vista.llenarFiltroCategoria(CATEGORIAS);

    vista.elementos.buscador.addEventListener('input', aplicarFiltros);
    vista.elementos.filtroCategoria.addEventListener('change', aplicarFiltros);
    vista.elementos.filtroEstado.addEventListener('change', aplicarFiltros);

    // Delegación de eventos: un solo oyente para todos los botones de orden
    vista.elementos.encabezado.addEventListener('click', (e) => {
        const boton = e.target.closest('.tabla-datos__orden');
        if (!boton) return;
        const columna = boton.dataset.columna;
        estadoTabla.direccion = (estadoTabla.columna === columna && estadoTabla.direccion === 'asc') ? 'desc' : 'asc';
        estadoTabla.columna = columna;
        estadoTabla.pagina = 1;
        refrescarTabla();
    });

    vista.elementos.botonAnterior.addEventListener('click', () => {
        estadoTabla.pagina -= 1;
        refrescarTabla();
    });
    vista.elementos.botonSiguiente.addEventListener('click', () => {
        estadoTabla.pagina += 1;
        refrescarTabla();
    });

    // El CSV lleva todas las fincas que cumplen los filtros, no solo la página visible
    vista.elementos.botonCsv.addEventListener('click', () => {
        vista.descargarCSV(generarCSV(obtenerListaVisible()), 'fincas.csv');
    });
}
