// Reglas del negocio (modelo): funciones puras que reciben datos y devuelven resultados.
// No tocan el DOM ni la base de datos.

// Categorías (la posición de cada una define su color en la página)
export const CATEGORIAS = [
    'Fincas de Clima Cálido con Piscina',
    'Cabañas Montañeras y Chalets',
    'Fincas de Lujo para Eventos y Bodas',
    'Alojamientos Ecológicos y Glampings',
    'Fincas Pet Friendly (Aptas para Mascotas)'
];

// Costo total según la finca, el servicio y la cantidad
export function calcularCostoReserva(finca, tipoServicio, cantidad) {
    if (!finca || cantidad <= 0) return 0;
    const precioBase = (tipoServicio === 'noche') ? finca.precioNoche : finca.precioDiaSol;
    return precioBase * cantidad;
}

// Rutas de todas las imágenes que se pueden elegir al agregar una finca
export function obtenerImagenesDisponibles(fincas) {
    return fincas.flatMap((finca) => finca.imagenes.map((imagen) => imagen.src));
}

// Valida el formulario de finca. Devuelve { campo, mensaje } o null si todo está bien
// "idActual" sirve al editar: la finca no cuenta como repetida consigo misma
export function validarFinca(datos, fincas, idActual = null) {
    if (datos.nombre === '') return { campo: 'nombre', mensaje: 'El nombre de la finca no puede estar vacío.' };
    if (datos.precioNoche === '') return { campo: 'precio-noche', mensaje: 'Escribe el precio por noche.' };
    if (datos.precioDia === '') return { campo: 'precio-dia', mensaje: 'Escribe el precio del día de sol.' };
    if (datos.cantidad === '') return { campo: 'cantidad', mensaje: 'Escribe la cantidad de cupos disponibles.' };
    if (datos.categoria === '') return { campo: 'categoria', mensaje: 'Selecciona una categoría.' };
    if (datos.imagen === '') return { campo: 'imagen', mensaje: 'Selecciona una imagen.' };

    const precioNoche = Number(datos.precioNoche);
    const precioDia = Number(datos.precioDia);
    const cantidad = Number(datos.cantidad);
    if (datos.nombre.length < 3) return { campo: 'nombre', mensaje: 'El nombre debe tener al menos 3 letras.' };
    if (Number.isNaN(precioNoche) || precioNoche <= 0) return { campo: 'precio-noche', mensaje: 'El precio por noche debe ser un número mayor que 0.' };
    if (Number.isNaN(precioDia) || precioDia <= 0) return { campo: 'precio-dia', mensaje: 'El precio del día de sol debe ser un número mayor que 0.' };
    if (!Number.isInteger(cantidad) || cantidad < 0) return { campo: 'cantidad', mensaje: 'Los cupos deben ser un número entero igual o mayor que 0.' };

    const repetido = fincas.some((finca) => finca.id !== idActual && finca.nombre.toLowerCase() === datos.nombre.toLowerCase());
    if (repetido) return { campo: 'nombre', mensaje: 'Ya existe una finca con ese nombre.' };

    if (precioDia > precioNoche) return { campo: 'precio-dia', mensaje: 'El día de sol no puede costar más que la noche completa.' };
    return null;
}

// ---- Búsqueda, filtros combinados, orden, paginación y CSV (tabla de datos) ----

// Filtros combinados: texto + categoría + estado ('todos', 'disponible' o 'agotada')
export function filtrarFincas(fincas, { texto = '', categoria = 'Todas', estado = 'todos' } = {}) {
    const buscado = texto.trim().toLowerCase();
    return fincas.filter((finca) => {
        const coincideCategoria = (categoria === 'Todas') || (finca.categoria === categoria);
        const coincideTexto = (finca.nombre + ' ' + finca.descripcion).toLowerCase().includes(buscado);
        const coincideEstado = (estado === 'todos')
            || (estado === 'agotada' && finca.cantidad === 0)
            || (estado === 'disponible' && finca.cantidad > 0);
        return coincideCategoria && coincideTexto && coincideEstado;
    });
}

// Ordena una copia de la lista por una columna ('asc' o 'desc')
export function ordenarFincas(fincas, columna, direccion = 'asc') {
    const signo = (direccion === 'asc') ? 1 : -1;
    return [...fincas].sort((a, b) => {
        const valorA = a[columna];
        const valorB = b[columna];
        if (typeof valorA === 'string') return signo * valorA.localeCompare(valorB, 'es');
        return signo * (valorA - valorB);
    });
}

// Devuelve solo los registros de la página pedida
export function paginar(lista, pagina, porPagina) {
    const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
    const paginaValida = Math.min(Math.max(pagina, 1), totalPaginas);
    const inicio = (paginaValida - 1) * porPagina;
    return { items: lista.slice(inicio, inicio + porPagina), pagina: paginaValida, totalPaginas };
}

// Convierte la lista en texto CSV (comillas dobles escapadas)
export function generarCSV(fincas) {
    const encabezados = ['Nombre', 'Categoría', 'Precio por noche', 'Precio día de sol', 'Cupos', 'Estado'];
    const filas = fincas.map((finca) => [
        finca.nombre, finca.categoria, finca.precioNoche, finca.precioDiaSol,
        finca.cantidad, finca.cantidad === 0 ? 'Agotada' : 'Disponible'
    ]);
    return [encabezados, ...filas]
        .map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

// ---- Resúmenes e indicadores ----

export function calcularResumen(fincas) {
    const agotadas = fincas.filter((finca) => finca.cantidad === 0);
    const totalCupos = fincas.reduce((acumulado, finca) => acumulado + finca.cantidad, 0);
    const sumaPrecios = fincas.reduce((acumulado, finca) => acumulado + finca.precioNoche, 0);
    return {
        total: fincas.length,
        agotadas: agotadas.length,
        totalCupos,
        promedioPrecio: fincas.length === 0 ? 0 : Math.round(sumaPrecios / fincas.length)
    };
}

// Estado de una finca según sus cupos libres
export function obtenerEstadoCupos(cantidad, cupoMaximo) {
    if (cantidad === 0) return 'agotado';
    if (cantidad / cupoMaximo <= 0.34) return 'pocos';
    return 'disponible';
}

export function calcularIndicadoresCupos(fincas) {
    const conCupos = fincas.filter((finca) => finca.cantidad > 0).length;
    const cuposLibres = fincas.reduce((acumulado, finca) => acumulado + finca.cantidad, 0);
    const cuposTotales = fincas.reduce((acumulado, finca) => acumulado + finca.cupoMaximo, 0);
    const porcentajeLibre = cuposTotales === 0 ? 0 : cuposLibres / cuposTotales;
    let nivel = 'ok';
    if (porcentajeLibre <= 0.25) nivel = 'critico';
    else if (porcentajeLibre <= 0.6) nivel = 'alerta';
    return { conCupos, cuposLibres, cuposTotales, nivel };
}

export function obtenerNivelCalidad(promedio) {
    if (promedio >= 4.5) return 'Excelente';
    if (promedio >= 4) return 'Muy bueno';
    if (promedio >= 3) return 'Bueno';
    return 'Por mejorar';
}

// Satisfacción: promedio ponderado por el número de reseñas
export function calcularSatisfaccion(fincas) {
    const conResenas = fincas.filter((finca) => finca.resenas > 0);
    const totalResenas = conResenas.reduce((acumulado, finca) => acumulado + finca.resenas, 0);
    const sumaPonderada = conResenas.reduce((acumulado, finca) => acumulado + finca.calificacion * finca.resenas, 0);
    const promedio = totalResenas === 0 ? 0 : sumaPonderada / totalResenas;
    return {
        promedio,
        totalResenas,
        nivel: obtenerNivelCalidad(promedio),
        mejorCalificadas: [...conResenas].sort((a, b) => b.calificacion - a.calificacion)
    };
}

// ---- Validación de los formularios de reserva y contacto ----
// Cada validación devuelve { campo, mensaje } (campo = id del elemento) o null si todo está bien.
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^[0-9]{7,10}$/;

function revisarNombre(nombre) {
    return nombre.length < 3 ? 'Escribe tu nombre completo (mínimo 3 letras).' : null;
}

function revisarCorreo(correo) {
    return PATRON_CORREO.test(correo) ? null : 'Escribe un correo válido, por ejemplo correo@ejemplo.com.';
}

function revisarTelefono(telefono) {
    return PATRON_TELEFONO.test(telefono) ? null : 'El teléfono debe tener entre 7 y 10 números, sin espacios ni guiones.';
}

// Recibe pares [campo, mensaje o null] y devuelve el primero que tenga mensaje
function primerError(revisiones) {
    const fallo = revisiones.find(([, mensaje]) => mensaje !== null);
    return fallo ? { campo: fallo[0], mensaje: fallo[1] } : null;
}

export function validarReserva(datos) {
    const cantidadValida = Number.isInteger(datos.cantidad) && datos.cantidad >= 1 && datos.cantidad <= 30;
    return primerError([
        ['nombre', revisarNombre(datos.nombre)],
        ['correo', revisarCorreo(datos.correo)],
        ['telefono', revisarTelefono(datos.telefono)],
        ['direccion', datos.direccion.length < 5 ? 'Escribe una dirección de al menos 5 caracteres.' : null],
        ['finca-select', datos.fincaId === '' ? 'Selecciona una finca.' : null],
        ['tipo-servicio', datos.tipoServicio === '' ? 'Selecciona el tipo de servicio.' : null],
        ['cantidad', cantidadValida ? null : 'La cantidad debe ser un número entero entre 1 y 30.'],
        ['metodo-pago', datos.metodoPago === '' ? 'Selecciona un método de pago.' : null]
    ]);
}

export function validarContacto(datos) {
    return primerError([
        ['contacto-nombre', revisarNombre(datos.nombre)],
        ['contacto-correo', revisarCorreo(datos.correo)],
        ['contacto-telefono', revisarTelefono(datos.telefono)],
        ['contacto-texto', datos.mensaje.length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : null]
    ]);
}
