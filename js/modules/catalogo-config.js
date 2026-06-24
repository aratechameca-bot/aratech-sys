// CATALOGO / CONFIG
function rndCfg() {
  const cat = DB.get("cat");
  document.getElementById("tb-cat").innerHTML = cat
    .map(
      (s, i) =>
        `<tr><td style="font-size:11px">${s.nombre}</td><td style="color:var(--green)">${s.precio > 0 ? mxn(s.precio) : "Gratis"}</td><td>${s.garantia > 0 ? s.garantia + " días" : "Sin garantía"}</td><td><button class="btn bg bsm" onclick="editSvcPrecio(${i})" title="Editar precio">$</button><button class="btn bs bsm" onclick="verHistorialPrecio(${i})" title="Ver historial">📈</button><button class="btn bd bsm" onclick="delSvc(${i})">✕</button></td></tr>`,
    )
    .join("");
  const cf = DB.obj("config");
  const map = {
    "cfg-nm": "nombre",
    "cfg-sl": "slogan",
    "cfg-tel": "tel",
    "cfg-ig": "ig",
    "cfg-dir": "dir",
    "cfg-em": "em",
    "cfg-gn": "cfg_gn",
    "cfg-gu": "cfg_gu",
    "cfg-gr": "cfg_gr",
    "cfg-gh": "cfg_gh",
    "cfg-ga": "cfg_ga",
    "cfg-ma": "cfg_ma",
    "cfg-pv": "cfg_pv",
  };
  Object.entries(map).forEach(([eid, k]) => {
    const el = document.getElementById(eid);
    if (el && cf[k]) el.value = cf[k];
  });
}
function addSvc() {
  const nm = document.getElementById("ns-nm").value.trim();
  if (!nm) return;
  const cat = DB.get("cat");
  const precio = parseFloat(document.getElementById("ns-pr").value) || 0;
  const id = "SVC-" + Date.now();
  const svc = {
    id,
    nombre: nm,
    precio,
    garantia: parseInt(document.getElementById("ns-ga").value) || 0,
    descripcion: document.getElementById("ns-ds")?.value || "",
    historialPrecios: [
      { precio, fecha: hoy(), usuario: currentUser?.nombre || "Sistema" },
    ],
  };
  cat.push(svc);
  DB.set("cat", cat);
  API.save("cat", svc);
  ["ns-nm", "ns-pr", "ns-ga", "ns-ds"].forEach((f) => {
    const e = document.getElementById(f);
    if (e) e.value = "";
  });
  rndCfg();
  notify("Servicio agregado ✅");
}
function delSvc(i) {
  if (!confirm("¿Eliminar?")) return;
  const cat = DB.get("cat");
  const svc = cat[i];
  cat.splice(i, 1);
  DB.set("cat", cat);
  if (svc?.id) API.delete("cat", svc.id);
  rndCfg();
}
function saveConf() {
  const cf = {
    nombre: document.getElementById("cfg-nm").value,
    slogan: document.getElementById("cfg-sl").value,
    tel: document.getElementById("cfg-tel").value,
    ig: document.getElementById("cfg-ig").value,
    dir: document.getElementById("cfg-dir").value,
    em: document.getElementById("cfg-em").value,
    cfg_gn: document.getElementById("cfg-gn").value,
    cfg_gu: document.getElementById("cfg-gu").value,
    cfg_gr: document.getElementById("cfg-gr").value,
    cfg_gh: document.getElementById("cfg-gh").value,
    cfg_ga: document.getElementById("cfg-ga").value,
    cfg_ma: document.getElementById("cfg-ma").value,
    cfg_pv: document.getElementById("cfg-pv").value,
  };
  DB.sobj("config", cf);
  notify("Configuración guardada ✅");
}

// ============================================================
// HISTORIAL DE PRECIOS — Catálogo de servicios
// ============================================================
function editSvcPrecio(i) {
  const cat = DB.get("cat");
  const svc = cat[i];
  if (!svc) return;

  const nuevo = parseFloat(
    prompt(
      `Nuevo precio para "${svc.nombre}" (actual: ${mxn(svc.precio)}):`,
      svc.precio,
    ),
  );
  if (isNaN(nuevo) || nuevo < 0) return;
  if (nuevo === svc.precio) {
    notify("El precio no cambió");
    return;
  }

  // Guardar en historial
  svc.historialPrecios = svc.historialPrecios || [
    { precio: svc.precio, fecha: hoy(), usuario: "Inicial" },
  ];
  svc.historialPrecios.push({
    precio: nuevo,
    fecha: hoy(),
    usuario: currentUser?.nombre || "Sistema",
  });
  svc.precio = nuevo;

  cat[i] = svc;
  DB.set("cat", cat);
  API.save("cat", svc);
  rndCfg();
  notify(`Precio actualizado a ${mxn(nuevo)} ✅`);
}

function verHistorialPrecio(i) {
  const cat = DB.get("cat");
  const svc = cat[i];
  if (!svc) return;

  const hist = svc.historialPrecios || [
    { precio: svc.precio, fecha: "—", usuario: "Inicial" },
  ];
  const rows = hist
    .slice()
    .reverse()
    .map(
      (h, j) =>
        `<tr style="${j === 0 ? "background:rgba(14,165,233,0.08)" : ""}">
      <td style="padding:8px 12px;color:var(--green);font-weight:${j === 0 ? "700" : "400"}">${mxn(h.precio)}</td>
      <td style="padding:8px 12px;color:var(--text2);font-size:11px">${h.fecha || "—"}</td>
      <td style="padding:8px 12px;color:var(--text3);font-size:11px">${h.usuario || "—"}</td>
    </tr>`,
    )
    .join("");

  // Mostrar en modal de alerta estilizado
  const w = window.open("", "_blank", "width=480,height=400");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;background:#0b1e2d;color:#fff;padding:20px;margin:0}
    h2{color:#75d0fa;font-size:16px;margin-bottom:4px}
    p{color:#a0b4c0;font-size:12px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    th{background:#102a43;padding:8px 12px;text-align:left;font-size:11px;color:#75d0fa;letter-spacing:1px}
    tr:nth-child(even){background:rgba(255,255,255,0.03)}
    </style></head><body>
    <h2>Historial de precios</h2>
    <p>${svc.nombre}</p>
    <table><thead><tr><th>Precio</th><th>Fecha</th><th>Modificado por</th></tr></thead>
    <tbody>${rows}</tbody></table>
    </body></html>`);
  w.document.close();
}

window.rndCfg = rndCfg;
window.addSvc = addSvc;
window.delSvc = delSvc;
window.saveConf = saveConf;
window.editSvcPrecio = editSvcPrecio;
window.verHistorialPrecio = verHistorialPrecio;
