const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/team
router.get('/team', protect, async (req, res) => {
  try {
    const users = await User.find({ company: req.user.company._id, isActive: true })
      .select('-password')
      .sort({ name: 1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/users/invitations
router.get('/invitations', protect, authorize('company_admin', 'super_admin'), async (req, res) => {
  try {
    const Invitation = require('../models/Invitation');
    const invitations = await Invitation.find({ company: req.user.company._id })
      .populate('invitedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, invitations });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', protect, authorize('company_admin', 'super_admin'), async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/users/:id/deactivate
router.put('/:id/deactivate', protect, authorize('company_admin', 'super_admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself' });

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: req.user.company._id },
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
