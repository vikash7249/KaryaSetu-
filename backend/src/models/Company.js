const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true },
  domain: { type: String, required: true, unique: true, lowercase: true },
  logo:   String,
  admin:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan:   { type: String, enum: ['free','starter','business','enterprise'], default: 'free' },
  planLimits: {
    maxUsers:    { type: Number, default: 5 },
    maxProjects: { type: Number, default: 3 },
    aiEnabled:   { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

companySchema.pre('save', function(next) {
  const limits = {
    free:       { maxUsers: 5,      maxProjects: 3,      aiEnabled: false },
    starter:    { maxUsers: 20,     maxProjects: 999,    aiEnabled: true  },
    business:   { maxUsers: 100,    maxProjects: 999,    aiEnabled: true  },
    enterprise: { maxUsers: 999999, maxProjects: 999999, aiEnabled: true  }
  };
  if (this.isModified('plan')) {
    this.planLimits = { ...this.planLimits, ...limits[this.plan] };
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
