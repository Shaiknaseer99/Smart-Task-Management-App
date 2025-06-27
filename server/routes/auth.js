const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const { auth, optional } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    console.log('Login attempt:', emailOrUsername, password ? '(password provided)' : '(no password)');
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    }).select('+password');
    if (!user) {
      console.log('User not found for:', emailOrUsername);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    console.log('User found:', user.username, user.email);
    console.log('Stored password hash:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/register', optional, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    let userRole = 'user';
    // Allow admin self-registration if correct code is provided
    if (role === 'admin' && req.body.adminCode === 'admin2025') {
      userRole = 'admin';
    } else if (req.user && req.user.role === 'admin' && role) {
      userRole = role;
    }
    const user = new User({
      username,
      email,
      password, // plain password, let pre-save hook hash it
      profile: { firstName, lastName },
      role: userRole,
      isActive: true
    });
    await user.save();
    // Generate token for the new user
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ 
      message: 'User registered successfully.',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(401).json({ message: 'Invalid token.' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT and redirect to frontend with token
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Redirect to frontend with token in query string
    res.redirect(`http://localhost:3000/login?token=${token}`);
  }
);

module.exports = router;