/* Health service
 * Define the REST endpoint for /health
 * This service responds to health request to validate if the workflow engine is functioning correct
 */

const constants = require('../config/constants');

const healthController = {};

healthController.getHealth = function getHealth(req, reply) {
  reply.send({ dateTime: new Date() });
};

module.exports = healthController;