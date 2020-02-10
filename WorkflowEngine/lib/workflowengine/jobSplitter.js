/*
 * JobSplitter
 */

// Dependencies
const log = require('../log');
const constants = require('../config/constants');
const storage = require('../database/database');
const Task = require('../models/task');
const authoringSpec = require('./authoring-spec');

const jobSplitter = {};

jobSplitter.generateOutputAssetName = function generateOutputAssetName(job, track) {
  const videoSize = track.videoSize.replace('x', '_');
  const { videoBitrate } = track;
  const extensionDotPos = job.outputAsset.lastIndexOf('.');
  const newExtension = jobSplitter.getExtension(track.videoEncoder);
  if (extensionDotPos !== -1) {
    const extension = job.outputAsset.substr(extensionDotPos);
    return job.outputAsset.replace(extension, `_${videoSize}_${videoBitrate}.${newExtension}`);
  }
  return `${job.outputAsset}_${videoSize}_${videoBitrate}.${newExtension}`;
};

jobSplitter.getExtension = function getExtension(videoEncoder) {
  switch (videoEncoder) {
    case constants.ENCODER_TYPES.X264:
    case constants.ENCODER_TYPES.X265:
      return 'mp4';
    case constants.ENCODER_TYPES.VP9:
      return 'webm';
    default:
      return 'mp4';
  }
};

jobSplitter.split = function split(job, cb) {
  // Split the job into one or more tasks depending on the encodingType
  const jobToUpdate = job;
  const spec = authoringSpec.getAuthoringSpec(job.encodingType);
  if (spec) {
    if (spec.encodingTracks && Array.isArray(spec.encodingTracks) && spec.encodingTracks.length > 0) {
      spec.encodingTracks.forEach(async (encodingTrack) => {
        const task = jobSplitter.generateEncodingTask(jobToUpdate, encodingTrack);
        await database.addTask(task);
      });
    }
    if (spec.packagingTracks && Array.isArray(spec.packagingTracks) && spec.packagingTracks.length > 0) {
      spec.packagingTracks.forEach(async (packagingTrack) => {
        const task = jobSplitter.generatePackagingTask(jobToUpdate, packagingTrack);
        await database.addTask(task);
      });
    }
    cb();
  } else {
    const message = `Could not split the job ${job.name} as the authoring spec/encoding type could not be found, setting job status to error`;
    log.error(message);
    jobToUpdate.status = constants.WORKFLOW_STATUS.ERROR;
    jobToUpdate.statusMessage = message;
    database.updateJob(jobToUpdate);
    cb({ message });
  }
};

jobSplitter.generateEncodingTask = function generateEncodingTask(job, encodingTrack) {
  const task = new Task();
  task.jobId = job._id;
  task.name = `${job.name} ${encodingTrack.videoSize} ${encodingTrack.videoBitrate}`;
  task.taskType = constants.TASK_TYPES.ENCODING;
  task.inputFolder = job.inputFolder;
  task.inputAsset = job.inputAsset;
  task.outputFolder = job.outputFolder;
  task.videoEncoder = encodingTrack.videoEncoder;
  task.videoSize = encodingTrack.videoSize;
  task.videoBitrate = encodingTrack.videoBitrate;
  task.audioEncoder = encodingTrack.audioEncoder;
  task.audioBitrate = encodingTrack.audioBitrate;
  task.audioFrequency = encodingTrack.audioFrequency;
  task.outputAsset = jobSplitter.generateOutputAssetName(job, encodingTrack);
  task.status = constants.WORKFLOW_STATUS.NEW;
  return task;
};

jobSplitter.generatePackagingTask = function generatePackagingTask(job, packagingTrack) {
  const task = new Task();
  task.jobId = job._id;
  task.name = `${job.name} packaging`;
  task.taskType = constants.TASK_TYPES.PACKAGING;
  task.inputFolder = job.inputFolder;
  task.inputAsset = job.inputAsset;
  task.outputFolder = job.outputFolder;
  task.videoEncoder = packagingTrack.videoEncoder;
  task.videoSize = packagingTrack.videoSize;
  task.videoBitrate = packagingTrack.videoBitrate;
  task.audioEncoder = packagingTrack.audioEncoder;
  task.audioBitrate = packagingTrack.audioBitrate;
  task.audioFrequency = packagingTrack.audioFrequency;
  task.outputAsset = `${job.name}`;
  task.status = constants.WORKFLOW_STATUS.NEW;
  return task;
};

module.exports = jobSplitter;
