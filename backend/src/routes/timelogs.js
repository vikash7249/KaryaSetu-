const express = require('express');
const router  = express.Router();
const TimeLog = require('../models/TimeLog');
const Task    = require('../models/Task');
const { protect } = require('../middleware/auth');

// POST /api/timelogs/start  — Start timer for a task
router.post('/start', protect, async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'taskId required' });

    // Stop any running timer for this user first
    await TimeLog.updateMany(
      { user: req.user._id, isRunning: true },
      { $set: { endTime: new Date(), isRunning: false } }
    );

    const task = await Task.findOne({ _id: taskId, company: req.user.company._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const timeLog = await TimeLog.create({
      task:      taskId,
      project:   task.project,
      company:   req.user.company._id,
      user:      req.user._id,
      startTime: new Date(),
      isRunning: true
    });

    res.status(201).json({ success: true, timeLog });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/timelogs/stop  — Stop running timer
router.post('/stop', protect, async (req, res) => {
  try {
    const { note } = req.body;
    const timeLog = await TimeLog.findOne({ user: req.user._id, isRunning: true });
    if (!timeLog) return res.status(404).json({ success: false, message: 'No running timer' });

    timeLog.endTime  = new Date();
    timeLog.isRunning = false;
    if (note) timeLog.note = note;
    await timeLog.save(); // duration auto-calculated in pre-save

    // Update task actualHours
    const totalMins = await TimeLog.aggregate([
      { $match: { task: timeLog.task, user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    if (totalMins[0]) {
      await Task.findByIdAndUpdate(timeLog.task, { actualHours: Math.round(totalMins[0].total / 60 * 10) / 10 });
    }

    res.json({ success: true, timeLog, duration: timeLog.duration });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/timelogs  — Get logs for current user or task
router.get('/', protect, async (req, res) => {
  try {
    const { taskId, userId, projectId } = req.query;
    const query = { company: req.user.company._id };

    if (req.user.role === 'employee') query.user = req.user._id;
    else if (userId) query.user = userId;

    if (taskId)    query.task    = taskId;
    if (projectId) query.project = projectId;

    const logs = await TimeLog.find(query)
      .populate('task', 'title')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    // Total time per user
    const totals = await TimeLog.aggregate([
      { $match: query },
      { $group: { _id: '$user', totalMins: { $sum: '$duration' } } }
    ]);

    res.json({ success: true, logs, totals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/timelogs/running  — Check if user has active timer
router.get('/running', protect, async (req, res) => {
  try {
    const running = await TimeLog.findOne({ user: req.user._id, isRunning: true }).populate('task', 'title');
    res.json({ success: true, running });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
