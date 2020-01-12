const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  encodingType: { type: String, required: true },
  inputFolder: { type: String, required: true },
  inputAsset: { type: String, required: true },
  outputFolder: { type: String, required: true },
  outputAsset: { type: String, required: true },
  status: { type: String, required: false },
  statusMessage: { type: String, required: false },
  priority: { type: Number, required: false },
}, { timestamps: true });

jobSchema.index({ status: 1 });
jobSchema.index({ name: 1 });

module.exports = mongoose.model('Job', jobSchema);
