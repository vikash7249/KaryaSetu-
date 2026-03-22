const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: String,
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['pending','in_progress','completed','on_hold'], default: 'pending' },
  priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  dueDate:     Date,
  completedAt: Date,
  startedAt:   Date,
  estimatedHours: Number,
  actualHours:    Number,
  isDelayed:      { type: Boolean, default: false },
  reworkCount:    { type: Number, default: 0 },
  comments: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:      String,
    createdAt: { type: Date, default: Date.now }
  }],
  order:       { type: Number, default: 0 }
}, { timestamps: true });

taskSchema.pre('save', function(next) {
  if (this.dueDate && this.status !== 'completed') {
    this.isDelayed = new Date() > this.dueDate;
  }
  if (this.isModified('status')) {
    if (this.status === 'in_progress' && !this.startedAt)  this.startedAt  = new Date();
    if (this.status === 'completed')                        this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
