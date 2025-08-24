// backend/routes/superAdmin.js
const express = require('express');
<<<<<<< HEAD
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Allowed roles
const ALLOWED_ROLES = ['patient', 'doctor', 'admin', 'super-admin', 'hr_manager', 'department_head'];

// GET /api/super-admin/users
router.get('/users', async (req, res) => {
  try {
    console.log('Received get users request:', req.query);
    
    const { search = '', role, page = 1, limit = 10 } = req.query;
    const where = {};
    const offset = (page - 1) * parseInt(limit);

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phoneNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    // Get role statistics
    const roleStats = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role']
    });

    const roleStatsMap = {};
    roleStats.forEach(stat => {
      roleStatsMap[stat.role] = parseInt(stat.getDataValue('count'));
    });

    res.json({
      success: true,
      data: users,
      total,
      page: Number(page),
      limit: Number(limit),
      roleStats: roleStatsMap
    });
  } catch (err) {
    console.error('GET /users error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
=======
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const router = express.Router();
const User = require('../models/User'); // Sequelize model
const { authenticate } = require('../middleware/auth');

// Role authorization helper
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
>>>>>>> 09f338b170c30e405622b6707e35d7bc332dd24c
  }
  next();
};

<<<<<<< HEAD
// POST /api/super-admin/users
router.post('/users', async (req, res) => {
  try {
    console.log('Received create user request:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      contactNumber,
      department,
      specialization
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      console.log('Missing required fields:', { firstName, lastName, email, password, role });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phoneNumber: contactNumber,
      address: department,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: user
    });
=======
// =======================
// ✅ ORIGINAL INLINE ROUTES
// =======================

// GET /api/super-admin/users?role=doctor
router.get('/users', authenticate, authorizeRoles('super-admin', 'admin'), async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    const users = await User.findAll({ where, attributes: { exclude: ['password'] } });
    res.json({ success: true, data: users });
>>>>>>> 09f338b170c30e405622b6707e35d7bc332dd24c
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/super-admin/create-admin
router.post('/create-admin', authenticate, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'admin' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email + password required' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      role,
      isActive: true
    });
    res.status(201).json({ success: true, data: { id: newUser.id, email: newUser.email, role: newUser.role }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/super-admin/users/:id
router.put('/users/:id', authenticate, authorizeRoles('super-admin', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const updates = (({ firstName, lastName, phoneNumber, address, isActive }) => ({ firstName, lastName, phoneNumber, address, isActive }))(req.body);
    await user.update(updates);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/super-admin/users/:id
router.delete('/users/:id', authenticate, authorizeRoles('super-admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await user.update({ isActive: false });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/super-admin/stats
router.get('/stats', authenticate, authorizeRoles('super-admin', 'admin'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalDoctors = await User.count({ where: { role: 'doctor' }});
    const totalActive = await User.count({ where: { isActive: true }});
    res.json({ success: true, data: { totalUsers, totalDoctors, totalActive }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =======================
// ✅ NEW CONTROLLER-BASED ROUTES
// =======================

const ctrl = require('../controllers/superAdminController');
const ALLOWED_ROLES = ['super-admin', 'admin', 'hr_manager', 'department_head', 'doctor', 'patient'];

// These routes assume upstream protection via authenticate + authorizeRoles('super-admin')
// If not applied globally, uncomment the following line:
// router.use(authenticate, authorizeRoles('super-admin'));

router.get('/users', ctrl.listUsers); // supports search, role, status, pagination
router.post('/users', ctrl.createUser); // create user with role, employeeId
router.patch('/users/:id/status', ctrl.updateUserStatus); // activate/deactivate user
router.patch('/users/:id/role', ctrl.updateUserRole); // change user role
router.get('/kpis', ctrl.getKpis); // dashboard stats

module.exports = router;