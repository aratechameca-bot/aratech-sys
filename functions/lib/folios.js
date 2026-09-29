const { db, admin } = require("./firestore");
const ERR = require("./errors");

async function next(prefix, usuario = "Sistema") {
  const ref = db.collection("folios").doc(prefix);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      ERR.notFound(`El prefijo '${prefix}' no existe.`);
    }

    const data = snap.data();

    const ultimo = Math.max(0, Number(data.ultimo) || 0);

    const nuevo = ultimo + 1;

    const folio = `${prefix}-${String(nuevo).padStart(4, "0")}`;

    tx.update(ref, {
      ultimo: nuevo,
      siguiente: `${prefix}-${String(nuevo + 1).padStart(4, "0")}`,
      actualizado: admin.firestore.Timestamp.now().toDate().toISOString(),
      usuario,
    });

    return folio;
  });
}

module.exports = {
  next,
};
