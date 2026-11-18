// Vista del catálogo: dibuja y lee el DOM. No guarda datos ni reglas del negocio

import { CATEGORIAS } from '../modelo/reglas.js';
import { obtenerMunicipio } from '../modelo/municipios.js';
import { crearElemento, crearLineaDato, formatearPrecio } from './utilidadesVista.js';

const porId = (id) => document.getElementById(id);

// Elementos sobre los que el controlador registra eventos
export const elementos = {
    seccionCatalogo: porId('catalogo'),
    contenedorCatalogo: porId('contenedor-fincas'),
    listaCategorias: porId('lista-categorias'),
    filtrosCategoria: porId('filtros-categoria'),
    buscador: porId('buscador'),
    formAgregar: porId('form-agregar'),
    selectFinca: porId('finca-select')
};

const contadorResultados = porId('contador-resultados');
const avisoVacio = porId('aviso-vacio');
const errorAgregar = porId('error-agregar');
const exitoAgregar = porId('exito-agregar');

// Párrafo para avisos de la nube
const avisoDatos = crearElemento('p', '', 'mensaje-error');
avisoDatos.classList.add('oculto');
elementos.contenedorCatalogo.before(avisoDatos);

// ---- Estados de la carga ----
export function mostrarCargando() {
    contadorResultados.textContent = '';
    elementos.contenedorCatalogo.replaceChildren(crearElemento('p', 'Cargando fincas desde la nube...'));
}

export function mostrarErrorCarga(mensaje) {
    elementos.contenedorCatalogo.replaceChildren(crearElemento('p', mensaje, 'mensaje-error'));
}

// Muestra un aviso; con texto vacío lo oculta
export function mostrarAviso(texto) {
    avisoDatos.textContent = texto;
    avisoDatos.classList.toggle('oculto', texto === '');
}

// ---- Catálogo de tarjetas ----
export function renderizarCatalogo(lista, totalFincas) {
    elementos.contenedorCatalogo.replaceChildren();
    lista.forEach((finca) => {
        const articulo = document.createElement('article');
        articulo.classList.add('color-cat-' + CATEGORIAS.indexOf(finca.categoria));
        if (finca.cantidad === 0) { articulo.classList.add('agotada'); }

        articulo.appendChild(crearElemento('h3', finca.nombre));
        articulo.appendChild(crearElemento('span', finca.categoria, 'etiqueta-categoria'));
        articulo.appendChild(crearElemento('p', finca.descripcion));
        articulo.appendChild(crearLineaDato('Precio por noche:', formatearPrecio(finca.precioNoche)));
        articulo.appendChild(crearLineaDato('Precio día de Sol:', formatearPrecio(finca.precioDiaSol)));
        articulo.appendChild(crearLineaDato('Cupos disponibles:', finca.cantidad === 0 ? 'Agotada' : finca.cantidad));

        // Línea del clima: el controlador la completa cuando llega la respuesta de la API
        const municipio = obtenerMunicipio(finca.nombre);
        if (municipio) {
            const clima = crearElemento('p', `Clima en ${municipio.nombre}: cargando...`, 'finca-clima');
            clima.dataset.municipio = municipio.clave;
            clima.dataset.nombre = municipio.nombre;
            articulo.appendChild(clima);
        }

        const galeria = document.createElement('div');
        galeria.classList.add('galeria-img');
        finca.imagenes.forEach((img) => {
            const imagen = document.createElement('img');
            imagen.src = img.src;
            imagen.alt = img.alt;
            imagen.width = 300;
            imagen.height = 200;
            galeria.appendChild(imagen);
        });
        articulo.appendChild(galeria);

        const botonEditar = crearElemento('button', 'Editar', 'btn-editar');
        botonEditar.type = 'button';
        botonEditar.dataset.id = finca.id;
        articulo.appendChild(botonEditar);

        const botonEliminar = crearElemento('button', 'Eliminar', 'btn-eliminar');
        botonEliminar.type = 'button';
        botonEliminar.dataset.id = finca.id;
        articulo.appendChild(botonEliminar);

        elementos.contenedorCatalogo.appendChild(articulo);
    });
    contadorResultados.textContent = `Mostrando ${lista.length} de ${totalFincas} fincas`;
    avisoVacio.classList.toggle('oculto', lista.length !== 0);
}

// Escribe el clima en todas las tarjetas de ese municipio
export function pintarClima(claveMunicipio, texto) {
    elementos.contenedorCatalogo.querySelectorAll('.finca-clima').forEach((linea) => {
        if (linea.dataset.municipio === claveMunicipio) {
            linea.textContent = `Clima en ${linea.dataset.nombre}: ${texto}`;
        }
    });
}

// ---- Filtros y categorías ----
export function renderizarFiltros() {
    elementos.filtrosCategoria.replaceChildren();
    ['Todas', ...CATEGORIAS].forEach((categoria) => {
        const boton = crearElemento('button', categoria, 'btn-filtro');
        boton.type = 'button';
        boton.dataset.categoria = categoria;
        const indice = CATEGORIAS.indexOf(categoria);
        if (indice !== -1) { boton.classList.add('color-cat-' + indice); }
        elementos.filtrosCategoria.appendChild(boton);
    });
}

export function prepararListaCategorias() {
    elementos.listaCategorias.querySelectorAll('li').forEach((item, indice) => {
        item.classList.add('categoria-item', 'color-cat-' + indice);
        item.dataset.categoria = item.textContent.trim();
    });
}

export function actualizarColoresCategoria(categoriaActiva) {
    const indiceActivo = CATEGORIAS.indexOf(categoriaActiva);
    document.querySelectorAll('.btn-filtro, .categoria-item').forEach((elemento) => {
        elemento.classList.toggle('activo', elemento.dataset.categoria === categoriaActiva);
    });
    CATEGORIAS.forEach((categoria, indice) => elementos.seccionCatalogo.classList.remove('color-cat-' + indice));
    elementos.seccionCatalogo.classList.toggle('tema-activo', indiceActivo !== -1);
    if (indiceActivo !== -1) { elementos.seccionCatalogo.classList.add('color-cat-' + indiceActivo); }
}

export function subirAResultados() {
    contadorResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Selects ----
export function llenarSelectFincas(fincas) {
    const select = elementos.selectFinca;
    const valorActual = select.value;
    while (select.options.length > 1) { select.remove(1); }
    fincas.forEach((finca) => {
        const opcion = document.createElement('option');
        opcion.value = finca.id;
        opcion.textContent = finca.cantidad === 0 ? finca.nombre + ' (Agotada)' : finca.nombre;
        opcion.disabled = finca.cantidad === 0;
        select.appendChild(opcion);
    });
    select.value = valorActual;
}

export function llenarSelectsAgregar(categorias, imagenes) {
    const selectCategoria = porId('nuevo-categoria');
    const selectImagen = porId('nuevo-imagen');
    categorias.forEach((categoria) => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
    imagenes.forEach((ruta) => {
        const opcion = document.createElement('option');
        opcion.value = ruta;
        opcion.textContent = ruta.replace('img/', '');
        selectImagen.appendChild(opcion);
    });
}

// ---- Resumen ----
export function renderizarResumen(resumen) {
    porId('resumen-total').textContent = resumen.total;
    porId('resumen-agotadas').textContent = resumen.agotadas;
    porId('resumen-cupos').textContent = resumen.totalCupos;
    porId('resumen-promedio').textContent = formatearPrecio(resumen.promedioPrecio);
}

// ---- Formulario de agregar finca ----
export function leerFormularioAgregar() {
    return {
        nombre: porId('nuevo-nombre').value.trim(),
        precioNoche: porId('nuevo-precio-noche').value.trim(),
        precioDia: porId('nuevo-precio-dia').value.trim(),
        cantidad: porId('nuevo-cantidad').value.trim(),
        categoria: porId('nuevo-categoria').value,
        imagen: porId('nuevo-imagen').value
    };
}

// "error" trae { campo, mensaje }; campo es opcional (por ejemplo, errores de la nube)
export function mostrarErrorAgregar(error) {
    errorAgregar.textContent = error.mensaje;
    errorAgregar.classList.remove('oculto');
    if (error.campo) { porId('nuevo-' + error.campo).classList.add('campo-error'); }
}

export function mostrarExitoAgregar(mensaje) {
    exitoAgregar.textContent = mensaje;
    exitoAgregar.classList.remove('oculto');
}

export function limpiarMensajesAgregar() {
    errorAgregar.classList.add('oculto');
    exitoAgregar.classList.add('oculto');
    elementos.formAgregar.querySelectorAll('.campo-error').forEach((campo) => campo.classList.remove('campo-error'));
}

// ---- Modo edición: se reutiliza el formulario de agregar ----
const leyendaFormulario = elementos.formAgregar.querySelector('legend');
const botonGuardar = elementos.formAgregar.querySelector('button[type="submit"]');
const textoLeyendaOriginal = leyendaFormulario.textContent;
const textoBotonOriginal = botonGuardar.textContent;

const botonCancelar = crearElemento('button', 'Cancelar edición', 'btn-cancelar-edicion');
botonCancelar.type = 'button';
botonCancelar.classList.add('oculto');
botonGuardar.after(botonCancelar);
elementos.botonCancelarEdicion = botonCancelar;

// Si la foto de la finca no está en la lista, se agrega para poder seleccionarla
function asegurarOpcionImagen(ruta) {
    const selectImagen = porId('nuevo-imagen');
    const existe = [...selectImagen.options].some((opcion) => opcion.value === ruta);
    if (existe) return;
    const opcion = document.createElement('option');
    opcion.value = ruta;
    opcion.textContent = ruta.replace('img/', '');
    selectImagen.appendChild(opcion);
}

export function cargarFormularioEdicion(finca) {
    limpiarMensajesAgregar();
    porId('nuevo-nombre').value = finca.nombre;
    porId('nuevo-precio-noche').value = finca.precioNoche;
    porId('nuevo-precio-dia').value = finca.precioDiaSol;
    porId('nuevo-cantidad').value = finca.cantidad;
    porId('nuevo-categoria').value = finca.categoria;
    asegurarOpcionImagen(finca.imagen);
    porId('nuevo-imagen').value = finca.imagen;
    leyendaFormulario.textContent = 'Editar finca: ' + finca.nombre;
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.classList.remove('oculto');
    elementos.formAgregar.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Deja el formulario limpio y en modo "agregar"
export function salirModoEdicion() {
    elementos.formAgregar.reset();
    limpiarMensajesAgregar();
    leyendaFormulario.textContent = textoLeyendaOriginal;
    botonGuardar.textContent = textoBotonOriginal;
    botonCancelar.classList.add('oculto');
}
