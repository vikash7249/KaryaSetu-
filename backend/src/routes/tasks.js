const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { log } = require('../utils/activityLog');

router.get('/', protect, async (req, res) => {
  try {
    const { status, priority, projectId } = req.query;
    const query = { company: req.user.company._id };
    if (req.user.role === 'employee') query.assignedTo = req.user._id;
    if (status)    query.status   = status;
    if (priority)  query.priority = priority;
    if (projectId) query.project  = projectId;
    const tasks = await Task.find(query).populate('project', 'name').populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, company: req.user.company._id, assignedBy: req.user._id });
    await task.populate(['project', 'assignedTo']);

    if (req.body.assignedTo) {
      await Notification.create({
        user: req.body.assignedTo,
        company: req.user.company._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you "${req.body.title}"`
      });
    }

    await log({ company: req.user.company._id, user: req.user._id, action: 'task_created', entity: 'task', entityId: task._id, entityName: task.title, req });

    // Update project progress
    await updateProjectProgress(task.project);

    res.status(201).json({ success: true, task });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, company: req.user.company._id })
      .populate('project', 'name').populate('assignedTo', 'name email profile').populate('comments.user', 'name');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const update = req.user.role === 'employee' ? { status: req.body.status } : req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('project', 'name').populate('assignedTo', 'name');

    if (req.body.status === 'completed' && task.status !== 'completed') {
      const proj = await Project.findById(task.project).populate('manager', 'email name');
      if (proj?.manager) {
        await Notification.create({
          user: proj.manager._id,
          company: req.user.company._id,
          type: 'task_completed',
          title: 'Task Completed',
          message: `${req.user.name} completed "${task.title}"`
        });
      }
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: task.isDelayed ? 50 : 100 } });

      // Check and award badges
      const { checkAndAwardBadges } = require('../utils/badges');
      checkAndAwardBadges(req.user._id).catch(console.error);

      // Real-time emit
      const { emitToCompany } = require('../utils/socket');
      emitToCompany(req.user.company._id.toString(), 'task:completed', {
        taskId: task._id, taskTitle: task.title,
        completedBy: req.user.name, projectId: task.project
      });

      // Activity log
      await log({ company: req.user.company._id, user: req.user._id, action: 'task_completed', entity: 'task', entityId: task._id, entityName: task.title, req });
    }

    await updateProjectProgress(task.project);
    res.json({ success: true, task: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','in_progress','completed','on_hold'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      { status, ...(status === 'in_progress' && { startedAt: new Date() }), ...(status === 'completed' && { completedAt: new Date() }) },
      { new: true }
    ).populate('project', 'name').populate('assignedTo', 'name');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await updateProjectProgress(task.project._id);
    res.json({ success: true, task });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await updateProjectProgress(task.project);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment required' });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      { $push: { comments: { user: req.user._id, text, createdAt: new Date() } } },
      { new: true }
    ).populate('comments.user', 'name');
    res.json({ success: true, task });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

async function updateProjectProgress(projectId) {
  if (!projectId) return;
  const total = await Task.countDocuments({ project: projectId });
  const done  = await Task.countDocuments({ project: projectId, status: 'completed' });
  await Project.findByIdAndUpdate(projectId, { progress: total ? Math.round((done / total) * 100) : 0 });
}

module.exports = router;
