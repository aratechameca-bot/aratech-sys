const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");
const FOLIOS = require("../lib/folios");
const { requireStaff } = require("../lib/auth");

exports.getTicketsCliente = onCall(async (request) => {
  try {
    const clienteId = String(request.data.cliente_id || "").trim();

    VALID.required(clienteId, "cliente_id");

    const snap = await db
      .collection("tickets")
      .where("cliente_id", "==", clienteId)
      .get();

    const tickets = snap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: d.id,
        folio: d.folio,
        fecha: d.fecha,
        asunto: d.asunto,
        prioridad: d.prioridad,
        estado: d.estado,
        responsable: d.responsable,
        fecha_actualizacion: d.fecha_actualizacion,
      };
    });

    return ok({
      tickets,
    });
  } catch (e) {
    LOG.error("getTicketsCliente", {
      error: e.message,
    });

    throw e;
  }
});

exports.getDetalleTicket = onCall(async (request) => {
  try {
    const ticketId = String(request.data.ticket_id || "").trim();

    VALID.required(ticketId, "ticket_id");

    const snap = await db.collection("tickets").doc(ticketId).get();

    if (!snap.exists) {
      ERR.notFound("TICKET_NOT_FOUND");
    }

    return ok({
      ticket: snap.data(),
    });
  } catch (e) {
    LOG.error("getDetalleTicket", {
      error: e.message,
    });

    throw e;
  }
});

exports.getComentariosTicket = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    try {
      const ticketId = String(request.data.ticket_id || "").trim();

      VALID.required(ticketId, "ticket_id");

      const snap = await db
        .collection("ticketcomentarios")
        .where("ticket_id", "==", ticketId)
        .where("visible_cliente", "==", true)
        .get();

      const comentarios = snap.docs
        .map((doc) => {
          const d = doc.data();

          return {
            id: d.id,
            fecha: d.fecha,
            fecha_hora: d.fecha_hora,
            autor: d.autor,
            comentario: d.comentario,
          };
        })
        .sort((a, b) =>
          String(a.fecha_hora).localeCompare(String(b.fecha_hora)),
        );

      return ok({
        comentarios,
      });
    } catch (e) {
      LOG.error("getComentariosTicket", {
        error: e.message,
      });

      throw e;
    }
  },
);

exports.getArchivosTicket = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    try {
      const ticketId = String(request.data.ticket_id || "").trim();

      VALID.required(ticketId, "ticket_id");

      const snap = await db
        .collection("ticketarchivos")
        .where("ticket_id", "==", ticketId)
        .where("eliminado", "==", false)
        .get();

      const archivos = snap.docs.map((doc) => {
        const d = doc.data();

        return {
          nombre: d.nombre,
          url: d.url,
        };
      });

      return ok({
        archivos,
      });
    } catch (e) {
      LOG.error("getArchivosTicket", {
        error: e.message,
      });

      throw e;
    }
  },
);

exports.crearTicketPortal = onCall(async (request) => {
  try {
    const data = request.data;

    VALID.required(data.cliente_id, "cliente_id");
    VALID.required(data.cliente_nombre, "cliente_nombre");
    VALID.required(data.asunto, "asunto");
    VALID.required(data.descripcion, "descripcion");

    const folio = await FOLIOS.next("ARTK", "Portal Cliente");

    const ticket = {
      id: folio,
      folio,

      fecha: new Date().toISOString().substring(0, 10),

      cliente_id: data.cliente_id,
      cliente_nombre: data.cliente_nombre,

      garantia_id: data.garantia_id || "",

      capturado_por: "Portal Cliente",

      orden_id: "",
      orden_folio: "",

      asunto: data.asunto,
      descripcion: data.descripcion,

      prioridad: data.prioridad || "Media",

      estado: "Nuevo",

      responsable: "ARABOT",

      origen: "Portal Cliente",

      visible_cliente: true,

      notificar_cliente: true,

      fecha_actualizacion: new Date().toISOString(),

      fecha_cierre: "",

      venta_generada: false,
      venta_id: "",
      venta_folio: "",

      total_productos: 0,
      total_servicios: 0,
      total_ticket: 0,
    };

    await db.collection("tickets").doc(ticket.id).set(ticket);

    return ok({
      folio,
    });
  } catch (e) {
    LOG.error("crearTicketPortal", {
      error: e.message,
    });

    throw e;
  }
});

exports.getPuedeComentarTicket = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    try {
      const ticketId = String(request.data.ticket_id || "").trim();

      VALID.required(ticketId, "ticket_id");

      const TICKETS = require("../lib/tickets");

      const puede = await TICKETS.puedeComentar(ticketId);

      return ok({
        puedeComentar: puede,
      });
    } catch (e) {
      LOG.error("getPuedeComentarTicket", {
        error: e.message,
      });

      throw e;
    }
  },
);

exports.guardarComentarioCliente = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    try {
      const data = request.data;

      VALID.required(data.ticket_id, "ticket_id");
      VALID.required(data.cliente_nombre, "cliente_nombre");
      VALID.required(data.comentario, "comentario");

      const TICKETS = require("../lib/tickets");

      const puede = await TICKETS.puedeComentar(data.ticket_id);

      if (!puede) {
        ERR.permission("DEBES_ESPERAR_RESPUESTA_DE_ARATECH");
      }

      const comentario = {
        id: "TC-" + Date.now(),

        ticket_id: data.ticket_id,

        fecha: new Date().toISOString().substring(0, 10),

        fecha_hora: new Date().toISOString(),

        autor: data.cliente_nombre,

        autor_tipo: "CLIENTE",

        comentario: data.comentario,

        visible_cliente: true,

        notificar_cliente: false,
      };

      await db
        .collection("ticketcomentarios")
        .doc(comentario.id)
        .set(comentario);

      return ok();
    } catch (e) {
      LOG.error("guardarComentarioCliente", {
        error: e.message,
      });

      throw e;
    }
  },
);
exports.guardarArchivoCliente = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    try {
      const data = request.data;

      VALID.required(data.ticket_id, "ticket_id");
      VALID.required(data.cliente_nombre, "cliente_nombre");
      VALID.required(data.nombre, "nombre");
      VALID.required(data.url, "url");

      const ahora = new Date().toISOString();

      const archivoId = "TA-" + Date.now();

      await db
        .collection("ticketarchivos")
        .doc(archivoId)
        .set({
          id: archivoId,

          ticket_id: data.ticket_id,

          fecha: ahora.substring(0, 10),

          fecha_hora: ahora,

          nombre: data.nombre,

          url: data.url,

          eliminado: false,

          visible_cliente: true,

          autor: data.cliente_nombre,

          autor_tipo: "CLIENTE",
        });

      const comentarioId = "TC-" + Date.now();

      await db
        .collection("ticketcomentarios")
        .doc(comentarioId)
        .set({
          id: comentarioId,

          ticket_id: data.ticket_id,

          fecha: ahora.substring(0, 10),

          fecha_hora: ahora,

          autor: data.cliente_nombre,

          autor_tipo: "CLIENTE",

          comentario: "📎 Evidencia agregada: " + data.nombre,

          visible_cliente: true,

          notificar_cliente: false,
        });

      return ok({
        id: archivoId,
      });
    } catch (e) {
      LOG.error("guardarArchivoCliente", {
        error: e.message,
      });

      throw e;
    }
  },
);
// ============================================================
// CREAR COMENTARIO INTERNO TICKET
// ============================================================

exports.crearComentarioTicket = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    // [FASE 2] Solo personal activo de ARASYS (antes no pedía sesión)
    const staff = await requireStaff(request);

    try {
      const data = request.data;

      VALID.required(data.ticket_id, "ticket_id");
      VALID.required(data.comentario, "comentario");

      const comentario = {
        id: "TC-" + Date.now(),

        ticket_id: data.ticket_id,

        fecha: new Date().toISOString().substring(0, 10),

        fecha_hora: new Date().toISOString(),

        autor: data.autor || staff.nombre || "Sistema",

        autor_tipo: data.autor_tipo || "ARATECH",

        comentario: data.comentario,

        visible_cliente: data.visible_cliente === true,

        notificar_cliente: data.notificar_cliente === true,
      };

      await db
        .collection("ticketcomentarios")
        .doc(comentario.id)
        .set(comentario);

      return ok({
        id: comentario.id,
      });
    } catch (e) {
      LOG.error("crearComentarioTicket", {
        error: e.message,
      });

      throw e;
    }
  },
);
