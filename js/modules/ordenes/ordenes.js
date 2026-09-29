// ======================================
// CONTEXTO DE CREACIÓN DE ÓRDENES
// ======================================

window.ordenContext = {
  tipo: "NORMAL",
  garantia: null,
};

function resetOrdenContext() {
  window.ordenContext = {
    tipo: "NORMAL",
    garantia: null,
  };
}

// LINEAS SERVICIO ORDEN
let LS = [];
function initLS() {
  LS = [{ svc: "", precio: 0 }];
  renderLS();
}
function renderLS() {
  const cat = DB.get("cat");
  document.getElementById("ls-cont").innerHTML = LS.map((l, i) => {
    const optsL = cat
      .map(
        (s) =>
          `<option value="${s.nombre}" ${l.svc === s.nombre ? "selected" : ""} data-p="${s.precio}">${s.nombre}${s.precio > 0 ? " — $" + s.precio : " — Gratis"}</option>`,
      )
      .join("");
    return `
    <div class="ls">
      <select onchange="onLSsel(${i},this)" style="font-size:12px">
        <option value="" ${!l.svc || l.svc === "" ? "selected" : ""}>-- Seleccionar servicio --</option>${optsL}
        <option value="__otro" ${l.svc === "__otro" ? "selected" : ""}>Otro (especificar)…</option>
      </select>
      <input type="number" value="${l.precio || ""}" placeholder="$ Precio" style="font-size:12px;text-align:right" oninput="onLSprice(${i},this)">
      <button class="btn bd bsm" onclick="delLS(${i})">✕</button>
    </div>
    ${l.svc === "__otro" ? `<div class="fr" style="margin:-4px 0 6px"><div class="fi"><input type="text" id="ls-otro-${i}" placeholder="Describe el servicio…" oninput="LS[${i}].svcOtro=this.value"></div></div>` : ""}
  `;
  }).join("");
  recalcOrd();
}
function onLSsel(i, s) {
  const cat = DB.get("cat");
  const sv = cat.find((x) => x.nombre === s.value);
  LS[i].svc = s.value;
  LS[i].precio = sv ? sv.precio : 0;
  renderLS();
}
function onLSprice(i, inp) {
  LS[i].precio = parseFloat(inp.value) || 0;
  recalcOrd();
}
function delLS(i) {
  LS.splice(i, 1);
  if (!LS.length) LS = [{ svc: "", precio: 0 }];
  renderLS();
}
function addLS() {
  LS.push({ svc: "", precio: 0 });
  renderLS();
}
function recalcOrd() {
  const sub = LS.reduce((a, l) => a + (l.precio || 0), 0);
  const desc = parseFloat(document.getElementById("ord-desc")?.value) || 0;
  const tot = Math.max(0, sub - desc);
  const el = document.getElementById("ord-tot");
  if (el) el.textContent = mxn(tot);
  return tot;
}

async function delOrd(id) {
  if (!puedo("eliminarOrdenes")) {
    notify("❌ Sin permisos");
    return;
  }

  const ords = DB.get("ordenes");
  const ord = ords.find((o) => o.id === id);

  if (!ord) {
    notify("Orden no encontrada");
    return;
  }

  const ok = await ARABOT.confirm({
    title: "Eliminar Orden de Servicio",

    message: "¿Deseas eliminar la Orden " + ord.folio + "?",

    details:
      "Cliente: " +
      ord.cliente_nombre +
      "<br><br>" +
      "La Orden de Servicio será eliminada permanentemente y esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  try {
    await DATA.delete("ordenes", id);
  } catch (e) {
    console.error(e);
    notify("❌ Error al eliminar la orden");
    return;
  }

  rndOrd();
  dash();
  updBadges();

  notify("🗑️ Orden " + ord.folio + " eliminada");
}

window.initLS = initLS;
window.renderLS = renderLS;
window.onLSsel = onLSsel;
window.onLSprice = onLSprice;
window.delLS = delLS;
window.addLS = addLS;
window.recalcOrd = recalcOrd;
window.delOrd = delOrd;
