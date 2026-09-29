const { db } = require("./firestore");

async function buscarCorreoCliente(nombre) {
  const snap = await db
    .collection("clientes")
    .where("nombre", "==", nombre)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const cliente = snap.docs[0].data();

  return cliente.email || null;
}

module.exports = {
  buscarCorreoCliente,
};
