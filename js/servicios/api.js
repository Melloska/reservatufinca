// Servicio del clima: consume la API REST pública de Open-Meteo

const URL_CLIMA = 'https://api.open-meteo.com/v1/forecast';

// Códigos WMO de Open-Meteo agrupados por rangos, con su emoji (y uno de noche cuando cambia)
const DESCRIPCIONES_CLIMA = [
    { hasta: 0, texto: 'Despejado', emoji: '☀️', emojiNoche: '🌙' },
    { hasta: 2, texto: 'Parcialmente nublado', emoji: '⛅', emojiNoche: '☁️' },
    { hasta: 3, texto: 'Nublado', emoji: '☁️' },
    { hasta: 48, texto: 'Niebla', emoji: '🌫️' },
    { hasta: 57, texto: 'Llovizna', emoji: '🌦️' },
    { hasta: 67, texto: 'Lluvia', emoji: '🌧️' },
    { hasta: 77, texto: 'Nieve', emoji: '❄️' },
    { hasta: 82, texto: 'Chubascos', emoji: '🌧️' },
    { hasta: 86, texto: 'Chubascos de nieve', emoji: '🌨️' },
    { hasta: 99, texto: 'Tormenta eléctrica', emoji: '⛈️' }
];

function describirCodigo(codigo, esDeDia) {
    const grupo = DESCRIPCIONES_CLIMA.find((item) => codigo <= item.hasta);
    if (!grupo) return { texto: 'Sin datos', emoji: '🌡️' };
    const emoji = (!esDeDia && grupo.emojiNoche) ? grupo.emojiNoche : grupo.emoji;
    return { texto: grupo.texto, emoji };
}

export async function obtenerClima(latitud, longitud) {
    const parametros = new URLSearchParams({
        latitude: latitud,
        longitude: longitud,
        current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
        timezone: 'America/Bogota'
    });
    try {
        const respuesta = await fetch(`${URL_CLIMA}?${parametros}`);
        if (!respuesta.ok) {
            throw new Error(`El servicio del clima respondió con error ${respuesta.status}.`);
        }
        const datos = await respuesta.json();
        const descripcion = describirCodigo(datos.current.weather_code, datos.current.is_day !== 0);
        return {
            temperatura: datos.current.temperature_2m,
            viento: datos.current.wind_speed_10m,
            descripcion: descripcion.texto,
            emoji: descripcion.emoji
        };
    } catch {
        throw new Error('No se pudo consultar el clima. Revisa tu conexión e inténtalo de nuevo.');
    }
}
