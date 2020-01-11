const jobController = require('../controllers/jobController');

const jobRoutes = [
  {
    name: 'GetJobs',
    method: 'get',
    path: '/api/jobs',
    handler: jobController.getJobs,
  },
  {
    name: 'GetJobs',
    method: 'get',
    path: '/api/jobs/:id',
    handler: jobController.getJob,
  },
  {
    name: 'AddJob',
    method: 'post',
    path: '/api/jobs',
    handler: jobController.addJob,
  },
  {
    name: 'UpdateJob',
    method: 'put',
    path: '/api/jobs/:id',
    handler: jobController.updateJob,
  },
  {
    name: 'DeleteJob',
    method: 'delete',
    path: '/api/jobs/:id',
    handler: jobController.deleteJob,
  },
];

module.exports = jobRoutes;