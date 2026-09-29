const { onCall, HttpsError } = require("firebase-functions/v2/https");

const { admin } = require("../lib/firestore");
const { requireAuth } = require("../lib/auth");
const { ok } = require("../lib/responses");

const bucket = admin.storage().bucket();

exports.obtenerUrlArchivo = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    requireAuth(request);

    const storagePath = String(request.data.storage_path || "").trim();

    if (!storagePath) {
      throw new HttpsError("invalid-argument", "STORAGE_PATH_REQUIRED");
    }

    const file = bucket.file(storagePath);

    const [exists] = await file.exists();

    if (!exists) {
      throw new HttpsError("not-found", "FILE_NOT_FOUND");
    }

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    return ok({
      url,
    });
  },
);
