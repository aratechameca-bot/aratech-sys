/**
 * ==========================================================
 * ARATECH-SYS
 * Icon Registry
 * ETAPA 8.5
 * ==========================================================
 */

window.ARATECH_ICONS = Object.freeze({
  // Acciones
  add: "fa-solid fa-plus",
  edit: "fa-solid fa-pen",
  delete: "fa-solid fa-trash",
  save: "fa-solid fa-floppy-disk",
  cancel: "fa-solid fa-xmark",
  search: "fa-solid fa-magnifying-glass",
  filter: "fa-solid fa-filter",
  refresh: "fa-solid fa-rotate-right",
  print: "fa-solid fa-print",
  download: "fa-solid fa-download",
  upload: "fa-solid fa-upload",
  view: "fa-solid fa-eye",
  close: "fa-solid fa-xmark",
  clear: "fa-solid fa-broom",
  alerta: "fa-solid fa-bell",
  comentario: "fa-solid fa-comment",
  descuento: "fa-solid fa-tags",
  menu: "fa-solid fa-ellipsis-vertical",

  // Módulos
  dashboard: "fa-solid fa-chart-line",
  clientes: "fa-solid fa-users",
  ordenes: "fa-solid fa-clipboard-list",
  ventas: "fa-solid fa-cart-shopping",
  inventario: "fa-solid fa-boxes-stacked",
  compras: "fa-solid fa-truck-ramp-box",
  garantias: "fa-solid fa-shield-halved",
  crm: "fa-solid fa-comments",
  tickets: "fa-solid fa-ticket",
  gastos: "fa-solid fa-money-bill-wave",
  configuracion: "fa-solid fa-gears",
  historial: "fa-solid fa-clock-rotate-left",
  cotizador: "fa-solid fa-file-invoice-dollar",
  finanzas: "fa-solid fa-chart-pie",
  proveedor: "fa-solid fa-building-user",

  // Objetos
  usuario: "fa-solid fa-user",
  telefono: "fa-solid fa-phone",
  correo: "fa-solid fa-envelope",
  empresa: "fa-solid fa-building",
  calendario: "fa-solid fa-calendar",
  reloj: "fa-solid fa-clock",
  dinero: "fa-solid fa-dollar-sign",
  archivo: "fa-solid fa-file-lines",
  imagen: "fa-solid fa-image",
  calculadora: "fa-solid fa-calculator",
  clipboard: "fa-solid fa-clipboard",
  transferencia: "fa-solid fa-building-columns",
  tarjeta: "fa-solid fa-credit-card",
  mixto: "fa-solid fa-money-check-dollar",
  estado_cuenta: "fa-solid fa-file-invoice-dollar",
  notas: "fa-solid fa-note-sticky",
  formato: "fa-solid fa-file-lines",
  devolucion: "fa-solid fa-rotate-left",
  libro: "fa-solid fa-book-bookmark",
  servicio: "fa-solid fa-screwdriver-wrench",
  sun: "fa-solid fa-sun",
  moon: "fa-solid fa-moon",
  lock: "fa-solid fa-lock",
  link: "fa-solid fa-link",
  expediente: "fa-solid fa-folder-open",
  ticket: "fa-solid fa-ticket",
  garantia: "fa-solid fa-shield-halved",
  herramientas: "fa-solid fa-screwdriver-wrench",
  clip: "fa-solid fa-paperclip",
  excel: "fa-solid fa-file-excel",

  // Estados
  success: "fa-solid fa-circle-check",
  warning: "fa-solid fa-triangle-exclamation",
  error: "fa-solid fa-circle-xmark",
  info: "fa-solid fa-circle-info",

  // Redes Sociales
  camara: "fa-solid fa-camera",
  qr: "fa-solid fa-qrcode",
  pdf: "fa-solid fa-file-pdf",
  whatsapp: "fa-brands fa-whatsapp",
  instagram: "fa-brands fa-instagram",
  printer: "fa-solid fa-print",
  clear: "fa-solid fa-broom",
  whatsapp: "fa-brands fa-whatsapp",
  portal: "fa-solid fa-globe",
});

/**
 * Devuelve las clases FA para un icono
 */
window.getIcon = function (name) {
  return ARATECH_ICONS[name] || null;
};

/**
 * Aplica iconos FontAwesome
 */
window.refreshIcons = function (root = document) {
  root.querySelectorAll(".ar-icon").forEach((el) => {
    const key = [...el.classList].find(
      (c) => c !== "ar-icon" && !c.startsWith("fa-"),
    );

    if (!key) return;

    const cls = getIcon(key);

    if (!cls) {
      console.warn("Icono inexistente:", key, el);
      return;
    }

    cls.split(" ").forEach((c) => el.classList.add(c));
  });
};

/**
 * Inicialización global
 */
window.initIcons = function () {
  refreshIcons(document);
};
