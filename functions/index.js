const { setGlobalOptions } = require("firebase-functions/v2");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { ejecutarAutomatizaciones } = require("./services/scheduler");
const { ZOHO_SMTP_PASSWORD } = require("./services/mail");

setGlobalOptions({
  region: "us-east1",
  maxInstances: 1,
});

exports.helloWorld = require("./services/folios").helloWorld;
exports.getFolio = require("./services/folios").getFolio;
exports.getConfig = require("./services/config").getConfig;
exports.setConfig = require("./services/config").setConfig;
exports.getAll = require("./services/crud").getAll;
exports.save = require("./services/crud").save;
exports.update = require("./services/crud").update;
exports.remove = require("./services/crud").remove;
exports.loginCliente = require("./services/portal").loginCliente;
exports.activarPortalCliente =
  require("./services/portal").activarPortalCliente;
exports.getDashboardCliente = require("./services/portal").getDashboardCliente;
exports.getServiciosCliente = require("./services/portal").getServiciosCliente;
exports.getDetalleServicio = require("./services/portal").getDetalleServicio;
exports.getTicketsCliente = require("./services/tickets").getTicketsCliente;
exports.getDetalleTicket = require("./services/tickets").getDetalleTicket;
exports.getComentariosTicket =
  require("./services/tickets").getComentariosTicket;
exports.getArchivosTicket = require("./services/tickets").getArchivosTicket;
exports.crearTicketPortal = require("./services/tickets").crearTicketPortal;
exports.getPuedeComentarTicket =
  require("./services/tickets").getPuedeComentarTicket;
exports.guardarComentarioCliente =
  require("./services/tickets").guardarComentarioCliente;
exports.guardarArchivoCliente =
  require("./services/tickets").guardarArchivoCliente;
exports.getGarantiasCliente =
  require("./services/garantias").getGarantiasCliente;
exports.getVentasCliente = require("./services/ventas").getVentasCliente;
exports.validarUsuario = require("./services/usuarios").validarUsuario;
exports.actualizarUltimoAcceso =
  require("./services/usuarios").actualizarUltimoAcceso;
exports.subirFoto = require("./services/storage").subirFoto;
exports.obtenerFotos = require("./services/storage").obtenerFotos;
exports.subirTicketFile = require("./services/storage").subirTicketFile;
exports.eliminarFoto = require("./services/storage").eliminarFoto;
exports.eliminarFotoLogica = require("./services/storage").eliminarFotoLogica;
exports.eliminarTicketFile = require("./services/storage").eliminarTicketFile;
exports.subirGastoFile = require("./services/storage").subirGastoFile;
exports.crearComentarioTicket =
  require("./services/tickets").crearComentarioTicket;
exports.notificarCambioEstadoOrden =
  require("./services/notificaciones").notificarCambioEstadoOrden;
exports.notificarRecepcionOrden =
  require("./services/notificaciones").notificarRecepcionOrden;
exports.notificarComentarioTicket =
  require("./services/notificaciones").notificarComentarioTicket;
exports.notificarEstadoTicket =
  require("./services/notificaciones").notificarEstadoTicket;
exports.notificarCreacionTicket =
  require("./services/notificaciones").notificarCreacionTicket;
exports.notificarEvidencia =
  require("./services/notificaciones").notificarEvidencia;
exports.alertaInventarioBajo =
  require("./services/notificaciones").alertaInventarioBajo;
exports.ejecutarAutomatizaciones = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/Mexico_City",
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async () => {
    await ejecutarAutomatizaciones();
  },
);
exports.migrarClientesPortal =
  require("./services/migraciones").migrarClientesPortal;
exports.obtenerUrlArchivo =
  require("./services/storageSigned").obtenerUrlArchivo;
