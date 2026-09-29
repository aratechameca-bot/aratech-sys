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

// ============================================================
// [FASE 2] Exigir que quien llama sea personal activo de ARASYS
// ============================================================
// Con el login de Google, cualquier cuenta de Gmail puede obtener una
// sesión de Firebase. Esta función verifica además que el correo esté
// registrado en "usuarios" (ID del documento = correo en minúsculas),
// que esté activo y, opcionalmente, que tenga uno de los roles indicados.

const ROLES_PERSONAL = ["admin", "recepcionista", "tecnico"];

async function requireStaff(request, rolesPermitidos = ROLES_PERSONAL) {
  const auth = requireAuth(request);

  const email = String(auth.token.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    ERR.permission("USUARIO_NO_AUTORIZADO");
  }

  const snap = await db.collection("usuarios").doc(email).get();

  if (!snap.exists) {
    ERR.permission("USUARIO_NO_AUTORIZADO");
  }

  const usuario = snap.data();

  if (usuario.activo !== true) {
    ERR.permission("USUARIO_INACTIVO");
  }

  if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)) {
    ERR.permission("PERMISO_DENEGADO");
  }

  return {
    id: snap.id,
    ...usuario,
  };
}

module.exports = {
  requireStaff,
  ROLES_PERSONAL,
  requireAuth,
  user,
  getUserByEmail,
  hasRole,
  requireRole,
};
