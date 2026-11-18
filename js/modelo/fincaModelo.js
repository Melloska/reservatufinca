// Modelo de fincas: guarda los datos en memoria, los sincroniza con la nube (Supabase)
// y deja una copia en localStorage. No toca el DOM.
import * as nube from '../servicios/baseDatos.js';

const CLAVE_COPIA = 'reservatufinca:fincas';

let fincas = [];
let origenDatos = 'nube'; // 'nube' o 'copia' (cuando no hay internet)

// La base de datos usa snake_case; la página usa camelCase
function desdeFila(fila) {
    return {
        id: String(fila.id),
        nombre: fila.nombre,
        descripcion: fila.descripcion,
        precioNoche: fila.precio_noche,
        precioDiaSol: fila.precio_dia_sol,
        categoria: fila.categoria,
        cantidad: fila.cantidad,
        cupoMaximo: fila.cupo_maximo,
        calificacion: Number(fila.calificacion),
        resenas: fila.resenas,
        imagen: fila.imagen,
        imagenes: fila.imagenes
    };
}

function haciaFila(finca) {
    return {
        nombre: finca.nombre,
        descripcion: finca.descripcion,
        precio_noche: finca.precioNoche,
        precio_dia_sol: finca.precioDiaSol,
        categoria: finca.categoria,
        cantidad: finca.cantidad,
        cupo_maximo: finca.cupoMaximo,
        calificacion: finca.calificacion,
        resenas: finca.resenas,
        imagen: finca.imagen,
        imagenes: finca.imagenes
    };
}

// ---- Copia local (localStorage) ----
function guardarCopia() {
    try {
        localStorage.setItem(CLAVE_COPIA, JSON.stringify(fincas));
    } catch {
        // Si localStorage no está disponible, la página sigue funcionando con la nube
    }
}

function leerCopia() {
    try {
        const texto = localStorage.getItem(CLAVE_COPIA);
        return texto ? JSON.parse(texto) : null;
    } catch {
        return null;
    }
}

// ---- Consultas ----
export function obtenerFincas() {
    return fincas;
}

export function buscarFinca(id) {
    return fincas.find((finca) => finca.id === id);
}

export function obtenerOrigenDatos() {
    return origenDatos;
}

// ---- Operaciones (CRUD) ----

// Lee de la nube; si falla, usa la copia guardada; si tampoco hay copia, lanza el error
export async function cargarFincas() {
    try {
        const filas = await nube.obtenerFincas();
        fincas = filas.map(desdeFila);
        origenDatos = 'nube';
        guardarCopia();
    } catch (error) {
        const copia = leerCopia();
        if (copia === null) throw error;
        fincas = copia;
        origenDatos = 'copia';
    }
}

// Crea una finca. "datos" ya viene validado con validarFinca (precios como texto)
export async function agregarFinca(datos) {
    const nueva = {
        nombre: datos.nombre,
        descripcion: 'Finca agregada recientemente al catálogo.',
        precioNoche: Number(datos.precioNoche),
        precioDiaSol: Number(datos.precioDia),
        categoria: datos.categoria,
        cantidad: Number(datos.cantidad),
        cupoMaximo: Math.max(Number(datos.cantidad), 1),
        calificacion: 0,
        resenas: 0,
        imagen: datos.imagen,
        imagenes: [{ src: datos.imagen, alt: 'Imagen de ' + datos.nombre }]
    };
    const filaCreada = await nube.crearFinca(haciaFila(nueva));
    const creada = desdeFila(filaCreada);
    fincas.push(creada);
    guardarCopia();
    return creada;
}

// Edita los campos del formulario de una finca existente
export async function editarFinca(id, datos) {
    const original = buscarFinca(id);
    // Si la finca tiene una sola foto, la foto y su texto alternativo siguen al formulario
    const imagenes = (original.imagenes.length === 1)
        ? [{ src: datos.imagen, alt: 'Imagen de ' + datos.nombre }]
        : original.imagenes;
    const cambios = {
        nombre: datos.nombre,
        precio_noche: Number(datos.precioNoche),
        precio_dia_sol: Number(datos.precioDia),
        categoria: datos.categoria,
        cantidad: Number(datos.cantidad),
        cupo_maximo: Math.max(Number(datos.cantidad), original.cupoMaximo),
        imagen: datos.imagen,
        imagenes
    };
    const actualizada = desdeFila(await nube.actualizarFinca(id, cambios));
    fincas = fincas.map((finca) => (finca.id === id ? actualizada : finca));
    guardarCopia();
    return actualizada;
}

export async function eliminarFinca(id) {
    await nube.eliminarFinca(id);
    fincas = fincas.filter((finca) => finca.id !== id);
    guardarCopia();
}

// Cada reserva descuenta un cupo; al llegar a 0 la finca queda agotada
export async function descontarCupo(id) {
    const finca = buscarFinca(id);
    if (!finca || finca.cantidad === 0) return;
    const actualizada = desdeFila(await nube.actualizarFinca(id, { cantidad: finca.cantidad - 1 }));
    fincas = fincas.map((item) => (item.id === id ? actualizada : item));
    guardarCopia();
}
