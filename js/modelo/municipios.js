// Municipios conocidos con sus coordenadas, para consultar el clima de cada finca.
const MUNICIPIOS = {
    'llano grande': { nombre: 'Llano Grande', latitud: 6.14, longitud: -75.42 },
    'sopetran': { nombre: 'Sopetrán', latitud: 6.50, longitud: -75.75 },
    'guatape': { nombre: 'Guatapé', latitud: 6.23, longitud: -75.16 },
    'jerico': { nombre: 'Jericó', latitud: 5.79, longitud: -75.79 },
    'santa fe de antioquia': { nombre: 'Santa Fe de Antioquia', latitud: 6.56, longitud: -75.83 },
    'rionegro': { nombre: 'Rionegro', latitud: 6.16, longitud: -75.37 },
    'el penol': { nombre: 'El Peñol', latitud: 6.22, longitud: -75.24 },
    'medellin': { nombre: 'Medellín', latitud: 6.24, longitud: -75.58 }
};

// Minúsculas y sin tildes, para comparar nombres
function normalizar(texto) {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// El municipio es lo que va después del último " - " del nombre de la finca.
// Devuelve { clave, nombre, latitud, longitud } o null si no lo conocemos.
export function obtenerMunicipio(nombreFinca) {
    const clave = normalizar(nombreFinca.split(' - ').pop());
    return MUNICIPIOS[clave] ? { clave, ...MUNICIPIOS[clave] } : null;
}
