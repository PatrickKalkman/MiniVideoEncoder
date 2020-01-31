/* Start up the http server */

// Dependencies
const registerRoutes = require('fastify-register-routes');
const path = require('path');
const log = require('./log');

const config = require('./config/config');

const fastify = require('fastify')({
  logger: {
    prettyPrint: true,
  },
});

fastify.register(require('fastify-sensible'));

const server = {};

// path with routes files
const defaultPath = path.join(__dirname, './routes');

fastify.register(registerRoutes, {
  regex: /((Route)|(Routes))\.js$/,
  showTable: true,
  path: defaultPath,
});

server.start = function start() {
  fastify.listen(config.httpPort, config.httpAddress, (err) => {
    if (!err) {
      fastify.log.info(`The http server is running in ${config.envName} mode and listening on port ${fastify.server.address().port}`);
    } else {
      log.error(`An error occurred while trying to start the http server. Err: ${err}`);
    }
  });
};

server.stop = function stop() {
  fastify
    .close(function(err) {
      if (err) {
        log.error(`An error occurred while trying to close the http server. Err: ${err}`);
      }
    });
}

module.exports = server;
