const express = require('express');
const router = express.Router();
const { CleaningTask, CleaningStaff } = require('../models');

// Helper to normalize model instances to client shape with _id
const toClient = (item) => {
  if (!item) return item;
  const obj = item.toJSON ? item.toJSON() : item;
  return { _id: obj.id, ...obj };
};

// Ensure JSON body parsing
router.use(express.json());

// Get tasks
router.get('/tasks', async (req, res) => {
  try {
  const tasks = await CleaningTask.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: tasks.map(toClient) });
  } catch (err) {
    console.error('Fetch tasks failed', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/tasks', async (req, res) => {
  try {
    const { roomNumber, assignedTo, priority = 'medium', scheduledDate, notes, status = 'pending' } = req.body;
    if (!roomNumber || !assignedTo || !scheduledDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const task = await CleaningTask.create({
      roomNumber,
      assignedTo,
      priority,
      scheduledDate: new Date(scheduledDate),
      notes: notes || '',
      status,
    });
  res.status(201).json({ success: true, data: toClient(task) });
  } catch (err) {
    console.error('Create task failed', err);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await CleaningTask.findByPk(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const { roomNumber, assignedTo, priority, scheduledDate, notes } = req.body;
    await task.update({
      roomNumber: roomNumber ?? task.roomNumber,
      assignedTo: assignedTo ?? task.assignedTo,
      priority: priority ?? task.priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : task.scheduledDate,
      notes: notes ?? task.notes,
    });
  res.json({ success: true, data: toClient(task) });
  } catch (err) {
    console.error('Update task failed', err);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update status
router.patch('/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const task = await CleaningTask.findByPk(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.update({ status });
  res.json({ success: true, data: toClient(task) });
  } catch (err) {
    console.error('Update status failed', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await CleaningTask.findByPk(id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await task.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Delete task failed', err);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

// Get staff
router.get('/staff', async (req, res) => {
  try {
    const staff = await CleaningStaff.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: staff.map(toClient) });
  } catch (err) {
    console.error('Fetch staff failed', err);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
});

module.exports = router;
