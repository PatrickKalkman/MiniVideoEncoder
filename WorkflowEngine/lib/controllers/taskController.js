// External Dependancies
const constants = require('../config/constants');
const log = require('../log');
const Task = require('../models/task');

const taskController = {};

taskController.getTasks = function getTasks(req, reply) {
  Task.find(function(err, tasks) {
    if (!err) {
      reply.send(tasks);
    } else {
      reply.internalServerError(err);
    }
  });
};

taskController.getSingleTask = function getSingleTask(req, reply) {
  const id = req.params.id;
  Task.findById(id, function(err, task) {
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
  task.save(function(err, savedTask) {
    if (!err) {
      reply.send(savedTask);
    } else {
      reply.badRequest(err); 
    }
  });
};

taskController.updateTask = function updateTask(req, reply) {
  const id = req.params.id;
  const job = req.body;
  const { ...updateData } = job;
  Task.findByIdAndUpdate(id, updateData, { new: true }, function(err, updatedTask) {
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
  const id = req.params.id;
  Task.findByIdAndRemove(id, function(err, newTask) {
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
  Task.findOneAndUpdate(filter, update, function(err, newTask) {
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
taskController.getFirstNewPackagingTaskAndUpdate = function getFirstNewPackagingTaskAndUpdate() {
  // We should only return the packaging task if all the encoding tasks of this job are done.
  const status = constants.WORKFLOW_STATUS.NEW;
  const filter = { status, taskType: constants.TASK_TYPES.PACKAGING };
  const newStatus = constants.WORKFLOW_STATUS.INPROGRESS;
  const update = { status: newStatus };

  Task.findOneAndUpdate(filter, update, function(err, task) {
    if (!err) {
      if (task) {
        const allTasksOfJobFinishedFilter = {
          jobId: task.jobId,
          $or: [{ status: constants.WORKFLOW_STATUS.NEW }, { status: constants.WORKFLOW_STATUS.INPROGRESS }],
          taskType: constants.TASK_TYPES.ENCODING,
        };
        
        Task.find(allTasksOfJobFinishedFilter, function(err, notFinishedEncodingTasks) {
          if (!err) {
            if (notFinishedEncodingTasks.length > 0) {
              // Encoding still busy, set packaging task status back to new.
              log.debug('Not all encoding tasks finished, setting status of packaging task back to new');
              task.status = constants.WORKFLOW_STATUS.NEW;
              task.updateOne(task._doc, function(err, updatedTask) {
                if (!err) {
                  reply.send(null);
                } else {
                  reply.badRequest(err); 
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