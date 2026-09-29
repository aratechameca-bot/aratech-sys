// Los folios se generan mediante API.getFolio(prefix).
// Esta utilidad ya no administra consecutivos locales.
function hoy() {
  return new Date().toISOString().split("T")[0];
}
function fmt(s) {
  if (!s || s === "—") return "—";
  const clean =
    typeof s === "string"
      ? s.slice(0, 10)
      : new Date(s).toISOString().slice(0, 10);
  const d = new Date(clean + "T12:00:00");
  return isNaN(d)
    ? "—"
    : d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
function diasE(a, b) {
  if (!a || !b) return 0;
  const ca =
    typeof a === "string"
      ? a.slice(0, 10)
      : new Date(a).toISOString().slice(0, 10);
  const cb =
    typeof b === "string"
      ? b.slice(0, 10)
      : new Date(b).toISOString().slice(0, 10);
  return Math.round(
    (new Date(cb + "T12:00") - new Date(ca + "T12:00")) / 86400000,
  );
}
function mxn(n) {
  return (
    "$" +
    (n || 0).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
function cfg() {
  return DB.obj("config", {
    nombre: "ARATECH",
    slogan: "Tecnología a tu servicio",
    dir: "Allende 246, Col. Obrera, Ameca, Jalisco 46620",
    ig: "@aratechameca",
    tel: "375 690 5296",
    em: "aratechameca@gmail.com",
  });
}

// ============================================================
// [FASE 1] ARCHIVOS — nombre seguro y tipos permitidos
// ============================================================

// Tipos que aceptan las Cloud Functions de tickets y gastos
const TIPOS_ARCHIVO_PERMITIDOS = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

// Convierte cualquier nombre en uno que el servidor acepta
// (solo letras, números, "_" y "-"), sin acentos, y le antepone
// un timestamp para que dos archivos con el mismo nombre no se sobrescriban.
// Ej: "Foto (1) cámara.JPG" → "1790000000000_Foto_1_camara.jpg"
function nombreArchivoSeguro(nombre, extForzada) {
  const limpio = String(nombre || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const punto = limpio.lastIndexOf(".");

  let base = punto > 0 ? limpio.slice(0, punto) : limpio;
  let ext = extForzada || (punto > 0 ? limpio.slice(punto + 1) : "bin");

  base =
    base
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "archivo";

  ext =
    ext
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 5) || "bin";

  return `${Date.now()}_${base}.${ext}`;
}

window.TIPOS_ARCHIVO_PERMITIDOS = TIPOS_ARCHIVO_PERMITIDOS;
window.nombreArchivoSeguro = nombreArchivoSeguro;

window.hoy = hoy;
window.fmt = fmt;
window.diasE = diasE;
window.mxn = mxn;
window.cfg = cfg;
