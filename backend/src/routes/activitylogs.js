const express = require('express');
const router  = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// GET /api/activitylogs  — Company-wide activity feed
router.get('/', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const { limit = 50, page = 1, entity, action } = req.query;
    const query = { company: req.user.company._id };
    if (entity) query.entity = entity;
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
      .populate('user', 'name profile.photo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);
    res.json({ success: true, logs, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
