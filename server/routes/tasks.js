const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { logAction, authorize } = require('../middleware/auth');
const Task = require('../models/Task');
const { exportToCSV, exportToExcel, exportToPDF } = require('../utils/exportUtils');
const { auth } = require('../middleware/auth');
const router = express.Router();


// @route   GET /api/tasks
// @desc    Get all tasks for user with filtering and sorting
// @access  Private
router.get('/', [
  query('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('category').optional().isString(),
  query('sortBy').optional().isIn(['title', 'dueDate', 'priority', 'status', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('dueDateFrom').optional().isISO8601(),
  query('dueDateTo').optional().isISO8601()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const {
    status,
    priority,
    category,
    sortBy = 'dueDate',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
    search,
    dueDateFrom,
    dueDateTo
  } = req.query;

  // Build filter object
  const filter = { user: req.user._id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  // Date range filter
  if (dueDateFrom || dueDateTo) {
    filter.dueDate = {};
    if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
    if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
  }

  // Search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'username email profile.firstName profile.lastName');

  // Get total count for pagination
  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   GET /api/tasks/dashboard
// @desc    Get dashboard data for user
// @access  Private
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get tasks due today
  const tasksDueToday = await Task.getTasksDueToday(userId);

  // Get overdue tasks
  const overdueTasks = await Task.getOverdueTasks(userId);

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = await Task.getUpcomingTasks(userId, 7);

  // Get tasks completed in last 7 days for graph
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const completedTasks = await Task.aggregate([
    {
      $match: {
        user: userId,
        status: 'completed',
        completedAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get most popular categories
  const popularCategories = await Task.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Get task statistics
  const taskStats = await Task.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Convert stats to object
  const stats = {
    pending: 0,
    'in-progress': 0,
    completed: 0,
    cancelled: 0
  };

  taskStats.forEach(stat => {
    stats[stat._id] = stat.count;
  });

  res.json({
    success: true,
    data: {
      tasksDueToday,
      overdueTasks,
      upcomingTasks,
      completedTasks,
      popularCategories,
      stats
    }
  });
}));

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authorize(Task), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('user', 'username email profile.firstName profile.lastName')
    .populate('notes.createdBy', 'username profile.firstName profile.lastName');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
}));

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters'),
  body('summary')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Task summary cannot exceed 500 characters'),
  body('category')
    .notEmpty()
    .withMessage('Task category is required')
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('estimatedTime')
    .optional()
    .isObject()
    .withMessage('Estimated time must be an object')
], logAction('task_create', 'task'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const {
    title,
    description,
    summary,
    category,
    dueDate,
    priority = 'medium',
    tags = [],
    estimatedTime
  } = req.body;

  const task = new Task({
    title,
    description,
    summary,
    category,
    dueDate,
    priority,
    tags,
    estimatedTime,
    user: req.user._id
  });

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('user', 'username email profile.firstName profile.lastName');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populatedTask
  });
}));

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters'),
  body('summary')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Task summary cannot exceed 500 characters'),
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category cannot exceed 100 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], authorize(Task), logAction('task_update', 'task'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'username email profile.firstName profile.lastName');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
}));

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authorize(Task), logAction('task_delete', 'task'), asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.post('/:id/complete', authorize(Task), logAction('task_complete', 'task'), asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'completed',
      completedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('user', 'username email profile.firstName profile.lastName');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task marked as completed',
    data: task
  });
}));

// @route   POST /api/tasks/:id/cancel
// @desc    Cancel task
// @access  Private
router.post('/:id/cancel', authorize(Task), logAction('task_cancel', 'task'), asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true, runValidators: true }
  ).populate('user', 'username email profile.firstName profile.lastName');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    message: 'Task cancelled',
    data: task
  });
}));

// @route   POST /api/tasks/:id/notes
// @desc    Add note to task
// @access  Private
router.post('/:id/notes', [
  body('content')
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ max: 1000 })
    .withMessage('Note cannot exceed 1000 characters')
], authorize(Task), logAction('task_update', 'task'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const task = await Task.findById(req.params.id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await task.addNote(req.body.content, req.user._id);

  const updatedTask = await Task.findById(task._id)
    .populate('user', 'username email profile.firstName profile.lastName')
    .populate('notes.createdBy', 'username profile.firstName profile.lastName');

  res.json({
    success: true,
    message: 'Note added successfully',
    data: updatedTask
  });
}));

// @route   GET /api/tasks/export/csv
// @desc    Export tasks to CSV
// @access  Private
router.get('/export/csv', logAction('export_data', 'export'), asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id })
    .populate('user', 'username email profile.firstName profile.lastName')
    .sort({ dueDate: 1 });

  const csvData = await exportToCSV(tasks);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
  res.send(csvData);
}));

// @route   GET /api/tasks/export/excel
// @desc    Export tasks to Excel
// @access  Private
//const { exportToExcel } = require('../utils/exportUtils');

router.get('/export/excel', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).lean();
    exportToExcel(tasks, res); // Pass res as the second argument!
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ message: 'Failed to export Excel file.' });
  }
});
// @route   GET /api/tasks/export/pdf
// @desc    Export tasks to PDF
// @access  Private
router.get('/export/pdf', logAction('export_data', 'export'), asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id })
    .populate('user', 'username email profile.firstName profile.lastName')
    .sort({ dueDate: 1 });

  const buffer = await exportToPDF(tasks, req.user);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.pdf');
  res.send(buffer);
}));

module.exports = router; 