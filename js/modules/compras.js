// ============================================================
// MÓDULO COMPRAS — PROVEEDORES + ÓRDENES DE COMPRA
// ============================================================

// --- Sub-pestañas del panel Compras ---
function cmpTab(t) {
  document.getElementById("cmp-panel-ord").style.display =
    t === "ord" ? "" : "none";
  document.getElementById("cmp-panel-prov").style.display =
    t === "prov" ? "" : "none";
  document.getElementById("cmp-tab-ord").style.background =
    t === "ord" ? "var(--accent)" : "var(--card)";
  document.getElementById("cmp-tab-ord").style.color =
    t === "ord" ? "#fff" : "var(--text2)";
  document.getElementById("cmp-tab-prov").style.background =
    t === "prov" ? "var(--accent)" : "var(--card)";
  document.getElementById("cmp-tab-prov").style.color =
    t === "prov" ? "#fff" : "var(--text2)";
}

// --- Pestañas proveedor modal ---
function provTab(t) {
  document.getElementById("prov-panel-gen").style.display =
    t === "gen" ? "" : "none";
  document.getElementById("prov-panel-fis").style.display =
    t === "fis" ? "" : "none";
  document.getElementById("prov-tab-gen").style.background =
    t === "gen" ? "var(--accent)" : "var(--card)";
  document.getElementById("prov-tab-gen").style.color =
    t === "gen" ? "#fff" : "var(--text2)";
  document.getElementById("prov-tab-fis").style.background =
    t === "fis" ? "var(--accent)" : "var(--card)";
  document.getElementById("prov-tab-fis").style.color =
    t === "fis" ? "#fff" : "var(--text2)";
}

function copiarDirProv() {
  document.getElementById("pv-dirfis").value =
    document.getElementById("pv-dir").value;
}

// --- PROVEEDORES ---
function openNuevoProv() {
  document.getElementById("prov-tit").textContent = "🏭 Nuevo proveedor";
  document.getElementById("pv-eid").value = "";
  [
    "pv-nm",
    "pv-tel",
    "pv-wa",
    "pv-em",
    "pv-dir",
    "pv-prod",
    "pv-not",
    "pv-rfc",
    "pv-razon",
    "pv-regimen-otro",
    "pv-dirfis",
    "pv-emfis",
  ].forEach((f) => {
    const e = document.getElementById(f);
    if (e) e.value = "";
  });
  ["pv-regimen", "pv-cfdi", "pv-metpago", "pv-formapago"].forEach((f) => {
    const e = document.getElementById(f);
    if (e) e.value = "";
  });
  document.getElementById("pv-ret-iva").checked = false;
  document.getElementById("pv-ret-isr").checked = false;
  document.getElementById("pv-regimen-otro-wrap").style.display = "none";
  provTab("gen");
  openM("m-prov");
}

function saveProv() {
  const nm = document.getElementById("pv-nm").value.trim();
  if (!nm) {
    alert("Ingresa el nombre del proveedor");
    return;
  }
  const eid = document.getElementById("pv-eid").value;
  const provs = DB.get("proveedores");
  const reg = document.getElementById("pv-regimen").value;
  const datos = {
    nombre: nm,
    tel: document.getElementById("pv-tel").value,
    wa: document.getElementById("pv-wa").value,
    email: document.getElementById("pv-em").value,
    dir: document.getElementById("pv-dir").value,
    productos: document.getElementById("pv-prod").value,
    notas: document.getElementById("pv-not").value,
    rfc: document.getElementById("pv-rfc").value.toUpperCase(),
    razonSocial: document.getElementById("pv-razon").value,
    regimenFiscal:
      reg === "otro" ? document.getElementById("pv-regimen-otro").value : reg,
    usoCFDI: document.getElementById("pv-cfdi").value,
    metodoPago: document.getElementById("pv-metpago").value,
    formaPago: document.getElementById("pv-formapago").value,
    emailFiscal: document.getElementById("pv-emfis").value,
    direccionFiscal: document.getElementById("pv-dirfis").value,
    retieneIVA: document.getElementById("pv-ret-iva").checked,
    retieneISR: document.getElementById("pv-ret-isr").checked,
  };
  if (eid) {
    const i = provs.findIndex((p) => p.id === eid);
    if (i >= 0) {
      provs[i] = { ...provs[i], ...datos };
      DB.set("proveedores", provs);
      API.update("proveedores", eid, datos);
    }
  } else {
    const id = "PROV-" + String(provs.length + 1).padStart(4, "0");
    const np = { id, ...datos, fecha: hoy() };
    provs.push(np);
    DB.set("proveedores", provs);
    API.save("proveedores", np);
  }
  closeM("m-prov");
  rndProv();
  fillProvSelect();
  notify("Proveedor guardado ✅");
}

function editProv(id) {
  const p = DB.get("proveedores").find((x) => x.id === id);
  if (!p) return;
  document.getElementById("prov-tit").textContent = "✏️ Editar proveedor";
  document.getElementById("pv-eid").value = p.id;
  document.getElementById("pv-nm").value = p.nombre || "";
  document.getElementById("pv-tel").value = p.tel || "";
  document.getElementById("pv-wa").value = p.wa || "";
  document.getElementById("pv-em").value = p.email || "";
  document.getElementById("pv-dir").value = p.dir || "";
  document.getElementById("pv-prod").value = p.productos || "";
  document.getElementById("pv-not").value = p.notas || "";
  document.getElementById("pv-rfc").value = p.rfc || "";
  document.getElementById("pv-razon").value = p.razonSocial || "";
  const regOpts = ["605", "606", "608", "612", "616", "621", "626", "601"];
  const reg = p.regimenFiscal || "";
  if (regOpts.includes(reg)) {
    document.getElementById("pv-regimen").value = reg;
    document.getElementById("pv-regimen-otro-wrap").style.display = "none";
  } else if (reg) {
    document.getElementById("pv-regimen").value = "otro";
    document.getElementById("pv-regimen-otro").value = reg;
    document.getElementById("pv-regimen-otro-wrap").style.display = "";
  } else document.getElementById("pv-regimen").value = "";
  document.getElementById("pv-cfdi").value = p.usoCFDI || "";
  document.getElementById("pv-metpago").value = p.metodoPago || "";
  document.getElementById("pv-formapago").value = p.formaPago || "";
  document.getElementById("pv-emfis").value = p.emailFiscal || "";
  document.getElementById("pv-dirfis").value = p.direccionFiscal || "";
  document.getElementById("pv-ret-iva").checked = !!p.retieneIVA;
  document.getElementById("pv-ret-isr").checked = !!p.retieneISR;
  provTab("gen");
  openM("m-prov");
}

function delProv(id) {
  if (!confirm("¿Eliminar este proveedor?")) return;
  let provs = DB.get("proveedores");
  provs = provs.filter((p) => p.id !== id);
  DB.set("proveedores", provs);
  API.delete && API.delete("proveedores", id);
  rndProv();
  fillProvSelect();
  notify("Proveedor eliminado");
}

function rndProv(lista) {
  const data = lista || DB.get("proveedores");
  const tb = document.getElementById("tb-prov");
  if (!data.length) {
    tb.innerHTML =
      '<tr><td colspan="7" class="nd">Sin proveedores registrados</td></tr>';
    return;
  }
  tb.innerHTML = data
    .map(
      (p) => `<tr>
    <td><b>${p.nombre}</b>${p.productos ? '<br><span style="font-size:10px;color:var(--text2)">' + p.productos + "</span>" : ""}</td>
    <td>${p.tel || "—"}</td>
    <td>${p.wa ? `<a href="https://wa.me/52${p.wa.replace(/\D/g, "")}" target="_blank" class="btn bw bsm">💬</a>` : "—"}</td>
    <td style="font-size:11px;color:var(--text2)">${p.email || "—"}</td>
    <td style="font-size:11px">${p.productos || "—"}</td>
    <td style="font-size:11px;color:var(--text2)">${p.rfc || "—"}</td>
    <td class="bg-btn"><button class="btn bg bsm" onclick="editProv('${p.id}')">✏️</button><button class="btn bd bsm" onclick="delProv('${p.id}')">🗑️</button></td>
  </tr>`,
    )
    .join("");
}

function filtProv() {
  const q = document.getElementById("sch-prov").value.toLowerCase();
  rndProv(
    DB.get("proveedores").filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.productos || "").toLowerCase().includes(q),
    ),
  );
}

function fillProvSelect() {
  const provs = DB.get("proveedores");
  const sel = document.getElementById("oc-prov");
  const cur = sel.value;
  sel.innerHTML =
    '<option value="">-- Seleccionar proveedor --</option>' +
    provs.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join("");
  if (cur) sel.value = cur;
}

// --- LÍNEAS DE ORDEN DE COMPRA ---
let OC_LINEAS = [];

function addLineaOC(linea) {
  const idx = OC_LINEAS.length;
  OC_LINEAS.push(
    linea || {
      desc: "",
      sku: "",
      qty: 1,
      precio: 0,
      iva: "16",
      cond: "Nuevo",
      cat: "Refacción",
      unidad: "pza",
      min: 1,
    },
  );
  renderLineasOC();
}

function renderLineasOC() {
  const cont = document.getElementById("oc-lineas");
  cont.innerHTML = OC_LINEAS.map(
    (l, i) => `
    <div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;position:relative">
      <button onclick="delLineaOC(${i})" style="position:absolute;top:6px;right:8px;background:var(--red);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 7px">✕</button>
      <div class="fr c2" style="margin-bottom:6px">
        <div class="fi"><label class="fl" style="font-size:10px">Descripción *</label><input type="text" value="${l.desc}" onchange="updLineaOC(${i},'desc',this.value)" placeholder="Ej: Batería iPhone 12"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Marca</label><input type="text" value="${l.marca || ""}" onchange="updLineaOC(${i},'marca',this.value)" placeholder="Ej: Apple, Samsung"></div>
      </div>
      <div class="fr c2" style="margin-bottom:6px">
        <div class="fi"><label class="fl" style="font-size:10px">SKU (opcional)</label><input type="text" value="${l.sku || ""}" onchange="updLineaOC(${i},'sku',this.value)" placeholder="Opcional"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Notas</label><input type="text" value="${l.notas || ""}" onchange="updLineaOC(${i},'notas',this.value)" placeholder="Observaciones del producto"></div>
      </div>
      <div style="display:grid;grid-template-columns:80px 120px 100px 120px 100px 100px 80px 100px;gap:8px;align-items:end">
        <div class="fi"><label class="fl" style="font-size:10px">Cant.</label><input type="number" min="1" value="${l.qty}" onchange="updLineaOC(${i},'qty',this.value);calcTotOC()" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Precio unit.</label><input type="number" min="0" step="0.01" value="${l.precio}" onchange="updLineaOC(${i},'precio',this.value);calcTotOC()" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">IVA</label>
          <select onchange="updLineaOC(${i},'iva',this.value);calcTotOC()">
            <option value="16" ${l.iva === "16" ? "selected" : ""}>16%</option>
            <option value="8" ${l.iva === "8" ? "selected" : ""}>8%</option>
            <option value="0" ${l.iva === "0" ? "selected" : ""}>0%</option>
            <option value="exento" ${l.iva === "exento" ? "selected" : ""}>Exento</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Condición</label>
          <select onchange="updLineaOC(${i},'cond',this.value)">
            <option ${l.cond === "Nuevo" ? "selected" : ""}>Nuevo</option>
            <option ${l.cond === "Usado" ? "selected" : ""}>Usado</option>
            <option ${l.cond === "Reacondicionado" ? "selected" : ""}>Reacondicionado</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Categoría</label>
          <select onchange="updLineaOC(${i},'cat',this.value)">
            <option ${l.cat === "Refacción" ? "selected" : ""}>Refacción</option>
            <option ${l.cat === "Accesorio" ? "selected" : ""}>Accesorio</option>
            <option ${l.cat === "Software" ? "selected" : ""}>Software</option>
            <option ${l.cat === "Herramienta" ? "selected" : ""}>Herramienta</option>
            <option ${l.cat === "Consumible" ? "selected" : ""}>Consumible</option>
            <option ${l.cat === "Laptop" ? "selected" : ""}>Laptop</option>
            <option ${l.cat === "PC" ? "selected" : ""}>PC</option>
            <option ${l.cat === "Impresora" ? "selected" : ""}>Impresora</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Unidad</label>
          <select onchange="updLineaOC(${i},'unidad',this.value)">
            <option ${l.unidad === "pza" ? "selected" : ""}>pza</option>
            <option ${l.unidad === "par" ? "selected" : ""}>par</option>
            <option ${l.unidad === "kit" ? "selected" : ""}>kit</option>
            <option ${l.unidad === "litro" ? "selected" : ""}>litro</option>
            <option ${l.unidad === "gramos" ? "selected" : ""}>gramos</option>
          </select>
        </div>
        <div class="fi"><label class="fl" style="font-size:10px">Stock mín.</label><input type="number" min="0" value="${l.min || 1}" onchange="updLineaOC(${i},'min',this.value)" style="text-align:right"></div>
        <div class="fi"><label class="fl" style="font-size:10px">Garantía (días)</label><input type="number" min="0" value="${l.garantia_dias || 0}" onchange="updLineaOC(${i},'garantia_dias',this.value)" style="text-align:right"></div>
      </div>
    </div>`,
  ).join("");
  calcTotOC();
}

function updLineaOC(i, campo, val) {
  OC_LINEAS[i][campo] = val;
}
function delLineaOC(i) {
  OC_LINEAS.splice(i, 1);
  renderLineasOC();
}

function calcTotOC() {
  let sub = 0,
    iva = 0;
  OC_LINEAS.forEach((l) => {
    const q = parseFloat(l.qty) || 0;
    const p = parseFloat(l.precio) || 0;
    const s = q * p;
    sub += s;
    if (l.iva !== "exento") iva += (s * (parseFloat(l.iva) || 0)) / 100;
  });
  document.getElementById("oc-subtotal").textContent = mxn(sub);
  document.getElementById("oc-iva-total").textContent = mxn(iva);
  document.getElementById("oc-total").textContent = mxn(sub + iva);
}

// --- ÓRDENES DE COMPRA ---

function openNuevaOC() {
  document.getElementById("oc-tit").textContent = "📋 Nueva orden de compra";
  document.getElementById("oc-eid").value = "";
  document.getElementById("oc-fecha").value = hoy();
  document.getElementById("oc-notas").value = "";
  fillProvSelect();
  document.getElementById("oc-prov").value = "";
  OC_LINEAS = [];
  addLineaOC();
  openM("m-oc");
}

function autoFillOCProv() {
  /* futuro: prellenar datos del proveedor */
}

async function saveOC() {
  if (!document.getElementById("oc-prov").value) {
    alert("Selecciona un proveedor");
    return;
  }
  if (!OC_LINEAS.length || !OC_LINEAS[0].desc.trim()) {
    alert("Agrega al menos un producto");
    return;
  }
  const eid = document.getElementById("oc-eid").value;
  const ocs = DB.get("ordenes_compra");
  const provId = document.getElementById("oc-prov").value;
  const prov = DB.get("proveedores").find((p) => p.id === provId);
  let sub = 0,
    ivaT = 0;
  OC_LINEAS.forEach((l) => {
    const s = (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);
    sub += s;
    if (l.iva !== "exento") ivaT += (s * (parseFloat(l.iva) || 0)) / 100;
  });
  const estadoNuevo = document.getElementById("oc-estado").value || "Pendiente";
  const datos = {
    proveedorId: provId,
    proveedorNombre: prov ? prov.nombre : "",
    fecha: document.getElementById("oc-fecha").value,
    notas: document.getElementById("oc-notas").value,
    lineas: OC_LINEAS.map((l) => ({ ...l })),
    subtotal: sub,
    ivaTotal: ivaT,
    total: sub + ivaT,
    estado: estadoNuevo,
  };
  // Detectar si está marcando como recibida por primera vez
  let eraRecibida = false;
  if (eid) {
    const ocPrev = ocs.find((o) => o.id === eid);
    eraRecibida =
      ocPrev &&
      (ocPrev.estado === "Recibida completa" ||
        ocPrev.estado === "Recibida parcial");
    const i = ocs.findIndex((o) => o.id === eid);
    if (i >= 0) {
      ocs[i] = { ...ocs[i], ...datos };
      DB.set("ordenes_compra", ocs);
      API.update("ordenes_compra", eid, datos);
    }
  } else {
    const id = await API.getFolio("AROC");
    const no = {
      id,
      ...datos,
      historial: [{ estado: "Pendiente", fecha: hoy() }],
    };
    ocs.push(no);
    DB.set("ordenes_compra", ocs);
    API.save("ordenes_compra", no);
  }
  // #17: Si acaba de marcarse como Recibida, actualizar stock
  if (
    (estadoNuevo === "Recibida completa" ||
      estadoNuevo === "Recibida parcial") &&
    !eraRecibida
  ) {
    const inv = DB.get("inventario");
    OC_LINEAS.forEach((l) => {
      if (!l.desc || !l.desc.trim()) return;
      const qty = parseInt(l.qty) || 1;
      const costo = parseFloat(l.precio) || 0;
      // Buscar por SKU o nombre+marca
      let idx = l.sku ? inv.findIndex((p) => p.sku === l.sku) : -1;
      if (idx < 0)
        idx = inv.findIndex(
          (p) =>
            p.nombre.toLowerCase() === l.desc.toLowerCase() &&
            (p.marca || "").toLowerCase() === (l.marca || "").toLowerCase(),
        );
      if (idx >= 0) {
        // Producto existe → sumar stock y actualizar costo
        inv[idx].stock = (inv[idx].stock || 0) + qty;
        if (costo > 0) inv[idx].costo = costo;
        if (l.garantia_dias)
          inv[idx].garantia_dias = parseInt(l.garantia_dias) || 0;
        if (l.notas) inv[idx].notas = l.notas;
        API.update("inventario", inv[idx].sku, inv[idx]);
      } else {
        // Producto nuevo → crear en inventario
        const nuevoSku =
          l.sku || "SKU-" + String(inv.length + 1).padStart(4, "0");
        const prod = {
          id: nuevoSku,
          sku: nuevoSku,
          nombre: l.desc,
          marca: l.marca || "",
          cat: l.cat || "Refacción",
          cond: l.cond || "Nuevo",
          stock: qty,
          min: parseInt(l.min) || 1,
          unidad: l.unidad || "pza",
          costo,
          precio: costo,
          garantia_dias: parseInt(l.garantia_dias) || 0,
          proveedor: prov ? prov.nombre : "",
          notas: l.notas || "",
          fecha: hoy(),
        };
        inv.push(prod);
        API.save("inventario", prod);
      }
    });
    DB.set("inventario", inv);
    notify("✅ Stock actualizado desde la orden de compra");
  }
  closeM("m-oc");
  rndOC();
  if (
    !(
      (estadoNuevo === "Recibida completa" ||
        estadoNuevo === "Recibida parcial") &&
      !eraRecibida
    )
  )
    notify("Orden de compra guardada ✅");
}

function openDetalleOC(id) {
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);
  if (!oc) return;
  document.getElementById("oc-det-tit").textContent =
    "📋 Orden de compra — " + oc.id;
  document.getElementById("oc-det-est").value = oc.estado;
  document.getElementById("oc-det-body").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
      <div class="card card-sm"><div class="kl">Proveedor</div><b>${oc.proveedorNombre}</b></div>
      <div class="card card-sm"><div class="kl">Fecha</div>${fmt(oc.fecha)}</div>
      <div class="card card-sm"><div class="kl">Estado</div><span class="tag ${oc.estado === "Recibida completa" ? "tgg" : oc.estado === "Cancelada" ? "trd" : "tgr"}">${oc.estado}</span></div>
    </div>
    <div style="overflow-x:auto;margin-bottom:12px">
      <table class="tbl">
        <thead><tr><th>Descripción</th><th>SKU</th><th>Cant.</th><th>Precio</th><th>IVA</th><th>Condición</th><th>Subtotal</th></tr></thead>
        <tbody>${(oc.lineas || [])
          .map((l) => {
            const s = (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);
            return `<tr>
          <td>${l.desc}</td><td style="font-size:10px;color:var(--text2)">${l.sku || "—"}</td>
          <td style="text-align:right">${l.qty}</td><td style="text-align:right">${mxn(parseFloat(l.precio) || 0)}</td>
          <td>${l.iva === "exento" ? "Exento" : l.iva + "%"}</td><td>${l.cond}</td>
          <td style="text-align:right;color:var(--green)">${mxn(s)}</td>
        </tr>`;
          })
          .join("")}</tbody>
      </table>
    </div>
    <div style="text-align:right;font-size:13px">
      <div>Subtotal: <b>${mxn(oc.subtotal || 0)}</b></div>
      <div>IVA: <b>${mxn(oc.ivaTotal || 0)}</b></div>
      <div style="font-size:15px;font-weight:700;color:var(--green)">Total: ${mxn(oc.total || 0)}</div>
    </div>
    ${oc.notas ? `<div class="card card-sm" style="margin-top:10px"><div class="kl">Notas</div>${oc.notas}</div>` : ""}
    <div style="margin-top:12px">
      <div class="kl">Historial</div>
      ${(oc.historial || [])
        .slice()
        .reverse()
        .map(
          (h) =>
            `<div style="font-size:11px;padding:3px 0;border-bottom:1px solid var(--border)"><span style="color:var(--accent2)">${h.estado}</span> — <span style="color:var(--text2)">${fmt(h.fecha)}</span></div>`,
        )
        .join("")}
    </div>`;
  document.getElementById("oc-det-body").dataset.id = id;
  openM("m-oc-det");
}

function saveEstOC() {
  const id = document.getElementById("oc-det-body").dataset.id;
  const est = document.getElementById("oc-det-est").value;
  const ocs = DB.get("ordenes_compra");
  const i = ocs.findIndex((o) => o.id === id);
  if (i < 0) return;
  ocs[i].estado = est;
  ocs[i].historial = ocs[i].historial || [];
  ocs[i].historial.push({ estado: est, fecha: hoy() });
  DB.set("ordenes_compra", ocs);
  API.update("ordenes_compra", id, {
    estado: est,
    historial: ocs[i].historial,
  });
  // Si recibida completa → agregar al inventario
  if (est === "Recibida completa") {
    const oc = ocs[i];
    const cf = DB.obj("config");
    const prods = DB.get("inventario");
    (oc.lineas || []).forEach((l) => {
      const garDias =
        l.cond === "Nuevo"
          ? parseInt(cf.cfg_gn) || 365
          : l.cond === "Reacondicionado"
            ? parseInt(cf.cfg_gr) || 90
            : parseInt(cf.cfg_gu) || 90;
      const sku = "SKU-" + String(prods.length + 1).padStart(4, "0");
      const np = {
        id: sku,
        sku: l.sku || sku,
        nombre: l.desc,
        marca: "",
        cat: l.cat || "Refacción",
        cond: l.cond || "Nuevo",
        stock: parseInt(l.qty) || 1,
        min: parseInt(l.min) || 1,
        unidad: l.unidad || "pza",
        costo: parseFloat(l.precio) || 0,
        precio: 0,
        garantia_dias: garDias,
        proveedor: oc.proveedorNombre,
        notas: "Recibido de OC " + oc.id,
        fecha: hoy(),
      };
      prods.push(np);
      API.save("inventario", np);
    });
    DB.set("inventario", prods);
    notify("✅ Productos agregados al inventario");
    rndInv();
  }
  closeM("m-oc-det");
  rndOC();
  notify("Estado actualizado ✅");
}

function editOC(id) {
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);
  if (!oc) return;
  document.getElementById("oc-tit").textContent = "✏️ Editar orden " + oc.id;
  document.getElementById("oc-eid").value = oc.id;
  document.getElementById("oc-fecha").value = oc.fecha || hoy();
  document.getElementById("oc-estado").value = oc.estado || "Pendiente";
  document.getElementById("oc-notas").value = oc.notas || "";
  fillProvSelect();
  document.getElementById("oc-prov").value = oc.proveedorId || "";
  OC_LINEAS = (oc.lineas || []).map((l) => ({ ...l }));
  renderLineasOC();
  openM("m-oc");
}

function delOC(id) {
  if (!confirm("¿Eliminar esta orden de compra?")) return;
  let ocs = DB.get("ordenes_compra");
  ocs = ocs.filter((o) => o.id !== id);
  DB.set("ordenes_compra", ocs);
  rndOC();
  notify("Orden eliminada");
}

const EST_OC_COLOR = {
  Pendiente: "tgr",
  Enviada: "tgb",
  Cancelada: "trd",
  "Recibida completa": "tgg",
  "Recibida parcial": "tgy",
};
function rndOC(lista) {
  const data = lista || DB.get("ordenes_compra");
  const tb = document.getElementById("tb-oc");
  if (!data.length) {
    tb.innerHTML =
      '<tr><td colspan="7" class="nd">Sin órdenes de compra</td></tr>';
    return;
  }
  tb.innerHTML = data
    .slice()
    .reverse()
    .map(
      (oc) => `<tr>
    <td style="font-family:var(--fh);color:var(--accent);font-size:11px">${oc.id}</td>
    <td style="font-size:11px;color:var(--text2)">${fmt(oc.fecha)}</td>
    <td><b>${oc.proveedorNombre || "—"}</b></td>
    <td style="font-size:11px">${(oc.lineas || []).length} producto(s)</td>
    <td style="color:var(--green);font-family:var(--fh)">${mxn(oc.total || 0)}</td>
    <td><span class="tag ${EST_OC_COLOR[oc.estado] || "tgr"}">${oc.estado}</span></td>
    <td class="bg-btn">
      <button class="btn bp bsm" onclick="openDetalleOC('${oc.id}')">📋</button>
      <button class="btn bg bsm" onclick="editOC('${oc.id}')">✏️</button>
      <button class="btn bd bsm" onclick="delOC('${oc.id}')">🗑️</button>
    </td>
  </tr>`,
    )
    .join("");
}

function filtOC() {
  const q = document.getElementById("sch-oc").value.toLowerCase();
  const est = document.getElementById("fil-oc-est").value;
  rndOC(
    DB.get("ordenes_compra").filter(
      (o) =>
        (!q ||
          o.id.toLowerCase().includes(q) ||
          (o.proveedorNombre || "").toLowerCase().includes(q)) &&
        (!est || o.estado === est),
    ),
  );
}

// Imprimir OC
function prtOC() {
  const id = document.getElementById("oc-det-body").dataset.id;
  const oc = DB.get("ordenes_compra").find((x) => x.id === id);
  if (!oc) return;
  const c = cfg();
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    @page{size:letter;margin:15mm}body{font-family:Arial,sans-serif;font-size:11px;color:#000}
    h1{font-size:18px;margin:0}table{width:100%;border-collapse:collapse;margin-top:10px}
    th{background:#000;color:#fff;padding:5px 8px;text-align:left;font-size:10px}
    td{padding:4px 8px;border-bottom:1px solid #ddd;font-size:10px}
    .tot{text-align:right;margin-top:10px;font-size:12px}
    .tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:#eee}
    @media print{body{margin:0}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px">
    <div><h1>${c.nombre || "ARATECH"}</h1><div style="font-size:10px;color:#555">${c.dir || ""} | Tel: ${c.tel || ""}</div></div>
    <div style="text-align:right"><div style="font-size:16px;font-weight:700">ORDEN DE COMPRA</div><div style="font-size:13px;color:#555">${oc.id}</div><div style="font-size:10px">Fecha: ${fmt(oc.fecha)}</div></div>
  </div>
  <div style="margin-bottom:10px"><b>Proveedor:</b> ${oc.proveedorNombre} &nbsp;&nbsp; <b>Estado:</b> <span class="tag">${oc.estado}</span></div>
  <table><thead><tr><th>Descripción</th><th>SKU</th><th>Cant.</th><th>Precio unit.</th><th>IVA</th><th>Condición</th><th>Subtotal</th></tr></thead>
  <tbody>${(oc.lineas || [])
    .map((l) => {
      const s = (parseFloat(l.qty) || 0) * (parseFloat(l.precio) || 0);
      return `<tr><td>${l.desc}</td><td>${l.sku || "—"}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${mxn(parseFloat(l.precio) || 0)}</td><td>${l.iva === "exento" ? "Exento" : l.iva + "%"}</td><td>${l.cond}</td><td style="text-align:right">${mxn(s)}</td></tr>`;
    })
    .join("")}</tbody></table>
  <div class="tot"><div>Subtotal: <b>${mxn(oc.subtotal || 0)}</b></div><div>IVA: <b>${mxn(oc.ivaTotal || 0)}</b></div><div style="font-size:14px;font-weight:700">Total: ${mxn(oc.total || 0)}</div></div>
  ${oc.notas ? `<div style="margin-top:12px;padding:8px;border:1px solid #ddd;border-radius:4px"><b>Notas:</b> ${oc.notas}</div>` : ""}
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// Inicializar datos compras en DB si no existen
if (!DB.get("proveedores").length && !localStorage.getItem("db_proveedores"))
  DB.set("proveedores", []);
if (
  !DB.get("ordenes_compra").length &&
  !localStorage.getItem("db_ordenes_compra")
)
  DB.set("ordenes_compra", []);

window.cmpTab = cmpTab;
window.provTab = provTab;

window.openNuevoProv = openNuevoProv;
window.saveProv = saveProv;
window.editProv = editProv;
window.delProv = delProv;
window.rndProv = rndProv;
window.filtProv = filtProv;

window.addLineaOC = addLineaOC;
window.renderLineasOC = renderLineasOC;
window.updLineaOC = updLineaOC;
window.delLineaOC = delLineaOC;
window.calcTotOC = calcTotOC;

window.openNuevaOC = openNuevaOC;
window.autoFillOCProv = autoFillOCProv;
window.saveOC = saveOC;
window.openDetalleOC = openDetalleOC;
window.saveEstOC = saveEstOC;
window.editOC = editOC;
window.delOC = delOC;
window.rndOC = rndOC;
window.filtOC = filtOC;
window.prtOC = prtOC;
