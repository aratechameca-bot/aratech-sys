// ============================================================
// MESA DE AYUDA
// ============================================================

function renderOrdenRelacionada(ticket) {
  const ordenInfo = document.getElementById("tkexp-orden-info");

  if (!ordenInfo) return;

  if (!ticket?.orden_id) {
    ordenInfo.style.display = "none";
    ordenInfo.innerHTML = "";
    return;
  }

  const ord = (DB.get("ordenes") || []).find((o) => o.id === ticket.orden_id);

  if (!ord) {
    ordenInfo.style.display = "none";
    ordenInfo.innerHTML = "";
    return;
  }

  let estadoColor = "#3b82f6";

  if (["Recibido", "Diagnóstico"].includes(ord.estado)) {
    estadoColor = "#3b82f6";
  } else if (["En proceso", "Reingreso por garantía"].includes(ord.estado)) {
    estadoColor = "#8b5cf6";
  } else if (
    ["Esperando refacción", "Equipo en taller especializado"].includes(
      ord.estado,
    )
  ) {
    estadoColor = "#f59e0b";
  } else if (
    ["Listo para entrega", "Entregado", "Entregado (garantía)"].includes(
      ord.estado,
    )
  ) {
    estadoColor = "#22c55e";
  } else if (["Cancelado", "No reparado"].includes(ord.estado)) {
    estadoColor = "#ef4444";
  }

  ordenInfo.style.display = "block";

  ordenInfo.innerHTML = `
    <div
      class="card"
      style="
        padding:8px;
        margin-top:6px;
        font-size:12px;
        background:rgba(255,255,255,.03);
      ">

      <div style="
        color:var(--accent);
        font-weight:700;
      ">
        <i class="ar-icon herramientas"></i> ${ord.folio}
      </div>

      <div style="
        font-size:12px;
        margin-top:4px;
      ">

        Estado:

        <span
          style="
            color:${estadoColor};
            font-weight:700;
          ">

          <i class="ar-icon info"></i> ${ord.estado || "Sin estado"}

        </span>

      </div>

      <div style="
        font-size:12px;
        color:var(--text2);
      ">
        Equipo:
        ${ord.tipo_equipo || ""}
        ${ord.modelo || ""}
      </div>

      <div style="
        font-size:12px;
        color:var(--text2);
      ">
        Técnico:
        ${ord.tecnico || "Sin asignar"}
      </div>

      <div style="
        font-size:12px;
        color:var(--text2);
      ">
        Fecha:
        ${fmt(ord.fecha)}
      </div>

    </div>
  `;
  window.refreshIcons(ordenInfo);
}

function openTicket(id) {
  const t = DB.get("tickets").find((x) => x.id === id);

  if (!t) return;

  document.getElementById("tkexp-id").value = t.id;

  document.getElementById("tkexp-id").dataset.estadoOriginal = t.estado || "";

  document.getElementById("tkexp-id").dataset.respOriginal =
    t.responsable || "";

  document.getElementById("tkexp-folio").value = t.folio;
  document.getElementById("tkexp-cliente").value = t.cliente_nombre || "";
  document.getElementById("tkexp-capturo").value = t.capturado_por || "Sistema";

  document.getElementById("tkexp-estado").value = t.estado || "Nuevo";
  document.getElementById("tkexp-prioridad").value = t.prioridad || "Media";

  const respSel = document.getElementById("tkexp-resp");

  respSel.innerHTML = '<option value="">Sin asignar</option>';

  const usuarios = DB.get("usuarios") || [];

  usuarios.forEach((u) => {
    const o = document.createElement("option");

    o.value = u.nombre;

    o.textContent = u.nombre;

    respSel.appendChild(o);
  });

  respSel.value = t.responsable || "";

  document.getElementById("tkexp-asunto").value = t.asunto || "";
  document.getElementById("tkexp-desc").value = t.descripcion || "";
  document.getElementById("tkexp-orden-folio").value = t.orden_folio || "";
  document.getElementById("tkexp-orden-id").value = t.orden_id || "";
  let ventasRel = [];

  if (t.venta_id) {
    const ventaDirecta = (DB.get("ventas") || []).find(
      (v) => v.id === t.venta_id,
    );

    if (ventaDirecta) ventasRel.push(ventaDirecta);
  }

  if (!ventasRel.length && t.orden_folio) {
    ventasRel = (DB.get("ventas") || []).filter(
      (v) => v.orden_rel === t.orden_folio,
    );
  }

  let garantiasRel = [];

  if (t.garantia_id) {
    const gar = (DB.get("garantias") || []).find((g) => g.id === t.garantia_id);

    if (gar) {
      garantiasRel.push(gar);
    }
  }

  if (t.orden_folio) {
    garantiasRel.push(
      ...(DB.get("garantias") || []).filter(
        (g) => g.folio_ord === t.orden_folio,
      ),
    );
  }

  if (t.venta_folio) {
    garantiasRel.push(
      ...(DB.get("garantias") || []).filter(
        (g) => g.folio_vta === t.venta_folio,
      ),
    );
  }

  const ordenInfo = document.getElementById("tkexp-orden-info");

  const ventaInfo = document.getElementById("tkexp-venta-info");

  if (ventaInfo) {
    ventaInfo.innerHTML = ventasRel.length
      ? ventasRel
          .map(
            (v) => `

                        <div
                          class="card"
                          style="
                            padding:8px;
                            margin-top:6px;
                            font-size:12px;
                            background:rgba(255,255,255,.03);
                          ">

                          <div style="
                            color:var(--green);
                            font-weight:700;
                          ">
                            <i class="ar-icon formato"></i> ${v.folio}
                          </div>

                          <div style="
                            font-size:12px;
                            color:var(--text2);
                            margin-top:4px;
                          ">
                            Fecha: ${fmt(v.fecha)}
                          </div>

                          <div style="
                            font-size:12px;
                            color:var(--text2);
                          ">
                            Pago: ${v.pago || "—"}
                          </div>

                          <div style="
                            font-size:12px;
                            color:var(--green);
                            font-weight:700;
                            margin-top:4px;
                          ">
                            ${mxn(v.total)}
                          </div>

                        </div>

                      `,
          )
          .join("")
      : `

                        <div
                          class="card"
                          style="
                            padding:12px;
                            text-align:center;
                            color:var(--text2);
                          ">

                          Sin venta relacionada

                        </div>

                      `;
    window.refreshIcons(document.getElementById("m-ticket-exp"));
  }

  const garInfo = document.getElementById("tkexp-gar-info");

  if (garInfo) {
    garInfo.innerHTML = garantiasRel.length
      ? garantiasRel
          .map((g) => {
            const dias = g.fecha_gar ? diasE(hoy(), g.fecha_gar) : 0;

            return `

                            <div
                              class="card"
                              style="
                                padding:8px;
                                margin-top:6px;
                                font-size:12px;
                                background:rgba(255,255,255,.03);
                              ">

                              <div style="
                                color:#75d0fa;
                                font-weight:700;
                              ">
                                <i class="ar-icon garantia"></i> ${g.folio}
                              </div>

                              <div style="
                                font-size:12px;
                                color:var(--text2);
                                margin-top:4px;
                              ">
                                Inicio:
                                ${fmt(g.fecha)}
                              </div>

                              <div style="
                                font-size:12px;
                                color:var(--text2);
                              ">
                                Vence:
                                ${fmt(g.fecha_gar)}
                              </div>

                              <div style="
                                font-size:12px;
                                font-weight:700;
                                color:${
                                  dias < 0
                                    ? "#ff6b6b"
                                    : dias <= 7
                                      ? "#ffd600"
                                      : "#00e676"
                                };
                                margin-top:4px;
                              ">
                                ${
                                  dias < 0
                                    ? "Vencida"
                                    : dias + " días restantes"
                                }
                              </div>

                            </div>

                          `;
          })
          .join("")
      : `

                        <div
                          class="card"
                          style="
                            padding:12px;
                            text-align:center;
                            color:var(--text2);
                          ">

                          Sin garantías relacionadas

                        </div>

                      `;
    window.refreshIcons(document.getElementById("m-ticket-exp"));
  }

  renderOrdenRelacionada(t);

  document.getElementById("tkexp-desc").readOnly = true;
  document.getElementById("tkexp-desc").style.cursor = "default";

  document.getElementById("tkexp-titulo").innerHTML =
    '<i class="ar-icon tickets"></i> ' + t.folio;
  window.refreshIcons(document.getElementById("m-ticket-exp"));

  renderTicketComments(id);

  renderTicketFiles(id);

  openM("m-ticket-exp");
}

async function saveTicketExp() {
  const id = document.getElementById("tkexp-id").value;
  const estadoAnterior =
    document.getElementById("tkexp-id").dataset.estadoOriginal || "";

  const respAnterior =
    document.getElementById("tkexp-id").dataset.respOriginal || "";

  const estadosCierre = [
    "Resuelto",
    "Cerrado",
    "Cancelado",
    "Cerrado por error",
  ];

  const estadoNuevo = document.getElementById("tkexp-estado").value;

  const fechaCierre = estadosCierre.includes(estadoNuevo) ? hoy() : "";

  await DATA.update("tickets", id, {
    estado: document.getElementById("tkexp-estado").value,

    prioridad: document.getElementById("tkexp-prioridad").value,

    responsable: document.getElementById("tkexp-resp").value,

    asunto: document.getElementById("tkexp-asunto").value,

    orden_id: document.getElementById("tkexp-orden-id").value,

    orden_folio: document.getElementById("tkexp-orden-folio").value,

    fecha_ultima_actualizacion: hoy(),

    fecha_cierre: fechaCierre,
  });

  const ordenId = document.getElementById("tkexp-orden-id").value;

  if (ordenId) {
    await DATA.update("ordenes", ordenId, {
      ticket_id: id,
    });
  }

  const respNuevo = document.getElementById("tkexp-resp").value;

  if (estadoAnterior !== estadoNuevo) {
    const comentarioSistema = {
      id: "TC-" + Date.now(),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario:
        "Estado: " + (estadoAnterior || "Sin estado") + " → " + estadoNuevo,

      visible_cliente: false,

      notificar_cliente: false,
    };

    await DATA.save(
      "ticketcomentarios",
      comentarioSistema.id,
      comentarioSistema,
    );
  }

  const estabaCerrado = estadosCierre.includes(estadoAnterior);

  const ahoraCerrado = estadosCierre.includes(estadoNuevo);

  if (!estabaCerrado && ahoraCerrado) {
    const comentarioSistema = {
      id: "TC-" + (Date.now() + 2),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario: "🎯 Ticket cerrado (" + estadoNuevo + ")",

      visible_cliente: false,

      notificar_cliente: false,
    };

    await DATA.save(
      "ticketcomentarios",
      comentarioSistema.id,
      comentarioSistema,
    );
  }

  if (estadoAnterior !== estadoNuevo && ahoraCerrado) {
    const ticket = (DB.get("tickets") || []).find((t) => t.id === id);

    const cliente = (DB.get("clientes") || []).find(
      (c) => c.id === ticket?.cliente_id,
    );

    if (cliente?.email) {
      const envio = await FB.callFunction("notificarEstadoTicket", {
        correo: cliente.email,
        cliente: cliente.nombre,
        folio: ticket.folio,
        estado: estadoNuevo,
      });

      if (envio?.ok) {
        const comentarioArabot = {
          id: "TC-" + (Date.now() + 50),

          ticket_id: id,

          fecha: hoy(),

          fecha_hora: new Date().toISOString(),

          autor: "ARABOT",
          autor_tipo: "ARABOT",

          comentario: "📧 Correo enviado por cambio de estado",

          visible_cliente: false,

          notificar_cliente: false,
        };

        await DATA.save(
          "ticketcomentarios",
          comentarioArabot.id,
          comentarioArabot,
        );
      }
    }
  }

  if (estabaCerrado && !ahoraCerrado) {
    const comentarioSistema = {
      id: "TC-" + (Date.now() + 3),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario: "🔄 Ticket reabierto (" + estadoNuevo + ")",

      visible_cliente: false,

      notificar_cliente: false,
    };

    await DATA.save(
      "ticketcomentarios",
      comentarioSistema.id,
      comentarioSistema,
    );
  }

  if (respAnterior !== respNuevo) {
    const comentarioSistema = {
      id: "TC-" + (Date.now() + 1),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario:
        "Responsable: " +
        (respAnterior || "Sin asignar") +
        " → " +
        (respNuevo || "Sin asignar"),

      visible_cliente: false,

      notificar_cliente: false,
    };

    await DATA.save(
      "ticketcomentarios",
      comentarioSistema.id,
      comentarioSistema,
    );
  }

  rndTickets();

  renderTicketComments(id);

  closeM("m-ticket-exp");

  limpTicket();

  notify("✅ Ticket actualizado");
}

function limpTicket() {
  const cli = document.getElementById("tk-cli");
  if (cli) cli.value = "";

  const asunto = document.getElementById("tk-asunto");
  if (asunto) asunto.value = "";

  const desc = document.getElementById("tk-desc");
  if (desc) desc.value = "";

  const prioridad = document.getElementById("tk-prioridad");
  if (prioridad) prioridad.selectedIndex = 0;

  const resp = document.getElementById("tk-resp");
  if (resp) resp.value = "";

  const origen = document.getElementById("tk-origen");
  if (origen) origen.selectedIndex = 0;

  const visible = document.getElementById("tk-visible");
  if (visible) visible.checked = true;

  const notificar = document.getElementById("tk-notificar");
  if (notificar) notificar.checked = false;
}

function vincularOrdenTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) return;

  const ordenes = (DB.get("ordenes") || [])
    .filter((o) => o.cliente_id === ticket.cliente_id)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (!ordenes.length) {
    ARABOT.alert({
      title: "Sin órdenes",

      message: "Este cliente no tiene órdenes registradas.",

      details: "No existen Órdenes de Servicio disponibles para vincular.",
    });

    return;
  }

  const cont = document.getElementById("tkord-lista");

  cont.innerHTML = ordenes
    .map(
      (o) => `

      <div
        class="card"
        style="
          margin-bottom:10px;
          cursor:pointer;
          padding:12px;
        "
        onclick="
          seleccionarOrdenTicket(
            '${o.id}',
            '${o.folio}'
          )
        ">

        <div
          style="
            font-weight:700;
            margin-bottom:4px;
          ">

          ${o.folio}

        </div>

        <div
          style="
            font-size:12px;
            color:var(--text2);
          ">

          ${o.tipo_equipo || ""}
          ${o.modelo || ""}

        </div>

        <div
          style="
            font-size:11px;
            color:var(--text2);
            margin-top:4px;
          ">

          Estado:
          ${o.estado || "Sin estado"}

        </div>

      </div>

    `,
    )
    .join("");

  openM("m-ticket-orden");
}

function vincularVentaTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) return;

  const ventas = (DB.get("ventas") || [])
    .filter((v) => v.cliente_id === ticket.cliente_id)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (!ventas.length) {
    ARABOT.alert({
      title: "Sin ventas",

      message: "Este cliente no tiene ventas registradas.",

      details: "No existen ventas disponibles para vincular.",
    });

    return;
  }

  const cont = document.getElementById("tkvta-lista");

  cont.innerHTML = ventas
    .map(
      (v) => `

                  <div
                    class="card"
                    style="
                      margin-bottom:10px;
                      cursor:pointer;
                      padding:12px;
                    "
                    onclick="
                      seleccionarVentaTicket(
                        '${v.id}',
                        '${v.folio}'
                      )
                    ">

                    <div
                      style="
                        font-weight:700;
                        margin-bottom:4px;
                      ">

                      ${v.folio}

                    </div>

                    <div
                      style="
                        font-size:12px;
                        color:var(--green);
                      ">

                      ${mxn(v.total)}

                    </div>

                    <div
                      style="
                        font-size:11px;
                        color:var(--text2);
                        margin-top:4px;
                      ">

                      ${fmt(v.fecha)}

                    </div>

                  </div>

                `,
    )
    .join("");

  openM("m-ticket-venta");
}

async function seleccionarVentaTicket(id, folio) {
  const venta = (DB.get("ventas") || []).find((v) => v.id === id);

  if (!venta) return;

  const tickets = DB.get("tickets") || [];

  const idx = tickets.findIndex(
    (t) => t.id === document.getElementById("tkexp-id").value,
  );

  if (idx >= 0) {
    tickets[idx].venta_id = venta.id;

    tickets[idx].venta_folio = venta.folio;

    tickets[idx].venta_generada = true;

    DB.set("tickets", tickets);

    await DATA.update("tickets", tickets[idx].id, {
      venta_id: venta.id,
      venta_folio: venta.folio,
      venta_generada: true,
    });
  }

  const ventaInfo = document.getElementById("tkexp-venta-info");

  ventaInfo.innerHTML = `

                <div
                  class="card"
                  style="
                    padding:8px;
                    margin-top:6px;
                    font-size:12px;
                    background:rgba(255,255,255,.03);
                  ">

                  <div style="
                    color:var(--green);
                    font-weight:700;
                  ">
                    <i class="ar-icon formato"></i> ${venta.folio}
                  </div>

                  <div style="
                    font-size:12px;
                    color:var(--text2);
                    margin-top:4px;
                  ">
                    Fecha: ${fmt(venta.fecha)}
                  </div>

                  <div style="
                    font-size:12px;
                    color:var(--text2);
                  ">
                    Pago: ${venta.pago || "—"}
                  </div>

                  <div style="
                    font-size:12px;
                    color:var(--green);
                    font-weight:700;
                    margin-top:4px;
                  ">
                    ${mxn(venta.total)}
                  </div>

                </div>

              `;
  window.refreshIcons(ventaInfo);

  closeM("m-ticket-venta");

  notify("🧾 Venta seleccionada: " + folio);
}

function crearOrdenDesdeTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) {
    ARABOT.error({
      title: "Ticket no encontrado",

      message: "No fue posible localizar el ticket.",

      details: "Es posible que haya sido eliminado o ya no esté disponible.",
    });

    return;
  }

  if (ticket.orden_id) {
    ARABOT.warning({
      title: "Orden ya vinculada",

      message: "Este ticket ya tiene una Orden de Servicio relacionada.",

      details:
        "Orden actual: " +
        ticket.orden_folio +
        "<br><br>" +
        "Solo se permite una Orden de Servicio por ticket." +
        "<br><br>" +
        "Si necesitas generar un nuevo servicio, crea un nuevo ticket o desvincula primero la orden existente.",
    });

    return;
  }

  window.ticketOrigenId = ticket.id;

  closeM("m-ticket-exp");

  openM("m-orden");

  setTimeout(() => {
    document.getElementById("ord-cli").value = ticket.cliente_id || "";

    autoTel();

    document.getElementById("ord-prob").value = ticket.descripcion || "";

    if (ticket.responsable) {
      document.getElementById("ord-tec").value = ticket.responsable;
    }
  }, 200);
}

function crearVentaDesdeTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) {
    ARABOT.error({
      title: "Ticket no encontrado",

      message: "No fue posible localizar el ticket.",

      details: "Es posible que haya sido eliminado o ya no esté disponible.",
    });

    return;
  }

  window.ticketVentaOrigenId = ticket.id;
  window.ticketVentaOrigenFolio = ticket.folio;

  closeM("m-ticket-exp");

  openM("m-venta");

  setTimeout(() => {
    const cli = document.getElementById("vta-cli");

    if (cli) {
      cli.value = ticket.cliente_id || "";

      if (typeof fillOrdVtas === "function") {
        fillOrdVtas();
      }
    }
  }, 200);
}

function abrirOrdenTicket() {
  const ordenId = document.getElementById("tkexp-orden-id").value;

  if (!ordenId) {
    ARABOT.warning({
      title: "Sin Orden de Servicio",

      message: "Este ticket no tiene una Orden de Servicio relacionada.",

      details:
        "Primero crea o vincula una Orden de Servicio para poder abrirla.",
    });

    return;
  }

  closeM("m-ticket-exp");

  openExp(ordenId);
}

async function seleccionarOrdenTicket(id, folio) {
  const orden = (DB.get("ordenes") || []).find((o) => o.id === id);

  if (!orden) return;

  const tickets = DB.get("tickets") || [];

  const idx = tickets.findIndex(
    (t) => t.id === document.getElementById("tkexp-id").value,
  );

  if (idx >= 0) {
    tickets[idx].orden_id = orden.id;

    tickets[idx].orden_folio = orden.folio;

    DB.set("tickets", tickets);

    await DATA.update("tickets", tickets[idx].id, {
      orden_id: orden.id,
      orden_folio: orden.folio,
    });

    renderOrdenRelacionada(tickets[idx]);
  }

  document.getElementById("tkexp-orden-id").value = orden.id;

  document.getElementById("tkexp-orden-folio").value = orden.folio;

  const ordenInfo = document.getElementById("tkexp-orden-info");

  if (ordenInfo) {
    ordenInfo.innerHTML = `
      <div class="card" style="padding:8px;margin-top:6px;font-size:12px;background:rgba(255,255,255,.03);">
        <div style="color:var(--accent);font-weight:700;">
          <i class="ar-icon herramientas"></i> ${orden.folio}
        </div>

        <div style="font-size:12px;color:var(--text2);margin-top:4px;">
          ${orden.tipo_equipo || ""} ${orden.modelo || ""}
        </div>

        <div style="font-size:12px;color:var(--text2);">
          Estado: ${orden.estado || "Sin estado"}
        </div>
      </div>
    `;
  }
  window.refreshIcons(ordenInfo);
  closeM("m-ticket-orden");

  notify("🔗 Orden vinculada: " + folio);
}

function rndTickets() {
  const tb = document.getElementById("tb-ticket");
  if (!tb) return;

  const tickets = DB.get("tickets") || [];

  if (!tickets.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="10" class="nd">Sin tickets</td>
      </tr>
    `;
    return;
  }

  tb.innerHTML = tickets
    .slice()
    .reverse()
    .map(
      (t) => `
    <tr>
      <td style="font-family:var(--fh);color:var(--accent)">
        ${t.folio}

        ${
          t.orden_folio
            ? `<br><span style="font-size:10px;color:var(--accent2)"><i class="ar-icon herramientas"></i> ${t.orden_folio}</span>`
            : ""
        }
      </td>

      <td>${fmt(t.fecha)}</td>

      <td>${escHTML(t.cliente_nombre || "—")}</td>

      <td>${t.capturado_por || "—"}</td>

      <td>${escHTML(t.asunto || "—")}</td>

      <td>
        <span class="tag ${
          t.prioridad === "Urgente"
            ? "tr"
            : t.prioridad === "Alta"
              ? "to"
              : t.prioridad === "Media"
                ? "tb"
                : "tg"
        }">
          ${t.prioridad || "Media"}
        </span>
      </td>

      <td>
        <span class="tag ${
          t.estado === "Nuevo"
            ? "tb"
            : t.estado === "Asignado"
              ? "to"
              : t.estado === "En proceso"
                ? "to"
                : t.estado === "Esperando cliente"
                  ? "ty"
                  : t.estado === "Esperando refacción"
                    ? "ty"
                    : t.estado === "Resuelto"
                      ? "tg"
                      : t.estado === "Cerrado"
                        ? "tg"
                        : t.estado === "Cancelado"
                          ? "tr"
                          : t.estado === "Cerrado por error"
                            ? "tr"
                            : "tb"
        }">
          ${t.estado || "Nuevo"}
        </span>
      </td>
      
      <td>${t.responsable || "—"}</td>

      <td>${fmt(t.fecha_ultima_actualizacion)}</td>

      <td>
        ${
          t.fecha_cierre
            ? `<i class="ar-icon lock"></i> ${fmt(t.fecha_cierre)}`
            : `<i class="ar-icon success"></i> Abierto`
        }
      </td>

      <td class="bg-btn">

    <div class="bg-btn-wrap">

        <button
            class="btn bg bsm btn-acciones"
            data-id="${t.id}"
            onclick="toggleAcciones(this)"
            title="Acciones">
            <i class="ar-icon menu"></i>
        </button>

    </div>

    <div class="acciones-card">

        <button
            class="btn bg bsm"
            onclick="openTicket('${t.id}')"
            title="Ver ticket">
            <i class="ar-icon archivo"></i> Ver ticket
        </button>

    </div>

</td>
    </tr>
  `,
    )
    .join("");
  window.refreshIcons(tb);
}

async function saveTicket() {
  const clienteId = document.getElementById("tk-cli").value;
  const asunto = document.getElementById("tk-asunto").value.trim();
  const descripcion = document.getElementById("tk-desc").value.trim();

  if (!clienteId) {
    ARABOT.alert({
      title: "Cliente requerido",

      message: "Selecciona un cliente.",

      details: "Debes seleccionar un cliente antes de crear el ticket.",
    });

    return;
  }

  if (!asunto) {
    ARABOT.alert({
      title: "Asunto requerido",

      message: "Ingresa un asunto.",

      details: "El asunto es obligatorio para registrar el ticket.",
    });

    return;
  }

  if (!descripcion) {
    ARABOT.alert({
      title: "Descripción requerida",

      message: "Describe brevemente la solicitud del cliente.",

      details: "La descripción permitirá dar seguimiento correcto al ticket.",
    });

    return;
  }

  try {
    ARABOT.loading({
      title: "Creando ticket",

      details: "Estamos registrando el ticket y preparando las notificaciones.",
    });

    const cliente = DB.get("clientes").find((c) => c.id === clienteId);

    const folio = await API.getFolio("ARTK");

    const ticket = {
      id: folio,
      folio: folio,

      fecha: hoy(),

      cliente_id: clienteId,
      cliente_nombre: cliente?.nombre || "",

      capturado_por: currentUser?.nombre || "Sistema",

      orden_id: "",
      orden_folio: "",

      asunto,
      descripcion,

      prioridad: document.getElementById("tk-prioridad").value,

      estado: "Nuevo",

      responsable: document.getElementById("tk-resp").value,

      origen: document.getElementById("tk-origen").value,

      visible_cliente: document.getElementById("tk-visible").checked,

      notificar_cliente: document.getElementById("tk-notificar").checked,

      fecha_ultima_actualizacion: hoy(),
      fecha_cierre: "",

      venta_generada: false,
      venta_id: "",
      venta_folio: "",

      total_productos: 0,
      total_servicios: 0,
      total_ticket: 0,
    };

    await DATA.save("tickets", ticket.id, ticket);

    if (cliente?.email) {
      const envio = await FB.callFunction("notificarCreacionTicket", {
        correo: cliente.email,
        cliente: cliente.nombre,
        folio: ticket.folio,
        asuntoTicket: ticket.asunto,
        prioridad: ticket.prioridad,
        estado: ticket.estado,
      });

      if (envio?.ok) {
        const comentarioArabot = {
          id: "TC-" + Date.now(),

          ticket_id: ticket.id,

          fecha: hoy(),

          fecha_hora: new Date().toISOString(),

          autor: "ARABOT",
          autor_tipo: "ARABOT",

          comentario: "📧 Correo de recepción enviado al cliente",

          visible_cliente: false,

          notificar_cliente: false,
        };

        await DATA.save(
          "ticketcomentarios",
          comentarioArabot.id,
          comentarioArabot,
        );
      }
    }
    rndTickets();

    closeM("m-ticket");

    ARABOT.success({
      title: "Ticket creado",

      message: "El ticket fue registrado correctamente.",

      details: "El expediente ya está disponible para su seguimiento.",
    });
  } catch (e) {
    console.error(e);

    ARABOT.error({
      title: "Error al crear ticket",

      message: "No fue posible registrar el ticket.",

      details: "Verifica tu conexión e inténtalo nuevamente.",
    });
  }
}

window.saveTicket = saveTicket;
window.rndTickets = rndTickets;

window.seleccionarOrdenTicket = seleccionarOrdenTicket;
window.abrirOrdenTicket = abrirOrdenTicket;

window.crearVentaDesdeTicket = crearVentaDesdeTicket;
window.crearOrdenDesdeTicket = crearOrdenDesdeTicket;

window.seleccionarVentaTicket = seleccionarVentaTicket;
window.vincularVentaTicket = vincularVentaTicket;
window.vincularOrdenTicket = vincularOrdenTicket;

window.saveTicketExp = saveTicketExp;

window.openTicket = openTicket;
