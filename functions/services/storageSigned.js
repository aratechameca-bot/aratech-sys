const { onCall, HttpsError } = require("firebase-functions/v2/https");

const { admin } = require("../lib/firestore");
const { requireStaff } = require("../lib/auth");
const { ok } = require("../lib/responses");

const bucket = admin.storage().bucket();

exports.obtenerUrlArchivo = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    // [FASE 2] Reactivada con seguridad: solo personal activo de ARASYS,
    // y solo dentro de las carpetas de evidencias del sistema.
    const staff = await requireStaff(request);

    const storagePath = String(request.data.storage_path || "").trim();

    if (!storagePath) {
      throw new HttpsError("invalid-argument", "STORAGE_PATH_REQUIRED");
    }

    if (
      !/^(ordenes|tickets|gastos)\/[A-Za-z0-9_-]{1,80}\/[^/]{1,255}$/.test(
        storagePath,
      ) ||
      storagePath.includes("..")
    ) {
      throw new HttpsError("invalid-argument", "STORAGE_PATH_INVALID");
    }

    // Comprobantes de gastos: mismos roles que las reglas de Firestore
    if (
      storagePath.startsWith("gastos/") &&
      !["admin", "recepcionista"].includes(staff.rol)
    ) {
      throw new HttpsError("permission-denied", "PERMISO_DENEGADO");
    }

    const file = bucket.file(storagePath);

    const [exists] = await file.exists();

    if (!exists) {
      throw new HttpsError("not-found", "FILE_NOT_FOUND");
    }

    let url;

    try {
      [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
      });
    } catch (e) {
      // Suele indicar que falta el permiso "Creador de tokens de cuenta de
      // servicio" (iam.serviceAccounts.signBlob) en la cuenta de las funciones.
      console.error("obtenerUrlArchivo: no se pudo firmar la URL", e.message);

      throw new HttpsError("internal", "SIGNED_URL_ERROR");
    }

    return ok({
      url,
    });
  },
);
