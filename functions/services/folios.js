const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { admin, db } = require("../lib/firestore");
const { ok } = require("../lib/responses");
const ERR = require("../lib/errors");
const LOG = require("../lib/logger");
const VALID = require("../lib/validators");
const AUTH = require("../lib/auth");
const FOLIOS = require("../lib/folios");

exports.helloWorld = onCall(() => {
  return {
    ok: true,
    message: "ARATECH Cloud Functions OK",
  };
});

exports.getFolio = onCall(async (request) => {
  try {
    const prefix = VALID.prefix(
      String(request.data.prefix || "")
        .trim()
        .toUpperCase(),
    );

    const user = AUTH.user(request);
    const folio = await FOLIOS.next(prefix, user.email);

    return ok({
      folio,
    });
  } catch (e) {
    LOG.error("getFolio", {
      error: e.message,
      prefix: request.data?.prefix,
    });

    throw e instanceof HttpsError ? e : new HttpsError("internal", e.message);
  }
});
