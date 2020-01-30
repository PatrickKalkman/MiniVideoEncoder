/*
 * Video and audio encoder for encoding video and audio
 */

// Dependencies
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const log = require('../log');
const config = require('../config');
const constants = require('../constants');

const encoder = {};

encoder.encode = function encode(encoderOptions, cbError, cbProgress, cbFinished) {
  const startTime = Date.now();
  const inputAsset = path.join(encoderOptions.inputFolder, encoderOptions.inputAsset);
  const outputAsset = path.join(encoderOptions.outputFolder, encoderOptions.outputAsset);
  log.debug(`input: ${inputAsset}`);
  log.debug(`output: ${outputAsset}`);

  if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.X265) {
    ffmpeg()
    .input(inputAsset)
    .videoBitrate(encoderOptions.videoBitrate)
    .videoCodec(encoderOptions.videoEncoder)
    .size(encoderOptions.videoSize)
    .audioCodec(encoderOptions.audioEncoder)
    .audioBitrate(encoderOptions.audioBitrate)
    .audioFrequency(encoderOptions.audioFrequency)
    .withOutputOptions('-force_key_frames "expr:gte(t,n_forced*2)"')
    .outputOption('-x265-params keyint=48:min-keyint=48:scenecut=0:ref=5:bframes=3:b-adapt=2')
    .setDuration(60)
    .on('progress', (info) => {
      cbProgress(info);
    })
    .on('end', () => {
      const endTime = Date.now();
      log.info(`Encoding finished after ${((endTime - startTime) / 1000)} s`);
      cbFinished();
    })
    .on('error', (err, stdout, stderr) => {
      log.error(`Error: ${err.message}`);
      log.error(`ffmpeg output:\n${stdout}`);
      log.error(`ffmpeg stderr:\n${stderr}`);
      cbError(err)
    })
    .save(outputAsset);
  } else if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.VP9) {
    ffmpeg()
    .input(inputAsset)
    .videoBitrate(encoderOptions.videoBitrate)
    .videoCodec(encoderOptions.videoEncoder)
    .size(encoderOptions.videoSize)
    .audioCodec(encoderOptions.audioEncoder)
    .audioBitrate(encoderOptions.audioBitrate)
    .audioFrequency(encoderOptions.audioFrequency)
    .outputOption('-crf 23 -keyint_min 48 -g 48 -t 60 -threads 8 -speed 4 -tile-columns 4 -auto-alt-ref 1 -lag-in-frames 25 -frame-parallel 1 -af "channelmap=channel_layout=5.1"')
    .setDuration(30)
    .on('progress', (info) => {
      cbProgress(info);
    })
    .on('end', () => {
      const endTime = Date.now();
      log.info(`Encoding finished after ${((endTime - startTime) / 1000)} s`);
      cbFinished();
    })
    .on('error', (err, stdout, stderr) => {
      log.error(`Error: ${err.message}`);
      log.error(`ffmpeg output:\n${stdout}`);
      log.error(`ffmpeg stderr:\n${stderr}`);
      cbError(err)
    })
    .save(outputAsset);
  }
  else if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.X264) {

  }

//  ffmpeg -y -ss 00:32:00 -i joker.mkv -c:v libvpx-vp9 -crf 30 -s 768x432 -b:v 300k -maxrate 330K -keyint_min 48 -g 48 -t 20 -threads 8 -speed 4 -tile-columns 4 -auto-alt-ref 1 -lag-in-frames 25 -frame-parallel 1 -c:a libopus -af "channelmap=channel_layout=5.1" joker.webm
// ffmpeg -ss 00:16:00 -y -i joker.mkv -c:v libvpx-vp9 -pass 1 -b:v 300K -keyint_min 48 -g 48 -an -threads 8 -t 20 -tile-columns 4 -auto-alt-ref 1 -lag-in-frames 25 -frame-parallel 1 -f webm /dev/null && \
// ffmpeg -ss 00:16:00 -i joker.mkv -c:v libvpx-vp9 -s 768x432 -pass 2 -b:v 300K -maxrate 330K -keyint_min 48 -g 48 -t 20 -threads 8 -speed 4 -tile-columns 4 -auto-alt-ref 1 -lag-in-frames 25 -frame-parallel 1 -an -f webm joker.webm

};

module.exports = encoder; 