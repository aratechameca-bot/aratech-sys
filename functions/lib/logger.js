const logger = require("firebase-functions/logger");

function info(message, data = {}) {
  logger.info(message, data);
}

function warn(message, data = {}) {
  logger.warn(message, data);
}

function error(message, data = {}) {
  logger.error(message, data);
}

module.exports = {
  info,
  warn,
  error,
};
