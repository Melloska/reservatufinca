# ReservaTuFinca

Sistema web para la gestión, consulta y reserva de fincas turísticas en Antioquia, desarrollado bajo una arquitectura por capas (Modelo, Vista, Controlador y Servicios) utilizando tecnologías web estándar sin frameworks externos.

* **Aplicación publicada:** <https://melloska.github.io/reservatufinca/>
* **Repositorio en GitHub:** `[Enlace al repositorio en GitHub]`
* **Paquete de entrega:** `HP3_Final_Cuesta.zip`
* **Institución:** Institución Universitaria Pascual Bravo — Ingeniería de Software 
* **Curso:** Herramientas de Programación III (ET0056), Grupo 053 — Periodo 2026-2
* **Docente:** Luis Fernando Londoño López

## Autor / Integrante

 N.º  Nombre completo | 

 1  **Luis Fernando Cuesta** | Arquitectura por capas (MVC + Servicios), base de datos SQL, persistencia en `localStorage`, CRUD completo, tabla dinámica con CSV y consumo de APIs REST. |

## Descripción del Dominio

**ReservaTuFinca** permite a los usuarios explorar un catálogo interactivo de fincas recreativas ubicadas en distintos municipios de Antioquia (Jericó, Santa Fe de Antioquia, Guatapé, Rionegro, Jardín, Barbosa, Copacabana y Girardota).

El sistema ofrece:

* **Catálogo visual interactivo** con galería de imágenes por propiedad, descripción, capacidad, tarifa por noche y estado de disponibilidad.
* **Consulta meteorológica en tiempo real** por municipio mediante integración con la API pública de Open-Meteo.
* **Gestión completa (CRUD)** de fincas (crear, consultar, editar y eliminar registros con confirmación) sincronizada con Supabase y respaldo automático en `localStorage`.
* **Tabla dinámica de resumen** con búsqueda instantánea, filtros combinados (texto, categoría y estado), ordenamiento por columna, paginación y exportación a archivo `.csv`.
* **Módulo de indicadores y reservas** con cálculo dinámico de cotización según noches y huéspedes, validación de formularios y descuento automático de cupos.

## Estructura del Proyecto

```
reservatufinca/
├── index.html                              # Estructura semántica principal de la aplicación
├── README.md                               # Documentación general y técnica del repositorio
├── bases de datos/
│   └── 01_crear_base_de_datos.sql          # Script SQL de creación de tablas, políticas RLS y datos iniciales
├── css/
│   └── estilos.css                         # Estilos responsivos (Flexbox/Grid) bajo metodología BEM
├── img/                                    # Recursos gráficos locales de las fincas (30 fotografías)
└── js/
    ├── app.js                              # Punto de entrada e inicialización de controladores
    ├── config.js                           # Configuración de conexión y credenciales públicas
    ├── modelo/
    │   ├── fincaModelo.js                  # Gestión del estado de fincas y persistencia en localStorage
    │   ├── municipios.js                   # Coordenadas geográficas de los municipios de Antioquia
    │   ├── reglas.js                       # Lógica pura: validaciones, tarifas, filtros, orden, paginación y CSV
    │   └── reservaModelo.js                # Gestión y registro de reservas
    ├── vista/
    │   ├── catalogoVista.js                # Renderizado seguro del catálogo y galerías en el DOM
    │   ├── indicadoresVista.js             # Actualización visual de indicadores (<progress> y <meter>)
    │   ├── reservaVista.js                 # Renderizado del resumen de cotización y mensajes de reserva
    │   ├── tablaVista.js                   # Renderizado de la tabla paginada y controles de página
    │   └── utilidadesVista.js              # Funciones auxiliares de formato y alertas visuales en DOM
    ├── controlador/
    │   ├── climaControlador.js             # Orquestación de consultas climáticas, caché y estados de carga
    │   ├── fincaControlador.js             # Flujo de eventos del catálogo y operaciones CRUD de fincas
    │   ├── reservaControlador.js           # Flujo de cotización, validación y envío de reservas
    │   └── tablaControlador.js             # Flujo de búsqueda, filtros, ordenamiento, paginación y CSV
    └── servicios/
        ├── api.js                          # Cliente HTTP (fetch / async-await) para la API de Open-Meteo
        └── baseDatos.js                    # Cliente REST para operaciones CRUD en Supabase (PostgREST)
```

## Cómo Ejecutar el Proyecto en Local (VS Code)

1. Clonar o descargar el repositorio en el equipo local:

   ```
   git clone [URL_DEL_REPOSITORIO]
   cd reservatufinca
   ```

2. Abrir la carpeta raíz `reservatufinca/` en **Visual Studio Code**.
3. Instalar la extensión **Live Server** (de Ritwick Dey) si aún no está instalada.
4. Hacer clic derecho sobre el archivo `index.html` y seleccionar **"Open with Live Server"** (o pulsar el botón **Go Live** en la barra inferior de VS Code).
5. La aplicación se abrirá automáticamente en el navegador en `http://127.0.0.1:5500/index.html` con soporte completo para módulos ES (`type="module"`).

> **Nota sobre la base de datos:** El esquema SQL de respaldo se encuentra en `bases de datos/01_crear_base_de_datos.sql`. Si la conexión remota no está disponible, el sistema carga automáticamente los datos respaldados en `localStorage` bajo la clave `reservatufinca:fincas`.

## APIs REST Consumidas

### 1. Open-Meteo Forecast API (Clima en Tiempo Real)

* **URL base:** `https://api.open-meteo.com/v1`
* **Endpoint:** `/forecast`
* **Método HTTP:** `GET`
* **Autenticación:** No requiere clave de API.
* **Parámetros de consulta:**
  * `latitude` (número): Latitud del municipio seleccionado (ej. `5.7917` para Jericó).
  * `longitude` (número): Longitud del municipio seleccionado (ej. `-75.7861` para Jericó).
  * `current_weather` (booleano): `true` para obtener temperatura, velocidad del viento y código meteorológico actual.
* **Ejemplo de solicitud:**
  `GET https://api.open-meteo.com/v1/forecast?latitude=5.7917&longitude=-75.7861&current_weather=true`
* **Ejemplo de respuesta JSON:**

  ```
  {
    "latitude": 5.75,
    "longitude": -75.75,
    "generationtime_ms": 0.042,
    "utc_offset_seconds": 0,
    "timezone": "GMT",
    "current_weather": {
      "temperature": 21.4,
      "windspeed": 7.2,
      "winddirection": 145,
      "weathercode": 2,
      "is_day": 1,
      "time": "2026-11-17T15:00"
    }
  }
  ```

### 2. Supabase REST API — PostgREST (Persistencia en la Nube)

* **URL base:** `https://[ID-PROYECTO].supabase.co/rest/v1`
* **Endpoints:** `/fincas` y `/reservas`
* **Métodos HTTP:** `GET` (consultar), `POST` (crear), `PATCH` (actualizar), `DELETE` (eliminar).
* **Parámetros y encabezados:**
  * Encabezados `apikey` y `Authorization: Bearer <clave_publica_anon>` (clave pública de solo lectura/escritura controlada mediante políticas RLS; nunca se exponen llaves administrativas `service_role`).
  * Parámetro `select=*` para consulta general y filtros como `id=eq.<id>`.
* **Ejemplo de respuesta JSON (`/fincas`):**

  ```
  [
    {
      "id": 1,
      "nombre": "Finca Las Acacias",
      "municipio": "Santa Fe de Antioquia",
      "categoria": "Familiar",
      "capacidad": 14,
      "precio_noche": 650000,
      "estado": "Disponible",
      "calificacion": 4.8
    }
  ]
  ```

## Normas de Codificación Aplicadas

1. **Nomenclatura en JavaScript:** Uso estricto de `camelCase` para variables, constantes locales, parámetros y funciones (`obtenerClimaMunicipio`, `calcularTotalReserva`).
2. **Metodología CSS (BEM):** Clases nombradas bajo el patrón `bloque__elemento--modificador` (ej. `.tarjeta-finca__titulo`, `.boton--primario`).
3. **Sangría y formato:** Indentación consistente de 2 espacios, punto y coma al final de cada sentencia y comillas uniformes por archivo.
4. **Comentarios en español:** Documentación breve y clara en español encabezando funciones principales y bloques lógicos relevantes.
5. **Seguridad y limpieza del DOM:** Prohibido el uso de `innerHTML` para datos ingresados por el usuario o provenientes de APIs; se emplea exclusivamente `document.createElement()` y `textContent`. Sin código muerto ni `console.log()` de depuración en producción.

## Fuentes de Documentación Oficial Consultadas

 Recurso  Página Oficial | Enlace | Aplicación en el Proyecto |

 
| ----- | ----- | ----- |
| **MDN — Fetch API (`fetch()`)** | <https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch> | Implementación de peticiones HTTP asíncronas, lectura de `response.ok` y parseo con `.json()` en `servicios/api.js` y `servicios/baseDatos.js`. |
| **MDN — `async` y `await`** | <https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function> | Manejo de flujo asíncrono y captura de errores de red mediante bloques `try...catch` en controladores y servicios. |
| **MDN — `Window.localStorage`** | <https://developer.mozilla.org/es/docs/Web/API/Window/localStorage> | Serialización (`JSON.stringify`) y recuperación (`JSON.parse`) del catálogo de fincas para persistencia local y modo sin conexión. |
| **MDN — Métodos de `Array` (`map`, `filter`, `find`, `reduce`, `sort`)** | <https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array> | Implementación de búsquedas, filtros combinados, ordenamiento por columnas, cálculo de métricas y generación de CSV en `modelo/reglas.js`. |
| **MDN — Delegación de eventos y `Element.closest()`** | <https://developer.mozilla.org/es/docs/Web/API/Element/closest> | Captura centralizada de clics sobre botones dinámicos de editar, eliminar y ver galería dentro del catálogo y la tabla. |
| **Open-Meteo — Weather Forecast API Docs** | <https://open-meteo.com/en/docs> | Consulta de parámetros `latitude`, `longitude`, `current_weather` e interpretación de códigos meteorológicos WMO. |
| **Supabase — REST API Documentation** | <https://supabase.com/docs/guides/api> | Estructura de endpoints PostgREST, cabeceras de autorización y filtros por igualdad (`eq.`) para el CRUD remoto. |

## Créditos de Recursos Externos

* **Datos meteorológicos:** Provistos por [Open-Meteo.com](https://open-meteo.com/) bajo licencia abierta para uso educativo y no comercial.
* **Fotografías del catálogo (`img/`):** Imágenes locales integradas en el repositorio del proyecto exclusivamente con fines académicos para la demostración del catálogo turístico.