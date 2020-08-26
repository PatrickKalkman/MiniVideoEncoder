/*
 * Packaging Engine
 */

// Dependencies
const superagent = require('superagent');

const log = require('./log');
const constants = require('./constants');
const config = require('./config');
const packager = require('./packager/packager');

const packagerEngine = {};

packagerEngine.searchTasks = function searchTasks(cb) {
  // Check with the workflow engine API to see if there is something to package
  const url = `${config.workflowEngine.url}tasks/packaging/new`;
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

packagerEngine.setTaskToFinished = function setTaskToFinished(id, cb) {
  const url = `${config.workflowEngine.url}tasks/${id}`;
  superagent
    .put(url, { status: constants.WORKFLOW_STATUS.DONE })
    .set('accept', 'json')
    .end((err, res) => {
      if (!err) {
        cb(null, res.data);
      } else {
        log.error(`An error occurred while trying to update the task to finished. Err: ${err}`);
        cb(err, null);
      }
    });
};

packagerEngine.setTaskToError = function setTaskToError(id, err, cb) {
  const url = `${config.workflowEngine.url}tasks/${id}`;
  superagent
    .put(url, {
      status: constants.WORKFLOW_STATUS.ERROR,
      statusMessage: err.message,
    })
    .set('accept', 'json')
    .end((httpErr, res) => {
      if (!httpErr) {
        cb(false, res.data);
      } else {
        log.error(`An error occurred while trying to update the task to error. Err: ${err}`);
        cb(httpErr, null);
      }
    });
};

packagerEngine.startPackager = function startPackager(packageInstructions, cb) {
  packager.packageContent(packageInstructions, (err) => {
    log.info('done packaging');
    cb(err);
  });
};

module.exports = packagerEngine;
