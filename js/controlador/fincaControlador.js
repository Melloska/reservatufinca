// Controlador de fincas: escucha los eventos, llama al modelo y le pide a la vista que dibuje.
import { obtenerFincas, buscarFinca, cargarFincas, agregarFinca, editarFinca, eliminarFinca, obtenerOrigenDatos } from '../modelo/fincaModelo.js';
import {
    CATEGORIAS, filtrarFincas, validarFinca, obtenerImagenesDisponibles,
    calcularResumen, calcularIndicadoresCupos, calcularSatisfaccion
} from '../modelo/reglas.js';
import * as catalogo from '../vista/catalogoVista.js';
import { renderizarIndicadores } from '../vista/indicadoresVista.js';
import { refrescarTabla } from './tablaControlador.js';
import { cargarClimas } from './climaControlador.js';

// Estado de los filtros (lo que el usuario eligió en pantalla)
let categoriaActiva = 'Todas';
let textoBusqueda = '';
let idEditando = null; // id de la finca en edición (null = modo agregar)

// Vuelve a dibujar todo lo que depende de los datos
export function refrescar() {
    const fincas = obtenerFincas();
    catalogo.llenarSelectFincas(fincas);
    const visibles = filtrarFincas(fincas, { texto: textoBusqueda, categoria: categoriaActiva });
    catalogo.renderizarCatalogo(visibles, fincas.length);
    cargarClimas(visibles);
    refrescarTabla();
    catalogo.renderizarResumen(calcularResumen(fincas));
    renderizarIndicadores(fincas, calcularIndicadoresCupos(fincas), calcularSatisfaccion(fincas));
}

function seleccionarCategoria(categoria) {
    categoriaActiva = (categoria === categoriaActiva) ? 'Todas' : categoria;
    catalogo.actualizarColoresCategoria(categoriaActiva);
    refrescar();
    catalogo.subirAResultados();
}

async function eliminar(id) {
    const finca = buscarFinca(id);
    if (!finca) return;
    if (!window.confirm(`¿Seguro que quieres eliminar "${finca.nombre}"?`)) return;
    try {
        await eliminarFinca(id);
        catalogo.mostrarAviso('');
        if (id === idEditando) cancelarEdicion();
        refrescar();
    } catch (error) {
        catalogo.mostrarAviso(error.message);
    }
}

function iniciarEdicion(id) {
    const finca = buscarFinca(id);
    if (!finca) return;
    idEditando = id;
    catalogo.cargarFormularioEdicion(finca);
}

function cancelarEdicion() {
    idEditando = null;
    catalogo.salirModoEdicion();
}

// Sirve para agregar y para editar, según haya o no una finca en edición
async function guardar() {
    catalogo.limpiarMensajesAgregar();
    const datos = catalogo.leerFormularioAgregar();
    const error = validarFinca(datos, obtenerFincas(), idEditando);
    if (error !== null) {
        catalogo.mostrarErrorAgregar(error);
        return;
    }
    const editando = idEditando !== null;
    try {
        if (editando) {
            await editarFinca(idEditando, datos);
        } else {
            await agregarFinca(datos);
        }
        cancelarEdicion();
        catalogo.mostrarExitoAgregar(`Finca "${datos.nombre}" ${editando ? 'actualizada' : 'agregada'} correctamente.`);
        refrescar();
    } catch (errorNube) {
        catalogo.mostrarErrorAgregar({ mensaje: errorNube.message });
    }
}

// Carga inicial: muestra "cargando", pide los datos a la nube y dibuja
export async function iniciarFincas() {
    catalogo.prepararListaCategorias();
    catalogo.renderizarFiltros();
    catalogo.llenarSelectsAgregar(CATEGORIAS, []);
    catalogo.mostrarCargando();
    try {
        await cargarFincas();
    } catch (error) {
        catalogo.mostrarErrorCarga(error.message);
        return;
    }
    catalogo.llenarSelectsAgregar([], obtenerImagenesDisponibles(obtenerFincas()));
    if (obtenerOrigenDatos() === 'copia') {
        catalogo.mostrarAviso('Sin conexión con la nube: se muestra la última copia guardada en este navegador.');
    }
    catalogo.actualizarColoresCategoria(categoriaActiva);
    refrescar();
}

// "alCambiarFincas" recalcula el precio de la reserva cuando se elimina una finca
export function registrarEventosFincas(alCambiarFincas) {
    catalogo.elementos.buscador.addEventListener('input', (e) => {
        textoBusqueda = e.target.value.trim().toLowerCase();
        refrescar();
    });

    // Delegación de eventos: un solo oyente para todos los botones
    catalogo.elementos.filtrosCategoria.addEventListener('click', (e) => {
        const boton = e.target.closest('.btn-filtro');
        if (boton) seleccionarCategoria(boton.dataset.categoria);
    });

    catalogo.elementos.listaCategorias.addEventListener('click', (e) => {
        const item = e.target.closest('.categoria-item');
        if (item) seleccionarCategoria(item.dataset.categoria);
    });

    catalogo.elementos.contenedorCatalogo.addEventListener('click', async (e) => {
        const botonEditar = e.target.closest('.btn-editar');
        if (botonEditar) {
            iniciarEdicion(botonEditar.dataset.id);
            return;
        }
        const botonEliminar = e.target.closest('.btn-eliminar');
        if (!botonEliminar) return;
        await eliminar(botonEliminar.dataset.id);
        alCambiarFincas();
    });

    catalogo.elementos.formAgregar.addEventListener('submit', (e) => {
        e.preventDefault();
        guardar();
    });

    catalogo.elementos.botonCancelarEdicion.addEventListener('click', cancelarEdicion);
}
