// ============================================================
// RECORDATORIOS DE LLAMADA
// ============================================================
function cargarRecordatorio(id) {
  const ord = DB.get("ordenes").find((o) => o.id === id);
  if (!ord) return;
  const check = document.getElementById("exp-rec-check");
  const nota = document.getElementById("exp-rec-nota");
  const fecha = document.getElementById("exp-rec-fecha");
  if (!check) return;

  const rec = ord.recordatorio || {};
  check.checked = rec.pendiente || false;
  nota.value = rec.nota || "";
  nota.style.display = rec.pendiente ? "block" : "none";
  fecha.textContent = rec.fecha ? "Marcado: " + rec.fecha : "";
}

function toggleRecordatorio() {
  const id = document.getElementById("exp-id")?.value;
  if (!id) return;
  const check = document.getElementById("exp-rec-check");
  const nota = document.getElementById("exp-rec-nota");
  nota.style.display = check.checked ? "block" : "none";
  guardarRecordatorio();
}

async function guardarRecordatorio() {
  const id = document.getElementById("exp-id")?.value;
  if (!id) return;
  const check = document.getElementById("exp-rec-check");
  const nota = document.getElementById("exp-rec-nota");
  const fecha = document.getElementById("exp-rec-fecha");

  const rec = {
    pendiente: check.checked,
    nota: nota.value,
    fecha: check.checked
      ? new Date().toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
  };

  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === id);
  if (i < 0) return;
  ords[i].recordatorio = rec;
  DB.set("ordenes", ords);
  await DATA.update("ordenes", id, {
    recordatorio: rec,
  });
  fecha.textContent = rec.pendiente && rec.fecha ? "Marcado: " + rec.fecha : "";
}

window.cargarRecordatorio = cargarRecordatorio;
window.toggleRecordatorio = toggleRecordatorio;
window.guardarRecordatorio = guardarRecordatorio;
