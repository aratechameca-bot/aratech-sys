const { db } = require("./firestore");

async function puedeComentar(ticketId) {
  const snap = await db
    .collection("ticketcomentarios")
    .where("ticket_id", "==", ticketId)
    .get();

  if (snap.empty) {
    return true;
  }

  const comentarios = snap.docs
    .map((doc) => doc.data())
    .sort((a, b) => String(a.fecha_hora).localeCompare(String(b.fecha_hora)));

  const ultimo = comentarios[comentarios.length - 1];

  return ultimo.autor_tipo !== "CLIENTE";
}

module.exports = {
  puedeComentar,
};
