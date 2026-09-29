const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");

exports.getGarantiasCliente = onCall(async (request) => {
  try {
    const clienteId = String(request.data.cliente_id || "").trim();

    VALID.required(clienteId, "cliente_id");

    const snap = await db
      .collection("garantias")
      .where("cliente_id", "==", clienteId)
      .get();

    const garantias = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ok({
      garantias,
    });
  } catch (e) {
    LOG.error("getGarantiasCliente", {
      error: e.message,
    });

    throw e;
  }
});
