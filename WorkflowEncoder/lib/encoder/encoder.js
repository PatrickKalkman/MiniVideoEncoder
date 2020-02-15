/*
 * Video and audio encoder for encoding video and audio
 */

// Dependencies
const { parentPort, workerData } = require('worker_threads');

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const log = require('../log');
const constants = require('../constants');

async function encode() {
  const encoderOptions = workerData;
  const startTime = Date.now();
  const inputAsset = path.join(encoderOptions.inputFolder, encoderOptions.inputAsset);
  const outputAsset = path.join(encoderOptions.outputFolder, encoderOptions.outputAsset);
  log.debug(`input: ${inputAsset}`);
  log.debug(`output: ${outputAsset}`);

  if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.X265) {
    const ffmpegCommand = ffmpeg()
      .input(inputAsset)
      .videoBitrate(encoderOptions.videoBitrate)
      .videoCodec(encoderOptions.videoEncoder)
      .size(encoderOptions.videoSize)
      .audioCodec(encoderOptions.audioEncoder)
      .audioBitrate(encoderOptions.audioBitrate)
      .audioFrequency(encoderOptions.audioFrequency)
      .withOutputOptions('-force_key_frames "expr:gte(t,n_forced*2)"')
      .outputOption('-x265-params keyint=48:min-keyint=48:scenecut=0:ref=5:bframes=3:b-adapt=2')
      .on('progress', (info) => {
        const message = {};
        message.type = constants.WORKER_MESSAGE_TYPES.PROGRESS;
        message.message = `Encoding: ${Math.round(info.percent)}%`;
        parentPort.postMessage(message);
      })
      .on('end', () => {
        const message = {};
        message.type = constants.WORKER_MESSAGE_TYPES.DONE;
        const endTime = Date.now();
        message.message = `Encoding finished after ${(endTime - startTime) / 1000} s`;
        parentPort.postMessage(message);
      })
      .on('error', (err, stdout, stderr) => {
        const message = {};
        message.type = constants.WORKER_MESSAGE_TYPES.ERROR;
        message.message = `An error occurred during encoding. ${err.message}`;
        parentPort.postMessage(message);

        log.error(`Error: ${err.message}`);
        log.error(`ffmpeg output: ${stdout}`);
        log.error(`ffmpeg stderr: ${stderr}`);
      })
      .save(outputAsset);

    parentPort.on('message', (message) => {
      if (message.type === constants.WORKER_MESSAGE_TYPES.STOP_ENCODING) {
        // Main thread asks to kill this thread.
        log.info('Main thread asked to stop this thread');
        ffmpegCommand.kill();
      }
    });
  } else if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.VP9) {
    ffmpeg()
      .input(inputAsset)
      .videoBitrate(encoderOptions.videoBitrate)
      .videoCodec(encoderOptions.videoEncoder)
      .size(encoderOptions.videoSize)
      .audioCodec(encoderOptions.audioEncoder)
      .audioBitrate(encoderOptions.audioBitrate)
      .audioFrequency(encoderOptions.audioFrequency)
      .outputOption(
        '-crf 23 -keyint_min 48 -g 48 -t 60 -threads 8 -speed 4 -tile-columns 4 -auto-alt-ref 1 -lag-in-frames 25 -frame-parallel 1 -af "channelmap=channel_layout=5.1"',
      )
      .on('progress', (info) => {
        log.info(`Encoding: ${info.percent}`);
      })
      .on('end', () => {
        const endTime = Date.now();
        log.info(`Encoding finished after ${(endTime - startTime) / 1000} s`);
      })
      .on('error', (err, stdout, stderr) => {
        log.error(`Error: ${err.message}`);
        log.error(`ffmpeg output:\n${stdout}`);
        log.error(`ffmpeg stderr:\n${stderr}`);
        log.error(`An error occurred during encoding. ${err.message}`);
      })
      .save(outputAsset);
  } else if (encoderOptions.videoEncoder === constants.ENCODER_TYPES.X264) {
    // TODO: fill x264 encoding template
  }
}

encode();
