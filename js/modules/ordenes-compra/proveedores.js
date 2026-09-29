// ============================================================
// PROVEEDORES
// ============================================================
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
  document.getElementById("prov-tit").innerHTML =
    '<i class="ar-icon empresa"></i> Nuevo proveedor';
  initIcons();
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

function openNuevoProvOC() {
  PROV_OC_CALLBACK = true;

  openNuevoProv();
}

async function saveProv() {
  const nm = document.getElementById("pv-nm").value.trim();
  if (!nm) {
    ARABOT.alert({
      title: "Proveedor requerido",

      message: "Ingresa el nombre del proveedor.",

      details:
        "Este campo es obligatorio para registrar o actualizar un proveedor.",
    });

    return;
  }
  const eid = document.getElementById("pv-eid").value;
  const provs = DB.get("proveedores");
  let proveedorSeleccionado = eid;
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
      await DATA.update("proveedores", eid, datos);
    }
  } else {
    const id = "PROV-" + String(provs.length + 1).padStart(4, "0");
    const np = { id, ...datos, fecha: hoy() };
    provs.push(np);
    DB.set("proveedores", provs);
    await DATA.save("proveedores", np.id, np);
    proveedorSeleccionado = np.id;
  }
  closeM("m-prov");

  rndProv();

  fillProvSelect();

  if (PROV_OC_CALLBACK) {
    document.getElementById("oc-prov").value = proveedorSeleccionado;

    // Ejecutar el mismo flujo que cuando el usuario cambia manualmente el proveedor
    autoFillOCProv();

    PROV_OC_CALLBACK = false;

    // Continuar la captura desde la primera línea del producto
    setTimeout(() => {
      document.querySelector("#oc-lineas input")?.focus();
    }, 100);
  }

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

async function delProv(id) {
  const ok = await ARABOT.confirm({
    title: "Eliminar proveedor",

    message: "¿Deseas eliminar este proveedor?",

    details:
      "El proveedor será eliminado permanentemente y esta acción no podrá deshacerse.",
  });

  if (!ok) return;
  let provs = DB.get("proveedores");
  provs = provs.filter((p) => p.id !== id);
  DB.set("proveedores", provs);
  await DATA.delete("proveedores", id);
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

window.provTab = provTab;

window.copiarDirProv = copiarDirProv;

window.openNuevoProv = openNuevoProv;
window.saveProv = saveProv;
window.editProv = editProv;
window.delProv = delProv;
window.rndProv = rndProv;
window.filtProv = filtProv;
window.fillProvSelect = fillProvSelect;
