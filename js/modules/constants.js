// ============================================================
// ARATECH CORE CONSTANTS
// ============================================================

"use strict";

// ============================================================
// ENGINES
// ============================================================

window.ENGINE = {
  FIREBASE: "firebase",
  LOCAL: "local",
};

// ============================================================
// COLLECTIONS
// ============================================================

window.COLLECTIONS = Object.freeze({
  USUARIOS: "usuarios",
  CLIENTES: "clientes",
  CLIENTES_PORTAL: "clientes_portal",
  ORDENES: "ordenes",
  VENTAS: "ventas",
  INVENTARIO: "inventario",
  GARANTIAS: "garantias",
  PROVEEDORES: "proveedores",
  ORDENES_COMPRA: "ordenes_compra",
  GASTOS: "gastos",
  TICKETS: "tickets",
  TICKET_COMENTARIOS: "ticketcomentarios",
  TICKET_ARCHIVOS: "ticketarchivos",
  TICKET_CONCEPTOS: "ticketconceptos",
  SEGS: "segs",
  CAT: "cat",
  COTIZACIONES: "cotizaciones",
  CONFIG: "config",
  FOLIOS: "folios",
  PAGOS: "pagos",
  FINANZAS_MOVIMIENTOS: "finanzas_movimientos",
  CLIENTE_AVISOS: "cliente_avisos",
});

// ============================================================
// ARATECH CORE CONSTANTS
// ============================================================

window.FOLIO_COLS = {
  AROS: ["ordenes"],
  ARVTA: ["ventas"],
  ARGAR: ["garantias"],
  "ARGAR-AROS": ["garantias"],
  AROC: ["ordenes_compra"],
  ARGAS: ["gastos"],
  ARCOT: ["cotizaciones"],
  ARTK: ["tickets"],
  SKU: ["inventario"],
  ARPAG: ["pagos"],
  ARFIN: ["finanzas_movimientos"],
  // [FASE 4] Prefijos que faltaban (clientes, avisos y movimientos de inventario)
  CLI: ["clientes"],
  AVI: ["cliente_avisos"],
  MOV: ["inventario_movimientos"],
};

// ============================================================
// FOLIOS OFICIALES DEL SISTEMA
// ============================================================

window.FOLIOS = Object.freeze({
  // OPERACIÓN
  ORDEN: "AROS",
  GARANTIA: "ARGAR",
  TICKET: "ARTK",
  COTIZACION: "ARCOT",

  // INVENTARIO
  INVENTARIO: "SKU",
  MOVIMIENTO: "ARMOV",
  COMPRA: "AROC",

  // FINANZAS
  VENTA: "ARVTA",
  PAGO: "ARPAG",
  GASTO: "ARGAS",
  MOVIMIENTO_FINANCIERO: "ARFIN",
});

// ============================================================
// FECHA FIELDS
// ============================================================
window.FECHA_FIELDS = {
  ordenes: ["fecha", "fecha_prom", "fecha_entrega", "fecha_gar"],
  clientes: ["fecha", "ultima_visita"],
  ventas: ["fecha"],
  inventario: ["fecha"],
  garantias: ["fecha", "fecha_gar"],
  segs: ["fecha", "fdisp"],
  cotizaciones: ["fecha"],
  gastos: ["fecha"],
  ordenes_compra: ["fecha"],
  accesos: ["fecha"],
  tickets: ["fecha", "fecha_ultima_actualizacion", "fecha_cierre"],
  ticketcomentarios: ["fecha"],
  ticketarchivos: ["fecha"],
  pagos: ["fecha"],
  cliente_avisos: ["fecha"],
};

// ============================================================
// ARATECH DATA SCHEMA
// ============================================================

window.SCHEMA = {
  usuarios: {
    engine: window.ENGINE.FIREBASE,
  },
  clientes: {
    engine: window.ENGINE.FIREBASE,
  },

  clientes_portal: {
    engine: window.ENGINE.FIREBASE,
  },

  inventario: {
    engine: window.ENGINE.FIREBASE,
  },

  ordenes: {
    engine: window.ENGINE.FIREBASE,
  },

  ventas: {
    engine: window.ENGINE.FIREBASE,
  },

  tickets: {
    engine: window.ENGINE.FIREBASE,
  },

  ticketcomentarios: {
    engine: window.ENGINE.FIREBASE,
  },

  pagos: {
    engine: window.ENGINE.FIREBASE,
  },

  finanzas_movimientos: {
    engine: window.ENGINE.FIREBASE,
  },

  ticketarchivos: {
    engine: window.ENGINE.FIREBASE,
  },

  ticketconceptos: {
    engine: window.ENGINE.FIREBASE,
  },

  garantias: {
    engine: window.ENGINE.FIREBASE,
  },

  proveedores: {
    engine: window.ENGINE.FIREBASE,
  },

  ordenes_compra: {
    engine: window.ENGINE.FIREBASE,
  },

  gastos: {
    engine: window.ENGINE.FIREBASE,
  },

  segs: {
    engine: window.ENGINE.FIREBASE,
  },

  cat: {
    engine: window.ENGINE.FIREBASE,
  },

  cotizaciones: {
    engine: window.ENGINE.FIREBASE,
  },

  config: {
    engine: window.ENGINE.FIREBASE,
  },

  folios: {
    engine: window.ENGINE.FIREBASE,
  },

  cliente_avisos: {
    engine: window.ENGINE.FIREBASE,
  },
};

// ============================================================
// SYSTEM VERSION
// ============================================================

window.ARATECH = window.ARATECH || {};

Object.assign(ARATECH, {
  NAME: "ARATECH-SYS",

  VERSION: "5.0.0-dev",

  SESSION_TIMEOUT: 60 * 60 * 1000,
});

// ============================================================
// ASSETS
// ============================================================

window.ASSETS = Object.freeze({
  LOGO_ARATECH: "assets/isotipo aratech.png",
  LOGO_ONARA_DARK: "assets/onara sidebar negro.png",
  LOGO_ONARA_LIGHT: "assets/onara sidebar blanco.png",
  QR_POLYGAR: "assets/qr-polygar.png",
  ARATECH_TERMICO: "assets/aratech termico.png",
  ONARA_TERMICO: "assets/onara termico.png",
  ONARA_COLOR: "assets/onara color.png",
  FAVICON_ICO: "assets/favicon ico.png",
  ARABOT_ALERT: "assets/arabot alert.png",
  ARATECH_SIDEBAR: "assets/isotipo aratech sidebar.png",
  ARATECH_SIDEBAR_DARK: "isotipo aratech sidebar dark.png",
});
