/*
 * Primary file for the mini encoder API
 *
 */

// Dependencies
const process = require('process');

const log = require('./lib/log');
const config = require('./config');
const server = require('./lib/server');

const app = {};

app.init = function init() {
  log.info('Started MVE workflow engine, waiting for encoding requests');
  app.intervalTimer = setTimeout(() => { app.processWorkflowEngine(); });
};

app.processWorkflowEngine = function processWorkflowEngine() {
  log.info('Processing workflow jobs');

  app.intervalTimer = setTimeout(() => {
    app.processWorkflowEngine();
  }, config.workflow.pollingInterval * 1000);
};

app.shutdown = function shutdown() {
  server.start();
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
