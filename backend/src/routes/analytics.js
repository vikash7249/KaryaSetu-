const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const cid = req.user.company._id;

    const [projectCount, inProgress, completed, totalTasks] = await Promise.all([
      Project.countDocuments({ company: cid, status: 'active', isArchived: false }),
      Task.countDocuments({ company: cid, status: 'in_progress' }),
      Task.countDocuments({ company: cid, status: 'completed' }),
      Task.countDocuments({ company: cid })
    ]);

    const productivity = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
    const delayed = await Task.countDocuments({ company: cid, isDelayed: true, status: { $ne: 'completed' } });

    const recentTasks = await Task.find({ company: cid })
      .sort({ updatedAt: -1 }).limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'name');

    const aiInsight = delayed > 0
      ? `${delayed} task${delayed > 1 ? 's are' : ' is'} overdue. Check Kanban board and redistribute workload.`
      : productivity >= 85
      ? `Team productivity is at ${productivity}%. Great work this week!`
      : `Team is at ${productivity}% productivity. Use AI Assistant to rebalance workloads.`;

    res.json({
      success: true,
      stats: { projects: projectCount, tasksInProgress: inProgress, completed, productivity },
      recentTasks,
      aiInsight
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/analytics/productivity
router.get('/productivity', protect, async (req, res) => {
  try {
    const users = await User.find({ company: req.user.company._id, isActive: true }, 'name productivityScore points badges profile');

    const data = await Promise.all(users.map(async (u) => {
      const [total, done] = await Promise.all([
        Task.countDocuments({ assignedTo: u._id }),
        Task.countDocuments({ assignedTo: u._id, status: 'completed' })
      ]);
      return { ...u.toObject(), stats: { total, completed: done, rate: total ? Math.round((done / total) * 100) : 0 } };
    }));

    res.json({ success: true, productivity: data.sort((a, b) => b.productivityScore - a.productivityScore) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
