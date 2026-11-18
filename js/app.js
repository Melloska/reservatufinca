// Punto de arranque: conecta los controladores y carga los datos.
import { iniciarFincas, registrarEventosFincas } from './controlador/fincaControlador.js';
import { registrarEventosReserva, procesarCalculo } from './controlador/reservaControlador.js';
import { registrarEventosTabla } from './controlador/tablaControlador.js';

registrarEventosFincas(procesarCalculo);
registrarEventosReserva();
registrarEventosTabla();
iniciarFincas();
