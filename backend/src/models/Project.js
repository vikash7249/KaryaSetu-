const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: String,
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['planning','active','on_hold','completed'], default: 'active' },
  priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  startDate:   Date,
  dueDate:     Date,
  completedAt: Date,
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  tags:        [String],
  isArchived:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
