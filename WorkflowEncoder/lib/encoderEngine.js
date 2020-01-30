/*
 * Encoder Engine
 */

// Dependencies
const axios = require('axios').default;

const log = require('./log');
const constants = require('./constants');
const config = require('./config');
const encoder = require('./encoder/encoder');

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
  // Check with the workflow engine API to see if there is something to encode
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
  log.info('Start encoder');

  encoder.encode(encodingInstructions, (err) => {
    log.error(`An error occurred during encoding. Err: ${err}`);
    cb(err)
  }, (info) => {
    log.info(`percentage done: ${info.percent}`);
  },  () => {
    cb(null);
  });

}

module.exports = encoderEngine;
