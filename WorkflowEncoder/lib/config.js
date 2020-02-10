/*
 * Create and export configuration variables used by the API
 *
 */
const constants = require('./constants');

// Container for all environments
const environments = {};

environments.production = {
  httpPort: process.env.HTTP_PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  envName: 'production',
  log: {
    level: process.LOG_LEVEL || constants.LOG_LEVELS.DEBUG,
  },
  key: {
    fairplayKeyUrl: '',
  },
  workflowEngine: {
    url: process.env.WORKFLOWENGINE_URL || 'http://localhost:8181/api/',
    pollingInterval: 5000, // ms
  },
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment defined above,
// if not default to prodution
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.production;

// export the module
module.exports = environmentToExport;
