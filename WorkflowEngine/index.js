/*
 * Primary file for the Workflow Engine
 */

// Dependencies
const dotenv = require('dotenv').config();
const process = require('process');

const log = require('./lib/log');
const config = require('./lib/config/config');
const server = require('./lib/server');
const workflowEngine = require('./lib/workflowengine/workflowEngine');

const app = {};

app.init = function init() {
  log.info('Started MVE workflow engine, waiting for encoding requests');
  workflowEngine.start();
  server.start();
  app.intervalTimer = setTimeout(() => { app.processWorkflowEngine(); });
};

app.processWorkflowEngine = function processWorkflowEngine() {
  log.info('Processing workflow jobs');
  app.intervalTimer = setTimeout(() => {
    app.processWorkflowEngine();
  }, config.workflow.pollingInterval * 1000);
};

app.shutdown = function shutdown() {
  server.stop();
  workflowEngine.stop();
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

app.init();

module.exports = app;
