const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");

exports.getVentasCliente = onCall(async (request) => {
  try {
    const clienteId = String(request.data.cliente_id || "").trim();

    VALID.required(clienteId, "cliente_id");

    const snap = await db
      .collection("ventas")
      .where("cliente_id", "==", clienteId)
      .get();

    const ventas = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ok({
      ventas,
    });
  } catch (e) {
    LOG.error("getVentasCliente", {
      error: e.message,
    });

    throw e;
  }
});
