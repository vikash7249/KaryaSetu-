const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const query = { company: req.user.company._id, isArchived: false };
    if (req.user.role === 'employee') query.team = req.user._id;
    const projects = await Project.find(query).populate('manager', 'name email').populate('team', 'name email').sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const count = await Project.countDocuments({ company: req.user.company._id, isArchived: false });
    if (count >= req.user.company.planLimits.maxProjects)
      return res.status(403).json({ success: false, message: 'Project limit reached. Upgrade plan.' });

    const project = await Project.create({
      ...req.body,
      company: req.user.company._id,
      manager: req.user._id
    });
    await project.populate(['manager', 'team']);
    res.status(201).json({ success: true, project });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, company: req.user.company._id }).populate('manager', 'name email').populate('team', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name').sort({ order: 1 });
    res.json({ success: true, project, tasks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      req.body, { new: true }
    ).populate('manager team');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, authorize('company_admin', 'super_admin'), async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    await Task.deleteMany({ project: req.params.id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/archive', protect, authorize('company_admin', 'project_manager', 'super_admin'), async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      { isArchived: true }, { new: true }
    );
    res.json({ success: true, project });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
