const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require super_admin
router.use(protect, authorize('super_admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [companies, users, projects, tasks] = await Promise.all([
      Company.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Project.countDocuments({ isArchived: false }),
      Task.countDocuments()
    ]);
    res.json({ success: true, stats: { companies, users, projects, tasks } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/admin/companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().populate('admin', 'name email').sort({ createdAt: -1 });
    const data = await Promise.all(companies.map(async c => ({
      ...c.toObject(),
      userCount: await User.countDocuments({ company: c._id, isActive: true })
    })));
    res.json({ success: true, companies: data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/admin/companies/:id
router.put('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, company });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/admin/companies/:id/toggle
router.put('/companies/:id/toggle', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    company.isActive = !company.isActive;
    await company.save();
    res.json({ success: true, isActive: company.isActive });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
