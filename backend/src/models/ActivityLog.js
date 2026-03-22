const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, required: true },
  // e.g. 'task_created', 'task_completed', 'project_created', 'user_invited'
  entity:    { type: String }, // 'task', 'project', 'user'
  entityId:  { type: mongoose.Schema.Types.ObjectId },
  entityName:{ type: String }, // human readable name
  details:   { type: mongoose.Schema.Types.Mixed },
  ip:        { type: String }
}, { timestamps: true });

// Auto delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
