// Import our Controllers
const taskController = require('../controllers/taskController');

const taskRoutes = [
  {
    name: 'GetTasks',
    method: 'get',
    path: '/api/tasks',
    handler: taskController.getTasks,
  },
  {
    name: 'GetFirstNewEncodingTask',
    method: 'get',
    path: '/api/tasks/encoding/new',
    handler: taskController.getFirstNewEncodingTaskAndUpdate,
  },
  {
    name: 'GetFirstNewPackagingTask',
    method: 'get',
    path: '/api/tasks/packaging/new',
    handler: taskController.getFirstNewPackagingTaskAndUpdate,
  },
  {
    name: 'GetTask',
    method: 'get',
    path: '/api/tasks/:id',
    handler: taskController.getSingleTask,
  },
  {
    name: 'AddTask',
    method: 'post',
    path: '/api/tasks',
    handler: taskController.addTask,
  },
  {
    name: 'UpdateTask',
    method: 'put',
    path: '/api/tasks/:id',
    handler: taskController.updateTask,
  },
  {
    name: 'DeleteTask',
    method: 'delete',
    path: '/api/tasks/:id',
    handler: taskController.deleteTask,
  },
];

module.exports = taskRoutes;
