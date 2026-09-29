const { onCall } = require("firebase-functions/v2/https");

const { admin, db } = require("../lib/firestore");

const { ok } = require("../lib/responses");

const { requireStaff } = require("../lib/auth");

const VALIDATOR = require("../lib/validators");

const ERR = require("../lib/errors");

const bucket = admin.storage().bucket();

// ============================================================
// [FASE 2] Archivos privados
// ============================================================
// Los archivos ya NO se publican (antes: file.makePublic()). Solo se pueden
// ver desde ARASYS mediante enlaces firmados temporales (obtenerFotos y
// obtenerUrlArchivo). El campo "url" se guarda vacío en los registros nuevos;
// la referencia real es "storage_path".

// IDs de orden, ticket y gasto: solo letras, números, "_" y "-".
// Evita rutas manipuladas (por ejemplo con "/" o "..").
function validarId(valor, campo) {
  const id = String(valor || "").trim();

  if (!id) {
    ERR.invalid(`${campo}_REQUIRED`);
  }

  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) {
    ERR.invalid(`${campo}_INVALID`);
  }

  return id;
}

// ============================================================
// SUBIR FOTO EVIDENCIA ORDEN
// ============================================================

exports.subirFoto = onCall(async (request) => {
  const staff = await requireStaff(request);

  const data = request.data;

  const ordenId = validarId(data.collection, "ORDEN_ID");

  const { nombre, base64, mimeType, usuario, email, visible_cliente } =
    data.payload || {};

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

  // [FASE 2] Privado: sin makePublic(); se consulta con enlace firmado
  const url = "";

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

      usuario: usuario || email || staff.nombre || "",

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
  await requireStaff(request);

  const ordenId = validarId(request.data.collection, "ORDEN_ID");

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
  const staff = await requireStaff(request);

  const data = request.data;

  const ticketId = validarId(data.ticket_id, "TICKET_ID");

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

  // [FASE 2] Privado: sin makePublic(); se consulta con enlace firmado
  const url = "";

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

      autor: data.usuario || staff.nombre || "",

      // [FASE 2] Solo el personal puede usar esta función
      autor_tipo: data.autor_tipo || "ARATECH",
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
  // [FASE 2] Función desactivada en index.js (fase 0); se protege por si se reactiva
  await requireStaff(request, ["admin"]);
  const storagePath = String(request.data.storage_path || "").trim();

  if (!storagePath) {
    ERR.invalid("STORAGE_PATH_REQUIRED");
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
  const staff = await requireStaff(request);
  const fotoId = validarId(request.data.foto_id, "FOTO_ID");

  const usuario =
    String(request.data.usuario || "").trim() || staff.nombre || "";

  const ref = db.collection("ordenevidencias").doc(fotoId);

  const snap = await ref.get();

  if (!snap.exists) {
    ERR.notFound("FOTO_NOT_FOUND");
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
    const staff = await requireStaff(request);
    const id = validarId(request.data.id, "FILE_ID");

    const usuario =
      String(request.data.usuario || "").trim() || staff.nombre || "";

    const ref = db.collection("ticketarchivos").doc(id);

    const snap = await ref.get();

    if (!snap.exists) {
      ERR.notFound("FILE_NOT_FOUND");
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
  // [FASE 2] Gastos: mismos roles que las reglas de Firestore
  const staff = await requireStaff(request, ["admin", "recepcionista"]);
  const data = request.data;

  const gastoId = validarId(data.gasto_id, "GASTO_ID");

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

  // [FASE 2] Privado: sin makePublic(); se consulta con enlace firmado
  const url = "";

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

      usuario: data.usuario || staff.nombre || "",

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
