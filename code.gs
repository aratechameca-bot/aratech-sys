// ============================================================
// ARATECH — Google Apps Script v7.0
// Sheets + Drive + Notificaciones + Cotizaciones + Gastos + Accesos
// ============================================================

const SHEET_ID = '18HMpHRNu1H9fZ9YRfklrjDkiwkyC3u5QN5Nlpz6-Q00';
const DRIVE_FOLDER_NAME = 'ARATECH Evidencias';
const DRIVE_GASTOS_FOLDER = 'ARATECH Gastos';
const DRIVE_FOLDER_TICKETS = 'ARATECH Tickets';
const CORREO_ARATECH = 'aratechameca@gmail.com';
const TEL_ARATECH = '375 690 5296';
const DIR_ARATECH = 'Allende 246, Col. Obrera, Ameca, Jalisco';
const IG_ARATECH = '@aratechameca';

const SHEETS = {
  ordenes:        'Ordenes',
  clientes:       'Clientes',
  ventas:         'Ventas',
  inventario:     'Inventario',
  garantias:      'Garantias',
  segs:           'Seguimientos',
  cat:            'Catalogo',
  config:         'Config',
  folios:         'Folios',
  proveedores:    'Proveedores',
  ordenes_compra: 'OrdenesCompra',
  cotizaciones:   'Cotizaciones',  // v5.0
  gastos:         'Gastos',        // v6.0
  tickets:          'Tickets',          // v13.0
  ticketcomentarios:'TicketComentarios',  // v13.0
  ticketarchivos:   'TicketArchivos',     // v13.0   
  ticketconceptos:  'TicketConceptos',      // v13.0
  ordenevidencias:  'OrdenEvidencias',      // v19.4
  accesos:        'Accesos',        // v7.0
  clientes_portal: 'ClientesPortal',
  codigos_acceso: 'CodigosAcceso'
};

const EQUIPOS_MANTENIMIENTO = ['Laptop', 'PC escritorio', 'Mac', 'iMac', 'Todo en uno', 'Impresora'];

// ============================================================
// ENTRADA PRINCIPAL
// ============================================================
function doGet(e) {
  const action = e.parameter.action;
  if (action) {
    try {
      let result;
      const collection = e.parameter.collection;
      const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : null;
      const id = e.parameter.id;

      if      (action === 'getAll')             result = getAll(collection);
      else if (action === 'save')               result = saveRecord(collection, payload);
      else if (action === 'insert')             result = saveRecord(collection, payload);
      else if (action === 'update')             result = updateRecord(collection, id, payload);
      else if (action === 'delete')             result = deleteRecord(collection, id);
      else if (action === 'getConfig')          result = getConfig();
      else if (action === 'setConfig')          result = setConfig(payload);
      else if (action === 'getFolio')           result = getFolio(payload.prefix);
      else if (action === 'importAll')          result = importAll(payload);
      else if (action === 'subirFoto')          result = subirFoto(collection, payload);
      else if (action === 'subirTicketFile')    result = subirTicketFile(collection, payload);
      else if (action === 'obtenerFotos')       result = obtenerFotos(collection);
      else if (action === 'eliminarFoto')       result = eliminarFoto(id);
      else if (action === 'eliminarFotoLogica') result = eliminarFotoLogica(payload.fotoId, payload.usuario);
      else if (action === 'notificarEstado')    result = notificarCambioEstado(payload);
      else if (action === 'notificarRecepcion') result = notificarRecepcion(payload);
      else if (action === 'notificarComentarioTicket') result = notificarComentarioTicket(payload);
      else if (action === 'notificarEstadoTicket') result = notificarEstadoTicket(payload);
      else if (action === 'notificarCreacionTicket') result = notificarCreacionTicket(payload);
      else if (action === 'notificarEvidencia') result = notificarEvidencia(payload);
      else if (action === 'alertaInventario')   result = alertaInventarioBajo(payload);
      else if (action === 'loginCliente') result = loginCliente(e);
      else if (action === 'getDashboardCliente') result = getDashboardCliente(e);
      else if (action === 'getServiciosCliente') result = getServiciosCliente(e);
      else if (action === 'getDetalleServicio') result = getDetalleServicio(e);
      else if (action === 'getTicketsCliente') result = getTicketsCliente(e);
      else if (action === 'getDetalleTicket') result = getDetalleTicket(e);
      else if (action === 'getArchivosTicket') result = getArchivosTicket(e);
      else if (action === 'getComentariosTicket') result = getComentariosTicket(e);
      else if (action === 'crearTicketPortal') result = crearTicketPortal(e);
      else if (action === 'getPuedeComentarTicket') result = getPuedeComentarTicket(e);
      else if (action === 'guardarComentarioCliente') result = guardarComentarioCliente(e);
      else if (action === 'guardarArchivoCliente') result = guardarArchivoCliente(e);
      else if(action === 'getGarantiasCliente') result = getGarantiasCliente(e);
      else if(action === 'getVentasCliente') result = getVentasCliente(e);
      else result = { error: 'Acción no reconocida: ' + action };

      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ARATECH API activa ✓', version: '7.0' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, collection, payload, id } = data;
    let result;
    if      (action === 'getAll')             result = getAll(collection);
    else if (action === 'save')               result = saveRecord(collection, payload);
    else if (action === 'insert')             result = saveRecord(collection, payload);
    else if (action === 'update')             result = updateRecord(collection, id, payload);
    else if (action === 'delete')             result = deleteRecord(collection, id);
    else if (action === 'getConfig')          result = getConfig();
    else if (action === 'setConfig')          result = setConfig(payload);
    else if (action === 'getFolio')           result = getFolio(payload.prefix);
    else if (action === 'importAll')          result = importAll(payload);
    else if (action === 'subirFoto')          result = subirFoto(collection, payload);
    else if (action === 'subirTicketFile')    result = subirTicketFile(collection, payload);
    else if (action === 'obtenerFotos')       result = obtenerFotos(collection);
    else if (action === 'eliminarFoto')       result = eliminarFoto(id);
    else if (action === 'eliminarFotoLogica') result = eliminarFotoLogica(payload.fotoId, payload.usuario);
    else if (action === 'notificarEstado')    result = notificarCambioEstado(payload);
    else if (action === 'notificarRecepcion') result = notificarRecepcion(payload);
    else if (action === 'notificarComentarioTicket') result = notificarComentarioTicket(payload);
    else if (action === 'notificarEstadoTicket') result = notificarEstadoTicket(payload);
    else if (action === 'notificarCreacionTicket') result = notificarCreacionTicket(payload);
    else if (action === 'notificarEvidencia') result = notificarEvidencia(payload);
    else if (action === 'alertaInventario')   result = alertaInventarioBajo(payload);
    else if (action === 'loginCliente') result = loginCliente(e);
    else if (action === 'getDashboardCliente') result = getDashboardCliente(e);
    else if (action === 'getServiciosCliente') result = getServiciosCliente(e);
    else if (action === 'getDetalleServicio') result = getDetalleServicio(e);
    else if (action === 'getTicketsCliente') result = getTicketsCliente(e);
    else if (action === 'getDetalleTicket') result = getDetalleTicket(e);
    else if (action === 'getComentariosTicket') result = getComentariosTicket(e);
    else if (action === 'getArchivosTicket') result = getArchivosTicket(e);
    else if (action === 'crearTicketPortal') result = crearTicketPortal(e);
    else if (action === 'getPuedeComentarTicket') result = getPuedeComentarTicket(e);
    else if (action === 'guardarComentarioCliente') result = guardarComentarioCliente(e);
    else if (action === 'guardarArchivoCliente') result = guardarArchivoCliente(e);
    else if(action === 'getGarantiasCliente') result = getGarantiasCliente(e);
    else if(action === 'getVentasCliente') result = getVentasCliente(e);
    else result = { error: 'Acción no reconocida: ' + action };
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// PLANTILLA BASE DE CORREO HTML
// ============================================================
function plantillaCorreo(titulo, cuerpo) {

  return `<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light dark">

<style>

body{
  margin:0;
  padding:0;
  background-color:#e8edf2;
  font-family:Arial,Helvetica,sans-serif;
}

@media(prefers-color-scheme:dark){

  body{
    background-color:#0b1e2d!important;
  }

  .card{
    background-color:#102a43!important;
  }

  .body-cell{
    background-color:#102a43!important;
  }

  .body-text{
    color:#e0e8f0!important;
  }

  .caja{
    background-color:#0d2235!important;
  }

  .caja-text{
    color:#a0c4d8!important;
  }

  .caja-bold{
    color:#75d0fa!important;
  }

}

</style>

</head>

<body>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#e8edf2;
    padding:30px 0;
  ">

<tr>
<td align="center">

<table
  width="560"
  class="card"
  cellpadding="0"
  cellspacing="0"
  style="
    background-color:#ffffff;
    border-radius:16px;
    overflow:hidden;
    max-width:560px;
  ">

  <!-- HEADER -->

  <tr>

    <td
      style="
        background:linear-gradient(
          135deg,
          #0b1e2d,
          #102a43,
          #1a3a5c
        );
        padding:32px;
        text-align:center;
      ">

      <img
        src="https://i.imgur.com/DZw2jSj.png"
        alt="ARATECH"
        style="
          display:block;
          margin:0 auto;
          max-width:320px;
          width:100%;
          height:auto;
          border:0;
        ">

    </td>

  </tr>

  <!-- CUERPO -->

  <tr>

    <td
      class="body-cell"
      style="
        padding:36px 32px;
        background-color:#ffffff;
      ">

      <div
        class="body-text"
        style="
          font-size:14px;
          line-height:1.9;
          color:#1a1a2e;
        ">

        ${cuerpo}

      </div>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="margin:24px 0">

        <tr>

          <td
            style="
              height:2px;
              background:linear-gradient(
                90deg,
                #102a43,
                #75d0fa,
                #102a43
              );
            ">

            &nbsp;

          </td>

        </tr>

      </table>

      <!-- CONTACTO -->

      <table
        width="100%"
        class="caja"
        cellpadding="0"
        cellspacing="0"
        style="
          background-color:#f0f4f8;
          border-radius:10px;
          border-left:3px solid #75d0fa;
        ">

        <tr>

          <td style="padding:18px 22px">

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                Llámanos al

              <a
                href="tel:+523756905296"
                style="
                  color:#ffffff;
                  font-weight:bold;
                  text-decoration:none;
                ">

                ${TEL_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                WhatsApp

              <a
                href="https://wa.me/523756905296"
                style="
                  color:#ffffff;
                  font-weight:bold;
                  text-decoration:none;
                ">

                ${TEL_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0 0 8px;
              ">

                Correo

              <a
                href="mailto:${CORREO_ARATECH}"
                style="
                  color:#ffffff;
                  font-weight:bold;
                  text-decoration:none;
                ">

                ${CORREO_ARATECH}

              </a>

            </p>

            <p
              class="caja-text"
              style="
                font-size:13px;
                color:#444;
                margin:0;
              ">

                Instagram

              <a
                href="https://www.instagram.com/aratechameca/"
                style="
                  color:#ffffff;
                  font-weight:bold;
                  text-decoration:none;
                ">

                @aratechameca

              </a>

            </p>

          </td>

        </tr>

      </table>

    </td>

  </tr>

  <!-- FOOTER -->

  <tr>

    <td
      style="
        background-color:#0b1e2d;
        padding:20px 32px;
        text-align:center;
      ">

      <p
        style="
          font-size:10px;
          color:rgba(255,255,255,0.45);
          margin:0;
          letter-spacing:0.5px;
          line-height:1.8;
        ">

        ${DIR_ARATECH}
        &nbsp;&nbsp;•&nbsp;&nbsp;
        ${CORREO_ARATECH}

      </p>

    </td>

  </tr>

</table>

</td>
</tr>

</table>

</body>
</html>`;

}

// ============================================================
// NOTIFICACIONES AL CLIENTE — Cambio de estado
// ============================================================
function notificarCambioEstado(payload) {
  try {
    const { correo, nombre, equipo, modelo, estado, folio } = payload;
    if (!correo) return { ok: false, razon: 'Sin correo del cliente' };
    let asunto, cuerpo;
    if (estado === 'Listo' || estado === 'Listo para entrega') {
      asunto = '¡Tu equipo está listo! — ARATECH';
      cuerpo = `<p>Hola <b>${nombre}</b>, ¡buenas noticias! Tu <b>${equipo} ${modelo}</b> ya está listo para ser recogido. Pasa a visitarnos en <b>${DIR_ARATECH}</b>.</p>
        <p>Recuerda que equipos no reclamados después de <b>30 días</b> generan cargo de almacenaje y, pasados <b>60 días</b>, el equipo podrá ser dispuesto.</p>
        <p>¿Necesitas coordinar tu visita? Con gusto te atendemos:</p>`;
    } else {
      asunto = 'Tu equipo en ARATECH — Actualización de servicio';
      cuerpo = `<p>Hola <b>${nombre}</b>, te informamos que tu <b>${equipo} ${modelo}</b> ha cambiado al estado <b>${estado}</b>.</p>
        <p>Si tienes alguna duda, estamos a tu disposición:</p>`;
    }
    GmailApp.sendEmail(correo, asunto, '', { htmlBody: plantillaCorreo(asunto, cuerpo), name: 'ARATECH', replyTo: CORREO_ARATECH });
    return { ok: true };
  } catch(e) {
    return { error: e.toString() };
  }
}

// ============================================================
// NOTIFICACIÓN — Confirmación de recepción de equipo
// ============================================================
function notificarRecepcion(payload) {
  try {
    const { correo, nombre, folio, equipo, modelo, servicios, fechaProm } = payload;
    if (!correo) return { ok: false, razon: 'Sin correo' };
    const asunto = 'Recibimos tu equipo — ' + folio + ' | ARATECH';
    const fechaStr = fechaProm ? new Date(fechaProm + 'T12:00').toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}) : 'Por confirmar';
    const cuerpo = `<p>Hola <b>${nombre}</b>, hemos recibido tu <b>${equipo}${modelo?' '+modelo:''}</b> en nuestro taller.</p>
      <p>A continuación el detalle de tu servicio:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
        <tr style="background:#102a43"><td style="padding:8px 12px;color:#75d0fa;font-weight:600">Folio</td><td style="padding:8px 12px;color:#fff"><b>${folio}</b></td></tr>
        <tr style="background:#f4f7fb"><td style="padding:8px 12px;color:#444;font-weight:600">Equipo</td><td style="padding:8px 12px;color:#1a1a2e">${equipo}${modelo?' '+modelo:''}</td></tr>
        <tr><td style="padding:8px 12px;color:#444;font-weight:600">Servicio(s)</td><td style="padding:8px 12px;color:#1a1a2e">${servicios}</td></tr>
        <tr style="background:#f4f7fb"><td style="padding:8px 12px;color:#444;font-weight:600">Entrega estimada</td><td style="padding:8px 12px;color:#1a1a2e"><b>${fechaStr}</b></td></tr>
      </table>
      <p>Te notificaremos cuando tu equipo esté listo. Si tienes alguna duda:</p>`;
    GmailApp.sendEmail(correo, asunto, '', { htmlBody: plantillaCorreo(asunto, cuerpo), name: 'ARATECH', replyTo: CORREO_ARATECH });
    return { ok: true };
  } catch(e) {
    return { error: e.toString() };
  }
}

// ============================================================
// NOTIFICACIÓN — Notificación de comentario ticket
// ============================================================
function notificarComentarioTicket(payload) {

  try {

    const {
      correo,
      cliente,
      folio,
      comentario,
      estado
    } = payload;

    if(!correo){

      return {
        ok:false,
        razon:'Sin correo'
      };

    }

    const asunto =
      'Actualización de ticket ' +
      folio +
      ' | ARATECH';

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
            Estado
          </td>

          <td style="
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

      <div style="
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

    GmailApp.sendEmail(
      correo,
      asunto,
      '',
      {
        htmlBody:
          plantillaCorreo(
            asunto,
            cuerpo
          ),
        name:'ARATECH',
        replyTo:CORREO_ARATECH
      }
    );

    return { ok:true };

  } catch(e){

    return {
      error:e.toString()
    };

  }

}

// ============================================================
// NOTIFICACIÓN — Cambio de estado ticket
// ============================================================
function notificarEstadoTicket(payload) {

  try {

    const {
      correo,
      cliente,
      folio,
      estado
    } = payload;

    if(!correo){

      return {
        ok:false,
        razon:'Sin correo'
      };

    }

    const asunto =
      'Estado actualizado: ' +
      folio +
      ' | ARATECH';

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

    GmailApp.sendEmail(
      correo,
      asunto,
      '',
      {
        htmlBody:
          plantillaCorreo(
            asunto,
            cuerpo
          ),
        name:'ARATECH',
        replyTo:CORREO_ARATECH
      }
    );

    return { ok:true };

  } catch(e){

    return {
      error:e.toString()
    };

  }

}

// ============================================================
// NOTIFICACIÓN — Recepción de ticket
// ============================================================
function notificarCreacionTicket(payload) {

try {

const {
  correo,
  cliente,
  folio,
  asuntoTicket,
  prioridad,
  estado
} = payload;

if(!correo){

  return {
    ok:false,
    razon:'Sin correo'
  };

}

const asunto =
  'Tu ticket ha sido registrado | ' +
  folio;

const cuerpo = `

  <p>

    Hola <b>${cliente}</b>,

  </p>

  <p>

    Gracias por contactar a <b>ARATECH</b>.

  </p>

  <p>

    Hemos recibido tu solicitud y ya fue registrada en nuestro sistema de atención.

  </p>

  <p>

    A partir de este momento podremos dar seguimiento a tu caso mediante el siguiente folio:

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

    <tr style="background:#ffffff">

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

    <b>Conserva este folio</b>, ya que será la referencia principal para cualquier seguimiento relacionado con tu solicitud.

  </p>

  <p>

    Nuestro equipo revisará tu caso y te mantendremos informado sobre cualquier avance mediante este mismo correo.

  </p>

  <p>

    También recibirás notificaciones automáticas cuando:

  </p>

  <ul>

    <li>Se agreguen comentarios importantes.</li>

    <li>Existan actualizaciones relevantes.</li>

    <li>Tu ticket sea resuelto o cerrado.</li>

  </ul>

  <p>

    Si deseas agregar información adicional, simplemente responde este correo y nuestro equipo podrá revisarla.

  </p>

  <p>

    Gracias por confiar en <b>ARATECH</b>.

  </p>

  <p>

    Estamos para servirte.

  </p>

`;

  GmailApp.sendEmail(
    correo,
    asunto,
    '',
    {
      htmlBody:
        plantillaCorreo(
          asunto,
          cuerpo
        ),
      name:'ARATECH',
      replyTo:CORREO_ARATECH
    }
  );
      return { ok:true };

    } catch(e){

      return {
        error:e.toString()
      };

  }

}

// ============================================================
// NOTIFICACIÓN - Cambio estado de ticket
// ============================================================
function notificarEvidencia(payload) {

  try {

    const {
      correo,
      cliente,
      folio
    } = payload;

    if (!correo) {

      return {
        ok: false,
        razon: 'Sin correo'
      };

    }

    const asunto =
      'Nueva evidencia agregada | ' +
      folio +
      ' | ARATECH';

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

        Gracias por confiar en ARATECH.

      </p>

    `;

    GmailApp.sendEmail(
      correo,
      asunto,
      '',
      {
        htmlBody:
          plantillaCorreo(
            asunto,
            cuerpo
          ),
        name: 'ARATECH',
        replyTo: CORREO_ARATECH
      }
    );

    return { ok: true };

  } catch (e) {

    return {
      error: e.toString()
    };

  }

}

// ============================================================
// ALERTA INTERNA — Inventario bajo
// ============================================================
function alertaInventarioBajo(payload) {
  try {
    const { producto, stock, minimo } = payload;
    const asunto = '⚠️ ARATECH — Inventario bajo: ' + producto;
    const cuerpo = `<p>El producto <b>${producto}</b> cuenta con solo <b>${stock} unidades</b> en stock, por debajo del mínimo establecido de <b>${minimo} unidades</b>.</p>
      <p>Se recomienda reabastecer a la brevedad.</p>`;
    GmailApp.sendEmail(CORREO_ARATECH, asunto, '', { htmlBody: plantillaCorreo(asunto, cuerpo), name: 'ARATECH Sistema' });
    return { ok: true };
  } catch(e) {
    return { error: e.toString() };
  }
}

// ============================================================
// REVISIÓN DIARIA — Trigger automático 9am
// ============================================================
function revisionDiaria() {
  const hoy = new Date();
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // 1. Recordatorio de recoger equipo (más de 7 días listo sin entregar)
  const ordSheet = ss.getSheetByName(SHEETS.ordenes);
  if (ordSheet && ordSheet.getLastRow() > 1) {
    const ords = ordSheet.getDataRange().getValues();
    const headers = ords[0];
    const iEstado = headers.indexOf('estado');
    const iFechaEnt = headers.indexOf('fecha_entrega');
    const iNombre = headers.indexOf('cliente_nombre');
    const iEquipo = headers.indexOf('tipo_equipo');
    const iModelo = headers.indexOf('modelo');

    for (let i = 1; i < ords.length; i++) {
      const row = ords[i];
      const estado = row[iEstado];
      if (estado !== 'Listo' && estado !== 'Listo para entrega') continue;
      const fechaEnt = new Date(row[iFechaEnt]);
      if (isNaN(fechaEnt)) continue;
      const dias = Math.floor((hoy - fechaEnt) / 86400000);
      if (dias < 7) continue;
      const clienteNombre = row[iNombre];
      const correo = buscarCorreoCliente(clienteNombre, ss);
      if (!correo) continue;
      const equipo = row[iEquipo];
      const modelo = row[iModelo];
      const asunto = 'Tu equipo te está esperando — ARATECH';
      const cuerpo = `<p>Hola <b>${clienteNombre}</b>, te recordamos que tu <b>${equipo} ${modelo}</b> lleva <b>${dias} días</b> listo y esperándote en <b>ARATECH</b>.</p>
        <p>Te pedimos pasar a recogerlo a la brevedad para evitar cargos de almacenaje. Encuéntranos en <b>${DIR_ARATECH}</b>.</p>`;
      GmailApp.sendEmail(correo, asunto, '', { htmlBody: plantillaCorreo(asunto, cuerpo), name: 'ARATECH', replyTo: CORREO_ARATECH });
    }
  }

  // 2. Garantías próximas a vencer (7 días) y vencidas hoy
  const garSheet = ss.getSheetByName(SHEETS.garantias);
  if (garSheet && garSheet.getLastRow() > 1) {
    const gars = garSheet.getDataRange().getValues();
    const gh = gars[0];
    const giFechaGar = gh.indexOf('fecha_gar');
    const giNombre = gh.indexOf('cliente_nombre');
    const giEquipo = gh.indexOf('tipo_equipo');
    const giModelo = gh.indexOf('modelo');
    const giServicio = gh.indexOf('servicio');
    const giEstado = gh.indexOf('estado');

    for (let i = 1; i < gars.length; i++) {
      const row = gars[i];
      if (row[giEstado] !== 'Activa') continue;
      const fechaGar = new Date(row[giFechaGar]);
      if (isNaN(fechaGar)) continue;
      const diasRestantes = Math.floor((fechaGar - hoy) / 86400000);
      const nombre = row[giNombre];
      const equipo = row[giEquipo];
      const modelo = row[giModelo];
      const servicio = row[giServicio];
      const fechaStr = fechaGar.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
      const correo = buscarCorreoCliente(nombre, ss);

      if (diasRestantes === 7) {
        const asuntoInt = '⚠️ ARATECH — Garantía próxima a vencer';
        const cuerpoInt = `<p>La garantía de <b>${nombre}</b> por el servicio de <b>${servicio}</b> en <b>${equipo} ${modelo}</b> vence el <b>${fechaStr}</b>, en <b>7 días</b>.</p>`;
        GmailApp.sendEmail(CORREO_ARATECH, asuntoInt, '', { htmlBody: plantillaCorreo(asuntoInt, cuerpoInt), name: 'ARATECH Sistema' });
        if (correo) {
          const asuntoCli = 'Tu garantía ARATECH está por vencer';
          const cuerpoCli = `<p>Hola <b>${nombre}</b>, te recordamos que la garantía de tu <b>${equipo} ${modelo}</b> por el servicio de <b>${servicio}</b> vence el <b>${fechaStr}</b>, en tan solo <b>7 días</b>.</p>
            <p>Si presentas algún inconveniente antes de esa fecha, no dudes en contactarnos:</p>`;
          GmailApp.sendEmail(correo, asuntoCli, '', { htmlBody: plantillaCorreo(asuntoCli, cuerpoCli), name: 'ARATECH', replyTo: CORREO_ARATECH });
        }
      }

      if (diasRestantes === 0) {
        if (correo) {
          const asuntoVen = 'Tu garantía ARATECH ha concluido';
          const cuerpoVen = `<p>Hola <b>${nombre}</b>, te informamos que la garantía de tu <b>${equipo} ${modelo}</b> por el servicio de <b>${servicio}</b> concluyó el día de hoy.</p>
            <p>Fue un placer atenderte. Si en el futuro necesitas asistencia técnica, recuerda que en <b>ARATECH</b> siempre estaremos para ayudarte:</p>`;
          GmailApp.sendEmail(correo, asuntoVen, '', { htmlBody: plantillaCorreo(asuntoVen, cuerpoVen), name: 'ARATECH', replyTo: CORREO_ARATECH });
          if (EQUIPOS_MANTENIMIENTO.some(e => equipo.toLowerCase().includes(e.toLowerCase()))) {
            const asuntoMant = '🎁 Tu mantenimiento preventivo gratuito está disponible — ARATECH';
            const cuerpoMant = `<p>Hola <b>${nombre}</b>, al concluir la garantía de tu <b>${equipo} ${modelo}</b>, te corresponde tu <b>primer mantenimiento preventivo gratuito</b>, incluido por <b>ARATECH</b> como parte de nuestro compromiso contigo.</p>
              <p>¡No dejes pasar esta oportunidad de mantener tu equipo en óptimas condiciones! Agenda tu cita:</p>`;
            GmailApp.sendEmail(correo, asuntoMant, '', { htmlBody: plantillaCorreo(asuntoMant, cuerpoMant), name: 'ARATECH', replyTo: CORREO_ARATECH });
          }
        }
        garSheet.getRange(i + 1, gh.indexOf('estado') + 1).setValue('Vencida');
      }
    }
  }

  // 3. Órdenes sin avance (más de 3 días sin cambio de estado)
  if (ordSheet && ordSheet.getLastRow() > 1) {
    const ords = ordSheet.getDataRange().getValues();
    const headers = ords[0];
    const iEstado = headers.indexOf('estado');
    const iHistorial = headers.indexOf('historial');
    const iNombre = headers.indexOf('cliente_nombre');
    const iId = headers.indexOf('id');
    const estadosActivos = ['Recibido', 'Diagnóstico', 'En proceso', 'Esperando refacción'];

    for (let i = 1; i < ords.length; i++) {
      const row = ords[i];
      if (!estadosActivos.includes(row[iEstado])) continue;
      let historial = row[iHistorial];
      if (typeof historial === 'string') { try { historial = JSON.parse(historial); } catch(e) { continue; } }
      if (!Array.isArray(historial) || !historial.length) continue;
      const ultimaFecha = new Date(historial[historial.length - 1].fecha);
      if (isNaN(ultimaFecha)) continue;
      const dias = Math.floor((hoy - ultimaFecha) / 86400000);
      if (dias < 3) continue;
      const asunto = '⚠️ ARATECH — Orden sin movimiento: ' + row[iId];
      const cuerpo = `<p>La orden <b>${row[iId]}</b> del cliente <b>${row[iNombre]}</b> lleva <b>${dias} días</b> sin cambio de estado.</p>
        <p>Estado actual: <b>${row[iEstado]}</b>. Se recomienda revisar y actualizar el avance a la brevedad.</p>`;
      GmailApp.sendEmail(CORREO_ARATECH, asunto, '', { htmlBody: plantillaCorreo(asunto, cuerpo), name: 'ARATECH Sistema' });
    }
  }

  // 4. Cotizaciones vencidas — marcar automáticamente
  cotizacionesVencidas(ss);

  Logger.log('Revisión diaria ARATECH v7.0 completada: ' + new Date().toLocaleString());
}

// ============================================================
// COTIZACIONES — Marcar vencidas automáticamente
// ============================================================
function cotizacionesVencidas(ss) {
  try {
    const sheet = ss.getSheetByName(SHEETS.cotizaciones);
    if (!sheet || sheet.getLastRow() <= 1) return;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const iEstado = headers.indexOf('estado');
    const iFecha  = headers.indexOf('fecha');
    const iHora   = headers.indexOf('hora');
    const ahora   = new Date();

    for (let i = 1; i < data.length; i++) {
      if (data[i][iEstado] !== 'Pendiente') continue;
      const fechaStr = data[i][iFecha];
      const horaStr  = data[i][iHora] || '00:00:00';
      const emision  = new Date(fechaStr + 'T' + horaStr);
      if (isNaN(emision)) continue;
      const diffHrs  = (ahora - emision) / (1000 * 60 * 60);
      if (diffHrs >= 72) {
        sheet.getRange(i + 1, iEstado + 1).setValue('Vencida');
      }
    }
  } catch(e) {
    Logger.log('Error en cotizacionesVencidas: ' + e.toString());
  }
}

// ============================================================
// HELPER — Buscar correo de un cliente por nombre
// ============================================================
function buscarCorreoCliente(nombre, ss) {
  const sheet = ss.getSheetByName(SHEETS.clientes);
  if (!sheet || sheet.getLastRow() <= 1) return null;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const iNombre = headers.indexOf('nombre');
  const iEmail  = headers.indexOf('email');
  for (let i = 1; i < data.length; i++) {
    if (data[i][iNombre] === nombre && data[i][iEmail]) return data[i][iEmail];
  }
  return null;
}

// ============================================================
// CONFIGURAR TRIGGERS — Ejecutar UNA SOLA VEZ
// ============================================================
function configurarTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('revisionDiaria')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
  SpreadsheetApp.getUi().alert('✅ Trigger diario configurado. La revisión correrá todos los días a las 9:00 AM.');
}

// ============================================================
// SHEETS — CRUD completo
// ============================================================
function getAll(collection) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetName = SHEETS[collection];
  if (!sheetName) return [];
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h === '') return;
      let val = row[i];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      obj[h] = val;
    });
    return obj;
  }).filter(r => (r.id && r.id !== '') || (r.nombre && r.nombre !== ''));
}

function saveRecord(collection, payload) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetName = SHEETS[collection];
  if (!sheetName) return { error: 'Colección no reconocida: ' + collection };
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: 'Hoja no encontrada: ' + sheetName };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Cotizaciones: conceptos legible + raw
  if (collection === 'cotizaciones' && payload.conceptos) {
    const arr = Array.isArray(payload.conceptos) ? payload.conceptos : [];
    payload.conceptos     = arr.map(c => `${c.desc} x${c.cant}`).join(', ');
    payload.conceptos_raw = JSON.stringify(arr);
  }

  const row = headers.map(h => {
    if (h === '') return '';
    const val = payload[h];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  });
  sheet.appendRow(row);
  return { ok: true, id: payload.id };
}

function updateRecord(collection, id, payload) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetName = SHEETS[collection];
  if (!sheetName) return { error: 'Colección no reconocida: ' + collection };

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: 'Hoja no encontrada' };

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  if (idCol === -1)
    return { error: 'Columna id no encontrada' };

  for (let i = 1; i < data.length; i++) {

    if (data[i][idCol] === id) {

      headers.forEach((h, j) => {

        if (h === '' || h === 'id') return;

        if (payload[h] !== undefined) {

          let val = payload[h];

          // Detectar fechas ISO y convertirlas a Date real
          if (
            typeof val === 'string' &&
            /^\d{4}-\d{2}-\d{2}T/.test(val)
          ) {
            val = new Date(val);
          }

          // Objetos/arrays siguen guardándose como JSON
          else if (
            typeof val === 'object' &&
            val !== null
          ) {
            val = JSON.stringify(val);
          }

          sheet
            .getRange(i + 1, j + 1)
            .setValue(val);

        }

      });

      return { ok: true, id };

    }

  }

  return { error: 'Registro no encontrado: ' + id };
}

function deleteRecord(collection, id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetName = SHEETS[collection];
  if (!sheetName) return { error: 'Colección no reconocida: ' + collection };
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { error: 'Hoja no encontrada' };
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  if (idCol === -1) return { error: 'Columna id no encontrada' };
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === id) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'No encontrado' };
}

function getConfig() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.config);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const cfg = {};
  data.forEach(row => { if (row[0]) cfg[row[0]] = row[1]; });
  return cfg;
}

function setConfig(payload) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.config);
  if (!sheet) return { error: 'Hoja Config no encontrada' };
  const lastRow = sheet.getLastRow();
  if (lastRow > 0) sheet.clearContents();
  const rows = Object.entries(payload).map(([k, v]) => [k, v]);
  if (rows.length > 0) sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  return { ok: true };
}

// Mapea cada prefijo a la hoja donde se almacenan sus folios,
// para poder calcular el consecutivo real y auto-repararse.
const FOLIO_PREFIX_COL = {
  AROS:  'ordenes',
  ARVTA: 'ventas',
  ARGAR: 'garantias',
  AROC:  'ordenes_compra',
  ARGAS: 'gastos',
  ARCOT: 'cotizaciones'
};

// Lee el número consecutivo más alto ya usado para un prefijo,
// escaneando los folios reales de su hoja (columna 'folio' o 'id').
function maxFolioReal(ss, prefix) {
  const col = FOLIO_PREFIX_COL[prefix];
  if (!col) return 0;
  const sheet = ss.getSheetByName(SHEETS[col]);
  if (!sheet || sheet.getLastRow() <= 1) return 0;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let idx = headers.indexOf('folio');
  if (idx === -1) idx = headers.indexOf('id');
  if (idx === -1) return 0;
  const re = new RegExp('^' + prefix + '-(\\d+)$', 'i');
  let max = 0;
  for (let i = 1; i < data.length; i++) {
    const m = String(data[i][idx] || '').match(re);
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
  }
  return max;
}

function getFolio(prefix) {
  const lock = LockService.getScriptLock();
  // Espera hasta 30s para evitar que dos solicitudes generen el mismo folio
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.folios);

    // Consecutivo real ya usado en la hoja de datos (auto-reparación)
    const realMax = maxFolioReal(ss, prefix);

    if (!sheet) {
      const next = realMax + 1;
      return prefix + '-' + String(next).padStart(4, '0');
    }

    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === prefix) {
        const stored = parseInt(data[i][1]) || 0;
        // Usa el mayor entre el contador guardado y el folio real existente.
        // Esto corrige desfases por ediciones manuales o restauración de backups.
        const next = Math.max(stored, realMax) + 1;
        sheet.getRange(i + 1, 2).setValue(next);
        SpreadsheetApp.flush();
        return prefix + '-' + String(next).padStart(4, '0');
      }
    }
    // Prefijo nuevo: arranca desde el folio real existente (si lo hubiera)
    const next = realMax + 1;
    sheet.appendRow([prefix, next]);
    SpreadsheetApp.flush();
    return prefix + '-' + String(next).padStart(4, '0');
  } finally {
    lock.releaseLock();
  }
}

function importAll(backup) {
  const collections = [
    'ordenes','clientes','ventas','inventario','garantias','segs','cat','proveedores','ordenes_compra','gastos',
'tickets','ticketcomentarios','ticketarchivos','ticketconceptos'
];
  const results = {};
  collections.forEach(col => {
    if (!backup[col] || !backup[col].length) { results[col] = 0; return; }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = SHEETS[col];
    if (!sheetName) return;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
    backup[col].forEach(record => saveRecord(col, record));
    results[col] = backup[col].length;
  });
  if (backup.config) setConfig(backup.config);
  return { ok: true, imported: results };
}

// ============================================================
// DRIVE — Fotos de evidencia (órdenes)
// ============================================================
function getFotosFolder(ordenId) {
  let mainFolder;
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) { mainFolder = folders.next(); }
  else { mainFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME); }
  const subFolders = mainFolder.getFoldersByName(ordenId);
  if (subFolders.hasNext()) return subFolders.next();
  return mainFolder.createFolder(ordenId);
}

// ============================================================
// DRIVE — Comprobantes de gastos
// ============================================================
function getGastosFolder(gastoId) {
  let mainFolder;
  const folders = DriveApp.getFoldersByName(DRIVE_GASTOS_FOLDER);
  if (folders.hasNext()) { mainFolder = folders.next(); }
  else { mainFolder = DriveApp.createFolder(DRIVE_GASTOS_FOLDER); }
  const subFolders = mainFolder.getFoldersByName(gastoId);
  if (subFolders.hasNext()) return subFolders.next();
  return mainFolder.createFolder(gastoId);
}

// ============================================================
// DRIVE — Tickets
// ============================================================
function getTicketsFolder(ticketId) {
  let mainFolder;
  const folders =DriveApp.getFoldersByName(DRIVE_FOLDER_TICKETS);
  if (folders.hasNext()) {mainFolder = folders.next();} 
  else { mainFolder = DriveApp.createFolder(DRIVE_FOLDER_TICKETS); }
  const subFolders = mainFolder.getFoldersByName(ticketId);
  if (subFolders.hasNext()) {return subFolders.next();
  }
  return mainFolder.createFolder(ticketId);
}

function subirFoto(coleccionOId, payload) {
  try {
    let folder;
    if (coleccionOId && coleccionOId.startsWith('GASTO_')) {
      const gastoId = coleccionOId.replace('GASTO_', '');
      folder = getGastosFolder(gastoId);
    } else {
      folder = getFotosFolder(coleccionOId);
    }
    const {nombre, base64, mimeType, usuario, email, visible_cliente} = payload;
    const bytes = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(bytes, mimeType, nombre);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const ss =
      SpreadsheetApp.openById(SHEET_ID);

    const sh =
      ss.getSheetByName(
        SHEETS.ordenevidencias
      );

    if (sh) {

      sh.appendRow([
        'OE-' + new Date().getTime(),
        coleccionOId,
        file.getId(),
        nombre,
        file.getUrl(),
        new Date(),
        usuario || email || '',
        false,
        '',
        '',
        visible_cliente === true
      ]);
}
    Logger.log(
    'EVIDENCIA REGISTRADA: ' +
    nombre
  );
    return { ok: true, id: file.getId(), url: file.getUrl() };
  } catch(e) { return { error: e.toString() }; }
}

function subirTicketFile(ticketId, payload) {

  try {

    const folder =
      getTicketsFolder(ticketId);

    const {
      nombre,
      base64,
      mimeType
    } = payload;

    const bytes =
      Utilities.base64Decode(base64);

    const blob =
      Utilities.newBlob(
        bytes,
        mimeType,
        nombre
      );

    const file =
      folder.createFile(blob);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    return {

      ok:true,

      id:file.getId(),

      nombre:file.getName(),

      url:file.getUrl()

    };

  } catch(e) {

    return {
      error:e.toString()
    };

  }

}

function obtenerFotos(ordenId) {

  try {

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sh =
      ss.getSheetByName(
        SHEETS.ordenevidencias
      );

    const data =
      sh.getDataRange().getValues();

    const headers =
      data[0];

    const colId =
      headers.indexOf('drive_file_id');

    const colOrden =
      headers.indexOf('orden_id');

    const colNombre =
      headers.indexOf('nombre');

    const colUrl =
      headers.indexOf('url');

    const colFecha =
      headers.indexOf('fecha');

    const colUsuario =
      headers.indexOf('usuario');

    const colEliminada =
      headers.indexOf('eliminada');

    const colVisible =
      headers.indexOf('visible_cliente');

    const fotos = [];

    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      const row =
        data[i];

      if (
        String(
          row[colOrden]
        ) !== String(ordenId)
      ) {
        continue;
      }

      if (
        String(
          row[colEliminada]
        ).toUpperCase() === 'TRUE'
      ) {
        continue;
      }

      fotos.push({

        id:
          row[colId],

        nombre:
          row[colNombre],

        url:
          row[colUrl],

        fecha:
          row[colFecha],

        usuario:
          row[colUsuario],

        visible_cliente:
          row[colVisible] === true,

        thumbnail:
          'https://drive.google.com/thumbnail?id=' +
          row[colId] +
          '&sz=w200'

      });

    }

    return {
      fotos
    };

  } catch(e) {

    return {

      fotos: [],

      error:
        e.toString()

    };

  }

  }
function eliminarFoto(fotoId) {
  try {
    DriveApp.getFileById(fotoId).setTrashed(true);
    return { ok: true };
  } catch(e) { return { error: e.toString() }; }
}
// ============================================================
// DRIVE — No elimina foto
// ============================================================
function eliminarFotoLogica(fotoId, usuario) {

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(SHEETS.ordenevidencias);

  const data = sh.getDataRange().getValues();
  const headers = data[0];

  const colDrive =
    headers.indexOf('drive_file_id');

  const colEliminada =
    headers.indexOf('eliminada');

  const colFecha =
    headers.indexOf('fecha_eliminacion');

  const colUsuario =
    headers.indexOf('usuario_eliminacion');

  for (let i = 1; i < data.length; i++) {
    Logger.log(
    'DRIVE SHEET: ' +
    data[i][colDrive]
  );

Logger.log(
  'DRIVE RECIBIDO: ' +
  fotoId
);

    if (data[i][colDrive] === fotoId) {

      sh.getRange(i + 1, colEliminada + 1)
        .setValue(true);

      sh.getRange(i + 1, colFecha + 1)
        .setValue(new Date());

      sh.getRange(i + 1, colUsuario + 1)
        .setValue(usuario || '');

      return { ok: true };

    }

  }

  return { error: 'Foto no encontrada' };

}

// ============================================================
// LOGIN CLIENTES PORTAL
// ============================================================
// ============================================================
// LOGIN CLIENTES PORTAL
// ============================================================
function loginCliente(e) {

  try {

    const telefono =
      String(
        e.parameter.telefono || ''
      ).trim();

    const password =
      String(
        e.parameter.password || ''
      ).trim();

    if (!telefono || !password) {

      return {
        success: false,
        message: 'Datos incompletos'
      };

    }

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    // ========================================================
    // CLIENTES
    // ========================================================

    const clientesSheet =
      ss.getSheetByName(
        SHEETS.clientes
      );

    const clientes =
      clientesSheet
        .getDataRange()
        .getValues();

    const headers =
      clientes[0];

    const idxId =
      headers.indexOf('id');

    const idxNombre =
      headers.indexOf('nombre');

    const idxTel =
      headers.indexOf('tel');

    let cliente = null;

    for (
      let i = 1;
      i < clientes.length;
      i++
    ) {

      const tel =
        String(
          clientes[i][idxTel] || ''
        ).trim();

      if (tel === telefono) {

        cliente = {

          id:
            clientes[i][idxId],

          nombre:
            clientes[i][idxNombre],

          telefono:
            tel

        };

        break;

      }

    }

    if (!cliente) {

      return {

        success: false,

        message:
          'Cliente no encontrado'

      };

    }

    // ========================================================
    // CLIENTES PORTAL
    // ========================================================

    const portalSheet =
      ss.getSheetByName(
        SHEETS.clientes_portal
      );

    if (!portalSheet) {

      return {

        success: false,

        message:
          'Hoja ClientesPortal no encontrada'

      };

    }

    const portal =
      portalSheet
        .getDataRange()
        .getValues();

    let acceso = null;

    let accesoRow = -1;

    for (
      let i = 1;
      i < portal.length;
      i++
    ) {

      if (

        String(
          portal[i][0]
        ) ===

        String(
          cliente.id
        )

      ) {

        acceso =
          portal[i];

        accesoRow =
          i + 1;

        break;

      }

    }

    if (!acceso) {

      return {

        success: false,

        message:
          'Sin acceso al portal'

      };

    }

    const activo =
      String(
        acceso[1] || ''
      ).toUpperCase();

    const bloqueado =
      String(
        acceso[4] || ''
      ).toUpperCase();

    if (activo !== 'SI') {

      return {

        success: false,

        message:
          'Acceso desactivado'

      };

    }

    if (bloqueado === 'SI') {

      return {

        success: false,

        message:
          'Usuario bloqueado'

      };

    }

    // ========================================================
    // VALIDAR ÚLTIMOS 4 DÍGITOS
    // ========================================================

    const ultimos4 =
      cliente.telefono
        .slice(-4);

    if (
      ultimos4 !==
      password
    ) {

      return {

        success: false,

        message:
          'Contraseña incorrecta'

      };

    }

    // ========================================================
    // ACTUALIZAR ÚLTIMO ACCESO
    // ========================================================

    portalSheet
      .getRange(
        accesoRow,
        4
      )
      .setValue(
        new Date()
      );

    return {

      success: true,

      cliente_id:
        cliente.id,

      nombre:
        cliente.nombre,

      telefono:
        cliente.telefono

    };

  } catch (error) {

    return {

      success: false,

      message:
        error.toString()

    };

  }

}
/* ============================================================
   DASHBOARD CLIENTES PORTAL
============================================================ */
function getDashboardCliente(e) {

  try {

    const clienteId =
      String(
        e.parameter.cliente_id || ''
      ).trim();

    if (!clienteId) {

      return {
        success:false,
        message:'Cliente no especificado'
      };

    }

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const ventas =
      ss.getSheetByName(
        SHEETS.ventas
      )
      .getDataRange()
      .getValues();

    const ordenes =
      ss.getSheetByName(
        SHEETS.ordenes
      )
      .getDataRange()
      .getValues();

    const tickets =
      ss.getSheetByName(
        SHEETS.tickets
      )
      .getDataRange()
      .getValues();

    let totalCompras = 0;
    let totalServicios = 0;
    let totalTickets = 0;

    for(let i=1;i<ventas.length;i++){

      if(
        String(ventas[i][2]) === clienteId
      ){
        totalCompras++;
      }

    }

    for(let i=1;i<ordenes.length;i++){

      if(
        String(ordenes[i][2]) === clienteId
      ){
        totalServicios++;
      }

    }

    for(let i=1;i<tickets.length;i++){

      if(
        String(tickets[i][3]) === clienteId
      ){
        totalTickets++;
      }

    }

    return {

      success:true,

      compras:
        totalCompras,

      servicios:
        totalServicios,

      tickets:
        totalTickets

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}
/* ============================================================
   SERVICIOS CLIENTES PORTAL
============================================================ */

function getServiciosCliente(e){

  try{

    const clienteId =
      String(
        e.parameter.cliente_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.ordenes
      );

    const data =
      sheet.getDataRange().getValues();

    const servicios = [];

    for(let i=1;i<data.length;i++){

      const row = data[i];

      if(String(row[2]) === clienteId){

        servicios.push({

          id: row[0],
          folio: row[1],
          equipo: row[5],
          modelo: row[6],
          estado: row[18],
          fecha: row[19],
          garantia: row[21]

        });

      }

    }

    return {

      success:true,
      servicios

    };

  }catch(error){

    return {

      success:false,
      message:error.toString()

    };

  }

}
/* ============================================================
   DETALLE SERVICIOS CLIENTES PORTAL
============================================================ */

function getDetalleServicio(e){

  try{

    const folio =
      String(
        e.parameter.folio || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.ordenes
      );

    const data =
      sheet.getDataRange().getValues();

    for(let i=1;i<data.length;i++){

      const row = data[i];

      if(String(row[1]) === folio){

        const shEvidencias =
          ss.getSheetByName(
            SHEETS.ordenevidencias
          );

        const evidencias = [];

        if (shEvidencias) {

          const evData =
            shEvidencias.getDataRange().getValues();

          const evHeaders =
            evData[0];

          const colOrden =
            evHeaders.indexOf('orden_id');

          const colNombre =
            evHeaders.indexOf('nombre');

          const colUrl =
            evHeaders.indexOf('url');

          const colId =
            evHeaders.indexOf('drive_file_id');

          const colVisible =
            evHeaders.indexOf('visible_cliente');

          const colEliminada =
            evHeaders.indexOf('eliminada');

          for (let j = 1; j < evData.length; j++) {

            const ev =
              evData[j];

            if (
              String(ev[colOrden]) === String(row[0]) &&
              String(ev[colEliminada]).toUpperCase() !== 'TRUE' &&
              ev[colVisible] === true
            ) {
            
              evidencias.push({

                nombre:
                  ev[colNombre],

                url:
                  ev[colUrl],

                fileId:
                  ev[colId]

              });

            }

          }

        }

        return {

          success:true,

          servicio:{
            id: row[0],
            folio: row[1],
            cliente_id: row[2],
            evidencias: evidencias,
            equipo: row[5],
            modelo: row[6],
            serie: row[7],
            problema: row[13],
            accesorios: row[14],
            estado: row[18],
            fecha: row[19],
            fechaEntrega: row[20],
            garantia: row[21],
            historial: row[23],
            tecnico: row[24],
            bitacora: row[25],
            diagnostico: row[26]
          }

        };

      }

    }

    return {
      success:false,
      message:'Servicio no encontrado'
    };

  } catch(error){

    return {
      success:false,
      message:error.toString()
    };

  }

}
// ============================================================
// Sacar tickets
// ============================================================
function getTicketsCliente(e) {

  try {

    const clienteId =
      String(
        e.parameter.cliente_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sh =
      ss.getSheetByName(
        SHEETS.tickets
      );

    const data =
      sh.getDataRange().getValues();

    const tickets = [];

    for (
      let i = 1;
      i < data.length;
      i++
    ) {

      const row =
        data[i];

      if (
        String(row[3]) === clienteId
      ) {

        tickets.push({

          id: row[0],

          folio: row[1],

          fecha: row[2],

          asunto: row[8],

          prioridad: row[10],

          estado: row[11],

          responsable: row[12],

          fecha_actualizacion:
            row[16]

        });

      }

    }

    return {

      success: true,

      tickets: tickets

    };

  } catch(error) {

    return {

      success: false,

      message:
        error.toString()

    };

  }

}

function getDetalleTicket(e){

  try{

    const ticketId =
      String(
        e.parameter.ticket_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.tickets
      );

    const data =
      sheet.getDataRange().getValues();

    for(let i=1;i<data.length;i++){

      const row = data[i];

      if(String(row[0]) === ticketId){

        return {

          success:true,

          ticket:{

            id: row[0],
            folio: row[1],
            fecha: row[2],
            cliente_id: row[3],
            cliente_nombre: row[4],
            asunto: row[8],
            descripcion: row[9],
            prioridad: row[10],
            estado: row[11],
            responsable: row[12],
            fecha_actualizacion: row[16]

          }

        };

      }

    }

    return {
      success:false,
      message:'Ticket no encontrado'
    };

  } catch(error){

    return {
      success:false,
      message:error.toString()
    };

  }

}

function getComentariosTicket(e){

  try{

    const ticketId =
      String(
        e.parameter.ticket_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sh =
      ss.getSheetByName(
        SHEETS.ticketcomentarios
      );

    const data =
      sh.getDataRange().getValues();

    const comentarios = [];

    for(let i=1;i<data.length;i++){

      const row = data[i];

      if(
        String(row[1]) === ticketId &&
        row[6] === true
      ){

        comentarios.push({

          id: row[0],
          fecha: row[2],
          fecha_hora: row[3],
          autor: row[4],
          comentario: row[5]

        });

      }

    }

    return {

      success:true,

      comentarios

    };

  } catch(error){

    return {

      success:false,

      message:error.toString()

    };

  }

}

function getArchivosTicket(e){

  try{

    const ticketId =
      String(
        e.parameter.ticket_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sh =
      ss.getSheetByName(
        SHEETS.ticketarchivos
      );

    const data =
      sh.getDataRange().getValues();

    const archivos = [];

    for(let i=1;i<data.length;i++){

      const row = data[i];

      if(

        String(row[1]) === ticketId &&

        String(row[5]).toUpperCase() === 'TRUE' &&

        String(row[8]).toUpperCase() !== 'TRUE'

      ){

        archivos.push({

          nombre:
            row[3],

          url:
            row[4]

        });

      }

    }

    return {

      success:true,

      archivos

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}

function crearTicketPortal(e){

  try{

    const payload =
      JSON.parse(
        e.postData.contents
      );

    const folio =
      getFolio('ARTK');

    const ticket = {

      id: folio,
      folio: folio,

      fecha:
  Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
    ),

      cliente_id:
        payload.cliente_id,

      cliente_nombre:
        payload.cliente_nombre,

      garantia_id:
        payload.garantia_id || '',

      capturado_por:
        'Portal Cliente',

      orden_id: '',
      orden_folio: '',

      asunto:
        payload.asunto,

      descripcion:
        payload.descripcion,

      prioridad:
        payload.prioridad || 'Media',

      estado:
        'Nuevo',

      responsable:
        'ARABOT',

      origen:
        'Portal Cliente',

      visible_cliente:
        true,

      notificar_cliente:
        true,

      fecha_ultima_actualizacion:
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
  ),

      fecha_cierre: '',

      venta_generada: false,
      venta_id: '',
      venta_folio: '',

      total_productos: 0,
      total_servicios: 0,
      total_ticket: 0

    };

    const resultado =
      saveRecord(
        'tickets',
        ticket
      );

    return {

      success:true,

      folio,

      resultado

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString(),

      stack:
        error.stack

    };

  }

}

function getPuedeComentarTicket(e){

  try{

    const ticketId =
      String(
        e.parameter.ticket_id || ''
      ).trim();

    if(!ticketId){

      return {
        success:false,
        puedeComentar:false
      };

    }

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.ticketcomentarios
      );

    const data =
      sheet
        .getDataRange()
        .getValues();

    const headers =
      data[0];

    const idxTicket =
      headers.indexOf(
        'ticket_id'
      );

    const idxAutorTipo =
      headers.indexOf(
        'autor_tipo'
      );

    const idxFechaHora =
      headers.indexOf(
        'fecha_hora'
      );

    const comentarios =
      [];

    for(
      let i = 1;
      i < data.length;
      i++
    ){

      if(
        String(
          data[i][idxTicket]
        ) === ticketId
      ){

        comentarios.push({

          autor_tipo:
            data[i][idxAutorTipo],

          fecha_hora:
            data[i][idxFechaHora]

        });

      }

    }

    if(
      comentarios.length === 0
    ){

      return {

        success:true,

        puedeComentar:true

      };

    }

    comentarios.sort(
      (a,b) =>
        String(a.fecha_hora)
          .localeCompare(
            String(b.fecha_hora)
          )
    );

    const ultimo =
      comentarios[
        comentarios.length - 1
      ];

    return {

      success:true,

      puedeComentar:
        ultimo.autor_tipo !==
        'CLIENTE',

      ultimoAutor:
        ultimo.autor_tipo

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}


function guardarComentarioCliente(e){

  try{

    const payload =
      JSON.parse(
        e.postData.contents
      );

    const permiso =
      getPuedeComentarTicket({

        parameter:{
          ticket_id:
            payload.ticket_id
        }

      });

    if(
      !permiso.puedeComentar
    ){

      return {

        success:false,

        message:
          'Debes esperar respuesta de ARATECH antes de enviar otro mensaje.'

      };

    }

    saveRecord(
      'ticketcomentarios',
      {

        id:
          'TC-' + Date.now(),

        ticket_id:
          payload.ticket_id,

        fecha:
          Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            'yyyy-MM-dd'
          ),

        fecha_hora:
          new Date().toISOString(),

        autor:
          payload.cliente_nombre,

        autor_tipo:
          'CLIENTE',

        comentario:
          payload.comentario,

        visible_cliente:
          true,

        notificar_cliente:
          false

      }
    );

    return {

      success:true

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}

function guardarArchivoCliente(e){

  try{

    const payload =
      JSON.parse(
        e.postData.contents
      );

    saveRecord(
      'ticketarchivos',
      {

        id:
          'TA-' + Date.now(),

        ticket_id:
          payload.ticket_id,

        fecha:
          Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            'yyyy-MM-dd'
          ),

        fecha_hora:
          new Date().toISOString(),

        nombre:
          payload.nombre,

        url:
          payload.url,

        visible_cliente:
          true,

        autor:
          payload.cliente_nombre,

        autor_tipo:
          'CLIENTE'

      }
    );

    saveRecord(
      'ticketcomentarios',
      {

        id:
          'TC-' + Date.now(),

        ticket_id:
          payload.ticket_id,

        fecha:
          Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            'yyyy-MM-dd'
          ),

        fecha_hora:
          new Date().toISOString(),

        autor:
          payload.cliente_nombre,

        autor_tipo:
          'CLIENTE',

        comentario:
          '📎 Evidencia agregada: ' +
          payload.nombre,

        visible_cliente:
          true,

        notificar_cliente:
          false

      }
    );

    return {
      success:true
    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}

function getGarantiasCliente(e){

  try{

    const clienteId =
      String(
        e.parameter.cliente_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.garantias
      );

    const data =
      sheet.getDataRange()
      .getValues();

    const headers =
      data[0];

    const idxCliente =
      headers.indexOf(
        'cliente_id'
      );

    const garantias =
      [];

    for(
      let i = 1;
      i < data.length;
      i++
    ){

      if(
        String(
          data[i][idxCliente]
        ) === clienteId
      ){

        const row = {};

        headers.forEach(
          (h,j) =>
            row[h] =
              data[i][j]
        );

        garantias.push(
          row
        );

      }

    }

    return {

      success:true,

      garantias

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}

function getVentasCliente(e){

  try{

    const clienteId =
      String(
        e.parameter.cliente_id || ''
      ).trim();

    const ss =
      SpreadsheetApp.openById(
        SHEET_ID
      );

    const sheet =
      ss.getSheetByName(
        SHEETS.ventas
      );

    const data =
      sheet.getDataRange()
      .getValues();

    const headers =
      data[0];

    const idxCliente =
      headers.indexOf(
        'cliente_id'
      );

    const ventas = [];

    for(
      let i = 1;
      i < data.length;
      i++
    ){

      if(
        String(
          data[i][idxCliente]
        ) === clienteId
      ){

        const row = {};

        headers.forEach(
          (h,j) =>
            row[h] =
              data[i][j]
        );

        ventas.push(
          row
        );

      }

    }

    return {

      success:true,

      ventas

    };

  } catch(error){

    return {

      success:false,

      message:
        error.toString()

    };

  }

}
// ============================================================
// CREAR ESTRUCTURA — Ejecutar UNA SOLA VEZ si se necesita
// ============================================================
function crearEstructura() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const estructura = {
    Ordenes: ['id','folio','cliente_id','cliente_nombre','tel','tipo_equipo','modelo','serie',
              'servicios','subtotal','descuento','total','anticipo','problema','accesorios',
              'estado_eq','fecha_prom','obs','estado','fecha','fecha_entrega','fecha_gar',
              'vtas_rel','historial','tecnico','bitacora'],
    Clientes: ['id','nombre','tel','email','origen','dir','notas','fecha','visitas','ultima_visita',
               'rfc','razonSocial','regimenFiscal','usoCFDI','metodoPago','formaPago',
               'direccionFiscal','emailFiscal','retieneIVA','retieneISR','regimenFiscalOtro'],
    Ventas: ['id','folio','cliente_id','cliente_nombre','fecha','lineas','subtotal',
             'iva_pct','iva_monto','descuento','total','pago','orden_rel','es_directa'],
    Inventario: ['id','sku','nombre','marca','cat','cond','stock','min','costo','precio',
                 'unidad','garantia_dias','proveedor','notas','fecha'],
    Garantias: ['id','folio','folio_ord','cliente_id','cliente_nombre','tipo_equipo','modelo',
            'serie','tel','servicio','fecha','fecha_gar','estado','garantia_dias'], 
    Seguimientos: ['id','cliente_id','cliente_nombre','folio','fdisp','tipo','fecha',
                   'notas','hecho','tel','es_mant'],
    Catalogo: ['nombre','precio','garantia','descripcion'],
    Config: [],
    Folios: ['prefix','contador'],
    Proveedores: ['id','nombre','tel','wa','email','dir','productos','notas',
                  'rfc','razonSocial','regimenFiscal','usoCFDI','metodoPago','formaPago',
                  'emailFiscal','direccionFiscal','retieneIVA','retieneISR','fecha'],
    OrdenesCompra: ['id','proveedorId','proveedorNombre','fecha','notas','lineas',
                    'subtotal','ivaTotal','total','estado','historial'],
    Cotizaciones: ['id','folio','fecha','hora','cliente','tel','email',
                   'conceptos','conceptos_raw','notas','subtotal','iva','total','estado'],
    Gastos: ['id','fecha','categoria','subcategoria','descripcion','monto',
             'metodo','referencia','comprobante_url','registrado_por'],
    Accesos: ['id','fecha','hora','usuario','email','accion']
  };

  Object.entries(estructura).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    if (headers.length > 0) {
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setValues([headers]);
      range.setFontWeight('bold').setBackground('#102a43').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });

  // Folios iniciales
  const folioSheet = ss.getSheetByName('Folios');
  folioSheet.getRange(1,1,1,2).setValues([['prefix','contador']]);
  folioSheet.getRange(1,1,1,2).setFontWeight('bold').setBackground('#102a43').setFontColor('#ffffff');
  folioSheet.getRange(2,1,6,2).setValues([
    ['AROS',  0],
    ['ARVTA', 0],
    ['ARGAR', 0],
    ['AROC',  0],
    ['ARCOT', 0],
    ['ARGAS', 0],
    ['ARTK',  0]
  ]);

  SpreadsheetApp.getUi().alert('✅ Estructura ARATECH v7.0 creada correctamente.');
}