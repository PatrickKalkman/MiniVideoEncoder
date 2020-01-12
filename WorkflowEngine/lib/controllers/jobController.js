const Job = require('../models/job');
const constants = require('../config/constants');

const jobController = {};

jobController.getJobs = function getJobs(req, reply) {
  Job.find(function(err, jobs) {
    if (!err) {
      reply.send(jobs);
    } else {
      reply.internalServerError(err);
    }
  });
};

jobController.getJob = function getJob(req, reply) {
  const id = req.params.id;
  Job.findById(id, function(err, job) {
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

jobController.addJob = function addJob(req, reply) {
    const job = new Job(req.body);
    job.status = constants.WORKFLOW_STATUS.NEW;
    job.save(function(err, job) {
      if (!err) {
        reply.send(job);
      } else {
        reply.badRequest(err); 
      }
    });
};

jobController.updateJob = function updateJob(req, reply) {
    const id = req.params.id;
    const job = req.body;
    const { ...updateData } = job;
    Job.findByIdAndUpdate(id, updateData, { new: true }, function(err, job) {
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

jobController.deleteJob = function deleteJob(req, reply) {
    const id = req.params.id;
    Job.findByIdAndRemove(id, function(err, job) {
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