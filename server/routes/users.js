const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { admin, logAction } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Admin
router.get('/', admin, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Admin
router.get('/:id', admin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

// @route   PUT /api/users/:id/activate
// @desc    Activate user account (admin only)
// @access  Admin
router.put('/:id/activate', admin, logAction('user_activate', 'user'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User activated', data: user });
}));

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account (admin only)
// @access  Admin
router.put('/:id/deactivate', admin, logAction('user_deactivate', 'user'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deactivated', data: user });
}));

// @route   GET /api/users/:id/audit
// @desc    Get audit logs for a user (admin only)
// @access  Admin
router.get('/:id/audit', admin, asyncHandler(async (req, res) => {
  const logs = await AuditLog.getUserActivity(req.params.id, 100);
  res.json({ success: true, data: logs });
}));

module.exports = router; 