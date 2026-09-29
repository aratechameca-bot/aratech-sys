// EXPEDIENTE
function openExp(id) {
  const o = DB.get("ordenes").find((x) => x.id === id);
  const soloLectura = o.estado === "Cancelado";
  if (!o) return;
  const ticketRel =
    (DB.get("tickets") || []).find(
      (t) =>
        t.id === o.ticket_id ||
        t.orden_id === o.id ||
        t.orden_folio === o.folio,
    ) || null;
  document.getElementById("exp-id").value = id;
  const _tit = document.getElementById("exp-tit");
  _tit.innerHTML = '<i class="ar-icon expediente"></i> Expediente ' + o.folio;
  _tit.dataset.id = id;
  const vtasExtra = (o.vtas_rel || []).reduce((a, vid) => {
    const v = DB.get("ventas").find((x) => x.id === vid);
    return a + (v ? v.total : 0);
  }, 0);
  const totalIntegral = o.total + vtasExtra;

  // Temporal durante la transición.
  // El saldo definitivo será calculado desde el Libro Mayor.
  const saldo = o.pago_saldo ?? totalIntegral;

  const liq = saldo <= 0;

  const ventasRel = DB.get("ventas").filter((v) => v.orden_rel === o.id);

  const garantiasRel = DB.get("garantias").filter(
    (g) =>
      g.folio_ord === o.folio &&
      String(g.estado || "").toUpperCase() !== "CANCELADA",
  );

  const cancelacion = o.cancelacion || null;

  const waNum = o.tel ? String(o.tel).replace(/\D/g, "") : "";

  const wa = waNum
    ? `https://wa.me/52${waNum}?text=${encodeURIComponent(
        `Hola ${o.cliente_nombre}.

Te escribimos de ARATECH para notificarte avances relacionados con tu Orden de Servicio ${o.folio}.

`,
      )}`
    : "";
  document.getElementById("exp-info").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:10px">
      <div class="card card-sm"><div class="kl">Cliente</div><b>${o.cliente_nombre}</b><div style="font-size:11px;color:var(--text2)">${o.tel || "—"}</div></div>
      <div class="card card-sm"><div class="kl">Equipo</div><b>${o.tipo_equipo}</b>
      
      <div style="font-size:11px;color:var(--text2)">
        ${o.modelo || ""}
      </div>

      <div style="font-size:11px;color:var(--text2)">
        S/N: ${o.serie || "—"}
      </div>

      <div style="font-size:11px;color:var(--accent);font-weight:600;margin-top:4px">
        <i class="ar-icon lock"></i> PIN:: ${o.pin || "—"}
      </div>
</div>
      <div class="card card-sm"><div class="kl">Financiero</div>
        <div style="font-size:12px">Servicio: ${mxn(o.total)}${vtasExtra > 0 ? "<br>Ventas: " + mxn(vtasExtra) : ""}</div>
        <div style="font-size:13px;font-weight:700">Total: <span style="color:var(--green)">${mxn(totalIntegral)}</span></div>
        <div style="font-size:12px">
        Saldo pendiente:
        </div>

        <b style="color:${liq ? "var(--green)" : "var(--orange)"}">

        ${liq ? "LIQUIDADO" : mxn(saldo)}

        </b>

        </div>

    <div class="card card-sm">
      <div class="kl">
        <i class="ar-icon link"></i> Relacionadas
      </div>

      <div style="
        font-size:11px;
        color:var(--text2);
        margin-bottom:4px;
        font-weight:600;
      ">
        <i class="ar-icon ticket"></i> Ventas (${ventasRel.length})
      </div>

      <div style="
        font-size:11px;
        line-height:1.5;
        margin-bottom:8px;
      ">
        ${
          (ventasRel || []).length
            ? ventasRel
                .map(
                  (v) => `
                    <div
                      style="
                        color:var(--accent);
                        cursor:pointer;
                        text-decoration:underline;
                        font-weight:600;
                        margin-bottom:2px;
                      "
                      onclick="
                        closeM('m-exp');
                        openVenta('${v.id}');
                      "
                      title="Visualizar venta">

                      ${v.folio}

                    </div>
                  `,
                )
                .join("")
            : '<span style="color:var(--text3)">Sin registros</span>'
        }
      </div>

      <div style="
        font-size:11px;
        color:var(--text2);
        margin-bottom:4px;
        font-weight:600;
      ">
        <i class="ar-icon garantia"></i> Garantías (${garantiasRel.length})
      </div>

      <div style="
        font-size:11px;
        line-height:1.5;
      ">
        ${
          (garantiasRel || []).length
            ? garantiasRel
                .map(
                  (g) => `
                    <div
                      style="
                        color:var(--accent);
                        cursor:pointer;
                        text-decoration:underline;
                        font-weight:600;
                        margin-bottom:2px;
                      "
                      onclick="
                        closeM('m-exp');
                        verGar('${g.id}');
                      "
                      title="Visualizar garantía">

                      ${g.folio}

                    </div>
                  `,
                )
                .join("")
            : '<span style="color:var(--text3)">Sin registros</span>'
        }
      </div>

    </div>

      <div class="card card-sm">
        <div class="kl">
          <i class="ar-icon ticket"></i> Ticket
        </div>

        ${
          ticketRel
            ? `
            <div style="font-weight:700">
              ${ticketRel.folio}
            </div>

            <div style="
              font-size:11px;
              color:var(--text2);
              margin-top:4px;
            ">
              ${escHTML(ticketRel.asunto || "Sin asunto")}
            </div>

            <div style="
              font-size:11px;
              color:var(--accent);
              margin-top:4px;
            ">
              Estado: ${ticketRel.estado || "Sin estado"}
            </div>

            <div style="
              font-size:11px;
              color:#ffd600;
              margin-top:2px;
            ">
              Prioridad: ${ticketRel.prioridad || "Media"}
            </div>

            <div style="
              font-size:11px;
              color:var(--text2);
              margin-top:2px;
            ">
              Técnico: ${ticketRel.responsable || "Sin asignar"}
            </div>

            <div style="
              font-size:11px;
              color:var(--text2);
              margin-top:2px;
            ">
              Fecha: ${fmt(ticketRel.fecha)}
            </div>

            <button
              class="btn bs"
              style="margin-top:8px"
              onclick="abrirTicketDesdeOrden('${ticketRel.id}')">

              <i class="ar-icon expediente"></i> Abrir Ticket

            </button>
            `
            : `
            <div style="
              color:var(--text2);
              font-size:12px;
            ">
              Sin ticket relacionado
            </div>
            `
        }
      </div>
      </div> 

      ${
        cancelacion
          ? `
<div class="sec" style="border:1px solid rgba(255,90,90,.35)">

    <div class="sh">
        <h2 style="color:#ff6b6b">
            <i class="ar-icon cancel"></i> Documento cancelado
        </h2>
    </div>

    <div class="fr c2">

        <div class="fi">
            <label class="fl">Motivo</label>
            <div class="iv">
                ${cancelacion.motivo}
            </div>
        </div>

        <div class="fi">
            <label class="fl">Cancelado por</label>
            <div class="iv">
                ${cancelacion.usuario}
            </div>
        </div>

    </div>

        ${
          cancelacion.detalle
            ? `
        <div class="fr">
            <div class="fi">
                <label class="fl">Detalle</label>
                <div class="iv">
                    ${cancelacion.detalle}
                </div>
            </div>
        </div>
        `
            : ""
        }

        <div class="fr c2">

            <div class="fi">
                <label class="fl">Fecha</label>
                <div class="iv">
                    ${fmt(cancelacion.fecha)}
                </div>
            </div>

            <div class="fi">
                <label class="fl">Hora</label>
                <div class="iv">
                    ${cancelacion.hora}
                </div>
            </div>

        </div>

    </div>
    `
          : ""
      }

    <div class="sec">

        <div class="sh">

            <h2><i class="ar-icon herramientas"></i> Servicios</h2>

        </div>


    </div>
    <div class="card card-sm" style="margin-top:10px">
      <div class="kl">Servicios</div>
      ${(o.servicios || []).map((s) => `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:12px"><span>${s.svc || s.servicio}</span><span style="color:var(--green)">${mxn(s.precio)}</span></div>`).join("")}
      ${(o.vtas_rel || []).length > 0 ? `<div style="margin-top:6px;font-size:11px;color:var(--accent)">+ Ventas asociadas: ${mxn(vtasExtra)}</div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:700"><span>Total integral</span><span style="color:var(--green)">${mxn(totalIntegral)}</span></div>
      ${liq ? '<div style="background:rgba(0,230,118,.12);border:1px solid var(--green);border-radius:4px;padding:5px 10px;font-size:12px;color:var(--green);text-align:center;margin-top:5px">✅ LIQUIDADO AL 100%</div>' : ""}
    </div>
    <div class="card card-sm" style="margin-top:10px"><div class="kl">Problema reportado</div><div style="font-size:12px;margin-top:3px">${o.problema || "—"}</div></div>
  `;
  // Observaciones internas — solo visibles en expediente, nunca se imprimen
  const obsBlock = o.obs
    ? `
            <div style="background:rgba(255,145,0,.07);border:1px solid rgba(255,145,0,.3);border-radius:var(--r);padding:10px 14px;margin-top:10px">
              <div style="font-size:10px;font-family:var(--fh);color:var(--orange);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">
                <i class="ar-icon warning"></i> Observaciones internas — Uso exclusivo del equipo técnico · No se imprime
              </div>
              <div style="font-size:13px;color:var(--text)">
                ${o.obs}
              </div>
            </div>
          `
    : "";

  document.getElementById("exp-info").innerHTML += obsBlock;

  // Bitácora del servicio
  const bitBlock = document.getElementById("exp-bitacora");

  if (bitBlock) {
    const bits = (o.bitacora || []).slice().reverse();

    bitBlock.innerHTML = bits.length
      ? bits
          .map(
            (b) => `
                  <div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:11px">

                    <div style="display:flex;justify-content:space-between;align-items:center">

                      <span style="color:var(--accent2);font-weight:600">
                        <i class="ar-icon usuario"></i> ${b.usuario}
                      </span>

                      <span style="color:var(--text3);font-size:10px">
                        <i class="ar-icon reloj"></i> ${b.fecha}
                      </span>

                    </div>

                    <div style="color:var(--text2);margin-top:2px">

                      ${b.accion}

                      ${
                        b.detalle
                          ? ' — <span style="color:var(--text)">' +
                            b.detalle +
                            "</span>"
                          : ""
                      }

                    </div>

                    ${
                      typeof b.visible_cliente !== "undefined"
                        ? `
                        <div style="
                          margin-top:4px;
                          font-size:10px;
                          color:var(--text3);
                        ">
                          ${
                            b.visible_cliente
                              ? '<i class="ar-icon eye"></i> Visible para cliente'
                              : '<i class="ar-icon lock"></i> Interno'
                          }
                        </div>
                      `
                        : ""
                    }

                  </div>
                `,
          )
          .join("")
      : '<div style="color:var(--text3);font-size:11px;padding:8px 0">Sin actividad registrada</div>';
  }

  document.getElementById("exp-est").value = o.estado;
  if (soloLectura) {
    document.getElementById("exp-est").disabled = true;
  }
  // Cargar informe final guardado
  const diagEditEl = document.getElementById("exp-diag");
  if (diagEditEl) diagEditEl.value = o.diagnostico || "";
  document.getElementById("exp-wa").innerHTML = wa
    ? `<a
                  href="${wa}"
                  target="_blank"
                  class="btn bw"
                  style="width:100%;display:flex;justify-content:center">

                 <i class="ar-icon whatsapp"></i> WhatsApp al cliente

                </a>`
    : `<button
                  class="btn bg"
                  style="width:100%"
                  disabled>

                  <i class="ar-icon warning"></i> Cliente sin teléfono válido

                </button>`;
  window.initIcons();

  if (soloLectura) {
    document
      .querySelectorAll("#m-exp input, #m-exp textarea, #m-exp select")
      .forEach((el) => (el.disabled = true));
  }

  if (soloLectura) {
    document
      .getElementById("expTrabajoTecnico")
      ?.style.setProperty("display", "none");
  }

  if (soloLectura) {
    document
      .querySelector('button[onclick="saveExpDiag()"]')
      ?.style.setProperty("display", "none");
  }

  document.querySelectorAll("#m-exp button").forEach((btn) => {
    if (btn.onclick?.toString().includes("prtTalon")) {
      btn.style.display = "none";
    }
  });

  if (soloLectura) {
    document
      .querySelector('button[onclick="prtDesgloseFactura()"]')
      ?.style.setProperty("display", "none");
  }

  openM("m-exp");
  setTimeout(() => {
    cargarFotosExpediente(id);
    cargarRecordatorio(id);
  }, 300);
}

function abrirTicketDesdeOrden(id) {
  closeM("m-exp");
  openTicket(id);
}

async function saveExp() {
  const id = document.getElementById("exp-id").value;
  const est = document.getElementById("exp-est").value;
  const nota = document.getElementById("exp-nota").value;

  const visibleCliente = document.getElementById("exp-visible-cliente").checked;
  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === id);
  if (i < 0) return;
  ords[i].estado = est;
  ords[i].historial = ords[i].historial || [];
  ords[i].historial.push({
    estado: est,

    fecha: hoy(),

    nota,

    visible_cliente: visibleCliente,
  });
  if (["Entregado", "Entregado (garantía)"].includes(est))
    ords[i].fecha_entrega = hoy();
  DB.set("ordenes", ords);
  const updateData = {
    estado: est,
    historial: ords[i].historial,
  };

  if (ords[i].fecha_entrega !== undefined) {
    updateData.fecha_entrega = ords[i].fecha_entrega;
  }

  await DATA.update("ordenes", id, updateData);
  bitacora(id, "Estado actualizado", est + (nota ? " — " + nota : ""));
  console.log("SINCRONIZAR TICKET:", ords[i].ticket_id);
  const comentarioArabot = {
    id: "TC-" + Date.now(),

    ticket_id: ords[i].ticket_id,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: "ARABOT",
    autor_tipo: "ARABOT",

    comentario: "🔧 Orden " + id + " actualizada a estado: " + est,

    visible_cliente: visibleCliente,

    notificar_cliente: false,
  };

  if (ords[i].ticket_id) {
    await DATA.save("ticketcomentarios", comentarioArabot.id, comentarioArabot);
  }

  console.log("TICKET RELACIONADO:", ords[i].ticket_id, ords[i].folio);

  // Notificar al cliente por correo
  const _cli = DB.get("clientes").find((c) => c.id === ords[i].cliente_id);
  console.log("CORREO ESTADO ENVIADO:", ords[i].ticket_id);
  if (_cli?.email) {
    await FB.callFunction("notificarCambioEstadoOrden", {
      correo: _cli.email,
      nombre: _cli.nombre,
      equipo: ords[i].tipo_equipo,
      modelo: ords[i].modelo,
      estado: est,
      folio: id,
    });

    if (ords[i].ticket_id) {
      const comentarioArabot = {
        id: "TC-" + (Date.now() + 100),

        ticket_id: ords[i].ticket_id,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: "ARABOT",
        autor_tipo: "ARABOT",

        comentario: "📧 Correo enviado al cliente por cambio de estado: " + est,

        visible_cliente: false,

        notificar_cliente: false,
      };

      await DATA.save(
        "ticketcomentarios",
        comentarioArabot.id,
        comentarioArabot,
      );
    }

    document.getElementById("exp-nota").value = "";
    openExp(id);
    rndOrd();
    updBadges();
    notify("Avance guardado: " + est);
  }
}
async function saveExpObs() {
  const id = document.getElementById("exp-id").value;
  const obs = document.getElementById("exp-obs-edit").value;
  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === id);
  if (i < 0) return;
  ords[i].obs = obs;
  DB.set("ordenes", ords);
  await DATA.update("ordenes", id, { obs });
  // Re-render obs block
  const obsBlock = obs
    ? `<div style="background:rgba(255,145,0,.07);border:1px solid rgba(255,145,0,.3);border-radius:var(--r);padding:10px 14px;margin-top:10px"><div style="font-size:10px;font-family:var(--fh);color:var(--orange);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">⚠️ Observaciones internas — Uso exclusivo del equipo técnico · No se imprime</div><div style="font-size:13px;color:var(--text)">${obs}</div></div>`
    : "";
  notify("Observaciones guardadas ✅");
}

async function saveExpDiag() {
  const id = document.getElementById("exp-id").value;
  const diag = document.getElementById("exp-diag").value.trim();
  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === id);
  if (i < 0) return;
  ords[i].diagnostico = diag;
  DB.set("ordenes", ords);
  await DATA.update("ordenes", id, {
    diagnostico: diag,
  });
  notify("Informe final guardado ✅");
}
function prtOrdExp(fm = "carta") {
  const id = document.getElementById("exp-id").value;
  if (id) prtOrd(id, fm);
}

function prtEtiquetaExp() {
  const id = document.getElementById("exp-id").value;

  if (!id) return;

  prtEtiqueta(id);
}

let EOservices = [];
function openEditOrd(id) {
  const o = DB.get("ordenes").find((x) => x.id === id);
  if (!o) return;
  document.getElementById("edit-ord-id").value = id;
  EOservices = (o.servicios || []).map((s) => ({ ...s }));
  renderEditOrdBody(o);
  openM("m-edit-ord");
}
function renderEditOrdBody(o) {
  const id = o ? o.id : document.getElementById("edit-ord-id").value;
  const ord = o || DB.get("ordenes").find((x) => x.id === id);
  const cat = DB.get("cat");
  const usuarios = DB.get("usuarios") || [];
  const catOpts = cat
    .map(
      (s, i) =>
        `<option value="${i}">${s.nombre}${s.precio > 0 ? " — $" + s.precio.toFixed(2) : " — Gratis"}</option>`,
    )
    .join("");
  const svcsHtml = EOservices.map(
    (s, i) => `
    <div style="display:grid;grid-template-columns:1fr 120px 34px;gap:7px;margin-bottom:5px;align-items:center">
      <span style="font-size:12px">${s.svc || s.servicio || s.nombre || "—"}</span>
      <input type="number" value="${s.precio || 0}" id="eo-p-${i}" style="font-size:12px;text-align:right" oninput="recalcEditOrd()">
      <button class="btn bd bsm" onclick="delEOsvc(${i})"><i class="ar-icon close"></i></button>
    </div>`,
  ).join("");
  const sub = EOservices.reduce((a, s) => a + (s.precio || 0), 0);
  const tot = sub;
  document.getElementById("edit-ord-body").innerHTML = `
    <div class="fr c2">
      <div class="fi"><label class="fl">Técnico asignado</label>
        <select id="eo-tec">
          <option value="">-- Seleccionar técnico --</option>
          ${usuarios
            .map(
              (u) =>
                `<option value="${u.nombre}" ${
                  ord.tecnico === u.nombre ? "selected" : ""
                }>${u.nombre}${
                  u.rol === "admin"
                    ? " (Admin)"
                    : u.rol === "tecnico"
                      ? " (Técnico)"
                      : " (Recepción)"
                }</option>`,
            )
            .join("")}
        </select>
      </div>
      <div class="fi"><label class="fl">Fecha probable entrega</label><input type="date" id="eo-fp" value="${ord.fecha_prom || ""}"></div>
      
    <div class="fr c3">

      <div class="fi">
        <label class="fl">Modelo / Marca</label>
        <input
          type="text"
          id="eo-mod"
          value="${ord.modelo || ""}">
      </div>

      <div class="fi">
        <label class="fl">No. Serie</label>
        <input
          type="text"
          id="eo-ser"
          value="${ord.serie || ""}">
      </div>

      <div class="fi">
        <label class="fl">PIN / Contraseña</label>
        <input
          type="text"
          id="eo-pin"
          value="${ord.pin || ""}">
        </div>

    </div>
    </div>
    <div class="fr"><div class="fi"><label class="fl">Problema reportado</label><textarea id="eo-prob">${ord.problema || ""}</textarea></div></div>
    <div class="fr"><div class="fi"><label class="fl">Accesorios</label><input type="text" id="eo-acc" value="${ord.accesorios || ""}"></div></div>
    <hr style="border-color:var(--border);margin:10px 0">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-family:var(--fh);color:var(--accent)">SERVICIOS DE LA ORDEN</div>
      <div style="display:flex;gap:7px;align-items:center">
        <select id="eo-new-svc" style="font-size:12px;width:240px">
          <option value="">+ Agregar servicio del catálogo…</option>${catOpts}
        </select>
        <button class="btn bs bsm" onclick="addEOsvc()">Agregar</button>
      </div>
    </div>
    <div id="eo-svcs-list">${svcsHtml}</div>
   <div style="margin-top:8px;display:flex;justify-content:flex-end">

        <span
            style="font-family:var(--fh);font-size:16px;color:var(--green)">

            Total:

            <span id="eo-tot-display">

                ${mxn(tot)}

            </span>

        </span>

    </div>
  `;
}
function addEOsvc() {
  const sel = document.getElementById("eo-new-svc");
  const idx = parseInt(sel.value);
  if (isNaN(idx) || idx < 0) return;
  const cat = DB.get("cat");
  const sv = cat[idx];
  EOservices.push({
    svc: sv.nombre,
    servicio: sv.nombre,
    precio: sv.precio || 0,
  });
  sel.value = "";
  const id = document.getElementById("edit-ord-id").value;
  const ord = DB.get("ordenes").find((x) => x.id === id);
  renderEditOrdBody(ord);
}
function delEOsvc(i) {
  EOservices.splice(i, 1);
  const id = document.getElementById("edit-ord-id").value;
  const ord = DB.get("ordenes").find((x) => x.id === id);
  renderEditOrdBody(ord);
}
function recalcEditOrd() {
  EOservices.forEach((s, i) => {
    const el = document.getElementById("eo-p-" + i);

    if (el) {
      s.precio = parseFloat(el.value) || 0;
    }
  });

  const total = EOservices.reduce((a, s) => a + (s.precio || 0), 0);

  const display = document.getElementById("eo-tot-display");

  if (display) {
    display.textContent = mxn(total);
  }
}

async function saveEditOrd() {
  const id = document.getElementById("edit-ord-id").value;
  const ords = DB.get("ordenes");
  const i = ords.findIndex((o) => o.id === id);
  if (i < 0) return;
  const o = ords[i];
  // Update prices from inputs before saving
  EOservices.forEach((s, si) => {
    const el = document.getElementById("eo-p-" + si);
    if (el) s.precio = parseFloat(el.value) || 0;
  });
  o.servicios = EOservices.map((s) => ({ ...s }));
  o.fecha_prom = document.getElementById("eo-fp").value;
  o.modelo = document.getElementById("eo-mod").value;
  o.serie = document.getElementById("eo-ser").value;
  o.pin = document.getElementById("eo-pin").value.trim();
  o.problema = document.getElementById("eo-prob").value;
  o.accesorios = document.getElementById("eo-acc").value;
  o.tecnico = document.getElementById("eo-tec")?.value || "";
  o.subtotal = o.servicios.reduce((a, s) => a + (s.precio || 0), 0);

  o.total = o.subtotal;

  // Registrar edición sin duplicar el estado
  o.historial = o.historial || [];
  o.historial.push({
    fecha: hoy(),
    nota: "✏️ Orden editada — Total actualizado: " + mxn(o.total),
  });

  DB.set("ordenes", ords);
  await DATA.update("ordenes", id, ords[i]);
  await generarGarantiasOrden(o);
  closeM("m-edit-ord");
  rndOrd();
  dash();
  notify("Orden actualizada ✅");
}

window.openExp = openExp;
window.abrirTicketDesdeOrden = abrirTicketDesdeOrden;

window.saveExpObs = saveExpObs;
window.saveExpDiag = saveExpDiag;

window.prtOrdExp = prtOrdExp;
window.prtEtiquetaExp = prtEtiquetaExp;

window.openEditOrd = openEditOrd;
window.renderEditOrdBody = renderEditOrdBody;

window.addEOsvc = addEOsvc;
window.delEOsvc = delEOsvc;
window.recalcEditOrd = recalcEditOrd;

window.saveEditOrd = saveEditOrd;
