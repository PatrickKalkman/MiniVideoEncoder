/*
 * Module that define constants used in the app.
 *
 */

module.exports = Object.freeze({
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_CREATED: 201,
  HTTP_BAD_REQUEST: 400,
  HTTP_STATUS_UNAUTHORIZED: 403,
  HTTP_STATUS_NOT_FOUND: 404,
  HTTP_INTERNAL_SERVER_ERROR: 500,

  HTTP_METHOD_GET: 'get',
  HTTP_METHOD_POST: 'post',
  HTTP_METHOD_PUT: 'put',
  HTTP_METHOD_DELETE: 'delete',

  HLS: 'hls',

  RESPONSE_TYPES: {
    JSON: 'json',
    STREAM: 'stream',
    HTML: 'html',
  },

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
