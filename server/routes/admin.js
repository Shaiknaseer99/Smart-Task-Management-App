const express = require('express');
const { admin, logAction } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', admin, asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const taskCount = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'completed' });
  const overdueTasks = await Task.countDocuments({ status: { $ne: 'completed' }, dueDate: { $lt: new Date() } });
  res.json({
    success: true,
    data: {
      userCount,
      activeUsers,
      taskCount,
      completedTasks,
      overdueTasks
    }
  });
}));

// @route   GET /api/admin/audit
// @desc    Get all audit logs (admin only)
// @access  Admin
router.get('/audit', admin, asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate('user', 'username email');
  res.json({ success: true, data: logs });
}));

// List all users
router.get('/users', admin, asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
}));

// Create user (admin only)
router.post('/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = new User({ username, email, password, role: role || 'user', isActive: true });
  await user.save();
  res.status(201).json(user);
});

// Update user role (admin only)
router.put('/users/:id/role', admin, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ success: false, message: 'Role is required' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

// Delete user (admin only)
router.delete('/users/:id', admin, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
}));

// Deactivate user (admin only)
router.post('/users/:id/deactivate', admin, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

// Reactivate user (admin only)
router.post('/users/:id/reactivate', admin, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

// View all tasks (admin only, with optional filters)
router.get('/tasks', admin, asyncHandler(async (req, res) => {
  const { userId, status } = req.query;
  const filter = {};
  if (userId) filter.user = userId;
  if (status) filter.status = status;
  const tasks = await Task.find(filter);
  res.json({ success: true, data: tasks });
}));

// View user dashboard/stats
router.get('/users/:id/dashboard', async (req, res) => {
  const userId = req.params.id;
  const stats = await Task.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  res.json(stats);
});

// AI Report (dummy example)
router.get('/ai-report', admin, asyncHandler(async (req, res) => {
  // Example: count tasks per category
  const report = await Task.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  res.json({ success: true, data: report });
}));

module.exports = router; 