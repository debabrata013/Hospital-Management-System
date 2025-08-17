// backend/routes/superAdmin.js
const express = require('express')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { User } = require('../models')

const router = express.Router()

// Utility: allowed roles that Super Admin can assign
const ALLOWED_ROLES = ['super-admin','admin','hr_manager','department_head','doctor','patient']

// GET /api/super-admin/users
// Query params: search, role, status (active|inactive), page, limit
router.get('/users', async (req, res) => {
  try {
    const { search = '', role, status, page = 1, limit = 10 } = req.query
    const where = {}

    if (role) where.role = role
    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { employeeId: { [Op.like]: `%${search}%` } },
      ]
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)
    const offset = (pageNum - 1) * pageSize

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id','firstName','lastName','email','role','employeeId','isActive','createdAt','updatedAt'],
      order: [['createdAt','DESC']],
      limit: pageSize,
      offset,
    })

    res.json({ success: true, data: rows, total: count, page: pageNum, limit: pageSize })
  } catch (err) {
    console.error('GET /users error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// POST /api/super-admin/users
// Body: { firstName,lastName,email,password,role,employeeId,isActive }
router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'patient', employeeId, isActive = true } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(409).json({ success: false, message: 'Email already in use' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ firstName, lastName, email, password: hash, role, employeeId, isActive })

    res.status(201).json({ success: true, data: { id: user.id } })
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