const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");

exports.validarUsuario = onCall(async (request) => {
  try {
    const email = String(request.data.email || "").trim();

    VALID.required(email, "email");

    const snap = await db
      .collection("usuarios")
      .where("email", "==", email)
      .where("activo", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {
      return ok({
        success: false,
      });
    }

    return ok({
      success: true,
      usuario: {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      },
    });
  } catch (e) {
    LOG.error("validarUsuario", {
      error: e.message,
    });

    throw e;
  }
});

exports.actualizarUltimoAcceso = onCall(async (request) => {
  try {
    const data = request.data;

    VALID.required(data.email, "email");

    const snap = await db
      .collection("usuarios")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (snap.empty) {
      return ok({
        success: false,
      });
    }

    await snap.docs[0].ref.update({
      ultimo_acceso: new Date().toISOString(),

      navegador: data.navegador || "",
    });

    return ok({
      success: true,
    });
  } catch (e) {
    LOG.error("actualizarUltimoAcceso", {
      error: e.message,
    });

    throw e;
  }
});
