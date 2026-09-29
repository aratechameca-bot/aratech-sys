const { onCall } = require("firebase-functions/v2/https");

const { db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const AUTH = require("../lib/auth");

exports.getConfig = onCall(async (request) => {
  try {
    AUTH.user(request);

    const snap = await db.collection("config").get();

    const config = {};

    snap.forEach((doc) => {
      config[doc.id] = doc.data().valor;
    });

    return ok({
      config,
    });
  } catch (e) {
    LOG.error("getConfig", {
      error: e.message,
    });

    throw e;
  }
});

exports.setConfig = onCall(async (request) => {
  try {
    AUTH.user(request);

    const config = request.data;

    if (!config || typeof config !== "object") {
      ERR.invalid("CONFIG_REQUIRED");
    }

    const batch = db.batch();

    Object.entries(config).forEach(([key, value]) => {
      batch.set(
        db.collection("config").doc(key),
        {
          valor: value,
          actualizado: new Date().toISOString(),
        },
        { merge: true },
      );
    });

    await batch.commit();

    return ok();
  } catch (e) {
    LOG.error("setConfig", {
      error: e.message,
    });

    throw e;
  }
});
