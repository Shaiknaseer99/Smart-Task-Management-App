const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Task summary cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Task category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completedAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedTime: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    minutes: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  actualTime: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    minutes: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  reminders: [{
    time: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['email', 'push', 'both'],
      default: 'both'
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  dependencies: [{
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'related'
    }
  }],
  aiGenerated: {
    description: {
      type: Boolean,
      default: false
    },
    category: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isOverdue
taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && this.dueDate < new Date();
});

// Virtual for isDueToday
taskSchema.virtual('isDueToday').get(function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return dueDate.toDateString() === today.toDateString();
});

// Virtual for isDueSoon
taskSchema.virtual('isDueSoon').get(function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0 && this.status !== 'completed';
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  if (this.status === 'in-progress') return 50;
  return 0;
});

// Indexes
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ 'reminders.time': 1, 'reminders.sent': 1 });

// Pre-save middleware to update completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Static method to get tasks due today
taskSchema.statics.getTasksDueToday = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return this.find({
    user: userId,
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ priority: -1, dueDate: 1 });
};

// Static method to get upcoming tasks
taskSchema.statics.getUpcomingTasks = function(userId, days = 7) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    user: userId,
    status: { $ne: 'completed' },
    dueDate: { $gte: today, $lte: futureDate }
  }).sort({ dueDate: 1 });
};

// Instance method to add note
taskSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    createdBy: userId
  });
  return this.save();
};

// Instance method to add reminder
taskSchema.methods.addReminder = function(time, type = 'both') {
  this.reminders.push({
    time,
    type
  });
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema); 