const { HttpsError } = require("firebase-functions/v2/https");

function invalid(message) {
  throw new HttpsError("invalid-argument", message);
}

function notFound(message) {
  throw new HttpsError("not-found", message);
}

function internal(message) {
  throw new HttpsError("internal", message);
}

function permission(message) {
  throw new HttpsError("permission-denied", message);
}

module.exports = {
  invalid,
  notFound,
  internal,
  permission,
};
