const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const File    = require('../models/File');
const { protect, authorize } = require('../middleware/auth');
const { log } = require('../utils/activityLog');

// ── Multer setup ──────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|xls|xlsx|ppt|pptx|png|jpg|jpeg|gif|zip|txt|csv/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    allowed.test(ext) ? cb(null, true) : cb(new Error('File type not allowed'));
  }
});

// Helper — try Cloudinary, fall back to local
const saveFile = async (file) => {
  if (process.env.CLOUDINARY_API_KEY) {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
        api_key:     process.env.CLOUDINARY_API_KEY,
        api_secret:  process.env.CLOUDINARY_API_SECRET
      });
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'karyasetu',
        resource_type: 'auto'
      });
      fs.unlinkSync(file.path); // remove local temp
      return { url: result.secure_url, publicId: result.public_id, source: 'cloudinary' };
    } catch (e) {
      console.error('[Cloudinary]', e.message);
    }
  }
  // Local fallback
  const url = `${process.env.CLIENT_URL || 'http://localhost:5000'}/uploads/${file.filename}`;
  return { url, publicId: file.filename, source: 'local' };
};

// POST /api/files/upload  — PM/Admin only
router.post('/upload', protect, authorize('company_admin', 'project_manager', 'super_admin'),
  upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      const { projectId, taskId } = req.body;
      const { url, publicId } = await saveFile(req.file);

      const file = await File.create({
        name:         req.file.filename,
        originalName: req.file.originalname,
        url, publicId,
        size:         req.file.size,
        mimeType:     req.file.mimetype,
        extension:    path.extname(req.file.originalname).replace('.', ''),
        project:      projectId || null,
        task:         taskId    || null,
        company:      req.user.company._id,
        uploadedBy:   req.user._id
      });

      await log({ company: req.user.company._id, user: req.user._id, action: 'file_uploaded', entity: 'file', entityId: file._id, entityName: req.file.originalname, req });

      await file.populate('uploadedBy', 'name');
      res.status(201).json({ success: true, file });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET /api/files  — list files (everyone can see, filtered by company)
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    const query = { company: req.user.company._id };
    if (projectId) query.project = projectId;
    if (taskId)    query.task    = taskId;

    const files = await File.find(query)
      .populate('uploadedBy', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/files/:id/download  — increment download count, redirect
router.get('/:id/download', protect, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    await File.findByIdAndUpdate(file._id, { $inc: { downloads: 1 } });

    // For local files, stream them
    if (!file.url.startsWith('http')) {
      const filePath = path.join(uploadDir, file.name);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        return res.sendFile(filePath);
      }
    }
    // For Cloudinary or external, redirect
    res.redirect(file.url);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/files/:id  — PM/Admin only
router.delete('/:id', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    // Delete from Cloudinary if applicable
    if (process.env.CLOUDINARY_API_KEY && file.publicId && !file.publicId.includes('/')) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(`karyasetu/${file.publicId}`);
      } catch (e) { console.error('[Cloudinary delete]', e.message); }
    } else {
      // Delete local file
      const localPath = path.join(uploadDir, file.name);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    }

    await File.findByIdAndDelete(file._id);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
