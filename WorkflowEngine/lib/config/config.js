/*
 * Create and export configuration variables used by the API
 *
 */
const constants = require('./constants');

// Container for all environments
const environments = {};

environments.production = {
  httpPort: process.env.HTTP_PORT || 8181,
  host: process.env.HOST || '0.0.0.0',
  envName: 'production',
  log: {
    level: process.LOG_LEVEL || constants.LOG_LEVELS.DEBUG,
  },
  database: {
    url: process.env.STORAGE_HOST || 'mongodb://mve-workflowengine:mve-workflowengine-password@localhost:27017/workflow-db?authMechanism=DEFAULT&authSource=workflow-db',
    name: 'workflow-db',
    connectRetry: 5, // seconds
  },
  workflow: {
    pollingInterval: 10, // Seconds
  },
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environment defined above,
// if not default to prodution
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.production;

// export the module
module.exports = environmentToExport;
