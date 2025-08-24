// backend/middleware/authorize.js
// Simple role-based guard for Express routes

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user should be set by your existing authenticate middleware
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

module.exports = { authorizeRoles };