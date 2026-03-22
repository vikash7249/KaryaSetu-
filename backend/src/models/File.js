const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  originalName:{ type: String, required: true },
  url:         { type: String, required: true },
  publicId:    { type: String, required: true }, // Cloudinary public_id
  size:        { type: Number }, // bytes
  mimeType:    { type: String },
  extension:   { type: String },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task:        { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads:   { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
