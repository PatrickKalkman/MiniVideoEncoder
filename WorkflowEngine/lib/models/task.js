// External Dependancies
const mongoose = require('mongoose');

const { Schema } = mongoose;

const taskSchema = new mongoose.Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  name: { type: String, required: true },
  taskType: { type: String, required: true },
  videoEncoder: { type: String, required: true },
  videoBitrate: { type: String, required: true },
  videoSize: { type: String, required: true },
  audioEncoder: { type: String, required: true },
  audioBitrate: { type: String, required: true },
  audioFrequency: { type: String, required: true },
  inputFolder: { type: String, required: true },
  inputAsset: { type: String, required: true },
  outputFolder: { type: String, required: true },
  outputAsset: { type: String, required: true },
  status: { type: String, required: false },
  statusMessage: { type: String, required: false },
}, { timestamps: true });

taskSchema.index({ jobId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ name: 1 });

module.exports = mongoose.model('tasks', taskSchema);
