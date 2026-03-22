const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  company:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  role: {
    type: String,
    enum: ['super_admin', 'company_admin', 'project_manager', 'employee'],
    default: 'employee'
  },
  profile: {
    photo:         { type: String, default: '' },
    jobTitle:      { type: String, default: '' },
    designation:   { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    manager:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  isFirstLogin:       { type: Boolean, default: true },
  isActive:           { type: Boolean, default: true },
  lastLogin:          Date,
  productivityScore:  { type: Number, default: 0 },
  points:             { type: Number, default: 0 },
  badges: [{ name: String, icon: String, earnedAt: Date }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
