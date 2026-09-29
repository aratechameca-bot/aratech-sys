const { onCall } = require("firebase-functions/v2/https");
const { db } = require("../lib/firestore");

exports.migrarClientesPortal = onCall(async () => {
  const datos = [
    {
      id: "CLI-0003",
      activo: "SI",
      fecha_alta: "2026-06-17",
      ultimo_acceso: "13/7/2026",
      bloqueado: "NO",
    },
    {
      id: "CLI-0002",
      activo: "SI",
      fecha_alta: "2026-06-19",
      ultimo_acceso: "19/6/2026",
      bloqueado: "NO",
    },
  ];

  const batch = db.batch();

  datos.forEach((cliente) => {
    const ref = db.collection("clientes_portal").doc(cliente.id);

    batch.set(ref, cliente);
  });

  await batch.commit();

  return {
    ok: true,
    migrados: datos.length,
  };
});
