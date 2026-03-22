const mongoose = require('mongoose');
const crypto = require('crypto');

const invitationSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  company:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  role:      { type: String, enum: ['project_manager','employee'], default: 'employee' },
  token:     { type: String, default: () => crypto.randomBytes(32).toString('hex'), unique: true },
  tempPassword: String,
  status:    { type: String, enum: ['pending','accepted','expired'], default: 'pending' },
  expiresAt: { type: Date,   default: () => new Date(Date.now() + 7*24*60*60*1000) }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
