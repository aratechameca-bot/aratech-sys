const ERR = require("./errors");

function hasRole(user, roles = []) {
  if (!roles.length) return true;

  const role = user.token?.rol || user.token?.role;

  if (!roles.includes(role)) {
    ERR.permission("PERMISSION_DENIED");
  }

  return true;
}

module.exports = {
  hasRole,
};
