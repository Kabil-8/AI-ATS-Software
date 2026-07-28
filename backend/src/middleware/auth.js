const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talentai_secret_key_2026');
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or malformed authentication token' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Role mapping for backward compatibility and super admin override
    const userRole = req.user.role;
    if (userRole === 'super_admin') {
      return next(); // Super admin has global permission
    }

    const normalizedRole = userRole === 'applicant' ? 'candidate' : userRole;
    const normalizedAllowed = allowedRoles.map((r) => (r === 'applicant' ? 'candidate' : r));

    if (!normalizedAllowed.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
};

// Audit Logging Middleware helper
const logActivity = async (req, action, entity, entityId = null, details = '') => {
  try {
    if (!req.user) return;
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      company: req.user.company || null,
      action,
      entity,
      entityId: entityId ? entityId.toString() : null,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

module.exports = { protect, requireRole, logActivity };
