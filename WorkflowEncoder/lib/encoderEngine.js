/*
 * Encoder Engine
 */

// Dependencies
const workerThreads = require('worker_threads');
const superagent = require('superagent');

const log = require('./log');
const constants = require('./constants');
const config = require('./config');

const encoderEngine = {};

encoderEngine.searchTasks = function searchTasks(cb) {
  // Check with the workflow engine API to see if there is something to encode
  const url = `${config.workflowEngine.url}tasks/encoding/new`;
  superagent
    .get(url)
    .set('accept', 'json')
    .end((err, res) => {
      if (!err) {
        cb(null, res.body);
      } else {
        log.error(`An error occurred while trying to retrieve a new task. ${err}`);
        cb(err, null);
      }
    });
};

encoderEngine.setTaskToFinished = function setTaskToFinished(id, cb) {
  const url = `${config.workflowEngine.url}tasks/${id}`;
  superagent
    .put(url)
    .set('accept', 'json')
    .send({ status: constants.WORKFLOW_STATUS.DONE })
    .end((err, res) => {
      if (!err) {
        cb(null, res.body);
      } else {
        log.error(`An error occurred while trying to update the task to finished. ${err}`);
        cb(err, null);
      }
    });
};

encoderEngine.setTaskToError = function setTaskToFinished(id, err, cb) {
  const url = `${config.workflowEngine.url}tasks/${id}`;
  superagent
    .put(url)
    .set('accept', 'json')
    .send({ status: constants.WORKFLOW_STATUS.ERROR, statusMessage: err.message })
    .end((endErr, res) => {
      if (!endErr) {
        cb(null, res.body);
      } else {
        log.error(`An error occurred while trying to update the task to error. ${endErr}`);
        cb(endErr, null);
      }
    });
};

encoderEngine.startEncoder = function startEncoder(encodingInstructions, cb) {
  log.info('Starting Worker....');

  const worker = new workerThreads.Worker('./lib/encoder/encoder.js', {
    workerData: encodingInstructions,
  });

  worker.on('message', (message) => {
    if (message != null && typeof message === 'object') {
      if (message.type === constants.WORKER_MESSAGE_TYPES.PROGRESS) {
        log.info(message.message);
      } else if (message.type === constants.WORKER_MESSAGE_TYPES.ERROR) {
        cb(new Error(message.message));
      } else if (message.type === constants.WORKER_MESSAGE_TYPES.DONE) {
        log.info(message.message);
        cb(null);
      }
    }
  });

  worker.on('error', (err) => {
    cb(new Error(`An error occurred while encoding. ${err}`));
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      cb(new Error(`Worker stopped with exit code ${code}`));
    } else {
      cb(null);
    }
  });
};

module.exports = encoderEngine;
