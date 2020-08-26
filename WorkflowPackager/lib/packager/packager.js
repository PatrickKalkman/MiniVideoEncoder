/*
 * HLS and Dash packager for packaging multi bitrate video and audio streams
 */

// Dependencies
const path = require('path');
const bento4 = require('fluent-bento4');
const { spawn } = require('child_process');
const rimraf = require('rimraf');
const superagent = require('superagent');

const log = require('../log');
const config = require('../config');
const constants = require('../constants');

const packager = {};

packager.packageContent = function packageContent(packageOptions, cb) {
  packager.getOutputStreams(packageOptions.jobId, (err, outputStreams) => {
    if (err) {
      cb(err);
    } else {
      switch (packageOptions.videoEncoder) {
        case constants.ENCODER_TYPES.X265:
          packager.createFragmentedOutputStreams(outputStreams);
          packager.createHlsPackageForX265(outputStreams);
          cb(false);
          break;
        case constants.ENCODER_TYPES.X264:
          packager.createFragmentedOutputStreams(outputStreams);
          packager.createHlsPackageForX264(outputStreams);
          cb(false);
          break;
        case constants.ENCODER_TYPES.VP9:
          packager.createMpegDashPackageForWebm(packageOptions, outputStreams, (packageErr) => {
            cb(packageErr);
          });
          cb(false);
          break;
        default:
          cb(false);
      }
    }
  });
};

packager.getOutputStreams = function getOutputStreams(jobId, cb) {
  const url = `${config.workflowEngine.url}jobs/${jobId}/streams`;
  superagent.get(url, (err, res) => {
    if (!err) {
      log.info(res);
      cb(false, res.body);
    } else {
      log.error(`An error occurred while trying to retrieve the output streams. Err: ${err}`);
      cb(err, null);
    }
  });
};

packager.createFragmentedOutputStreams = function createFragmentedOutputStreams(outputStreams) {
  outputStreams.forEach((outputStream) => {
    const result = bento4.mp4fragment.exec([outputStream, packager.createFragmentedOutputStreamFileName(outputStream, 'fr')]);
    //log.debug(result);
  });
};

packager.createHlsPackageForX265 = async function createHlsPackageForX265(outputStreams) {
  const fragmentedOutputStreams = outputStreams.map((outputStream) => packager.createFragmentedOutputStreamFileName(outputStream, 'fr'));
  const outputOption = packager.createPackagerOutputOption(outputStreams);
  const result = bento4.mp4dash.exec(fragmentedOutputStreams, ['--hls', '--no-split', '--use-segment-list', outputOption]);
  log.debug(result);
};

packager.createHlsPackageForX264 = async function createHlsPackageForX264(outputStreams) {
  const fragmentedOutputStreams = outputStreams.map((outputStream) => packager.createFragmentedOutputStreamFileName(outputStream, 'fr'));
  const outputOption = packager.createPackagerOutputOption(outputStreams);
  const result = bento4.mp4dash.exec(fragmentedOutputStreams, ['--hls', '--no-split', '--use-segment-list', outputOption]);
  //log.debug(result);
};


packager.createFragmentedOutputStreamFileName = function createFragmentedOutputStreamFileName(outputStream, addToFileName) {
  const indexOfExtensionDot = outputStream.lastIndexOf('.');
  if (indexOfExtensionDot !== -1) {
    const extension = outputStream.substring(indexOfExtensionDot);
    return outputStream.replace(extension, `_${addToFileName}${extension}`);
  }
  return `${outputStream}_${addToFileName}`;
};

packager.createPackagerOutputOption = function createPackagerOutputOption(outputStreams) {
  const outputStream = outputStreams[0];
  const fileNamePosition = outputStream.lastIndexOf('/');
  const outputPosition = outputStream.lastIndexOf('/', fileNamePosition);
  const output = outputStream.substring(outputPosition);
  const packageFolder = outputStream.replace(output, '/package');
  rimraf.sync(packageFolder);
  return `--output-dir=${packageFolder}`;
};

packager.createFfmpegDashOptions = function createDashOptions(outputStreams) {
  // ffmpeg \
  //  -f webm_dash_manifest -i video_160x90_250k.webm \
  //  -f webm_dash_manifest -i video_320x180_500k.webm \
  //  -f webm_dash_manifest -i video_640x360_750k.webm \
  //  -f webm_dash_manifest -i video_640x360_1000k.webm \
  //  -f webm_dash_manifest -i video_1280x720_500k.webm \
  //  -f webm_dash_manifest -i audio_128k.webm \
  //  -c copy -map 0 -map 1 -map 2 -map 3 -map 4 -map 5 \
  //  -f webm_dash_manifest \
  //  -adaptation_sets "id=0,streams=0,1,2,3,4 id=1,streams=5" \
  //  manifest.mpd

  const options = [];
  let adaptationSets = '-adaptation_sets "id=0,streams=';
  let index = 0;
  outputStreams.forEach((outputStream) => {
    options.push(`-f webm_dash_manifest -i ${outputStream}`);
  });
  options.push(`-f webm_dash_manifest -i ${outputStreams[0]}`);

  options.push('-c copy');
  outputStreams.forEach(() => {
    adaptationSets += `${index},`;
    options.push(`-map ${index}`);
    index += 1;
  });
  options.push('-f webm_dash_manifest');

  adaptationSets = adaptationSets.substring(0, adaptationSets.length - 1);
  adaptationSets += ` id=1,streams=${index}"`;
  options.push(adaptationSets);
  options.push('-f webm_dash_manifest');
  options.push('manifest.mpd');

  return options;
};

packager.createShakaPackagerOptions = function createDashOptions(packageOptions, outputStreams) {
  // packager \
  //   in=h264_baseline_360p_600.mp4,stream=audio,output=audio.mp4 \
  //   in=h264_baseline_360p_600.mp4,stream=video,output=h264_360p.mp4 \
  //   in=h264_main_480p_1000.mp4,stream=video,output=h264_480p.mp4 \
  //   in=h264_main_720p_3000.mp4,stream=video,output=h264_720p.mp4 \
  //   in=h264_high_1080p_6000.mp4,stream=video,output=h264_1080p.mp4 \
  //   --mpd_output h264.mpdn

  const firstOutputStreamIsAlsoUsedForAudio = outputStreams[0];
  const outputStreamAudio = packager.createFragmentedOutputStreamFileName(firstOutputStreamIsAlsoUsedForAudio, 'fraudio');

  const options = [];
  options.push(`in=${firstOutputStreamIsAlsoUsedForAudio},stream=audio,output=${outputStreamAudio}`);
  outputStreams.forEach((outputStream) => {
    const outputStreamConverted = packager.createFragmentedOutputStreamFileName(outputStream, 'fr');
    options.push(`in=${outputStream},stream=video,output=${outputStreamConverted}`);
  });

  const outputFiles = path.join(packageOptions.outputFolder, 'manifest.mpd');
  options.push(`-mpd_output ${outputFiles}`);
  log.info(options);
  return options;
};

packager.createMpegDashPackageForWebm = function createMpegDashPackageForWebm(packageOptions, outputStreams, cbFinished) {
  const shakaPackagerOptions = packager.createShakaPackagerOptions(packageOptions, outputStreams);

  const options = {};
  options.shell = true;

  const shakaPackager = spawn('packager', shakaPackagerOptions, options);

  shakaPackager.stdout.on('data', (data) => {
    log.info(`stdout: ${data}`);
  });

  shakaPackager.stderr.on('data', (data) => {
    log.info(`stderr: ${data}`);
  });

  shakaPackager.on('close', (code) => {
    log.info(`child process exited with code ${code}`);
    cbFinished();
  });
};

module.exports = packager;
