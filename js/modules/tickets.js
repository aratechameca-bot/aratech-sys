// ============================================================
// MESA DE AYUDA
// ============================================================

function renderTicketComments(ticketId) {
  const wrap = document.getElementById("tkexp-comentarios");

  if (!wrap) return;

  const comentarios = (DB.get("ticketcomentarios") || [])
    .filter((c) => c.ticket_id === ticketId)
    .sort((a, b) =>
      String(a.fecha_hora || a.fecha).localeCompare(
        String(b.fecha_hora || b.fecha),
      ),
    );

  if (!comentarios.length) {
    wrap.innerHTML = '<div class="nd">Sin comentarios</div>';
    return;
  }

  wrap.innerHTML = comentarios
    .map(
      (c) => `

  <div class="card" style="margin-bottom:8px">

    <div style="font-size:11px;color:var(--text2)">
      ${
        c.fecha_hora
          ? new Date(c.fecha_hora).toLocaleString("es-MX")
          : fmt(c.fecha)
      }
    </div>
    
    <div style="font-weight:600">
      ${c.autor === "ARABOT" ? "🤖 ARABOT" : "👤 " + (c.autor || "Usuario")}
    </div>
      
    <div style="margin-top:6px">
      ${c.comentario || ""}
    </div>

    <div style="
      margin-top:8px;
      font-size:11px;
      color:var(--text2);
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    ">

      <span>
        ${c.visible_cliente ? "👁 Visible cliente" : "🔒 Interno"}
      </span>

      ${c.notificar_cliente ? "<span>📧 Notificar cliente</span>" : ""}

      </div>

    </div>

  `,
    )
    .join("");
}

function renderTicketFiles(ticketId) {
  const wrap = document.getElementById("tkexp-archivos");

  if (!wrap) return;

  const archivos = (DB.get("ticketarchivos") || []).filter(
    (a) => a.ticket_id === ticketId && !a.eliminada,
  );

  if (!archivos.length) {
    wrap.innerHTML = '<div class="nd">Sin evidencias</div>';

    return;
  }

  wrap.innerHTML = archivos
    .map(
      (a) => `

  <div class="card"
    style="margin-bottom:8px">

    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
      ">

        <a
          href="${a.url}"
          target="_blank"
          style="
            color:var(--accent);
            font-weight:600;
            text-decoration:none;
          ">

          📎 ${a.nombre}

        </a>

        <button
          class="btn br bsm"
          onclick="deleteTicketFile('${a.id}')">

          🗑

        </button>

      </div>

    <div style="
      margin-top:8px;
      font-size:11px;
      color:var(--text2);
      display:flex;
      gap:12px;
      flex-wrap:wrap;
    ">

      <span>
        👤 ${a.autor || "Sistema"}
      </span>

      <span>
        🕒 ${
          a.fecha_hora
            ? new Date(a.fecha_hora).toLocaleString("es-MX")
            : fmt(a.fecha)
        }
      </span>

      <span>
        ${a.visible_cliente ? "👁 Visible cliente" : "🔒 Interno"}
      </span>

    </div>

  </div>

`,
    )
    .join("");
}

async function addTicketComment() {
  const ticketId = document.getElementById("tkexp-id").value;

  const comentario = document.getElementById("tkexp-comentario").value.trim();

  if (!comentario) {
    alert("Escribe un comentario");
    return;
  }

  const registro = {
    id: "TC-" + Date.now(),

    ticket_id: ticketId,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: currentUser?.nombre || "Sistema",
    autor_tipo: "ARATECH",

    comentario,

    visible_cliente: document.getElementById("tkexp-visible").checked,

    notificar_cliente: document.getElementById("tkexp-notificar").checked,
  };

  await API.save("ticketcomentarios", registro);

  if (registro.visible_cliente && registro.notificar_cliente) {
    const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

    const cliente = (DB.get("clientes") || []).find(
      (c) => c.id === ticket?.cliente_id,
    );

    if (registro.notificar_cliente && !cliente?.email) {
      alert("⚠️ El cliente no tiene correo registrado.");

      return;
    }
    const envio = await API.call("notificarComentarioTicket", "", {
      correo: cliente.email,

      cliente: cliente.nombre,

      folio: ticket.folio,

      comentario,

      estado: ticket.estado,
    });

    if (envio?.ok) {
      await API.save("ticketcomentarios", {
        id: "TC-" + Date.now(),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: "ARABOT",
        autor_tipo: "ARABOT",

        comentario: "📧 Correo enviado al cliente",

        visible_cliente: false,

        notificar_cliente: false,
      });
    }
  }

  document.getElementById("tkexp-comentario").value = "";

  document.getElementById("tkexp-notificar").checked = false;

  renderTicketComments(ticketId);

  notify("💬 Comentario agregado");
}

async function addTicketFile() {
  const ticketId = document.getElementById("tkexp-id").value;

  const nombre = document.getElementById("tkexp-archivo-nombre").value.trim();

  const url = document.getElementById("tkexp-archivo-url").value.trim();

  if (!nombre) {
    alert("Ingresa un nombre");
    return;
  }

  if (!url) {
    alert("Ingresa una URL");
    return;
  }

  const archivo = {
    id: "TA-" + Date.now(),

    ticket_id: ticketId,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    nombre,

    url,

    visible_cliente: document.getElementById("tkexp-archivo-visible").checked,

    autor: currentUser?.nombre || "Sistema",
  };

  await API.save("ticketarchivos", archivo);

  await API.save("ticketcomentarios", {
    id: "TC-" + (Date.now() + 1),

    ticket_id: ticketId,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: "ARABOT",
    autor_tipo: "ARABOT",

    comentario: "📎 Evidencia agregada: " + nombre,

    visible_cliente: false,

    notificar_cliente: false,
  });

  document.getElementById("tkexp-archivo-nombre").value = "";

  document.getElementById("tkexp-archivo-url").value = "";

  document.getElementById("tkexp-archivo-visible").checked = true;

  renderTicketFiles(ticketId);

  renderTicketComments(ticketId);

  notify("📎 Evidencia agregada");
}

document.addEventListener("change", (e) => {
  if (e.target?.id !== "tkexp-file") return;

  const file = e.target.files?.[0];

  document.getElementById("tkexp-file-name").textContent = file
    ? "📄 " + file.name
    : "";
});

async function uploadTicketFile() {
  const ticketId = document.getElementById("tkexp-id").value;

  const notificarCliente = document.getElementById(
    "tkexp-evidencia-notificar",
  )?.checked;

  console.log(
    "CHECKBOX TICKET:",
    document.getElementById("tkexp-evidencia-notificar"),
  );

  console.log(
    "VALOR CHECKBOX:",
    document.getElementById("tkexp-evidencia-notificar")?.checked,
  );

  const input = document.getElementById("tkexp-file");

  const file = input.files[0];

  if (!file) {
    alert("Selecciona un archivo");

    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      notify("📤 Subiendo evidencia...");

      const base64 = e.target.result.split(",")[1];

      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",

        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },

        body: JSON.stringify({
          action: "subirTicketFile",

          collection: ticketId,

          payload: {
            nombre: file.name,

            base64,

            mimeType: file.type || "application/octet-stream",
          },
        }),

        redirect: "follow",
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);

        return;
      }

      const archivo = {
        id: "TA-" + Date.now(),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        nombre: data.nombre,

        url: data.url,

        visible_cliente: document.getElementById("tkexp-archivo-visible")
          .checked,

        autor: currentUser?.nombre || "Sistema",
      };

      await API.save("ticketarchivos", archivo);

      if (notificarCliente) {
        console.log("ENTRO A NOTIFICAR");

        const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

        const cliente = (DB.get("clientes") || []).find(
          (c) => c.id === ticket?.cliente_id,
        );

        if (cliente?.email) {
          const envio = await API.call("notificarEvidencia", null, {
            correo: cliente.email,
            cliente: cliente.nombre,
            folio: ticket.folio,
          });

          if (envio?.ok) {
            await API.save("ticketcomentarios", {
              id: "TC-" + (Date.now() + 50),

              ticket_id: ticketId,

              fecha: hoy(),

              fecha_hora: new Date().toISOString(),

              autor: "ARABOT",
              autor_tipo: "ARABOT",

              comentario: "📧 Correo enviado por evidencia agregada",

              visible_cliente: false,

              notificar_cliente: false,
            });
          }
        }
      }

      console.log("NOTIFICAR EVIDENCIA TICKET:", notificarCliente);

      await API.save("ticketcomentarios", {
        id: "TC-" + (Date.now() + 20),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: currentUser?.nombre || "ARABOT",
        autor_tipo: currentUser ? "ARATECH" : "ARABOT",

        comentario: "📎 Evidencia agregada: " + data.nombre,

        visible_cliente: false,

        notificar_cliente: false,
      });

      input.value = "";

      document.getElementById("tkexp-file-name").textContent = "";

      document.getElementById("tkexp-archivo-visible").checked = true;

      renderTicketFiles(ticketId);

      renderTicketComments(ticketId);

      notify("✅ Evidencia subida");
    } catch (e) {
      console.error(e);

      alert("Error al subir evidencia");
    }
  };

  reader.readAsDataURL(file);
}

async function deleteTicketFile(id) {
  if (!confirm("¿Eliminar esta evidencia?")) return;

  const archivo = (DB.get("ticketarchivos") || []).find((a) => a.id === id);

  if (!archivo) return;

  await API.update("ticketarchivos", id, {
    eliminada: true,
    fecha_eliminacion: new Date(),
    usuario_eliminacion: currentUser?.nombre || "",
  });

  await API.save("ticketcomentarios", {
    id: "TC-" + (Date.now() + 10),

    ticket_id: archivo.ticket_id,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: currentUser?.nombre || "Sistema",
    autor_tipo: "SISTEMA",

    comentario: "🗑 Evidencia eliminada: " + archivo.nombre,

    visible_cliente: false,

    notificar_cliente: false,
  });

  renderTicketFiles(archivo.ticket_id);

  renderTicketComments(archivo.ticket_id);

  notify("🗑 Evidencia eliminada");
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

  USUARIOS.forEach((u) => {
    const o = document.createElement("option");
    o.value = u.nombre;
    o.textContent = u.nombre;
    tecSel.appendChild(o);
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
                            🧾 ${v.folio}
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
                                🛡 ${g.folio}
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
  }

  if (t.orden_id) {
    const ord = (DB.get("ordenes") || []).find((o) => o.id === t.orden_id);

    if (ord) {
      let estadoColor = "#3b82f6";

      if (["Recibido", "Diagnóstico"].includes(ord.estado)) {
        estadoColor = "#3b82f6";
      } else if (
        ["En proceso", "Reingreso por garantía"].includes(ord.estado)
      ) {
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
            🔧 ${ord.folio}

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

               ⬤ ${ord.estado || "Sin estado"}

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
    }
  } else {
    ordenInfo.style.display = "none";

    ordenInfo.innerHTML = "";
  }
  document.getElementById("tkexp-desc").readOnly = true;
  document.getElementById("tkexp-desc").style.cursor = "default";

  document.getElementById("tkexp-titulo").textContent = "🎫 " + t.folio;

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

  await API.update("tickets", id, {
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
    await API.update("ordenes", ordenId, {
      ticket_id: id,
    });
  }

  const respNuevo = document.getElementById("tkexp-resp").value;

  if (estadoAnterior !== estadoNuevo) {
    await API.save("ticketcomentarios", {
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
    });
  }

  const estabaCerrado = estadosCierre.includes(estadoAnterior);

  const ahoraCerrado = estadosCierre.includes(estadoNuevo);

  if (!estabaCerrado && ahoraCerrado) {
    await API.save("ticketcomentarios", {
      id: "TC-" + (Date.now() + 2),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario: "🎯 Ticket cerrado (" + estadoNuevo + ")",

      visible_cliente: false,

      notificar_cliente: false,
    });

    if (estadoAnterior !== estadoNuevo && ahoraCerrado) {
      const ticket = (DB.get("tickets") || []).find((t) => t.id === id);

      const cliente = (DB.get("clientes") || []).find(
        (c) => c.id === ticket?.cliente_id,
      );

      if (cliente?.email) {
        const envio = await API.call("notificarEstadoTicket", "", {
          correo: cliente.email,

          cliente: cliente.nombre,

          folio: ticket.folio,

          estado: estadoNuevo,
        });

        if (envio?.ok) {
          await API.save("ticketcomentarios", {
            id: "TC-" + (Date.now() + 50),

            ticket_id: id,

            fecha: hoy(),

            fecha_hora: new Date().toISOString(),

            autor: "ARABOT",
            autor_tipo: "ARABOT",

            comentario: "📧 Correo enviado por cambio de estado",

            visible_cliente: false,

            notificar_cliente: false,
          });
        }
      }
    }
  }

  if (estabaCerrado && !ahoraCerrado) {
    await API.save("ticketcomentarios", {
      id: "TC-" + (Date.now() + 3),

      ticket_id: id,

      fecha: hoy(),

      fecha_hora: new Date().toISOString(),

      autor: "Sistema",
      autor_tipo: "SISTEMA",

      comentario: "🔄 Ticket reabierto (" + estadoNuevo + ")",
      visible_cliente: false,

      notificar_cliente: false,
    });
  }

  if (respAnterior !== respNuevo) {
    await API.save("ticketcomentarios", {
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
    });
  }

  rndTickets();

  renderTicketComments(id);

  closeM("m-ticket-exp");

  notify("✅ Ticket actualizado");
}

function vincularOrdenTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) return;

  const ordenes = (DB.get("ordenes") || [])
    .filter((o) => o.cliente_id === ticket.cliente_id)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  if (!ordenes.length) {
    alert("Este cliente no tiene órdenes registradas.");

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
    alert("Este cliente no tiene ventas registradas.");

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

    await API.update("tickets", tickets[idx].id, {
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
                    🧾 ${venta.folio}
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

  closeM("m-ticket-venta");

  notify("🧾 Venta seleccionada: " + folio);
}

function crearOrdenDesdeTicket() {
  const ticketId = document.getElementById("tkexp-id").value;

  const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

  if (!ticket) {
    alert("No se encontró el ticket.");

    return;
  }

  if (ticket.orden_id) {
    alert(
      "⚠️ Este ticket ya tiene una orden de servicio relacionada.\n\n" +
        "Orden actual: " +
        ticket.orden_folio +
        "\n\n" +
        "Solo se permite una orden de servicio por ticket.\n\n" +
        "Si necesitas generar un nuevo servicio, crea un nuevo ticket o desvincula primero la orden existente.",
    );

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
    alert("No se encontró el ticket.");

    return;
  }

  window.ticketVentaOrigenId = ticket.id;

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
    alert("⚠️ Este ticket no tiene una orden relacionada.");

    return;
  }

  closeM("m-ticket-exp");

  openExp(ordenId);
}

function seleccionarOrdenTicket(id, folio) {
  document.getElementById("tkexp-orden-id").value = id;

  document.getElementById("tkexp-orden-folio").value = folio;

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
            ? `<br><span style="font-size:10px;color:var(--accent2)">🔧 ${t.orden_folio}</span>`
            : ""
        }
      </td>

      <td>${fmt(t.fecha)}</td>

      <td>${t.cliente_nombre || "—"}</td>

      <td>${t.capturado_por || "—"}</td>

      <td>${t.asunto || "—"}</td>

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
        ${t.fecha_cierre ? "🔒 " + fmt(t.fecha_cierre) : "🟢 Abierto"}
      </td>

      <td class="bg-btn">
        <button class="btn bp bsm" onclick="openTicket('${t.id}')">
          📋
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function saveTicket() {
  const clienteId = document.getElementById("tk-cli").value;
  const asunto = document.getElementById("tk-asunto").value.trim();
  const descripcion = document.getElementById("tk-desc").value.trim();

  if (!clienteId) {
    alert("Selecciona un cliente");
    return;
  }

  if (!asunto) {
    alert("Ingresa un asunto");
    return;
  }

  if (!descripcion) {
    alert("Describe brevemente la solicitud del cliente");
    return;
  }

  if (!asunto) {
    alert("Ingresa un asunto");
    return;
  }

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

  await API.save("tickets", ticket);

  if (cliente?.email) {
    const envio = await API.call("notificarCreacionTicket", "", {
      correo: cliente.email,

      cliente: cliente.nombre,

      folio: ticket.folio,

      asuntoTicket: ticket.asunto,

      prioridad: ticket.prioridad,

      estado: ticket.estado,
    });

    if (envio?.ok) {
      await API.save("ticketcomentarios", {
        id: "TC-" + Date.now(),

        ticket_id: ticket.id,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: "ARABOT",
        autor_tipo: "ARABOT",

        comentario: "📧 Correo de recepción enviado al cliente",

        visible_cliente: false,

        notificar_cliente: false,
      });
    }
  }

  closeM("m-ticket");

  document.getElementById("tk-cli").value = "";
  document.getElementById("tk-asunto").value = "";
  document.getElementById("tk-desc").value = "";
  document.getElementById("tk-prioridad").value = "Media";
  document.getElementById("tk-origen").value = "WhatsApp";

  rndTickets();

  notify("🎫 Ticket " + folio + " creado correctamente");
}

// Navegación programática entre paneles
function navTo(panel) {
  const el = document.querySelector(`.sb-item[data-panel="${panel}"]`);
  if (el) el.click();
}

function prtDesgloseFactura() {
  // Llamado desde el expediente — usa los servicios de la orden actual
  const id = document.getElementById("exp-id")?.value;
  if (!id) return;
  const ord = DB.get("ordenes").find((o) => o.id === id);
  if (!ord) return;

  const conceptos = [];
  (ord.servicios || []).forEach((s) => {
    if (!s.svc || s.svc === "__otro") return;
    const precio = s.precio || 0;
    conceptos.push({
      desc: s.svcOtro || s.svc,
      totalConIva: precio,
      base: precio / 1.16,
      iva: precio - precio / 1.16,
    });
  });
  (ord.vtas_rel || []).forEach((vid) => {
    const v = DB.get("ventas").find((x) => x.id === vid);
    if (!v) return;
    (v.lineas || []).forEach((l) => {
      const precio = l.precio || 0;
      conceptos.push({
        desc: l.desc,
        totalConIva: precio,
        base: precio / 1.16,
        iva: precio - precio / 1.16,
      });
    });
  });

  if (!conceptos.length) {
    notify("❌ Esta orden no tiene servicios o productos");
    return;
  }
  prtDesglose(conceptos, ord);
}

function prtDesglose(conceptos, ord) {
  const c = cfg();
  let totBase = 0,
    totIva = 0,
    totTotal = 0;
  conceptos.forEach((x) => {
    totBase += x.base;
    totIva += x.iva;
    totTotal += x.totalConIva;
  });

  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;900&family=Montserrat:wght@400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Montserrat',sans-serif;color:#1a1a2e;background:#fff;padding:24px;font-size:11px}
    .header{background:#102a43;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;margin-bottom:0}
    .header-left{display:flex;align-items:center;gap:14px}
    .brand{font-family:'League Spartan',sans-serif;font-weight:900;font-size:22px;color:#fff;letter-spacing:3px}
    .slogan{font-size:8px;color:#75d0fa;letter-spacing:2px;text-transform:uppercase}
    .header-right{text-align:right}
    .doc-title{font-family:'League Spartan',sans-serif;font-weight:700;font-size:14px;color:#fff;letter-spacing:2px}
    .doc-sub{font-size:9px;color:#75d0fa;margin-top:2px}
    .meta{background:#f4f7fb;padding:12px 20px;display:flex;justify-content:space-between;margin-bottom:16px;font-size:10px;color:#444;border-bottom:2px solid #e0e8f0}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    thead th{background:#0a1a2e;color:#fff;padding:8px 10px;text-align:left;font-size:9px;letter-spacing:1px;text-transform:uppercase;font-family:'League Spartan',sans-serif}
    thead th:not(:first-child){text-align:right}
    tbody tr:nth-child(even){background:#f8fafc}
    tbody td{padding:8px 10px;border-bottom:1px solid #e8edf2;color:#1a1a2e}
    tbody td:not(:first-child){text-align:right}
    .tot-row{background:#102a43!important}
    .tot-row td{color:#fff;font-weight:600;padding:10px 10px;font-size:11px}
    .iva-cell{color:#ffd600!important;font-weight:700}
    .total-cell{color:#75d0fa!important;font-weight:800;font-size:13px}
    .nota{font-size:9px;color:#888;margin-bottom:16px;padding:10px;background:#f8fafc;border-radius:6px;border-left:3px solid #75d0fa}
    .footer{background:#102a43;padding:12px 20px;border-radius:0 0 8px 8px;display:flex;justify-content:space-between;align-items:center}
    .footer p{font-size:9px;color:rgba(255,255,255,0.45)}
    @media print{body{padding:10px}.no-print{display:none}}
  </style></head><body>
  <div class="header">
    <div class="header-left">
      <div>
        <div class="brand">${c.nombre || "ARATECH"}</div>
        <div class="slogan">Tecnología a tu servicio</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">DESGLOSE PARA FACTURA</div>
      <div class="doc-sub">${fecha}</div>
      ${ord ? `<div class="doc-sub" style="margin-top:2px">Orden: <b style="color:#75d0fa">${ord.folio}</b> · ${ord.cliente_nombre}</div>` : ""}
    </div>
  </div>
  <div class="meta">
    <span><b>${c.dir || ""}</b></span>
    <span>Tel: <b>${c.tel || "375 690 5296"}</b> · ${c.ig || "@aratechameca"}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:45%">Concepto / Descripción</th>
        <th>Subtotal</th>
        <th>IVA 16%</th>
        <th>Total con IVA</th>
      </tr>
    </thead>
    <tbody>
      ${conceptos
        .map(
          (x) => `
        <tr>
          <td>${x.desc}</td>
          <td>${mxn(x.base)}</td>
          <td class="iva-cell">${mxn(x.iva)}</td>
          <td style="font-weight:700;color:#102a43">${mxn(x.totalConIva)}</td>
        </tr>`,
        )
        .join("")}
      <tr class="tot-row">
        <td><b>TOTAL</b></td>
        <td><b>${mxn(totBase)}</b></td>
        <td class="iva-cell"><b>${mxn(totIva)}</b></td>
        <td class="total-cell">${mxn(totTotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="nota">
    <b>Nota:</b> Este desglose es para uso contable interno. El IVA de <b>${mxn(totIva)}</b> corresponde al 16% sobre el subtotal de <b>${mxn(totBase)}</b>.
    Los precios son en pesos mexicanos (MXN).
  </div>

  <div class="footer">
    <p>${c.nombre || "ARATECH"} · ${c.slogan || "Tecnología a tu servicio"}</p>
    <p>Documento generado el ${fecha}</p>
  </div>

  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
  </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

window.renderTicketComments = renderTicketComments;
window.renderTicketFiles = renderTicketFiles;

window.addTicketComment = addTicketComment;
window.addTicketFile = addTicketFile;
window.uploadTicketFile = uploadTicketFile;
window.deleteTicketFile = deleteTicketFile;

window.openTicket = openTicket;
window.saveTicketExp = saveTicketExp;

window.vincularOrdenTicket = vincularOrdenTicket;
window.vincularVentaTicket = vincularVentaTicket;

window.seleccionarVentaTicket = seleccionarVentaTicket;
window.seleccionarOrdenTicket = seleccionarOrdenTicket;

window.crearOrdenDesdeTicket = crearOrdenDesdeTicket;
window.crearVentaDesdeTicket = crearVentaDesdeTicket;

window.abrirOrdenTicket = abrirOrdenTicket;

window.rndTickets = rndTickets;
window.saveTicket = saveTicket;

window.navTo = navTo;

window.prtDesgloseFactura = prtDesgloseFactura;
window.prtDesglose = prtDesglose;
