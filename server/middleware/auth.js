const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const dotenv = require("dotenv");
// Middleware to authenticate user
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Optional auth middleware
const optional = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // ignore invalid token, treat as unauthenticated
    }
  }
  next();
};

// Middleware to check if user is admin
const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Middleware to check if user owns the resource or is admin
const authorize = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found.' });
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      if (resource.user && resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error.' });
    }
  };
};

// Middleware to log user actions
const logAction = (action, resource = 'system') => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      setTimeout(async () => {
        try {
          const logData = {
            userId: req.user?._id,
            action,
            resource,
            resourceId: req.params.id || null,
            details: {
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query,
              responseStatus: res.statusCode
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            status: res.statusCode < 400 ? 'success' : 'failure',
            sessionId: req.session?.id
          };

          if (res.statusCode >= 400) {
            logData.errorMessage = data;
          }

          await AuditLog.logAction(logData);
        } catch (error) {
          console.error('Error logging action:', error);
        }
      }, 0);

      originalSend.call(this, data);
    };

    next();
  };
};

// Middleware to update last login
const updateLastLogin = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastLogin: new Date(),
        loginAttempts: 0
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  auth,
  optional,
  admin,
  authorize,
  logAction,
  updateLastLogin
}; 