const { onCall } = require("firebase-functions/v2/https");

const {
  enviarCorreo,
  plantillaCorreo,
  ZOHO_SMTP_PASSWORD,
  CORREO_ARATECH,
} = require("./mail");

const LOG = require("../lib/logger");

// ============================================================
// CAMBIO ESTADO ORDEN
// ============================================================

exports.notificarCambioEstadoOrden = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const payload = request.data;
    const { correo, nombre, equipo, modelo, estado, folio } = payload;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    let asunto;
    let cuerpo;

    if (estado === "Listo" || estado === "Listo para entrega") {
      asunto = "¡Tu equipo está listo! — ARATECH";

      cuerpo = `
      <p>
        Hola <b>${nombre}</b>,
        ¡buenas noticias!
      </p>

      <p>
        Tu equipo
        <b>${equipo} ${modelo || ""}</b>
        ya está listo para ser recogido.
      </p>

      <p>
        Puedes visitarnos en ARATECH.
      </p>
    `;
    } else {
      asunto = "Tu equipo en ARATECH — Actualización de servicio";

      cuerpo = `
      <p>
        Hola <b>${nombre}</b>,
      </p>

      <p>
        Tu equipo
        <b>${equipo} ${modelo || ""}</b>
        cambió al estado:
        <b>${estado}</b>.
      </p>
    `;
    }

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarCambioEstadoOrden", {
        error: error.message,
      });

      return {
        ok: false,
        error: error.message,
      };
    }
  },
);

// ============================================================
// NOTIFICACIÓN — Confirmación de recepción de equipo
// ============================================================

exports.notificarRecepcionOrden = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { correo, nombre, folio, equipo, modelo, servicios, fechaProm } =
      request.data;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    const asunto = "Recibimos tu equipo — " + folio + " | ARATECH";

    const fechaStr = fechaProm
      ? new Date(fechaProm + "T12:00").toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Por confirmar";

    const cuerpo = `

<p>
Hola <b>${nombre}</b>,
hemos recibido tu
<b>${equipo}${modelo ? " " + modelo : ""}</b>
en nuestro taller.
</p>


<p>
A continuación el detalle de tu servicio:
</p>


<table
style="
width:100%;
border-collapse:collapse;
margin:16px 0;
font-size:13px
">


<tr style="background:#102a43">

<td style="
padding:8px 12px;
color:#75d0fa;
font-weight:600
">
Folio
</td>


<td style="
padding:8px 12px;
color:#fff
">

<b>${folio}</b>

</td>

</tr>


<tr style="background:#f4f7fb">

<td style="
padding:8px 12px;
color:#444;
font-weight:600
">

Equipo

</td>


<td style="
padding:8px 12px;
color:#1a1a2e
">

${equipo}${modelo ? " " + modelo : ""}

</td>

</tr>


<tr>

<td style="
padding:8px 12px;
color:#444;
font-weight:600
">

Servicio(s)

</td>


<td style="
padding:8px 12px;
color:#1a1a2e
">

${servicios}

</td>

</tr>


<tr style="background:#f4f7fb">

<td style="
padding:8px 12px;
color:#444;
font-weight:600
">

Entrega estimada

</td>


<td style="
padding:8px 12px;
color:#1a1a2e
">

<b>${fechaStr}</b>

</td>

</tr>


</table>


<p>
Te notificaremos cuando tu equipo esté listo.
Si tienes alguna duda:
</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarRecepcionOrden", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);

// ============================================================
// NOTIFICACIÓN — Comentario de Ticket
// ============================================================

exports.notificarComentarioTicket = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { correo, cliente, folio, comentario, estado } = request.data;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    const asunto = "Actualización de ticket " + folio + " | ARATECH";

    const cuerpo = `

<p>

Hola <b>${cliente}</b>,

</p>

<p>

Tenemos una actualización en tu ticket.

</p>

<table
style="
width:100%;
border-collapse:collapse;
margin:16px 0;
font-size:13px;
">

<tr style="background:#102a43">

<td
style="
padding:8px 12px;
color:#75d0fa;
font-weight:600;
">

Folio

</td>

<td
style="
padding:8px 12px;
color:#fff;
">

<b>${folio}</b>

</td>

</tr>

<tr style="background:#f4f7fb">

<td
style="
padding:8px 12px;
color:#444;
font-weight:600;
">

Estado

</td>

<td
style="
padding:8px 12px;
color:#1a1a2e;
">

${estado}

</td>

</tr>

</table>

<p>

<b>Comentario:</b>

</p>

<div
style="
background:#f4f7fb;
padding:12px;
border-radius:8px;
color:#1a1a2e;
font-size:14px;
line-height:1.5;
">

${comentario}

</div>

<p>

Si tienes alguna duda,
responde este correo
o contáctanos.

</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarComentarioTicket", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);

// ============================================================
// NOTIFICACIÓN — Cambio de estado ticket
// ============================================================

exports.notificarEstadoTicket = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { correo, cliente, folio, estado } = request.data;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    const asunto = "Estado actualizado: " + folio + " | ARATECH";

    const cuerpo = `

<p>

Hola <b>${cliente}</b>,

</p>


<p>

El estado de tu ticket ha sido actualizado.

</p>


<table
style="
width:100%;
border-collapse:collapse;
margin:16px 0;
font-size:13px;
">

<tr style="background:#102a43">

<td style="
padding:8px 12px;
color:#75d0fa;
font-weight:600;
">

Folio

</td>


<td style="
padding:8px 12px;
color:#fff;
">

<b>${folio}</b>

</td>

</tr>


<tr style="background:#f4f7fb">

<td style="
padding:8px 12px;
color:#444;
font-weight:600;
">

Nuevo estado

</td>


<td style="
padding:8px 12px;
color:#1a1a2e;
font-weight:700;
">

${estado}

</td>

</tr>

</table>


<p>

Puedes responder este correo
si necesitas más información.

</p>


<p>

Gracias por confiar en ARATECH.

</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarEstadoTicket", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);

// ============================================================
// NOTIFICACIÓN — Recepción de ticket
// ============================================================

exports.notificarCreacionTicket = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { correo, cliente, folio, asuntoTicket, prioridad, estado } =
      request.data;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    const asunto = "Tu ticket ha sido registrado | " + folio;

    const cuerpo = `

<p>

Hola <b>${cliente}</b>,

</p>


<p>

Gracias por contactar a <b>ARATECH</b>.

</p>


<p>

Hemos recibido tu solicitud y ya fue registrada
en nuestro sistema de atención.

</p>


<p>

A partir de este momento podremos dar seguimiento
a tu caso mediante el siguiente folio:

</p>


<table
style="
width:100%;
border-collapse:collapse;
margin:16px 0;
font-size:13px;
">


<tr style="background:#102a43">

<td style="
padding:8px 12px;
color:#75d0fa;
font-weight:600;
">

Folio

</td>

<td style="
padding:8px 12px;
color:#fff;
">

<b>${folio}</b>

</td>

</tr>


<tr style="background:#f4f7fb">

<td style="
padding:8px 12px;
color:#444;
font-weight:600;
">

Estado inicial

</td>

<td style="
padding:8px 12px;
color:#1a1a2e;
">

${estado}

</td>

</tr>


<tr>

<td style="
padding:8px 12px;
color:#444;
font-weight:600;
">

Prioridad

</td>

<td style="
padding:8px 12px;
color:#1a1a2e;
">

${prioridad}

</td>

</tr>


<tr style="background:#f4f7fb">

<td style="
padding:8px 12px;
color:#444;
font-weight:600;
">

Asunto

</td>

<td style="
padding:8px 12px;
color:#1a1a2e;
">

${asuntoTicket}

</td>

</tr>


</table>


<p>

<b>Conserva este folio</b>,
ya que será la referencia principal
para cualquier seguimiento.

</p>


<p>

Nuestro equipo revisará tu caso
y te mantendremos informado.

</p>


<p>

También recibirás notificaciones cuando:

</p>


<ul>

<li>
Se agreguen comentarios importantes.
</li>

<li>
Existan actualizaciones relevantes.
</li>

<li>
Tu ticket sea resuelto o cerrado.
</li>

</ul>


<p>

Si deseas agregar información adicional,
simplemente responde este correo.

</p>


<p>

Gracias por confiar en <b>ARATECH</b>.

</p>


<p>

Estamos para servirte.

</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarCreacionTicket", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);

// ============================================================
// NOTIFICACIÓN — Nueva evidencia agregada
// ============================================================

exports.notificarEvidencia = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { correo, cliente, folio } = request.data;

    if (!correo) {
      return {
        ok: false,
        razon: "SIN_CORREO",
      };
    }

    const asunto = "Nueva evidencia agregada | " + folio + " | ARATECH";

    const cuerpo = `

<p>

Hola <b>${cliente}</b>,

</p>


<p>

Se ha agregado nueva evidencia
relacionada con tu servicio.

</p>


<table
style="
width:100%;
border-collapse:collapse;
margin:16px 0;
font-size:13px;
">

<tr style="background:#102a43">

<td style="
padding:8px 12px;
color:#75d0fa;
font-weight:600;
">

Folio

</td>


<td style="
padding:8px 12px;
color:#fff;
">

<b>${folio}</b>

</td>

</tr>

</table>


<p>

Hemos agregado nueva evidencia
relacionada con tu servicio.

</p>


<p>

Gracias por confiar en <b>ARATECH</b>.

</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: correo,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("notificarEvidencia", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);

// ============================================================
// ALERTA INTERNA — Inventario bajo
// ============================================================

exports.alertaInventarioBajo = onCall(
  {
    secrets: [ZOHO_SMTP_PASSWORD],
  },
  async (request) => {
    const { producto, stock, minimo } = request.data;

    const asunto = "⚠️ ARATECH — Inventario bajo: " + producto;

    const cuerpo = `

<p>

El producto
<b>${producto}</b>
cuenta con solo

<b>${stock} unidades</b>

en stock.

</p>


<p>

Se encuentra por debajo del mínimo establecido de:

<b>${minimo} unidades</b>

</p>


<p>

Se recomienda reabastecer a la brevedad.

</p>

`;

    const html = plantillaCorreo(asunto, cuerpo);

    try {
      return await enviarCorreo({
        para: CORREO_ARATECH,

        asunto,

        html,
      });
    } catch (error) {
      LOG.error("alertaInventarioBajo", {
        error: error.message,
      });

      return {
        ok: false,

        error: error.message,
      };
    }
  },
);
