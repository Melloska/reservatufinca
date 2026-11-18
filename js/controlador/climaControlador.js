// Controlador del clima: pide el clima de cada municipio una sola vez y lo pinta en las tarjetas.
import { obtenerClima } from '../servicios/api.js';
import { obtenerMunicipio } from '../modelo/municipios.js';
import { pintarClima } from '../vista/catalogoVista.js';

const climasConsultados = new Map(); // municipio -> texto ya listo
const consultasEnCurso = new Map();  // municipio -> petición que todavía no termina

// Evita pedir dos veces el mismo municipio al mismo tiempo
function consultar(municipio) {
    if (!consultasEnCurso.has(municipio.clave)) {
        const peticion = obtenerClima(municipio.latitud, municipio.longitud)
            .finally(() => consultasEnCurso.delete(municipio.clave));
        consultasEnCurso.set(municipio.clave, peticion);
    }
    return consultasEnCurso.get(municipio.clave);
}

async function cargarClimaMunicipio(municipio) {
    if (!climasConsultados.has(municipio.clave)) {
        try {
            const clima = await consultar(municipio);
            climasConsultados.set(municipio.clave, `${clima.emoji} ${clima.descripcion}, ${clima.temperatura} °C · viento ${clima.viento} km/h`);
        } catch {
            pintarClima(municipio.clave, 'no disponible por ahora.');
            return;
        }
    }
    pintarClima(municipio.clave, climasConsultados.get(municipio.clave));
}

// Pide el clima de los municipios que aparecen en las tarjetas visibles
export function cargarClimas(fincas) {
    const municipios = fincas
        .map((finca) => obtenerMunicipio(finca.nombre))
        .filter((municipio) => municipio !== null);
    const unicos = [...new Map(municipios.map((municipio) => [municipio.clave, municipio])).values()];
    unicos.forEach(cargarClimaMunicipio);
}
