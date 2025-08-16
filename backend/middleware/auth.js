const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
        return res.status(401).json({ msg: 'Authorization denied, user not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = { authenticate };
