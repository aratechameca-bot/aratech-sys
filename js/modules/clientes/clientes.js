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
async function saveCli() {
  const nm = document.getElementById("cli-nm").value.trim();

  const telefono = ARATECH.Validator.telefono(
    document.getElementById("cli-tel").value,
    document.getElementById("cli-pais").value,
  );

  const email = ARATECH.Validator.email(
    document.getElementById("cli-em").value,
  );

  const emailFiscal = ARATECH.Validator.email(
    document.getElementById("cli-emfis").value,
  );

  const rfc = ARATECH.Validator.rfc(document.getElementById("cli-rfc").value);

  const codigoPais = document.getElementById("cli-pais").value;

  // Validación teléfono México
  if (!telefono.valid) {
    ARABOT.alert({
      title: "Teléfono inválido",
      message: telefono.message,
    });
    return;
  }

  // Validación email
  if (!email.valid) {
    ARABOT.alert({
      title: "Correo inválido",
      message: email.message,
    });
    return;
  }

  // Validación email fiscal
  if (!emailFiscal.valid) {
    ARABOT.alert({
      title: "Correo de facturación inválido",
      message: emailFiscal.message,
    });
    return;
  }
  // Validación RFC México
  if (!rfc.valid) {
    ARABOT.alert({
      title: "RFC inválido",
      message: rfc.message,
    });
    return;
  }

  if (!nm) {
    ARABOT.alert({
      title: "Nombre requerido",

      message: "Ingresa el nombre del cliente.",

      details:
        "Este campo es obligatorio para registrar o actualizar un cliente.",
    });

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
        codigoPais,
        tel: telefono.value,
        email: email.value,
        origen: document.getElementById("cli-ori").value,
        dir: document.getElementById("cli-dir").value,
        notas: document.getElementById("cli-not").value,
        ...fiscal,
      };
      savedId = clis[i].id;
    }
  } else {
    const id = await API.getFolio("CLI");

    clis.push({
      id,
      nombre: nm,
      codigoPais,
      tel: telefono.value,
      email: email.value,
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
    await DATA.update(
      "clientes",
      eid,
      clis.find((c) => c.id === eid),
    );
  } else {
    await DATA.save(
      "clientes",
      savedId,
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
  document.getElementById("cli-pais").value = "52";
  // Si viene desde Orden, seleccionar automáticamente el nuevo cliente
  if (desdeOrden && savedId) {
    ordSeleccionarCliente(savedId);
  }

  // =====================================================
  // Si viene desde Cotización
  // =====================================================

  if (window.COTIZACION_ABIERTA && savedId) {
    cotSeleccionarCliente(savedId);

    window.COTIZACION_ABIERTA = false;
  }

  rndCli();
  notify("Cliente guardado ✅");
}
function editCli(id) {
  const c = DB.get("clientes").find((x) => x.id === id);
  if (!c) return;
  document.getElementById("cli-eid").value = c.id;
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

function viewCli(id) {
  renderExpedienteCliente(id);

  openM("m-cli-view");
}

function renderExpedienteCliente(id) {
  const c = DB.get("clientes").find((x) => x.id === id);

  if (!c) return;

  const estado = AVISOS.estado(c.id);

  document.getElementById("cli-view-title").innerHTML =
    `<i class="ar-icon expediente"></i> Expediente del Cliente`;

  document.getElementById("cli-view-body").innerHTML =
    `
  
<div
    style="
        margin-bottom:18px;
        padding:10px 14px;
        border-radius:8px;
        background:rgba(255,255,255,.05);
        border-left:5px solid ${
          estado.color === "red"
            ? "#ff4d4f"
            : estado.color === "yellow"
              ? "#f7b731"
              : "#2ecc71"
        };
    "
>

<b>

${estado.icono}

Cliente

${estado.texto.toLowerCase()}

</b>

</div>

<h3 style="margin-bottom:15px">
    <i class="ar-icon usuario"></i>
    Información General
</h3>

<div class="fr c2">

  <div class="fi">
    <label class="fl">ID</label>
    <div class="iv">${c.id}</div>
  </div>

  <div class="fi">
    <label class="fl">Nombre</label>
    <div class="iv">${c.nombre || "—"}</div>
  </div>

</div>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Teléfono</label>
    <div class="iv">+${c.codigoPais || "52"} ${c.tel || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">Email</label>
    <div class="iv">${c.email || "—"}</div>
  </div>

</div>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Origen</label>
    <div class="iv">${c.origen || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">Visitas</label>
    <div class="iv">${c.visitas || 0}</div>
  </div>

</div>

<div class="fr">

  <div class="fi">
    <label class="fl">Dirección / Referencia</label>
    <div class="iv">${c.dir || "—"}</div>
  </div>

</div>

<div class="fr">

  <div class="fi">
    <label class="fl">Notas</label>
    <div class="iv">${c.notas || "—"}</div>
  </div>

</div>

<hr style="margin:22px 0;border:none;border-top:1px solid var(--border)">

<h3 style="margin-bottom:15px">
    <i class="ar-icon clipboard"></i>
    Datos Fiscales
</h3>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Razón Social</label>
    <div class="iv">${c.razonSocial || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">RFC</label>
    <div class="iv">${c.rfc || "—"}</div>
  </div>

</div>

<div class="fr">

  <div class="fi">
    <label class="fl">Dirección Fiscal</label>
    <div class="iv">${c.direccionFiscal || "—"}</div>
  </div>

</div>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Email Facturación</label>
    <div class="iv">${c.emailFiscal || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">Régimen Fiscal</label>
    <div class="iv">${c.regimenFiscal || "—"}</div>
  </div>

</div>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Uso CFDI</label>
    <div class="iv">${c.usoCFDI || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">Método de Pago</label>
    <div class="iv">${c.metodoPago || "—"}</div>
  </div>

</div>

<div class="fr c2">

  <div class="fi">
    <label class="fl">Forma de Pago</label>
    <div class="iv">${c.formaPago || "—"}</div>
  </div>

  <div class="fi">
    <label class="fl">Retenciones</label>
    <div class="iv">

      IVA: ${c.retieneIVA ? "Sí" : "No"} |

      ISR: ${c.retieneISR ? "Sí" : "No"}

    </div>

  </div>

</div>

` +
    renderCliAvisos(c) +
    `

<div
    style="
        display:flex;
        justify-content:flex-end;
        margin-top:20px;
    "
>

    <button
        class="btn bp"
        onclick="closeM('m-cli-view')"
    >
        <i class="ar-icon close"></i>
        Cerrar
    </button>

</div>

`;
  window.initIcons();
}

function renderCliAvisos(c) {
  const avisos = AVISOS.list(c.id);

  return `

<hr style="margin:22px 0;border:none;border-top:1px solid var(--border)">

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">

    <h3>
        <i class="ar-icon alerta"></i>
        Avisos internos
    </h3>

    <button
        class="btn bp bsm"
        onclick="newAviso('${c.id}')"
    >
        + Nuevo aviso
    </button>

</div>

<div id="cli-avisos">

${
  !avisos.length
    ? `<div class="nd">Sin avisos registrados</div>`
    : avisos
        .map(
          (a) => `

        <div
            style="
                border:1px solid var(--border);
                border-left:4px solid ${
                  a.prioridad === "critico"
                    ? "#ff4d4f"
                    : a.prioridad === "importante"
                      ? "#f7b731"
                      : "#2ecc71"
                };
                border-radius:10px;
                padding:12px;
                margin-bottom:10px;
            "
        >

            <div style="display:flex;justify-content:space-between">

                <div style="display:flex;align-items:center;gap:8px">

                  <span style="font-size:16px">
                      ${
                        a.prioridad === "critico"
                          ? "🔴"
                          : a.prioridad === "importante"
                            ? "🟡"
                            : "🟢"
                      }
                  </span>

                  <b>${a.categoria}</b>

              </div>

                <small>${a.fecha}</small>

            </div>

            <div style="margin-top:6px">

                  ${a.descripcion}

              </div>

              <div
                      style="
                          margin-top:10px;
                          display:flex;
                          justify-content:space-between;
                          align-items:center;
                      "
                  >

                      <small style="color:var(--text2)">

                          ${a.usuario_creacion || "Sistema"}

                      </small>

                      <div style="display:flex;gap:6px">

                          <button
                              class="btn bsm bg"
                              onclick="editAviso('${a.id}')"
                          >
                              <i class="ar-icon edit"></i>
                              Editar
                          </button>

                          <button
                              class="btn bsm bd"
                              onclick="deleteAviso('${a.id}','${c.id}')"
                          >
                              <i class="ar-icon delete"></i>
                              Eliminar
                          </button>

                      </div>

                  </div>

        </div>
        

    `,
        )
        .join("")
}

</div>


`;
  window.initIcons();
}

function newAviso(clienteId) {
  const cliente = DB.get("clientes").find((c) => c.id === clienteId);

  if (!cliente) return;

  document.getElementById("avi-cliente-id").value = cliente.id;

  document.getElementById("avi-cliente-nombre").value = cliente.nombre;

  document.getElementById("avi-id").value = "";

  document.getElementById("avi-prioridad").value = "info";

  document.getElementById("avi-categoria").value = "General";

  document.getElementById("avi-descripcion").value = "";

  openM("m-aviso");
}

async function saveAviso() {
  const cliente_id = document.getElementById("avi-cliente-id").value;

  const cliente_nombre = document.getElementById("avi-cliente-nombre").value;

  const prioridad = document.getElementById("avi-prioridad").value;

  const categoria = document.getElementById("avi-categoria").value;

  const descripcion = document.getElementById("avi-descripcion").value.trim();

  if (!descripcion) {
    ARABOT.alert({
      title: "Descripción requerida",
      message: "Escribe un aviso.",
    });

    return;
  }

  try {
    const avisoId = document.getElementById("avi-id").value;

    if (avisoId) {
      await AVISOS.update(avisoId, {
        prioridad,

        categoria,

        descripcion,

        usuario_actualizacion: "ARATECH",
      });
    } else {
      await AVISOS.save({
        cliente_id,

        cliente_nombre,

        prioridad,

        categoria,

        descripcion,

        usuario_creacion: "ARATECH",
      });
    }

    closeM("m-aviso");

    renderExpedienteCliente(cliente_id);

    rndCli();

    notify("Aviso guardado ✅");
  } catch (e) {
    ARABOT.error({
      title: "Error",

      message: e.message,
    });
  }
}

function editAviso(id) {
  const aviso = DB.get("cliente_avisos").find((a) => a.id === id);

  if (!aviso) return;

  document.getElementById("avi-id").value = aviso.id;

  document.getElementById("avi-cliente-id").value = aviso.cliente_id;

  document.getElementById("avi-cliente-nombre").value = aviso.cliente_nombre;

  document.getElementById("avi-prioridad").value = aviso.prioridad;

  document.getElementById("avi-categoria").value = aviso.categoria;

  document.getElementById("avi-descripcion").value = aviso.descripcion;

  openM("m-aviso");
}

async function deleteAviso(id, clienteId) {
  const ok = await ARABOT.confirm({
    title: "Eliminar aviso",

    message: "¿Deseas eliminar este aviso interno?",
  });

  if (!ok) return;

  try {
    await AVISOS.delete(id);

    renderExpedienteCliente(clienteId);

    rndCli();

    notify("Aviso eliminado ✅");
  } catch (e) {
    ARABOT.error({
      title: "Error",

      message: e.message,
    });
  }
}

function newCli() {
  document.getElementById("cli-eid").value = "";
  document.getElementById("cli-tit").innerHTML =
    '<i class="ar-icon usuario"></i> Nuevo cliente';

  window.refreshIcons(document.getElementById("cli-tit"));

  document.getElementById("cli-nm").value = "";
  document.getElementById("cli-tel").value = "";
  document.getElementById("cli-em").value = "";
  document.getElementById("cli-dir").value = "";
  document.getElementById("cli-not").value = "";

  document.getElementById("cli-desde-orden").value = "0";

  cliTab("gen");
  setFiscalCli({});

  openM("m-cli");

  ARATECH.Forms.bind({
    id: "cli-tel",
    validator: "telefono",
    country: "cli-pais",
  });

  ARATECH.Forms.bind({
    id: "cli-em",
    validator: "email",
  });

  ARATECH.Forms.bind({
    id: "cli-emfis",
    validator: "email",
  });

  ARATECH.Forms.bind({
    id: "cli-rfc",
    validator: "rfc",
  });
}

function rndCli(lista) {
  const data = lista || DB.get("clientes");
  const tb = document.getElementById("tb-cli");

  if (!data.length) {
    tb.innerHTML = '<tr><td colspan="10" class="nd">Sin clientes</td></tr>';
    return;
  }

  tb.innerHTML = data
    .map((c) => {
      const esFrec = (c.visitas || 0) >= 3;
      const portal = (DB.get("clientes_portal") || []).find(
        (p) => p.cliente_id === c.id,
      );

      return `
<tr>

    <td
        style="
            font-family:var(--fh);
            color:var(--accent);
            font-size:11px;
            cursor:pointer;
            font-weight:600;
            text-decoration:underline;
        "
        onclick="viewCli('${c.id}')"
        title="Ver información del cliente"
    >
        ${c.id}
    </td>

    <td style="text-align:center">

       ${(() => {
         const estado = AVISOS.estado(c.id);

         let fondo = "rgba(46,204,113,.15)";
         let borde = "rgba(46,204,113,.35)";
         let color = "#4ade80";
         let texto = "OK";

         if (estado.color === "yellow") {
           fondo = "rgba(251,191,36,.15)";
           borde = "rgba(251,191,36,.35)";
           color = "#fbbf24";
           texto = "Aviso";
         }

         if (estado.color === "red") {
           fondo = "rgba(239,68,68,.15)";
           borde = "rgba(239,68,68,.35)";
           color = "#ef4444";
           texto = "Crítico";
         }

         return `

        <span
            onclick="viewCli('${c.id}')"
            title="${estado.texto}"
            style="
                display:inline-flex;
                align-items:center;
                gap:5px;
                padding:2px 8px;
                border-radius:999px;
                cursor:pointer;
                background:${fondo};
                border:1px solid ${borde};
                color:${color};
                font-size:10px;
                font-weight:700;
                white-space:nowrap;
            "
        >

            ${estado.icono}

            ${texto}

        </span>

    `;
       })()}

    </td>

    <td>

        <b>${c.nombre}</b>

        ${
          esFrec
            ? `<span style="background:rgba(255,214,0,.15);color:#ffd600;border:1px solid rgba(255,214,0,.3);border-radius:10px;font-size:9px;padding:1px 6px;margin-left:5px;font-weight:600">⭐ Frecuente</span>`
            : ""
        }

    </td>

    <td>${c.tel || "—"}</td>

    <td style="color:var(--text2)">

        ${c.email || "—"}

    </td>

    <td>

        <span class="tag tgr">

            ${c.origen || "—"}

        </span>

    </td>

    <td style="max-width:220px">

        ${c.dir || "—"}

    </td>

    <td>

        ${c.visitas || 0}

    </td>

    <td>

        ${fmt(c.ultima_visita)}

    </td>
<td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${c.id}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        ${
          c.tel
            ? `
        <button
            class="btn bg bsm"
            onclick="window.open('https://wa.me/${c.codigoPais || "52"}${String(c.tel).replace(/\D/g, "")}?text=${encodeURIComponent(`¡Hola ${c.nombre}!, te escribimos de ARATECH para `)}','_blank')"
            title="Enviar WhatsApp al cliente">
            <i class="ar-icon whatsapp"></i> WhatsApp
        </button>
        `
            : ""
        }

        <button
            class="btn bg bsm"
            onclick="ESTADO.openCliente('${c.id}')"
            title="Portal Financiero">
            <i class="ar-icon finanzas"></i> Portal financiero
        </button>

        <button
            class="btn ${portal ? "tg" : "bg"} bsm"
            onclick="portalCliente('${c.id}')"
            title="${portal ? "Portal Cliente Activo" : "Activar Portal Cliente"}">
            ${
              portal
                ? '<i class="ar-icon success"></i> Portal activo'
                : '<i class="ar-icon portal"></i> Activar portal'
            }
        </button>

        <button
            class="btn bg bsm"
            onclick="editCli('${c.id}')"
            title="Editar cliente">
            <i class="ar-icon edit"></i> Editar cliente
        </button>

    </div>

</td>

</tr>
`;
    })
    .join("");

  window.initIcons();
}

function filtCli() {
  const q = ARATECH.Validator.normalizeText(
    document.getElementById("sch-cli").value,
  );

  const filtroEstado = document.getElementById("flt-cli-estado").value;

  rndCli(
    DB.get("clientes").filter((c) => {
      const avisos = AVISOS.list(c.id);

      const textoAvisos = avisos
        .map((a) =>
          [
            a.prioridad,
            a.categoria,
            a.descripcion,
            a.usuario_creacion,
            a.usuario_actualizacion,
          ].join(" "),
        )
        .join(" ");

      const texto = [
        c.id,
        c.nombre,
        c.tel,
        c.email,
        c.origen,
        c.dir,
        c.notas,

        c.rfc,
        c.razonSocial,
        c.regimenFiscal,
        c.usoCFDI,
        c.metodoPago,
        c.formaPago,
        c.direccionFiscal,
        c.emailFiscal,

        c.visitas,
        c.ultima_visita,

        textoAvisos,
      ]
        .map((v) => ARATECH.Validator.normalizeText(v))
        .join(" ");

      const coincideBusqueda = texto.includes(q);

      if (!coincideBusqueda) return false;

      const estado = AVISOS.estado(c.id);

      switch (filtroEstado) {
        case "":
          return true;

        case "sin":
          return !avisos.length;

        case "info":
          return estado.color === "green" && avisos.length > 0;

        case "importante":
          return estado.color === "yellow";

        case "critico":
          return estado.color === "red";

        default:
          return true;
      }
    }),
  );
}

async function delCli(id) {
  const ok = await ARABOT.confirm({
    title: "Eliminar cliente",

    message: "¿Deseas eliminar este cliente?",

    details: "Esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  const clientes = DB.get("clientes");

  const i = clientes.findIndex((c) => c.id === id);

  if (i < 0) return;

  clientes.splice(i, 1);

  DB.set("clientes", clientes);

  await DATA.delete("clientes", id);

  rndCli();

  notify("Cliente eliminado ✅");
}

async function portalCliente(clienteId) {
  const portal = (DB.get("clientes_portal") || []).find(
    (p) => p.cliente_id === clienteId,
  );

  if (portal) {
    ARABOT.alert({
      title: "Portal Cliente",
      message: "Este cliente ya tiene acceso al Portal Cliente.",
    });

    return;
  }

  const r = await FB.callFunction("activarPortalCliente", {
    cliente_id: clienteId,
  });

  if (!r.ok) {
    ARABOT.error(r.message || "No fue posible activar el Portal Cliente.");
    return;
  }

  await API.loadAll();

  rndCli();

  ARABOT.success({
    title: "Portal activado",
    message: "El cliente ya puede ingresar al Portal Cliente.",
  });
}

window.cliTab = cliTab;
window.newCli = newCli;
window.editCli = editCli;
window.saveCli = saveCli;
window.rndCli = rndCli;
window.filtCli = filtCli;
window.renderCliAvisos = renderCliAvisos;
window.newAviso = newAviso;
window.saveAviso = saveAviso;
window.renderExpedienteCliente = renderExpedienteCliente;
window.editAviso = editAviso;
window.deleteAviso = deleteAviso;
window.portalCliente = portalCliente;
