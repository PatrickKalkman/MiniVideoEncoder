/*
 * Workflow
 */

// Dependencies
const log = require('../log');
const constants = require('../config/constants');
const database = require('../database/database');
const jobSplitter = require('./jobSplitter');

const workflowEngine = {};

workflowEngine.start = function start() {
  database.connect((err) => {
    if (err) {
      log.error(`An error occurred while trying to connect to the database. Err: ${err}`);
    }
  });
};

workflowEngine.stop = function stop() {
  database.disconnect((err) => {
    if (err) {
      log.error(`An error occurred while trying to disconnect from the database. Err: ${err}`);
    }
  });
};

workflowEngine.showInfo = async function showInfo() {
  if (!database.isConnected) {
    log.info('Cannot show information, not connected to the database');
    return;
  }
  const newJobs = await database.getJobs(constants.WORKFLOW_STATUS.NEW);
  const inProgressJobs = await database.getJobs(constants.WORKFLOW_STATUS.INPROGRESS);

  log.info(`There are ${newJobs.length} new and ${inProgressJobs.length} in progress workflow jobs`);
};

workflowEngine.processJobs = async function processJobs() {
  if (!database.isConnected) {
    return;
  }

  await workflowEngine.splitNewJobs();
  await workflowEngine.handleFinishedJobs();
};

workflowEngine.splitNewJobs = async function splitNewJobs() {
  const newJobs = await database.getJobs(constants.WORKFLOW_STATUS.NEW);
  if (newJobs && Array.isArray(newJobs) && newJobs.length > 0) {
    newJobs.forEach((job) => {
      log.info(`Splitting job: ${job.name}`);
      jobSplitter.split(job._doc, (err) => {
        if (!err) {
          const jobToUpdate = job;
          jobToUpdate.status = constants.WORKFLOW_STATUS.INPROGRESS;
          database.updateJob(jobToUpdate);
        } else {
          log.error(`An error occurred during splitting. Err: ${err}`);
        }
      });
    });
  }
};

workflowEngine.handleFinishedJobs = async function handleFinishedJobs() {
  const runningJobs = await database.getJobs(constants.WORKFLOW_STATUS.INPROGRESS);
  runningJobs.forEach(async (job) => {
    const tasksOfJobs = await database.getTasksNewOrInProgress(job._id);
    if (tasksOfJobs.length === 0) {
      // job is finished, set the status to done
      log.info(`Setting job: ${job.name} status to done`);
      database.updateJobStatus(job._id, constants.WORKFLOW_STATUS.DONE);
    }
    // else do nothing, the tasks of the job are still running or new
  });
};

module.exports = workflowEngine;
