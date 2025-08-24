// backend/routes/superAdmin.js
const express = require('express');
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
  }
})

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
  } catch (err) {
    console.error('POST /users error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PATCH /api/super-admin/users/:id/status  Body: { isActive: boolean }
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    user.isActive = !!isActive
    await user.save()
    res.json({ success: true })
  } catch (err) {
    console.error('PATCH /users/:id/status error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PATCH /api/super-admin/users/:id/role  Body: { role }
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!ALLOWED_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' })

    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    user.role = role
    await user.save()
    res.json({ success: true })
  } catch (err) {
    console.error('PATCH /users/:id/role error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET /api/super-admin/kpis — quick stats for dashboard cards
router.get('/kpis', async (_req, res) => {
  try {
    const [total, active, admins, doctors, patients] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'doctor' } }),
      User.count({ where: { role: 'patient' } }),
    ])

    res.json({ success: true, data: { total, active, byRole: { admin: admins, doctor: doctors, patient: patients } } })
  } catch (err) {
    console.error('GET /kpis error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router