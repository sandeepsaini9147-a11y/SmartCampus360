const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['academic', 'exam', 'holiday', 'general', 'urgent'], default: 'general' },
  targetAudience: { type: String, enum: ['all', 'student', 'faculty'], default: 'all' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
