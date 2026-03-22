const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const Invitation = require('../models/Invitation');
const { protect, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { log } = require('../utils/activityLog');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, code, res) => {
  const token = signToken(user._id);
  res.status(code).json({
    success: true, token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, isFirstLogin: user.isFirstLogin, profile: user.profile }
  });
};

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('companyName').trim().notEmpty(),
  body('companyDomain').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  try {
    const { name, email, password, companyName, companyDomain } = req.body;
    const domain = companyDomain.toLowerCase().trim();
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (emailDomain !== domain)
      return res.status(400).json({ success: false, message: `Email must end with @${domain}` });

    const existing = await Company.findOne({ domain });
    if (existing)
      return res.status(400).json({ success: false, message: 'This domain is already registered' });

    const company = await Company.create({ name: companyName, domain });
    const user = await User.create({ name, email, password, company: company._id, role: 'company_admin', isFirstLogin: false });

    company.admin = user._id;
    await company.save();

    sendEmail({ to: email, subject: `Welcome to KaryaSetu!`, template: 'welcome', data: { name, companyName } }).catch(console.error);

    await log({ company: company._id, user: user._id, action: 'company_registered', entity: 'company', entityId: company._id, entityName: companyName, req });

    sendToken(user, 201, res);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already registered' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('company');

    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (user.company.domain !== emailDomain)
      return res.status(403).json({ success: false, message: 'Email domain does not match company workspace' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  res.json({ success: true, user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { jobTitle, designation, contactNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.jobTitle': jobTitle, 'profile.designation': designation, 'profile.contactNumber': contactNumber },
      { new: true }
    ).populate('company');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password wrong' });
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/invite
router.post('/invite', protect, authorize('company_admin', 'super_admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    const company = req.user.company;
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (emailDomain !== company.domain)
      return res.status(400).json({ success: false, message: `Email must be @${company.domain}` });

    const userCount = await User.countDocuments({ company: company._id, isActive: true });
    if (userCount >= company.planLimits.maxUsers)
      return res.status(403).json({ success: false, message: `User limit reached. Upgrade plan.` });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '@K1';

    const invitation = await Invitation.create({
      email: email.toLowerCase(), role,
      company: company._id,
      invitedBy: req.user._id,
      tempPassword
    });

    await sendEmail({
      to: email,
      subject: `Invitation to join ${company.name} on KaryaSetu`,
      template: 'invitation',
      data: {
        companyName: company.name,
        inviterName: req.user.name,
        email, tempPassword,
        role: role.replace('_', ' '),
        acceptUrl: `${process.env.CLIENT_URL}/accept-invite/${invitation.token}`
      }
    });

    res.status(201).json({ success: true, message: `Invitation sent to ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/accept-invite/:token
router.post('/accept-invite/:token', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token, status: 'pending' }).populate('company');
    if (!invitation) return res.status(404).json({ success: false, message: 'Invalid invitation' });
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ success: false, message: 'Invitation expired' });
    }

    const user = await User.create({
      name: req.body.name,
      email: invitation.email,
      password: invitation.tempPassword,
      company: invitation.company._id,
      role: invitation.role,
      isFirstLogin: true
    });

    invitation.status = 'accepted';
    await invitation.save();

    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
