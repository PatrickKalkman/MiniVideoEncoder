/*
 * Encoder Engine
 */

// Dependencies
const axios = require('axios').default;

const log = require('./log');
const constants = require('./constants');
const config = require('./config');
const { parentPort, workerData } =  require("worker_threads");

const encoderEngine = {};

encoderEngine.searchTasks = function searchTasks(cb) {
  // Check with the workflow engine API to see if there is something to encode
  const url = `${config.workflowEngine.url}tasks/encoding/new`;
  axios.get(url)
    .then(function (resp) {
      cb(null, resp.data);
    })
    .catch(function (err) {
      cb(err, null);
      log.error(`An error occurred while trying to retrieve an new task. Err: ${err}`)
    });
};

encoderEngine.setTaskToFinished = function setTaskToFinished(id, cb) {
  // Check with the workflow engine API to see if there is something to encode
  const url = `${config.workflowEngine.url}tasks/${id}`;
  axios.put(url, { status: constants.WORKFLOW_STATUS.DONE })
    .then(function (resp) {
      cb(null, resp.data);
    })
    .catch(function (err) {
      cb(err, null);
      log.error(`An error occurred while trying to update the task to finished. Err: ${err}`)
    });
}

encoderEngine.setTaskToError = function setTaskToFinished(id, err, cb) {
  // Set the task with the give id to error
  const url = `${config.workflowEngine.url}tasks/${id}`;
  axios.put(url, { status: constants.WORKFLOW_STATUS.ERROR, statusMessage: err.message })
    .then(function (resp) {
      cb(null, resp.data);
    })
    .catch(function (err) {
      cb(err, null);
      log.error(`An error occurred while trying to update the task to error. Err: ${err}`)
    });
}

encoderEngine.startEncoder = function startEncoder(encodingInstructions, cb) {
  log.info('Starting Worker for Encoding');

  const worker = new Worker('./encoder/encoder.js', { encodingInstructions });
  worker.on('message', cb(null));
  worker.on('error', cb(err));
  worker.on('exit', (code) => {
    if (code !== 0) {
      cb(new Error(`Worker stopped with exit code ${code}`));
    }
  });

}

module.exports = encoderEngine;
