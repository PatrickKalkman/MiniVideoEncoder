/*
 * key generator for generating encryption keys for various DRM systems
 */

// Dependencies
const crypto = require('crypto');
const uuidV4 = require('uuid/v4');

const log = require('../log');
const config = require('../config');

const keyGenerator = {};

keyGenerator.generate = function generate(cb) {
  crypto.randomBytes(64, (err, buffer) => {
    if (err) {
      log.error(`An error occurred while generating a key: ${err}`);
      cb(err, null);
    }

    const encryptionKeyBuffer = buffer.slice(0, 16);
    const encryptionIvBuffer = buffer.slice(16, 32);

    const key = encryptionKeyBuffer.toString('hex');
    const iv = encryptionIvBuffer.toString('hex');

    const keyModel = {};
    keyModel.id = uuidV4();
    keyModel.key = buffer;
    keyModel.keyString = `${key}:${iv}`;
    keyModel.keyUrl = `${config.key.fairplayKeyUrl}${keyModel.id}`;
    keyModel.keyFileName = `${keyModel.id}.bin`;
    cb(null, keyModel);
  });
};

module.exports = keyGenerator;

// keyGenerator.generate((err, keyModel) => {
//   if (!err) {
//     log.info(`Key id: ${keyModel.id}`);
//     log.info(`Key hex: ${keyModel.keyString}`);
//     log.info(`Key url: ${keyModel.keyUrl}`);
//     fs.writeFileSync(keyModel.keyFileName, keyModel.key);
//   }
// });
