// Import the health controller
const healthController = require('../controllers/healthController');

const healthRoutes = [
  {
    name: 'GetHealth',
    method: 'get',
    path: '/api/health',
    handler: healthController.getHealth,
  },
];

module.exports = healthRoutes;
