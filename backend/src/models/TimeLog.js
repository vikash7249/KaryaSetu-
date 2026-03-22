const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  task:      { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime:   { type: Date },
  duration:  { type: Number }, // minutes
  note:      { type: String },
  isRunning: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-calc duration on save
timeLogSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 60000);
    this.isRunning = false;
  }
  next();
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
