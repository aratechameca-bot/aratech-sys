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
      ${c.autor === "ARABOT" ? "🤖 ARABOT" : "👤 " + escHTML(c.autor || "Usuario")}
    </div>
      
    <div style="margin-top:6px">
      ${escHTML(c.comentario || "")}
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

async function addTicketComment() {
  const ticketId = document.getElementById("tkexp-id").value;

  const comentario = document.getElementById("tkexp-comentario").value.trim();

  if (!comentario) {
    ARABOT.alert({
      title: "Comentario requerido",

      message: "Escribe un comentario.",

      details: "Debes capturar un comentario antes de agregarlo al expediente.",
    });

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

  const res = await FB.callFunction("crearComentarioTicket", registro);

  await DATA.save("ticketcomentarios", res.id, {
    ...registro,
    id: res.id,
  });

  if (registro.visible_cliente && registro.notificar_cliente) {
    const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

    const cliente = (DB.get("clientes") || []).find(
      (c) => c.id === ticket?.cliente_id,
    );

    if (registro.notificar_cliente && !cliente?.email) {
      ARABOT.warning({
        title: "Correo no disponible",

        message: "El cliente no tiene un correo registrado.",

        details: "No es posible enviar la notificación por correo.",
      });

      return;
    }
    const envio = await FB.callFunction("notificarComentarioTicket", {
      correo: cliente.email,
      cliente: cliente.nombre,
      folio: ticket.folio,
      comentario,
      estado: ticket.estado,
    });

    if (envio?.ok) {
      const comentarioArabot = {
        id: "TC-" + Date.now(),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: "ARABOT",
        autor_tipo: "ARABOT",

        comentario: "📧 Correo enviado al cliente",

        visible_cliente: false,

        notificar_cliente: false,
      };

      const resArabot = await FB.callFunction(
        "crearComentarioTicket",
        comentarioArabot,
      );

      await DATA.save("ticketcomentarios", resArabot.id, {
        ...comentarioArabot,
        id: resArabot.id,
      });
    }
  }
  document.getElementById("tkexp-comentario").value = "";

  document.getElementById("tkexp-notificar").checked = false;

  renderTicketComments(ticketId);

  notify("💬 Comentario agregado");
}

window.addTicketComment = addTicketComment;
window.renderTicketComments = renderTicketComments;
