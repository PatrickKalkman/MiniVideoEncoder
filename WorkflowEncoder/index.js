/*
 * Primary file for the Mini Encoder Workflow Encoder
 *
 */

// Dependencies
const process = require('process');

const log = require('./lib/log');
const config = require('./lib/config');
const encoderEngine = require('./lib/encoderEngine');

const app = {
  isEncoding: false
};

app.init = function init() {
  log.info('Started Workflow Encoder, waiting for encoding requests');
  app.startProcessingOnTimeout();
};

app.processEncodingTasks = function processEncodingTasks() {
  encoderEngine.searchTasks((err, encoderInstructions) => {
    if (!err && encoderInstructions) {
        log.info(`Got encoder instructions, started encoder for task '${encoderInstructions.name}' id:${encoderInstructions._id}`);
        encoderEngine.startEncoder(encoderInstructions, (err) => {
          if (!err) {
            encoderEngine.setTaskToFinished(encoderInstructions._id, (err) => {
              app.startProcessingOnTimeout();
            });
          } else {
            log.error(`An error occurred during encoding, setting the status of the encoding task to error. Err: ${err}`);
            encoderEngine.setTaskToError(encoderInstructions._id, err, (err) => {
              app.startProcessingOnTimeout();
            });
          }
        });
    } else if (err) {
      log.info(`An error occurred while searching for encoding tasks. Err: ${err}`);
      app.startProcessingOnTimeout();
    } else {
      log.info('Workflow engine did not return any encoding tasks.');
      app.startProcessingOnTimeout();
    }
  });
}

app.startProcessingOnTimeout = function setProcessingTimeout() {
  app.intervalTimer = setTimeout(() => {
    app.processEncodingTasks();
  }, config.workflowEngine.pollingInterval);
}

app.shutdown = function shutdown() {
  clearInterval(app.intervalTimer);
  process.exit();
};

process.on('SIGINT', () => {
  log.info('Got SIGINT, gracefully shutting down');
  app.shutdown();
});

process.on('SIGTERM', () => {
  log.info('Got SIGTERM, gracefully shutting down');
  app.shutdown();
});

// Execute the function
app.init();

module.exports = app;
