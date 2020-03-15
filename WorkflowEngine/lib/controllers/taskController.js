// External Dependancies
const constants = require('../config/constants');
const log = require('../log');
const Task = require('../models/task');

const taskController = {};

taskController.getTasks = function getTasks(req, reply) {
  Task.find((err, tasks) => {
    if (!err) {
      reply.send(tasks);
    } else {
      reply.internalServerError(err);
    }
    return null;
  });
};

taskController.getSingleTask = function getSingleTask(req, reply) {
  const { id } = req.params;
  Task.findById(id, (err, task) => {
    if (!err) {
      if (task) {
        reply.send(task);
      } else {
        reply.notFound(`Could not find task with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

taskController.addTask = function addTask(req, reply) {
  const task = new Task(req.body);
  task.status = constants.WORKFLOW_STATUS.NEW;
  task.save((err, savedTask) => {
    if (!err) {
      reply.send(savedTask);
    } else {
      reply.badRequest(err);
    }
  });
};

taskController.updateTask = function updateTask(req, reply) {
  const { id } = req.params;
  const job = req.body;
  const { ...updateData } = job;
  Task.findByIdAndUpdate(id, updateData, { new: true }, (err, updatedTask) => {
    if (!err) {
      if (updatedTask) {
        reply.send(updatedTask);
      } else {
        reply.notFound(`Could not find the task with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

taskController.deleteTask = function deleteTask(req, reply) {
  const { id } = req.params;
  Task.findByIdAndRemove(id, (err, newTask) => {
    if (!err) {
      if (newTask) {
        reply.send(newTask);
      } else {
        reply.notFound(`Could not find the task with id ${id}`);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

// Get single task by status
taskController.getFirstNewEncodingTaskAndUpdate = function getFirstNewEncodingTaskAndUpdate(req, reply) {
  const status = constants.WORKFLOW_STATUS.NEW;
  const filter = { status, taskType: constants.TASK_TYPES.ENCODING };
  const newStatus = constants.WORKFLOW_STATUS.INPROGRESS;
  const update = { status: newStatus };
  Task.findOneAndUpdate(filter, update, (err, newTask) => {
    if (!err) {
      if (newTask) {
        reply.send(newTask);
      } else {
        reply.send(null);
      }
    } else {
      reply.badRequest(err);
    }
  });
};

// Get single task by ID
taskController.getFirstNewPackagingTaskAndUpdate = function getFirstNewPackagingTaskAndUpdate(req, reply) {
  // We should only return the packaging task if all the encoding tasks of this job are done.
  const status = constants.WORKFLOW_STATUS.NEW;
  const filter = { status, taskType: constants.TASK_TYPES.PACKAGING };
  const newStatus = constants.WORKFLOW_STATUS.INPROGRESS;
  const update = { status: newStatus };

  Task.findOneAndUpdate(filter, update, (err, task) => {
    if (!err) {
      if (task) {
        const allTasksOfJobFinishedFilter = {
          jobId: task.jobId,
          $or: [{ status: constants.WORKFLOW_STATUS.NEW }, { status: constants.WORKFLOW_STATUS.INPROGRESS }],
          taskType: constants.TASK_TYPES.ENCODING,
        };

        Task.find(allTasksOfJobFinishedFilter, (findErr, notFinishedEncodingTasks) => {
          if (!findErr) {
            if (notFinishedEncodingTasks.length > 0) {
              // Encoding still busy, set packaging task status back to new.
              log.debug('Not all encoding tasks finished, setting status of packaging task back to new');
              task.status = constants.WORKFLOW_STATUS.NEW;
              Task.updateOne(task._doc, (updateErr, updatedTask) => {
                if (!updateErr) {
                  reply.send(updatedTask);
                } else {
                  reply.badRequest(updateErr);
                }
              });
            } else {
              reply.send(task);
            }
          } else {
            reply.badRequest(err);
          }
        });
      } else {
        reply.notFound();
      }
    } else {
      reply.badRequest(err);
    }
  });
};

module.exports = taskController;
