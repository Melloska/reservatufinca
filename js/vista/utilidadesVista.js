// Utilidades de la vista: crean elementos y dan formato. No guardan datos.

// Crea un elemento con texto seguro (textContent) y una clase opcional
export function crearElemento(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    if (clase) { elemento.classList.add(clase); }
    return elemento;
}

// Crea un párrafo con una etiqueta en negrita y un valor
export function crearLineaDato(etiqueta, valor) {
    const parrafo = document.createElement('p');
    parrafo.appendChild(crearElemento('strong', etiqueta));
    parrafo.appendChild(document.createTextNode(' ' + valor));
    return parrafo;
}

// Da formato de pesos colombianos a un número
export function formatearPrecio(valor) {
    return `$${valor.toLocaleString('es-CO')} COP`;
}

// Convierte una calificación de 0 a 5 en estrellas de texto
export function crearEstrellas(calificacion) {
    const llenas = Math.round(calificacion);
    return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}
