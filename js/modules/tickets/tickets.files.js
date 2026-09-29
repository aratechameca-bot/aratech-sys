function renderTicketFiles(ticketId) {
  const wrap = document.getElementById("tkexp-archivos");

  if (!wrap) return;

  const archivos = (DB.get("ticketarchivos") || []).filter(
    (a) => a.ticket_id === ticketId && !a.eliminado,
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

          <i class="ar-icon clip"></i> ${a.nombre}

        </a>

        <button
          class="btn br bsm"
          onclick="deleteTicketFile('${a.id}')">

          <i class="ar-icon delete"></i>

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
        <i class="ar-icon usuario"></i> ${a.autor || "Sistema"}
      </span>

      <span>
         <i class="ar-icon reloj"></i>
          ${
            a.fecha_hora
              ? new Date(a.fecha_hora).toLocaleString("es-MX")
              : fmt(a.fecha)
          }
      </span>

      <span>
        ${
          a.visible_cliente
            ? '<i class="ar-icon view"></i> Visible cliente'
            : '<i class="ar-icon lock"></i> Interno'
        }
      </span>

    </div>

  </div>

`,
    )
    .join("");
  window.refreshIcons(wrap);
}

async function addTicketFile() {
  const ticketId = document.getElementById("tkexp-id").value;

  const nombre = document.getElementById("tkexp-archivo-nombre").value.trim();

  const url = document.getElementById("tkexp-archivo-url").value.trim();

  if (!nombre) {
    ARABOT.alert({
      title: "Nombre requerido",

      message: "Ingresa un nombre para la evidencia.",

      details: "Debes asignar un nombre antes de agregar el archivo.",
    });

    return;
  }

  if (!url) {
    ARABOT.alert({
      title: "URL requerida",

      message: "Ingresa la URL de la evidencia.",

      details: "Debes indicar la ubicación del archivo antes de guardarlo.",
    });

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

  await DATA.save("ticketarchivos", archivo.id, archivo);

  const comentario = {
    id: "TC-" + (Date.now() + 1),

    ticket_id: ticketId,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: "ARABOT",
    autor_tipo: "ARABOT",

    comentario: "📎 Evidencia agregada: " + nombre,

    visible_cliente: false,

    notificar_cliente: false,
  };

  await DATA.save("ticketcomentarios", comentario.id, comentario);

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

  const input = document.getElementById("tkexp-file");

  const file = input.files[0];

  if (!file) {
    ARABOT.alert({
      title: "Archivo requerido",

      message: "Selecciona un archivo.",

      details: "Debes elegir un archivo antes de subir la evidencia.",
    });

    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      ARABOT.loading({
        title: "Subiendo evidencia",

        details:
          "Estamos cargando el archivo y registrando la evidencia en el ticket.",
      });

      const base64 = e.target.result.split(",")[1];

      const data = await FB.callFunction("subirTicketFile", {
        ticket_id: ticketId,
        nombre: file.name,
        base64,
        mimeType: file.type || "application/octet-stream",
      });

      if (data.error) {
        ARABOT.error({
          title: "Error al subir evidencia",

          message: data.error,

          details: "La evidencia no pudo almacenarse correctamente.",
        });

        return;
      }

      const archivo = {
        id: "TA-" + Date.now(),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        nombre: file.name,

        url: data.url,

        visible_cliente: document.getElementById("tkexp-archivo-visible")
          .checked,

        autor: currentUser?.nombre || "Sistema",
      };

      await DATA.save("ticketarchivos", archivo.id, archivo);

      if (notificarCliente) {
        const ticket = (DB.get("tickets") || []).find((t) => t.id === ticketId);

        const cliente = (DB.get("clientes") || []).find(
          (c) => c.id === ticket?.cliente_id,
        );

        if (cliente?.email) {
          const envio = await FB.callFunction("notificarEvidencia", {
            correo: cliente.email,
            cliente: cliente.nombre,
            folio: ticket.folio,
          });

          if (envio?.ok) {
            const comentarioCorreo = {
              id: "TC-" + (Date.now() + 50),

              ticket_id: ticketId,

              fecha: hoy(),

              fecha_hora: new Date().toISOString(),

              autor: "ARABOT",
              autor_tipo: "ARABOT",

              comentario: "📧 Correo enviado por evidencia agregada",

              visible_cliente: false,

              notificar_cliente: false,
            };

            await DATA.save(
              "ticketcomentarios",
              comentarioCorreo.id,
              comentarioCorreo,
            );
          }
        }
      }

      const comentario = {
        id: "TC-" + (Date.now() + 20),

        ticket_id: ticketId,

        fecha: hoy(),

        fecha_hora: new Date().toISOString(),

        autor: currentUser?.nombre || "ARABOT",
        autor_tipo: currentUser ? "ARATECH" : "ARABOT",

        comentario: "📎 Evidencia agregada: " + data.nombre,

        visible_cliente: false,

        notificar_cliente: false,
      };

      await DATA.save("ticketcomentarios", comentario.id, comentario);

      input.value = "";

      document.getElementById("tkexp-file-name").textContent = "";

      document.getElementById("tkexp-archivo-visible").checked = true;

      renderTicketFiles(ticketId);

      renderTicketComments(ticketId);

      ARABOT.success({
        title: "Evidencia registrada",

        message: "La evidencia fue subida correctamente.",

        details:
          "El archivo quedó vinculado al ticket y registrado en el historial.",
      });
    } catch (e) {
      console.error(e);

      ARABOT.error({
        title: "Error al subir evidencia",

        message: "No fue posible completar la carga.",

        details: "Verifica tu conexión e inténtalo nuevamente.",
      });
    }
  };

  reader.readAsDataURL(file);
}

async function deleteTicketFile(id) {
  const ok = await ARABOT.confirm({
    title: "Eliminar evidencia",

    message: "¿Deseas eliminar esta evidencia?",

    details:
      "La evidencia será marcada como eliminada y dejará de estar disponible. Esta acción no podrá deshacerse.",
  });

  if (!ok) return;

  const archivo = (DB.get("ticketarchivos") || []).find((a) => a.id === id);

  if (!archivo) return;

  await FB.callFunction("eliminarTicketFile", {
    id,
    usuario: currentUser?.nombre || "",
  });

  const archivos = DB.get("ticketarchivos") || [];

  const archivoLocal = archivos.find((a) => a.id === id);

  if (archivoLocal) {
    archivoLocal.eliminado = true;
  }

  const comentario = {
    id: "TC-" + (Date.now() + 10),

    ticket_id: archivo.ticket_id,

    fecha: hoy(),

    fecha_hora: new Date().toISOString(),

    autor: currentUser?.nombre || "Sistema",
    autor_tipo: "SISTEMA",

    comentario: "🗑 Evidencia eliminada: " + archivo.nombre,

    visible_cliente: false,

    notificar_cliente: false,
  };

  await DATA.save("ticketcomentarios", comentario.id, comentario);

  const listaArchivos = DB.get("ticketarchivos") || [];

  const idx = listaArchivos.findIndex((a) => a.id === id);

  if (idx >= 0) {
    listaArchivos[idx].eliminado = true;
    DB.set("ticketarchivos", listaArchivos);
  }

  renderTicketFiles(archivo.ticket_id);

  renderTicketComments(archivo.ticket_id);

  notify("🗑 Evidencia eliminada");
}
window.deleteTicketFile = deleteTicketFile;
window.uploadTicketFile = uploadTicketFile;
window.addTicketFile = addTicketFile;
window.renderTicketFiles = renderTicketFiles;
