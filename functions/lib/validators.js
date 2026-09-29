const ERR = require("./errors");

function required(value, field) {
  if (value === undefined || value === null || value === "") {
    ERR.invalid(`${field.toUpperCase()}_REQUIRED`);
  }
}

function prefix(value) {
  required(value, "prefix");

  if (!/^[A-Z0-9_-]+$/.test(value)) {
    ERR.invalid("PREFIX_INVALID");
  }

  return value;
}

function fileName(nombre) {
  required(nombre, "nombre");

  if (nombre.length > 255) {
    ERR.invalid("FILE_NAME_TOO_LONG");
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(nombre)) {
    ERR.invalid("FILE_NAME_INVALID");
  }

  if (nombre.includes("..") || nombre.includes("/") || nombre.includes("\\")) {
    ERR.invalid("FILE_NAME_INVALID");
  }

  return nombre;
}

function mimeType(tipo, permitidos = []) {
  required(tipo, "mimeType");

  if (permitidos.length && !permitidos.includes(tipo)) {
    ERR.invalid("MIME_TYPE_INVALID");
  }

  return tipo;
}

function base64(data, maxBytes = 10 * 1024 * 1024) {
  required(data, "base64");

  const bytes = Buffer.byteLength(data, "base64");

  if (bytes > maxBytes) {
    ERR.invalid("FILE_TOO_LARGE");
  }

  return data;
}

module.exports = {
  required,
  prefix,
  fileName,
  mimeType,
  base64,
};
