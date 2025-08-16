const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { authenticate } = require('../middleware/auth'); // Assuming auth middleware exists

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// @route   POST /api/files/upload
// @desc    Upload a file with category and patientId
// @access  Private
router.post('/upload', [authenticate, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { category, patientId } = req.body;

    // Create a record in the database
    const newFile = await File.create({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`, // Store a web-accessible path
      filetype: req.file.mimetype,
      size: req.file.size,
      category: category || 'general',
      uploaderId: req.user.id, // Comes from the authenticate middleware
      patientId: patientId || null,
    });

    res.status(201).json({
      msg: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    console.error('File upload error:', error);
    // If the file was saved, but DB operation failed, you might want to delete the file
    // fs.unlinkSync(req.file.path);
    res.status(500).send('Server error');
  }
});

module.exports = router;
