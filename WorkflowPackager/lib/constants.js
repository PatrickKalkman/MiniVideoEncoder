/*
 * Module that define constants used in the app.
 *
 */

module.exports = Object.freeze({

  HLS: 'hls',

  LOG_LEVELS: {
    ERROR: 4,
    WARNING: 3,
    INFORMATION: 2,
    DEBUG: 1,
  },

  WORKFLOW_STATUS: {
    NEW: 'new',
    QUEUED: 'queued',
    INPROGRESS: 'inprogress',
    ERROR: 'error',
    DONE: 'done',
  },

  ENCODER_TYPES: {
    X265: 'libx265',
    X264: 'libx264',
    VP9: 'libvpx-vp9'
  },  
});
