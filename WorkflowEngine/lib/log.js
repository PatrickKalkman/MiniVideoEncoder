/*
 * Logging wrapper
 */
const logger = require('pino')({ prettyPrint: true });

const log = {};

log.info = function info(message) {
  logger.info(message);
};

log.error = function error(message) {
  logger.error(message);
};

log.debug = function debug(message) {
  logger.debug(message);
};

module.exports = log;
