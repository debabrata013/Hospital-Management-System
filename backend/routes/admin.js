const express = require('express');
const router = express.Router();
const { Patient, Room } = require('../models');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorize');

// Get all patients
router.get('/patients', authenticate, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: { status: 'admitted' },
      order: [['admissionDate', 'DESC']]
    });
    res.json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
});

// Admit a new patient
router.post('/rooms', authenticate, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  const { action, patientData, roomId } = req.body;

  if (action !== 'admitPatient') {
    return res.status(400).json({ success: false, error: 'Invalid action' });
  }

  const t = await Patient.sequelize.transaction();

  try {
    // Check if room exists and has capacity
    const room = await Room.findOne({ 
      where: { id: roomId },
      lock: true,
      transaction: t
    });

    if (!room) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (room.currentOccupancy >= room.capacity) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Room is at full capacity' });
    }

    // Create patient record
    const patient = await Patient.create(patientData, { transaction: t });

    // Update room occupancy
    await room.increment('currentOccupancy', { by: 1, transaction: t });
    if (room.currentOccupancy + 1 === room.capacity) {
      await room.update({ status: 'occupied' }, { transaction: t });
    }

    await t.commit();

    res.json({ 
      success: true, 
      message: 'Patient admitted successfully',
      patient: patient.toJSON()
    });

  } catch (error) {
    await t.rollback();
    console.error('Error admitting patient:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to admit patient' 
    });
  }
});

// Get available rooms
router.get('/rooms/available', authenticate, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: {
        status: 'available',
        currentOccupancy: {
          [Op.lt]: sequelize.col('capacity')
        }
      }
    });
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available rooms' });
  }
});

module.exports = router;
