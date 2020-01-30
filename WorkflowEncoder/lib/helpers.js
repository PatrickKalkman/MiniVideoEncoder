/*
 * Helpers contain helper functions that are too small to .... their own module
 */

// Dependencies
const url = require('url');
const crypto = require('crypto');
const config = require('./config');
const log = require('./log');

const lib = {};

lib.getTrimmedPath = function getTrimmedPath(rawUrl) {
  const parsedUrl = url.parse(rawUrl, true);
  // return the path name from the url and remove slashes before and after.
  return parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
};

lib.getQueryStringObject = function getQueryStringObject(rawUrl) {
  const parsedUrl = url.parse(rawUrl, true);
  return parsedUrl.query;
};

// Generate a random string
lib.generateId = function generateId(length) {
  // We generate an hex string, therefore we divide the given length by 2
  return crypto.randomBytes(length / 2).toString('hex').toLowerCase();
};

// Parse a JSON string to an object in all cases, without throwing
lib.parseJsonToObject = function parseJsonToObject(jsonString) {
  try {
    if (typeof (jsonString) === 'string' && jsonString.length > 0) {
      if (/^[\],:{}\s]*$/.test(jsonString.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return JSON.parse(jsonString);
      }
      return {};
    }
    return {};
  } catch (err) {
    log.debug(`parseJsonToObject: An error occurred while 
      trying to parse "${jsonString}". ${err}`);
    return {};
  }
};

// Hash the given string
lib.hash = function hash(stringToHash) {
  if (typeof (stringToHash) === 'string' && stringToHash.length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(stringToHash).digest('hex');
  }
  return false;
};

module.exports = lib;
