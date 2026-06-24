// CLIENTES
function cliTab(t) {
  document.getElementById("cli-panel-gen").style.display =
    t === "gen" ? "" : "none";
  document.getElementById("cli-panel-fis").style.display =
    t === "fis" ? "" : "none";
  document.getElementById("cli-tab-gen").style.background =
    t === "gen" ? "var(--accent)" : "var(--card)";
  document.getElementById("cli-tab-gen").style.color =
    t === "gen" ? "#fff" : "var(--text2)";
  document.getElementById("cli-tab-fis").style.background =
    t === "fis" ? "var(--accent)" : "var(--card)";
  document.getElementById("cli-tab-fis").style.color =
    t === "fis" ? "#fff" : "var(--text2)";
}
function toggleRegimenOtro(pre) {
  const v = document.getElementById(pre + "-regimen").value;
  document.getElementById(pre + "-regimen-otro-wrap").style.display =
    v === "otro" ? "" : "none";
}
function copiarDirCli() {
  const dir = document.getElementById("cli-dir").value;
  document.getElementById("cli-dirfis").value = dir;
}
function getFiscalCli() {
  const reg = document.getElementById("cli-regimen").value;
  return {
    rfc: document.getElementById("cli-rfc").value.toUpperCase(),
    razonSocial: document.getElementById("cli-razon").value,
    regimenFiscal:
      reg === "otro" ? document.getElementById("cli-regimen-otro").value : reg,
    usoCFDI: document.getElementById("cli-cfdi").value,
    metodoPago: document.getElementById("cli-metpago").value,
    formaPago: document.getElementById("cli-formapago").value,
    direccionFiscal: document.getElementById("cli-dirfis").value,
    emailFiscal: document.getElementById("cli-emfis").value,
    retieneIVA: document.getElementById("cli-ret-iva").checked,
    retieneISR: document.getElementById("cli-ret-isr").checked,
  };
}
function setFiscalCli(c) {
  document.getElementById("cli-rfc").value = c.rfc || "";
  document.getElementById("cli-razon").value = c.razonSocial || "";
  const regOpts = ["605", "606", "608", "612", "616", "621", "626"];
  const reg = c.regimenFiscal || "";
  if (regOpts.includes(reg)) {
    document.getElementById("cli-regimen").value = reg;
    document.getElementById("cli-regimen-otro-wrap").style.display = "none";
  } else if (reg) {
    document.getElementById("cli-regimen").value = "otro";
    document.getElementById("cli-regimen-otro").value = reg;
    document.getElementById("cli-regimen-otro-wrap").style.display = "";
  } else {
    document.getElementById("cli-regimen").value = "";
  }
  document.getElementById("cli-cfdi").value = c.usoCFDI || "";
  document.getElementById("cli-metpago").value = c.metodoPago || "";
  document.getElementById("cli-formapago").value = c.formaPago || "";
  document.getElementById("cli-dirfis").value = c.direccionFiscal || "";
  document.getElementById("cli-emfis").value = c.emailFiscal || "";
  document.getElementById("cli-ret-iva").checked = !!c.retieneIVA;
  document.getElementById("cli-ret-isr").checked = !!c.retieneISR;
}
function saveCli() {
  console.log("EID=", document.getElementById("cli-eid").value);
  const nm = document.getElementById("cli-nm").value.trim();
  if (!nm) {
    alert("Ingresa el nombre");
    return;
  }
  const eid = document.getElementById("cli-eid").value;
  const desdeOrden = document.getElementById("cli-desde-orden").value === "1";
  const clis = DB.get("clientes");
  const fiscal = getFiscalCli();
  let savedId = "";
  if (eid) {
    const i = clis.findIndex((c) => c.id === eid);
    if (i >= 0) {
      clis[i] = {
        ...clis[i],
        nombre: nm,
        tel: document.getElementById("cli-tel").value,
        email: document.getElementById("cli-em").value,
        origen: document.getElementById("cli-ori").value,
        dir: document.getElementById("cli-dir").value,
        notas: document.getElementById("cli-not").value,
        ...fiscal,
      };
      savedId = clis[i].id;
    }
  } else {
    const id = "CLI-" + String(clis.length + 1).padStart(4, "0");
    clis.push({
      id,
      nombre: nm,
      tel: document.getElementById("cli-tel").value,
      email: document.getElementById("cli-em").value,
      origen: document.getElementById("cli-ori").value,
      dir: document.getElementById("cli-dir").value,
      notas: document.getElementById("cli-not").value,
      ...fiscal,
      fecha: hoy(),
      visitas: 0,
      ultima_visita: "",
    });
    savedId = id;
  }
  DB.set("clientes", clis);

  if (eid) {
    API.update(
      "clientes",
      eid,
      clis.find((c) => c.id === eid),
    );
  } else {
    API.save(
      "clientes",
      clis.find((c) => c.id === savedId),
    );
  }
  closeM("m-cli");
  [
    "cli-nm",
    "cli-tel",
    "cli-em",
    "cli-dir",
    "cli-not",
    "cli-rfc",
    "cli-razon",
    "cli-dirfis",
    "cli-emfis",
    "cli-regimen-otro",
  ].forEach((f) => {
    const e = document.getElementById(f);
    if (e) e.value = "";
  });
  ["cli-regimen", "cli-cfdi", "cli-metpago", "cli-formapago"].forEach((f) => {
    const e = document.getElementById(f);
    if (e) e.value = "";
  });
  document.getElementById("cli-ret-iva").checked = false;
  document.getElementById("cli-ret-isr").checked = false;
  document.getElementById("cli-regimen-otro-wrap").style.display = "none";
  cliTab("gen");
  document.getElementById("cli-eid").value = "";
  document.getElementById("cli-desde-orden").value = "0";
  // Si viene desde orden, actualizar el select y seleccionar el nuevo cliente
  if (desdeOrden && savedId) {
    fillClis(["ord-cli"]);
    document.getElementById("ord-cli").value = savedId;
    const c = clis.find((x) => x.id === savedId);
    if (c) document.getElementById("ord-tel").value = c.tel || "";
  }
  rndCli();
  notify("Cliente guardado ✅");
}
function editCli(id) {
  const c = DB.get("clientes").find((x) => x.id === id);
  if (!c) return;
  document.getElementById("cli-eid").value = c.id;
  console.log("EDITCLI ASIGNO:", document.getElementById("cli-eid").value);
  document.getElementById("cli-nm").value = c.nombre;
  document.getElementById("cli-tel").value = c.tel || "";
  document.getElementById("cli-em").value = c.email || "";
  document.getElementById("cli-ori").value = c.origen || "Instagram";
  document.getElementById("cli-dir").value = c.dir || "";
  document.getElementById("cli-not").value = c.notas || "";
  document.getElementById("cli-desde-orden").value = "0";
  setFiscalCli(c);
  cliTab("gen");
  document.getElementById("cli-tit").textContent = "✏️ Editar cliente";
  openM("m-cli");
}

function newCli() {
  document.getElementById("cli-eid").value = "";
  document.getElementById("cli-tit").textContent = "👤 Nuevo cliente";

  document.getElementById("cli-nm").value = "";
  document.getElementById("cli-tel").value = "";
  document.getElementById("cli-em").value = "";
  document.getElementById("cli-dir").value = "";
  document.getElementById("cli-not").value = "";

  document.getElementById("cli-desde-orden").value = "0";

  cliTab("gen");
  setFiscalCli({});

  openM("m-cli");
}

function rndCli(lista) {
  const data = lista || DB.get("clientes");
  const tb = document.getElementById("tb-cli");
  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="8" class="nd">Sin clientes</td></tr>';
    return;
  }
  tb.innerHTML = data
    .map((c) => {
      const wa = c.tel
        ? `<a href="https://wa.me/52${String(c.tel).replace(/\D/g, "")}" target="_blank" class="btn bw bsm">💬</a>`
        : "";
      const esFrec = (c.visitas || 0) >= 3;
      return `<tr><td style="font-family:var(--fh);color:var(--accent);font-size:11px">${c.id}</td><td><b>${c.nombre}</b>${esFrec ? '<span style="background:rgba(255,214,0,.15);color:#ffd600;border:1px solid rgba(255,214,0,.3);border-radius:10px;font-size:9px;padding:1px 6px;margin-left:5px;font-weight:600">⭐ Frecuente</span>' : ""}</td><td>${c.tel || "—"}</td><td style="color:var(--text2)">${c.email || "—"}</td><td><span class="tag tgr">${c.origen || "—"}</span></td><td>${c.visitas || 0}</td><td>${fmt(c.ultima_visita)}</td><td class="bg-btn">${wa}<button class="btn bg bsm" onclick="editCli('${c.id}')">✏️</button></td></tr>`;
    })
    .join("");
}
function filtCli() {
  const q = document.getElementById("sch-cli").value.toLowerCase();
  rndCli(
    DB.get("clientes").filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.tel || "").includes(q) ||
        (c.email || "").toLowerCase().includes(q),
    ),
  );
}

window.cliTab = cliTab;
window.newCli = newCli;
window.editCli = editCli;
window.saveCli = saveCli;
window.rndCli = rndCli;
window.filtCli = filtCli;
