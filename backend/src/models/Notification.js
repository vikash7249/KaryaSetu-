const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type: {
    type: String,
    enum: ['task_assigned','task_completed','deadline_reminder','invitation','ai_alert','report_ready'],
    required: true
  },
  title:   String,
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
  link:    String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
