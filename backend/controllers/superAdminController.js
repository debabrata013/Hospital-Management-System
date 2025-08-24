// backend/controllers/superAdminController.js
const bcrypt = require('bcryptjs');
const { Op, fn, col } = require('sequelize');
const { User } = require('../models'); // uses backend/models/index.js

const ALLOWED_ROLES = ['patient','doctor','admin','super-admin','hr_manager','department_head'];

// GET /api/super-admin/users
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role, isActive } = req.query;
    const where = {};

    if (role) where.role = role;
    if (typeof isActive !== 'undefined') where.isActive = String(isActive) === 'true';

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName:  { [Op.like]: `%${search}%` } },
        { email:     { [Op.like]: `%${search}%` } },
        { employeeId:{ [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt','DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({ success: true, data: rows, meta: { page: Number(page), limit: Number(limit), total: count } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// POST /api/super-admin/users
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, employeeId } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hash, role, employeeId });
    const plain = user.get({ plain: true });
    delete plain.password;
    res.status(201).json({ success: true, data: plain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

// PATCH /api/super-admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive === 'undefined') {
      return res.status(400).json({ success: false, message: 'isActive is required' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = Boolean(isActive);
    await user.save();

    const plain = user.get({ plain: true });
    delete plain.password;
    res.json({ success: true, data: plain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// PATCH /api/super-admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    const plain = user.get({ plain: true });
    delete plain.password;
    res.json({ success: true, data: plain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
};

// GET /api/super-admin/kpis
exports.getKpis = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;

    const roleBreakdown = await User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      group: ['role'],
      raw: true,
    });

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const newUsers7d = await User.count({ where: { createdAt: { [Op.gte]: since } } });

    res.json({ success: true, data: { totalUsers, activeUsers, inactiveUsers, roleBreakdown, newUsers7d } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to compute KPIs' });
  }
};
