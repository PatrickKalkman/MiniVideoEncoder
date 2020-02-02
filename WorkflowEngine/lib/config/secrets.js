// dependencies
const fs = require('fs');
const log = require('../log');

const dockerSecret = {};

dockerSecret.read = function read(secretNameAndPath) {
  try {
    return fs.readFileSync(`${secretNameAndPath}`, 'utf8');
  } catch(err) {
    if (err.code !== 'ENOENT') {
      log.error(`An error occurred while trying to read the secret: ${secretNameAndPath}. Err: ${err}`);
    } else {
      log.debug(`Could not find the secret, probably not running in swarm mode: ${secretNameAndPath}. Err: ${err}`);
    }    
    return false;
  }
};

module.exports = dockerSecret;
