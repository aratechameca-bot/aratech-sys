const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");

exports.loginCliente = onCall(async (request) => {
  try {
    const telefono = String(request.data.telefono || "").trim();

    const password = String(request.data.password || "").trim();

    VALID.required(telefono, "telefono");

    VALID.required(password, "password");

    const snap = await db
      .collection("clientes")
      .where("tel", "==", telefono)
      .limit(1)
      .get();

    if (snap.empty) {
      ERR.notFound("CLIENTE_NOT_FOUND");
    }

    const cliente = snap.docs[0].data();

    const portalSnap = await db
      .collection("clientes_portal")
      .doc(cliente.id)
      .get();

    if (!portalSnap.exists) {
      ERR.permission("SIN_ACCESO_PORTAL");
    }

    const portal = portalSnap.data();

    if (String(portal.activo).toUpperCase() !== "SI") {
      ERR.permission("ACCESO_DESACTIVADO");
    }

    if (String(portal.bloqueado).toUpperCase() === "SI") {
      ERR.permission("USUARIO_BLOQUEADO");
    }

    const ultimos4 = String(cliente.tel || "").slice(-4);

    if (ultimos4 !== password) {
      ERR.permission("PASSWORD_INVALID");
    }

    await db.collection("clientes_portal").doc(cliente.id).update({
      ultimo_acceso: new Date().toISOString(),
      telefono: cliente.tel,
      nombre: cliente.nombre,
    });

    return ok({
      cliente_id: cliente.id,
      nombre: cliente.nombre,
      telefono: cliente.tel,
    });
  } catch (e) {
    LOG.error("loginCliente", {
      error: e.message,
    });

    throw e;
  }
});

exports.getDashboardCliente = onCall(async (request) => {
  try {
    const clienteId = String(request.data.cliente_id || "").trim();

    VALID.required(clienteId, "cliente_id");
    const [ventasSnap, ordenesSnap, ticketsSnap] = await Promise.all([
      db.collection("ventas").where("cliente_id", "==", clienteId).get(),

      db.collection("ordenes").where("cliente_id", "==", clienteId).get(),

      db.collection("tickets").where("cliente_id", "==", clienteId).get(),
    ]);

    return ok({
      compras: ventasSnap.size,
      servicios: ordenesSnap.size,
      tickets: ticketsSnap.size,
    });
  } catch (e) {
    LOG.error("getDashboardCliente", {
      error: e.message,
    });

    throw e;
  }
});

exports.getServiciosCliente = onCall(async (request) => {
  try {
    const clienteId = String(request.data.cliente_id || "").trim();

    VALID.required(clienteId, "cliente_id");

    const snap = await db
      .collection("ordenes")
      .where("cliente_id", "==", clienteId)
      .get();

    const servicios = snap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: d.id,
        folio: d.folio,
        equipo: d.tipo_equipo,
        modelo: d.modelo,
        estado: d.estado,
        fecha: d.fecha,
        garantia: d.garantia,
      };
    });

    return ok({
      servicios,
    });
  } catch (e) {
    LOG.error("getServiciosCliente", {
      error: e.message,
    });

    throw e;
  }
});

exports.getDetalleServicio = onCall(async (request) => {
  try {
    const folio = String(request.data.folio || "").trim();

    VALID.required(folio, "folio");

    const snap = await db
      .collection("ordenes")
      .where("folio", "==", folio)
      .limit(1)
      .get();

    if (snap.empty) {
      ERR.notFound("SERVICIO_NOT_FOUND");
    }

    const servicio = snap.docs[0].data();

    const evidenciasSnap = await db
      .collection("ordenevidencias")
      .where("orden_id", "==", servicio.id)
      .where("eliminada", "==", false)
      .where("visible_cliente", "==", true)
      .get();

    const evidencias = evidenciasSnap.docs.map((doc) => {
      const d = doc.data();

      return {
        nombre: d.nombre,
        url: d.url,
        storage_path: d.storage_path,
      };
    });

    return ok({
      servicio: {
        ...servicio,
        evidencias,
      },
    });
  } catch (e) {
    LOG.error("getDetalleServicio", {
      error: e.message,
    });

    throw e;
  }
});

exports.activarPortalCliente = onCall(async (request) => {
  const clienteId = String(request.data.cliente_id || "").trim();

  VALID.required(clienteId, "cliente_id");

  const clienteSnap = await db.collection("clientes").doc(clienteId).get();

  if (!clienteSnap.exists) {
    ERR.notFound("CLIENTE_NOT_FOUND");
  }

  const cliente = clienteSnap.data();

  await db.collection("clientes_portal").doc(clienteId).set(
    {
      activo: "SI",
      bloqueado: "NO",
      fecha_alta: new Date().toISOString(),
      ultimo_acceso: null,
      cliente_id: clienteId,
      nombre: cliente.nombre,
      telefono: cliente.tel,
    },
    {
      merge: true,
    },
  );

  return ok({
    cliente_id: clienteId,
    mensaje: "Cliente activado en Portal",
  });
});
