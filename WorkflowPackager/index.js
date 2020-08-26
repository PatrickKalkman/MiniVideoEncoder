/*
 * Primary file for the Mini Encoder Workflow Encoder
 *
 */

// Dependencies
const process = require('process');

const log = require('./lib/log');
const config = require('./lib/config');
const packagingEngine = require('./lib/packagingEngine');

const app = {};

app.init = function init() {
  log.info('Started Workflow Packager, waiting for packager requests');
  app.startProcessingOnTimeout();
};

app.processPackagingTasks = function processEncodingTasks() {
  packagingEngine.searchTasks((err, packagingInstructions) => {
    if (!err && packagingInstructions._id) {
      log.info(`Got packaging instructions, started packaging for task '${packagingInstructions.name}' id:${packagingInstructions._id}`);
      packagingEngine.startPackager(packagingInstructions, (startErr) => {
        if (!startErr) {
          packagingEngine.setTaskToFinished(packagingInstructions._id, (taskToFinishedErr) => {
            if (taskToFinishedErr) {
              log.error(`An error occurred while trying to set the task: ${packagingInstructions.name} id:${packagingInstructions._id} to finished`);
            }
            app.startProcessingOnTimeout();
          });
        } else {
          packagingEngine.setTaskToError(packagingInstructions._id, err, (taskToErrorErr) => {
            if (taskToErrorErr) {
              log.error(`An error occurred while trying to set the task: ${packagingInstructions.name} id:${packagingInstructions._id} to error`);
            }
            app.startProcessingOnTimeout();
          });
        }
      });
    } else {
      log.info('Workflow engine did not return any packager work....');
      app.startProcessingOnTimeout();
    }
  });
};

app.startProcessingOnTimeout = function setProcessingTimeout() {
  app.intervalTimer = setTimeout(() => {
    app.processPackagingTasks();
  }, config.workflowEngine.pollingInterval);
};

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
