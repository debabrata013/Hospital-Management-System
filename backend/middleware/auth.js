const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization || req.cookies.token;
  if (!auth) return res.status(401).json({ success: false, message: 'Missing token' });

  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user.get({ plain: true }); // includes role if needed
    next();
  } catch (err) {
    console.error('auth error', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { authenticate };