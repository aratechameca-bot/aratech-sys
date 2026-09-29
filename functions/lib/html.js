// ============================================================
// [FASE 2] Utilidades HTML para correos
// ============================================================

// Escapa texto para insertarlo de forma segura dentro de HTML.
// Evita que un nombre, comentario, etc. inyecte etiquetas o enlaces.
function esc(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

// Igual que esc(), pero conserva los saltos de línea como <br>.
function escMultilinea(valor) {
  return esc(valor).replace(/\r?\n/g, "<br>");
}

// Un solo correo válido (sin comas ni listas de destinatarios).
function emailValido(correo) {
  const c = String(correo ?? "").trim();

  return (
    c.length > 3 &&
    c.length <= 254 &&
    /^[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+$/.test(c)
  );
}

module.exports = {
  esc,
  escMultilinea,
  emailValido,
};
