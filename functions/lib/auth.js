const { db } = require("./firestore");
const ERR = require("./errors");
const { HttpsError } = require("firebase-functions/v2/https");

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "AUTH_REQUIRED");
  }

  return request.auth;
}

function user(request) {
  const auth = request.auth;

  if (!auth) {
    ERR.permission("AUTH_REQUIRED");
  }

  return {
    uid: auth.uid,
    email: auth.token.email || "Sistema",
    token: auth.token,
  };
}

async function getUserByEmail(email) {
  if (!email) {
    return null;
  }

  const snap = await db
    .collection("usuarios")
    .where("email", "==", email)
    .where("activo", "==", true)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
}

function hasRole(usuario, rolesPermitidos = []) {
  if (!usuario || !usuario.rol) {
    return false;
  }

  return rolesPermitidos.includes(usuario.rol);
}

async function requireRole(email, rolesPermitidos = []) {
  const usuario = await getUserByEmail(email);

  if (!usuario) {
    ERR.permission("USUARIO_NO_AUTORIZADO");
  }

  if (!hasRole(usuario, rolesPermitidos)) {
    ERR.permission("PERMISO_DENEGADO");
  }

  return usuario;
}

module.exports = {
  requireAuth,
  user,
  getUserByEmail,
  hasRole,
  requireRole,
};
