// Servicio de base de datos: consume la API REST (PostgREST) de Supabase con fetch
// Solo habla con la nube; no toca el DOM ni guarda datos en pantalla

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from '../config.js';

const URL_BASE = `${SUPABASE_URL}/rest/v1`;

// Petición genérica: revisa response.ok y traduce los fallos a mensajes amables
async function pedir(ruta, opciones = {}) {
    try {
        const respuesta = await fetch(`${URL_BASE}/${ruta}`, {
            ...opciones,
            headers: {
                apikey: SUPABASE_CLAVE_PUBLICA,
                'Content-Type': 'application/json',
                ...opciones.headers
            }
        });
        if (!respuesta.ok) {
            throw new Error(`La base de datos respondió con error ${respuesta.status}.`);
        }
        // DELETE y los POST sin retorno responden sin contenido
        const texto = await respuesta.text();
        return texto ? JSON.parse(texto) : null;
    } catch (error) {
        // fetch lanza TypeError cuando no hay red -- importante  este bloque para que la página funcione sin internet
        if (error instanceof TypeError) {
            throw new Error('No hay conexión con la base de datos. Revisa tu internet.');
        }
        throw error;
    }
}

export function obtenerFincas() {
    return pedir('fincas?select=*&order=id.asc');
}

export async function crearFinca(datos) {
    const filas = await pedir('fincas', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(datos)
    });
    return filas[0];
}

export async function actualizarFinca(id, cambios) {
    const filas = await pedir(`fincas?id=eq.${Number(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(cambios)
    });
    return filas[0];
}

export function eliminarFinca(id) {
    return pedir(`fincas?id=eq.${Number(id)}`, { method: 'DELETE' });
}

// Las reservas solo se pueden crear 
export function crearReserva(datos) {
    return pedir('reservas', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(datos)
    });
}
