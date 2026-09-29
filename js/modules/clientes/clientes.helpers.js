// ============================================================
// CLIENTES HELPERS
// ============================================================
function fillClis(ids = [], placeholder = "-- Selecciona un cliente --") {
  const clis = DB.get("clientes");

  const opts =
    `<option value="">${placeholder}</option>` +
    clis
      .map(
        (c) =>
          `<option value="${c.id}">${c.nombre}${
            c.tel ? " — " + c.tel : ""
          }</option>`,
      )
      .join("");

  ids.forEach((id) => {
    const el = document.getElementById(id);

    if (el) {
      el.innerHTML = opts;
    }
  });
}

function autoTel() {
  const id = document.getElementById("ord-cli").value;
  if (!id) return;
  const c = DB.get("clientes").find((x) => x.id === id);
  if (c) document.getElementById("ord-tel").value = c.tel || "";
}

// NUEVO CLIENTE DESDE ORDEN
function abrirNuevoCliDesdeOrden() {
  document.getElementById("cli-eid").value = "";
  document.getElementById("cli-desde-orden").value = "1";
  document.getElementById("cli-tit").innerHTML =
    '<i class="ar-icon usuario"></i> Nuevo cliente';

  window.refreshIcons(document.getElementById("cli-tit"));
  ["cli-nm", "cli-tel", "cli-em", "cli-dir", "cli-not"].forEach(
    (f) => (document.getElementById(f).value = ""),
  );
  openM("m-cli");
}

window.fillClis = fillClis;
window.autoTel = autoTel;
window.abrirNuevoCliDesdeOrden = abrirNuevoCliDesdeOrden;
