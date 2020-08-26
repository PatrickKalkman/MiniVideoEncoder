const path = require('path');

const constants = require('../config/constants');
const Job = require('../models/job');
const Task = require('../models/task');

const jobController = {};

jobController.getJobs = function getJobs(req, reply) {
  Job.find((err, jobs) => {
    if (!err) {
      reply.send(jobs);
    } else {
      reply.internalServerError(err);
    }
  });
};

jobController.getJob = function getJob(req, reply) {
  const { id } = req.params;
  Job.findById(id, (err, job) => {
    if (!err) {
      if (job) {
        reply.send(job);
      } else {
        reply.notFound(`Could not find job with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

jobController.getStreams = function getStreams(req, reply) {
  const { id } = req.params;
  Task.find({ jobId: id, taskType: constants.TASK_TYPES.ENCODING }, (err, tasks) => {
    if (!err && tasks) {
      var outputStreams = tasks.map((task) => {
        return path.join(task.outputFolder, task.outputAsset);
      });
      reply.send(outputStreams);
    } else {
      repl.internalServerError(err);
    }
  });
}

jobController.addJob = function addJob(req, reply) {
  const job = new Job(req.body);
  job.status = constants.WORKFLOW_STATUS.NEW;
  job.save((err, savedJob) => {
    if (!err) {
      reply.send(savedJob);
    } else {
      reply.badRequest(err);
    }
  });
};

jobController.updateJob = function updateJob(req, reply) {
  const { id } = req.params;
  const job = req.body;
  const { ...updateData } = job;
  Job.findByIdAndUpdate(id, updateData, { new: true }, (err, foundJob) => {
    if (!err) {
      if (foundJob) {
        reply.send(foundJob);
      } else {
        reply.notFound(`Could not find job with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

jobController.deleteJob = function deleteJob(req, reply) {
  const { id } = req.params;
  Job.findByIdAndRemove(id, (err, job) => {
    if (!err) {
      if (job) {
        reply.send(job);
      } else {
        reply.notFound(`Could not find job with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

module.exports = jobController;
