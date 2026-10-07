const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true },
  type: { type: String, enum: ['notes', 'assignment', 'paper', 'syllabus', 'other'], default: 'notes' },
  fileUrl: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, default: '' },
  semester: { type: String, default: '' },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
