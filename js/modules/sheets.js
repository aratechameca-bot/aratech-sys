// ============================================================
// SHEETS — funciones de configuración en runtime
// ============================================================

function guardarSheetsURL(url) {
  if (!url || !url.includes("script.google.com")) {
    notify("❌ URL inválida — debe ser de script.google.com");
    return;
  }

  try {
    localStorage.setItem("ara_sheets_url", url);
  } catch {}

  notify("✅ URL guardada — recarga la página para activar Sheets");
}

function migrarASheets() {
  const url = document.getElementById("sheets-url")?.value;

  if (!url || url === "TU_URL_AQUI") {
    notify("❌ Primero pega la URL del Apps Script");
    return;
  }

  if (
    !confirm(
      "¿Migrar todos los datos locales a Google Sheets? Los datos actuales en Sheets se reemplazarán.",
    )
  ) {
    return;
  }

  const backup = {
    ordenes: DB.get("ordenes"),
    ventas: DB.get("ventas"),
    clientes: DB.get("clientes"),
    inventario: DB.get("inventario"),
    garantias: DB.get("garantias"),
    segs: DB.get("segs"),
    cat: DB.get("cat"),
    config: DB.obj("config"),
  };

  API.importBackup(backup);
}

window.guardarSheetsURL = guardarSheetsURL;
window.migrarASheets = migrarASheets;
