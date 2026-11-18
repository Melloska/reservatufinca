// Vista de la tabla de datos: dibuja filas, paginación y orden, y lee los filtros.
import { crearElemento, formatearPrecio } from './utilidadesVista.js';

const porId = (id) => document.getElementById(id);

export const elementos = {
    buscador: porId('tabla-buscador'),
    filtroCategoria: porId('tabla-filtro-categoria'),
    filtroEstado: porId('tabla-filtro-estado'),
    botonCsv: porId('btn-exportar-csv'),
    encabezado: porId('tabla-encabezado'),
    botonAnterior: porId('btn-pagina-anterior'),
    botonSiguiente: porId('btn-pagina-siguiente')
};

const tablaCuerpo = porId('tabla-cuerpo');
const contador = porId('tabla-contador');
const avisoVacio = porId('tabla-vacia');
const etiquetaPagina = porId('tabla-pagina');

export function llenarFiltroCategoria(categorias) {
    categorias.forEach((categoria) => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        elementos.filtroCategoria.appendChild(opcion);
    });
}

export function leerFiltros() {
    return {
        texto: elementos.buscador.value,
        categoria: elementos.filtroCategoria.value,
        estado: elementos.filtroEstado.value
    };
}

export function renderizarTabla(fincas) {
    tablaCuerpo.replaceChildren();
    fincas.forEach((finca) => {
        const fila = document.createElement('tr');
        if (finca.cantidad === 0) { fila.classList.add('agotada-fila'); }
        [finca.nombre, finca.categoria, formatearPrecio(finca.precioNoche), formatearPrecio(finca.precioDiaSol),
            finca.cantidad, finca.cantidad === 0 ? 'Agotada' : 'Disponible'].forEach((valor) => {
            fila.appendChild(crearElemento('td', valor));
        });
        tablaCuerpo.appendChild(fila);
    });
}

export function renderizarPaginacion(pagina, totalFiltradas, totalFincas) {
    contador.textContent = `Mostrando ${totalFiltradas} de ${totalFincas} fincas`;
    avisoVacio.classList.toggle('oculto', totalFiltradas !== 0);
    etiquetaPagina.textContent = `Página ${pagina.pagina} de ${pagina.totalPaginas}`;
    elementos.botonAnterior.disabled = pagina.pagina <= 1;
    elementos.botonSiguiente.disabled = pagina.pagina >= pagina.totalPaginas;
}

// Marca en el encabezado la columna ordenada (flecha ▲ / ▼ con CSS)
export function marcarOrden(columna, direccion) {
    elementos.encabezado.querySelectorAll('th').forEach((celda) => {
        const boton = celda.querySelector('.tabla-datos__orden');
        if (!boton) return;
        let estado = 'none';
        if (boton.dataset.columna === columna) { estado = (direccion === 'asc') ? 'ascending' : 'descending'; }
        celda.setAttribute('aria-sort', estado);
    });
}

// Descarga un archivo CSV (con BOM para que Excel respete las tildes)
export function descargarCSV(texto, nombreArchivo) {
    const archivo = new Blob(['\uFEFF' + texto], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
}
