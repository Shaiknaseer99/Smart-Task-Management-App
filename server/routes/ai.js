const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { admin } = require('../middleware/auth');
const OpenAI = require('openai');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (error) {
    console.log('OpenAI initialization failed:', error.message);
  }
}

// @route   POST /api/ai/predict-category
// @desc    Predict next category for user
// @access  Private
router.post('/predict-category', asyncHandler(async (req, res) => {
  const { previousCategories } = req.body;
  if (!previousCategories || !Array.isArray(previousCategories)) {
    return res.status(400).json({ success: false, message: 'previousCategories array required' });
  }

  // If OpenAI is not available, provide a simple fallback
  if (!openai) {
    const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Other'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return res.json({ 
      success: true, 
      category: randomCategory,
      message: 'AI not available - using fallback category'
    });
  }

  try {
    const prompt = `Given the following task categories used by a user: ${previousCategories.join(', ')}. Predict the next likely category.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10
    });
    const category = completion.choices[0].message.content.trim();
    res.json({ success: true, category });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    // Fallback response
    const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Other'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    res.json({ 
      success: true, 
      category: randomCategory,
      message: 'AI service unavailable - using fallback category'
    });
  }
}));

// @route   POST /api/ai/generate-description
// @desc    Generate description from summary
// @access  Private
router.post('/generate-description', asyncHandler(async (req, res) => {
  const { summary } = req.body;
  if (!summary) return res.status(400).json({ success: false, message: 'summary is required' });

  // If OpenAI is not available, provide a simple fallback
  if (!openai) {
    const fallbackDescription = `Task: ${summary}\n\nThis task involves ${summary.toLowerCase()}. Please ensure to complete this task efficiently and on time.`;
    return res.json({ 
      success: true, 
      description: fallbackDescription,
      message: 'AI not available - using fallback description'
    });
  }

  try {
    const prompt = `Expand the following summary into a detailed task description: ${summary}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100
    });
    const description = completion.choices[0].message.content.trim();
    res.json({ success: true, description });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    // Fallback response
    const fallbackDescription = `Task: ${summary}\n\nThis task involves ${summary.toLowerCase()}. Please ensure to complete this task efficiently and on time.`;
    res.json({ 
      success: true, 
      description: fallbackDescription,
      message: 'AI service unavailable - using fallback description'
    });
  }
}));

// @route   GET /api/ai/admin-report
// @desc    Generate admin report for critical and overdue tasks
// @access  Admin
router.get('/admin-report', admin, asyncHandler(async (req, res) => {
  const criticalTasks = await Task.find({ priority: 'critical', status: { $ne: 'completed' } }).populate('user', 'username email');
  const overdueTasks = await Task.find({ status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }).populate('user', 'username email');
  res.json({ success: true, criticalTasks, overdueTasks });
}));

module.exports = router; 