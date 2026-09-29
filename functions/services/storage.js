const { onCall } = require("firebase-functions/v2/https");

const { admin, db } = require("../lib/firestore");

const { ok } = require("../lib/responses");

const { requireAuth } = require("../lib/auth");

const VALIDATOR = require("../lib/validators");

const bucket = admin.storage().bucket();

// ============================================================
// SUBIR FOTO EVIDENCIA ORDEN
// ============================================================

exports.subirFoto = onCall(async (request) => {
  requireAuth(request);

  const data = request.data;

  const ordenId = String(data.collection || "").trim();

  const { nombre, base64, mimeType, usuario, email, visible_cliente } =
    data.payload || {};

  if (!ordenId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ORDEN_ID_REQUIRED",
    );
  }

  VALIDATOR.fileName(nombre);

  VALIDATOR.base64(base64);

  VALIDATOR.mimeType(mimeType || "image/jpeg", [
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  const path = `ordenes/${ordenId}/${nombre}`;

  const file = bucket.file(path);

  const buffer = Buffer.from(base64, "base64");

  await file.save(buffer, {
    metadata: {
      contentType: mimeType || "image/jpeg",
    },
  });

  await file.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

  const id = "OE-" + Date.now();

  await db
    .collection("ordenevidencias")
    .doc(id)
    .set({
      id,

      orden_id: ordenId,

      storage_path: path,

      nombre,

      url,

      fecha: new Date().toISOString(),

      usuario: usuario || email || "",

      visible_cliente: visible_cliente === true,

      eliminada: false,

      fecha_eliminacion: "",

      usuario_eliminacion: "",
    });

  return ok({
    id,

    url,
  });
});

// ============================================================
// OBTENER FOTOS DE ORDEN
// ============================================================

exports.obtenerFotos = onCall(async (request) => {
  requireAuth(request);

  const ordenId = String(request.data.collection || "").trim();

  if (!ordenId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ORDEN_ID_REQUIRED",
    );
  }

  const snap = await db
    .collection("ordenevidencias")
    .where("orden_id", "==", ordenId)
    .where("eliminada", "==", false)
    .get();

  const fotos = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();

      let url = d.url;

      if (d.storage_path) {
        try {
          const file = bucket.file(d.storage_path);

          const [signedUrl] = await file.getSignedUrl({
            version: "v4",
            action: "read",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutos
          });

          url = signedUrl;
        } catch (err) {
          console.error(
            `Error generando Signed URL para ${d.storage_path}:`,
            err,
          );
        }
      }

      return {
        id: d.id,
        nombre: d.nombre,
        url,
        fecha: d.fecha,
        usuario: d.usuario,
        visible_cliente: d.visible_cliente,
        storage_path: d.storage_path,
      };
    }),
  );

  return ok({
    fotos,
  });
});

// ============================================================
// SUBIR ARCHIVO DE TICKET
// ============================================================

exports.subirTicketFile = onCall(async (request) => {
  console.log(">>> obtenerFotos V2 ejecutándose <<<");
  requireAuth(request);

  const data = request.data;

  const ticketId = String(data.ticket_id || "").trim();

  if (!ticketId) {
    throw new Error("TICKET_ID_REQUIRED");
  }

  VALIDATOR.fileName(data.nombre);

  VALIDATOR.base64(data.base64);

  VALIDATOR.mimeType(data.mimeType, [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]);

  const storagePath = `tickets/${ticketId}/${data.nombre}`;

  const file = bucket.file(storagePath);

  const buffer = Buffer.from(data.base64, "base64");

  await file.save(buffer, {
    metadata: {
      contentType: data.mimeType,
    },
  });

  await file.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  const id = "TA-" + Date.now();

  await db
    .collection("ticketarchivos")
    .doc(id)
    .set({
      id,

      ticket_id: ticketId,

      nombre: data.nombre,

      storage_path: storagePath,

      url,

      fecha: new Date().toISOString().substring(0, 10),

      fecha_hora: new Date().toISOString(),

      visible_cliente: data.visible_cliente === true,

      eliminado: false,

      autor: data.usuario || "",

      autor_tipo: data.autor_tipo || "CLIENTE",
    });

  return ok({
    id,

    url,

    storage_path: storagePath,
  });
});

// ============================================================
// ELIMINAR FOTO FÍSICA STORAGE
// ============================================================

exports.eliminarFoto = onCall(async (request) => {
  requireAuth(request);
  const storagePath = String(request.data.storage_path || "").trim();

  if (!storagePath) {
    throw new Error("STORAGE_PATH_REQUIRED");
  }

  const file = bucket.file(storagePath);

  await file.delete();

  return ok({
    eliminado: true,
  });
});

// ============================================================
// ELIMINACIÓN LÓGICA DE FOTO
// ============================================================

exports.eliminarFotoLogica = onCall(async (request) => {
  requireAuth(request);
  const fotoId = String(request.data.foto_id || "").trim();

  const usuario = String(request.data.usuario || "").trim();

  if (!fotoId) {
    throw new Error("FOTO_ID_REQUIRED");
  }

  const ref = db.collection("ordenevidencias").doc(fotoId);

  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("FOTO_NOT_FOUND");
  }

  await ref.update({
    eliminada: true,

    fecha_eliminacion: new Date().toISOString(),

    usuario_eliminacion: usuario,
  });

  return ok({
    eliminado: true,
  });
});

// ============================================================
// ELIMINAR ARCHIVO DE TICKET (LOGICO)
// ============================================================

exports.eliminarTicketFile = onCall(
  {
    region: "us-east1",
  },
  async (request) => {
    requireAuth(request);
    const id = String(request.data.id || "").trim();

    const usuario = String(request.data.usuario || "").trim();

    if (!id) {
      throw new Error("FILE_ID_REQUIRED");
    }

    const ref = db.collection("ticketarchivos").doc(id);

    const snap = await ref.get();

    if (!snap.exists) {
      throw new Error("FILE_NOT_FOUND");
    }

    await ref.update({
      eliminado: true,

      fecha_eliminacion: new Date().toISOString(),

      usuario_eliminacion: usuario,
    });

    return ok({
      eliminado: true,
    });
  },
);

// ============================================================
// SUBIR COMPROBANTE GASTO
// ============================================================

exports.subirGastoFile = onCall(async (request) => {
  requireAuth(request);
  const data = request.data;

  const gastoId = String(data.gasto_id || "").trim();

  if (!gastoId) {
    throw new Error("GASTO_ID_REQUIRED");
  }

  VALIDATOR.fileName(data.nombre);

  VALIDATOR.base64(data.base64);

  VALIDATOR.mimeType(data.mimeType || "application/octet-stream", [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]);

  const storagePath = `gastos/${gastoId}/${data.nombre}`;

  const file = bucket.file(storagePath);

  const buffer = Buffer.from(data.base64, "base64");

  await file.save(buffer, {
    metadata: {
      contentType: data.mimeType || "application/octet-stream",
    },
  });

  await file.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

  const id = "GE-" + Date.now();

  await db
    .collection("gastoevidencias")
    .doc(id)
    .set({
      id,

      gasto_id: gastoId,

      nombre: data.nombre,

      storage_path: storagePath,

      url,

      fecha: new Date().toISOString(),

      usuario: data.usuario || "",

      eliminada: false,

      fecha_eliminacion: "",

      usuario_eliminacion: "",
    });

  return ok({
    id,

    url,

    storage_path: storagePath,
  });
});
