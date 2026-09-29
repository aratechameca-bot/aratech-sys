const ERR = require("./errors");

const ALLOWED = new Set([
  "accesos",
  "cat",
  "cliente_avisos",
  "clientes",
  "clientes_portal",
  "config",
  "cotizaciones",
  "finanzas_movimientos",
  "folios",
  "gastos",
  "gastoevidencias",
  "garantias",
  "inventario",
  "inventario_movimientos",
  "ordenes",
  "ordenevidencias",
  "ordenes_compra",
  "pagos",
  "proveedores",
  "segs",
  "ticketarchivos",
  "ticketcomentarios",
  "ticketconceptos",
  "tickets",
  "usuarios",
  "ventas",
]);

function validate(collection) {
  if (!ALLOWED.has(collection)) {
    ERR.invalid("INVALID_COLLECTION");
  }
}

module.exports = {
  validate,
};
