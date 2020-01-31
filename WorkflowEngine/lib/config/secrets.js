// dependencies
const fs = require('fs');
const log = require('../log');

const dockerSecret = {};

dockerSecret.read = function read(secretName) {
  try {
    return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8');
  } catch(err) {
    if (err.code !== 'ENOENT') {
      log.error(`An error occurred while trying to read the secret: ${secretName}. Err: ${err}`);
    } else {
      log.debug(`Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`);
    }    
    return false;
  }
};

module.exports = dockerSecret;
