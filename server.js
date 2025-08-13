import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES6 module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Import models
import User from './models/User.js';
import Appointment from './models/Appointment.js';
import Prescription from './models/Prescription.js';
import TestReport from './models/TestReport.js';
import Billing from './models/Billing.js';
import AuditLog from './models/AuditLog.js';
import DischargeSummary from './models/DischargeSummary.js';
import AfterCareInstruction from './models/AfterCareInstruction.js';
import Medicine from './models/Medicine.js';
import Message from './models/Message.js';
import StaffProfile from './models/StaffProfile.js';
import StaffShift from './models/StaffShift.js';
import LeaveRequest from './models/LeaveRequest.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Audit logging middleware
const logAudit = async (action, details, userId) => {
  try {
    await AuditLog.create({
      action,
      details,
      userId,
      timestamp: new Date(),
      ipAddress: 'N/A', // Would be set from request in real implementation
      userAgent: 'N/A'
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    await logAudit('LOGIN', `User ${user.email} logged in`, user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      employeeId,
      isActive: true,
      createdAt: new Date()
    });

    await user.save();
    await logAudit('USER_REGISTERED', `New user registered: ${email}`, user._id);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User management routes
app.get('/api/users', authenticateToken, authorizeRoles('admin', 'super-admin'), async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users by role for staff creation
app.get('/api/users/role/:role', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { role } = req.params;
    const { search, department, page = 1, limit = 20 } = req.query;
    
    const query = { role };
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(parseInt(limit)).sort({ name: 1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updateData = { name, email, role, isActive };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit('USER_UPDATED', `User ${user.email} updated`, req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointment routes
app.post('/api/appointments', authenticateToken, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await appointment.save();
    await logAudit('APPOINTMENT_CREATED', `Appointment created for patient ${appointment.patientId}`, req.user._id);

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId, status, date } = req.query;
    const filter = {};

    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name patientId')
      .populate('doctorId', 'name employeeId')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await logAudit('APPOINTMENT_UPDATED', `Appointment ${appointment._id} updated`, req.user._id);
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patient routes (using User model with patient role)
app.post('/api/patients', authenticateToken, authorizeRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    const patient = new User({
      ...req.body,
      role: 'patient',
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await patient.save();
    await logAudit('PATIENT_CREATED', `Patient ${patient.name} created`, req.user._id);

    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = { role: 'patient' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.isActive = status === 'active';

    const patients = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-passwordHash');
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Prescription routes
app.post('/api/prescriptions', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const prescription = new Prescription({
      ...req.body,
      prescribedBy: req.user._id,
      prescribedAt: new Date()
    });

    await prescription.save();
    await logAudit('PRESCRIPTION_CREATED', `Prescription created for patient ${prescription.patientId}`, req.user._id);

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const filter = {};

    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.prescribedBy = doctorId;

    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'name patientId')
      .populate('prescribedBy', 'name employeeId')
      .sort({ prescribedAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Billing routes
app.post('/api/billing', authenticateToken, authorizeRoles('admin', 'billing'), async (req, res) => {
  try {
    const billing = new Billing({
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await billing.save();
    await logAudit('BILLING_CREATED', `Billing created for patient ${billing.patientId}`, req.user._id);

    res.status(201).json(billing);
  } catch (error) {
    console.error('Create billing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/billing', authenticateToken, async (req, res) => {
  try {
    const { patientId, status, dateFrom, dateTo } = req.query;
    const filter = {};

    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const billing = await Billing.find(filter)
      .populate('patientId', 'name patientId')
      .sort({ createdAt: -1 });

    res.json(billing);
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload route
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    await logAudit('FILE_UPLOADED', `File ${req.file.originalname} uploaded`, req.user._id);

    res.json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = {
      totalPatients: await User.countDocuments({ role: 'patient' }),
      totalAppointments: await Appointment.countDocuments(),
      todayAppointments: await Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      pendingAppointments: await Appointment.countDocuments({ status: 'pending' }),
      totalDoctors: await User.countDocuments({ role: 'doctor', isActive: true }),
      totalRevenue: await Billing.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Audit logs route
app.get('/api/audit-logs', authenticateToken, authorizeRoles('admin', 'super-admin'), async (req, res) => {
  try {
    const { action, userId, dateFrom, dateTo, limit = 100 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STAFF MANAGEMENT ROUTES ====================

// Add New Staff - Comprehensive staff creation endpoint
app.post('/api/staff/create', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const {
      // Basic Information
      name,
      email,
      password,
      contactNumber,
      alternateNumber,
      
      // Professional Information
      role,
      department,
      designation,
      employeeId,
      specialization,
      
      // Qualifications
      qualification,
      experience,
      licenseNumber,
      
      // Work Schedule
      workSchedule,
      
      // Address
      address,
      
      // Emergency Contact
      emergencyContact,
      
      // Employment Details
      employment,
      
      // Staff Profile Information
      personalInfo,
      identification,
      skills,
      certifications,
      currentAssignment,
      
      // Additional Fields
      notes,
      onboardingDate
    } = req.body;

    // Validation
    if (!name || !email || !password || !contactNumber || !role || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, password, contactNumber, role, department' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId: employeeId || null }] 
    });
    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Employee ID already exists' 
      });
    }

    // Validate role
    const validRoles = ['doctor', 'staff', 'admin', 'receptionist', 'nurse'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `${department.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;

    // Create new user
    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      contactNumber,
      alternateNumber,
      role,
      department,
      designation,
      employeeId: finalEmployeeId,
      specialization,
      qualification,
      experience,
      licenseNumber,
      workSchedule,
      address,
      emergencyContact,
      employment: {
        ...employment,
        joiningDate: onboardingDate || new Date()
      },
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    });

    await user.save();

    // Create staff profile if personal info is provided
    let staffProfile = null;
    if (personalInfo || identification || skills || certifications || currentAssignment) {
      staffProfile = new StaffProfile({
        userId: user._id,
        personalInfo,
        identification,
        skills,
        certifications,
        currentAssignment,
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id
      });

      await staffProfile.save();
    }

    // Log audit
    await logAudit('STAFF_CREATED', `New staff member created: ${name} (${role})`, req.user._id);

    // Prepare response
    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation,
        contactNumber: user.contactNumber,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    };

    if (staffProfile) {
      responseData.staffProfile = staffProfile;
    }

    res.status(201).json({
      success: true,
      data: responseData,
      message: `Staff member ${name} created successfully with Employee ID: ${finalEmployeeId}`
    });

  } catch (error) {
    console.error('Create staff error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk Staff Creation
app.post('/api/staff/bulk-create', authenticateToken, authorizeRoles('admin', 'super-admin'), async (req, res) => {
  try {
    const { staffList } = req.body;

    if (!Array.isArray(staffList) || staffList.length === 0) {
      return res.status(400).json({ error: 'Staff list is required and must be an array' });
    }

    if (staffList.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 staff members can be created at once' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < staffList.length; i++) {
      const staffData = staffList[i];
      
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [{ email: staffData.email }, { employeeId: staffData.employeeId || null }] 
        });
        
        if (existingUser) {
          errors.push({
            index: i,
            email: staffData.email,
            error: existingUser.email === staffData.email ? 'Email already exists' : 'Employee ID already exists'
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(staffData.password || 'defaultPassword123', 12);
        
        // Generate employee ID if not provided
        const finalEmployeeId = staffData.employeeId || `${staffData.department?.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}${i}`;

        // Create user
        const user = new User({
          name: staffData.name,
          email: staffData.email,
          passwordHash: hashedPassword,
          contactNumber: staffData.contactNumber,
          role: staffData.role || 'staff',
          department: staffData.department,
          designation: staffData.designation,
          employeeId: finalEmployeeId,
          isActive: true,
          isVerified: true,
          createdAt: new Date()
        });

        await user.save();
        results.push({
          index: i,
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            employeeId: user.employeeId,
            role: user.role
          }
        });

        // Log audit
        await logAudit('STAFF_CREATED', `Bulk staff creation: ${user.name} (${user.role})`, req.user._id);

      } catch (error) {
        errors.push({
          index: i,
          email: staffData.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        created: results,
        errors: errors,
        summary: {
          total: staffList.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Bulk staff creation completed. ${results.length} successful, ${errors.length} failed.`
    });

  } catch (error) {
    console.error('Bulk staff creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user already has staff profile
app.get('/api/staff/profiles/check/:userId', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const existingProfile = await StaffProfile.findOne({ userId });
    
    res.json({
      success: true,
      data: {
        hasProfile: !!existingProfile,
        profile: existingProfile
      }
    });
  } catch (error) {
    console.error('Check staff profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Profile Management
app.post('/api/staff/profiles', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { userId, personalInfo, qualifications, currentAssignment, ...otherData } = req.body;

    // Check if profile already exists
    const existingProfile = await StaffProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ error: 'Staff profile already exists for this user' });
    }

    // Verify user exists and is staff
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!['doctor', 'staff', 'admin', 'receptionist', 'nurse'].includes(user.role)) {
      return res.status(400).json({ error: 'Profile can only be created for staff members' });
    }

    const profile = new StaffProfile({
      userId,
      personalInfo,
      qualifications,
      currentAssignment,
      ...otherData,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id
    });

    await profile.save();
    await logAudit('STAFF_PROFILE_CREATED', `Staff profile created for ${user.name}`, req.user._id);

    const populatedProfile = await StaffProfile.findById(profile._id)
      .populate('userId', 'name employeeId role email contactNumber');

    res.status(201).json({
      success: true,
      data: populatedProfile,
      message: 'Staff profile created successfully'
    });
  } catch (error) {
    console.error('Create staff profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff/profiles', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, role, employmentStatus, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Check permissions
    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    // Build match conditions
    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.employeeId': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      matchConditions['user.department'] = department;
    }

    if (role) {
      matchConditions['user.role'] = role;
    }

    if (employmentStatus) {
      matchConditions.employmentStatus = employmentStatus;
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add sorting
    const sortField = sortBy === 'name' ? 'user.name' : 
                     sortBy === 'employeeId' ? 'user.employeeId' :
                     sortBy === 'department' ? 'user.department' : sortBy;

    pipeline.push({ $sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 } });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project final structure
    pipeline.push({
      $project: {
        _id: 1,
        userId: '$user._id',
        name: '$user.name',
        employeeId: '$user.employeeId',
        role: '$user.role',
        department: '$user.department',
        email: '$user.email',
        contactNumber: '$user.contactNumber',
        employmentStatus: 1,
        personalInfo: 1,
        currentAssignment: 1,
        age: 1,
        totalExperience: 1,
        createdAt: 1,
        updatedAt: 1
      }
    });

    const [profiles, totalCount] = await Promise.all([
      StaffProfile.aggregate(pipeline),
      StaffProfile.countDocuments()
    ]);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get staff profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id)
      .populate('userId', 'name employeeId role department email contactNumber')
      .populate('currentAssignment.supervisor', 'name employeeId')
      .populate('createdBy', 'name')
      .populate('lastUpdatedBy', 'name');

    if (!profile) {
      return res.status(404).json({ error: 'Staff profile not found' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get staff profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff by department
app.get('/api/staff/department/:department', authenticateToken, async (req, res) => {
  try {
    const { department } = req.params;
    const { page = 1, limit = 20, search, employmentStatus } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.department': department
        }
      }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.employeeId': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    if (employmentStatus) {
      pipeline.push({
        $match: {
          employmentStatus: employmentStatus
        }
      });
    }

    // Add sorting
    pipeline.push({ $sort: { 'user.name': 1 } });

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project final structure
    pipeline.push({
      $project: {
        _id: 1,
        userId: '$user._id',
        name: '$user.name',
        employeeId: '$user.employeeId',
        role: '$user.role',
        email: '$user.email',
        contactNumber: '$user.contactNumber',
        employmentStatus: 1,
        personalInfo: 1,
        currentAssignment: 1,
        age: 1,
        totalExperience: 1
      }
    });

    const [profiles, totalCount] = await Promise.all([
      StaffProfile.aggregate(pipeline),
      StaffProfile.countDocuments({ 'user.department': department })
    ]);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get staff by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/staff/profiles/:id', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Staff profile not found' });
    }

    const originalValues = {
      employmentStatus: profile.employmentStatus,
      currentAssignment: profile.currentAssignment,
      personalInfo: profile.personalInfo
    };

    Object.assign(profile, req.body);
    profile.lastUpdatedBy = req.user._id;
    await profile.save();

    await logAudit('STAFF_PROFILE_UPDATED', `Staff profile updated for ${profile.userId}`, req.user._id);

    const updatedProfile = await StaffProfile.findById(req.params.id)
      .populate('userId', 'name employeeId role department email contactNumber');

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Staff profile updated successfully'
    });
  } catch (error) {
    console.error('Update staff profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/staff/profiles/:id', authenticateToken, authorizeRoles('admin', 'super-admin'), async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Staff profile not found' });
    }

    await logAudit('STAFF_PROFILE_DELETED', `Staff profile deleted for ${profile.userId}`, req.user._id);
    
    await StaffProfile.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Staff profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Shift Management
app.post('/api/staff/shifts', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager', 'department_head'), async (req, res) => {
  try {
    const { action, staffId, shiftDate, shiftType, startTime, endTime, department, ward, responsibilities, doctorSchedule } = req.body;

    if (action === 'create') {
      // Verify staff exists
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Check for shift conflicts
      const conflictingShift = await StaffShift.findOne({
        staffId,
        shiftDate: new Date(shiftDate),
        status: { $in: ['Scheduled', 'In Progress'] }
      });

      if (conflictingShift) {
        return res.status(409).json({ error: 'Staff member already has a shift scheduled for this date' });
      }

      const shift = new StaffShift({
        staffId,
        shiftDate: new Date(shiftDate),
        shiftType,
        startTime,
        endTime,
        department,
        ward,
        responsibilities,
        doctorSchedule,
        status: 'Scheduled',
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id
      });

      await shift.save();
      await logAudit('SHIFT_CREATED', `Shift created for ${staff.name}`, req.user._id);

      const populatedShift = await StaffShift.findById(shift._id)
        .populate('staffId', 'name employeeId role department');

      res.status(201).json({
        success: true,
        data: populatedShift,
        message: 'Shift created successfully'
      });
    } else if (action === 'check_in') {
      const { shiftId, location, method } = req.body;
      
      const shift = await StaffShift.findById(shiftId);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }

      if (shift.status !== 'Scheduled') {
        return res.status(400).json({ error: 'Shift is not in scheduled status' });
      }

      shift.status = 'In Progress';
      shift.attendance = {
        checkIn: {
          time: new Date(),
          location,
          method,
          verifiedBy: req.user._id
        }
      };
      shift.lastUpdatedBy = req.user._id;
      await shift.save();

      await logAudit('SHIFT_CHECK_IN', `Shift check-in for ${shift.staffId}`, req.user._id);

      res.json({
        success: true,
        data: shift,
        message: 'Check-in successful'
      });
    } else if (action === 'check_out') {
      const { shiftId, location, method, notes } = req.body;
      
      const shift = await StaffShift.findById(shiftId);
      if (!shift) {
        return res.status(404).json({ error: 'Shift not found' });
      }

      if (shift.status !== 'In Progress') {
        return res.status(400).json({ error: 'Shift is not in progress' });
      }

      const checkOutTime = new Date();
      const checkInTime = new Date(shift.attendance.checkIn.time);
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      shift.status = 'Completed';
      shift.attendance.checkOut = {
        time: checkOutTime,
        location,
        method,
        notes,
        verifiedBy: req.user._id
      };
      shift.attendance.totalHours = totalHours;
      shift.lastUpdatedBy = req.user._id;
      await shift.save();

      await logAudit('SHIFT_CHECK_OUT', `Shift check-out for ${shift.staffId}`, req.user._id);

      res.json({
        success: true,
        data: shift,
        message: 'Check-out successful'
      });
    } else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Staff shift operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff/shifts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, staffId, department, shiftType, status, dateFrom, dateTo, sortBy = 'shiftDate', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (staffId) query.staffId = staffId;
    if (department) query.department = department;
    if (shiftType) query.shiftType = shiftType;
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query.shiftDate = {};
      if (dateFrom) query.shiftDate.$gte = new Date(dateFrom);
      if (dateTo) query.shiftDate.$lte = new Date(dateTo);
    }

    // If not admin/manager, restrict to own shifts
    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(req.user.role)) {
      query.staffId = req.user._id;
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [shifts, total] = await Promise.all([
      StaffShift.find(query)
        .populate('staffId', 'name employeeId role department')
        .populate('createdBy', 'name')
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StaffShift.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: shifts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Leave Management
app.post('/api/staff/leaves', authenticateToken, async (req, res) => {
  try {
    const { action, staffId, leaveType, startDate, endDate, reason, urgency, coverage } = req.body;

    if (action === 'create' || !action) {
      // Staff can only create leave requests for themselves unless they're admin/manager
      if (!['admin', 'super-admin', 'hr_manager'].includes(req.user.role)) {
        staffId = req.user._id;
      }

      // Verify staff exists
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Check for overlapping leave requests
      const overlappingLeave = await LeaveRequest.findOne({
        staffId,
        status: { $in: ['Pending', 'Approved', 'In Progress'] },
        $or: [
          {
            $and: [
              { startDate: { $lte: new Date(startDate) } },
              { endDate: { $gt: new Date(startDate) } }
            ]
          },
          {
            $and: [
              { startDate: { $lt: new Date(endDate) } },
              { endDate: { $gte: new Date(endDate) } }
            ]
          }
        ]
      });

      if (overlappingLeave) {
        return res.status(409).json({ error: 'Staff member already has leave approved for overlapping dates' });
      }

      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

      const leaveRequest = new LeaveRequest({
        staffId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason,
        urgency,
        coverage,
        status: 'Pending',
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id
      });

      await leaveRequest.save();
      await logAudit('LEAVE_REQUEST_CREATED', `Leave request created for ${staff.name}`, req.user._id);

      const populatedLeave = await LeaveRequest.findById(leaveRequest._id)
        .populate('staffId', 'name employeeId role department');

      res.status(201).json({
        success: true,
        data: populatedLeave,
        message: 'Leave request created successfully'
      });
    } else if (action === 'approve') {
      const { leaveRequestId, comments, conditions } = req.body;
      
      if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions to approve leave' });
      }

      const leaveRequest = await LeaveRequest.findById(leaveRequestId);
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      leaveRequest.status = 'Approved';
      leaveRequest.approvalDetails = {
        approvedBy: req.user._id,
        approvedAt: new Date(),
        comments,
        conditions
      };
      leaveRequest.lastUpdatedBy = req.user._id;
      await leaveRequest.save();

      await logAudit('LEAVE_REQUEST_APPROVED', `Leave request approved for ${leaveRequest.staffId}`, req.user._id);

      res.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request approved successfully'
      });
    } else if (action === 'reject') {
      const { leaveRequestId, reason } = req.body;
      
      if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions to reject leave' });
      }

      const leaveRequest = await LeaveRequest.findById(leaveRequestId);
      if (!leaveRequest) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      leaveRequest.status = 'Rejected';
      leaveRequest.rejectionDetails = {
        rejectedBy: req.user._id,
        rejectedAt: new Date(),
        reason
      };
      leaveRequest.lastUpdatedBy = req.user._id;
      await leaveRequest.save();

      await logAudit('LEAVE_REQUEST_REJECTED', `Leave request rejected for ${leaveRequest.staffId}`, req.user._id);

      res.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request rejected successfully'
      });
    } else {
      res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Staff leave operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff/leaves', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, staffId, leaveType, status, urgency, dateFrom, dateTo, sortBy = 'startDate', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (staffId) query.staffId = staffId;
    if (leaveType) query.leaveType = leaveType;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;

    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) query.startDate.$gte = new Date(dateFrom);
      if (dateTo) query.startDate.$lte = new Date(dateTo);
    }

    // If not admin/manager, restrict to own leaves or leaves requiring approval
    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(req.user.role)) {
      query.staffId = req.user._id;
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [leaves, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('staffId', 'name employeeId role department')
        .populate('createdBy', 'name')
        .populate('approvalDetails.approvedBy', 'name')
        .populate('rejectionDetails.rejectedBy', 'name')
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LeaveRequest.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff statistics
app.get('/api/staff/stats', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { department, dateRange = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    const endDate = new Date();

    // Staff count by department
    const departmentStats = await StaffProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          count: { $sum: 1 },
          activeCount: { 
            $sum: { $cond: [{ $eq: ['$employmentStatus', 'Active'] }, 1, 0] }
          },
          onLeaveCount: { 
            $sum: { $cond: [{ $eq: ['$employmentStatus', 'On Leave'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Staff count by role
    const roleStats = await StaffProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent staff additions
    const recentStaff = await StaffProfile.find()
      .populate('userId', 'name employeeId role department')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming birthdays
    const upcomingBirthdays = await StaffProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'personalInfo.dateOfBirth': { $exists: true },
          employmentStatus: 'Active'
        }
      },
      {
        $addFields: {
          nextBirthday: {
            $dateAdd: {
              start: '$personalInfo.dateOfBirth',
              unit: 'year',
              amount: {
                $subtract: [
                  { $year: new Date() },
                  { $year: '$personalInfo.dateOfBirth' }
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          nextBirthday: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $project: {
          name: '$user.name',
          employeeId: '$user.employeeId',
          department: '$user.department',
          nextBirthday: 1
        }
      },
      { $sort: { nextBirthday: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        departmentStats,
        roleStats,
        recentStaff,
        upcomingBirthdays,
        totalStaff: await StaffProfile.countDocuments(),
        activeStaff: await StaffProfile.countDocuments({ employmentStatus: 'Active' }),
        onLeaveStaff: await StaffProfile.countDocuments({ employmentStatus: 'On Leave' })
      }
    });
  } catch (error) {
    console.error('Staff stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Dashboard
app.get('/api/staff/dashboard', authenticateToken, async (req, res) => {
  try {
    const { type = 'overview', department, dateRange = '30' } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    const endDate = new Date();

    let dashboardData = {};

    if (type === 'overview' || type === 'all') {
      // Staff Overview Statistics
      const staffStats = await StaffProfile.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: null,
            totalStaff: { $sum: 1 },
            activeStaff: { 
              $sum: { $cond: [{ $eq: ['$employmentStatus', 'Active'] }, 1, 0] }
            },
            onLeaveStaff: { 
              $sum: { $cond: [{ $eq: ['$employmentStatus', 'On Leave'] }, 1, 0] }
            },
            departmentDistribution: { $push: '$user.department' }
          }
        }
      ]);

      dashboardData.staffOverview = staffStats[0] || {
        totalStaff: 0,
        activeStaff: 0,
        onLeaveStaff: 0,
        departmentDistribution: []
      };
    }

    if (type === 'attendance' || type === 'all') {
      // Attendance Statistics
      const attendanceStats = await StaffShift.aggregate([
        {
          $match: {
            shiftDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      dashboardData.attendance = attendanceStats;
    }

    if (type === 'leaves' || type === 'all') {
      // Leave Statistics
      const leaveStats = await LeaveRequest.aggregate([
        {
          $match: {
            startDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      dashboardData.leaves = leaveStats;
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Staff dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADDITIONAL STAFF MANAGEMENT ENDPOINTS ====================

// Update Staff Status (Active/Inactive)
app.put('/api/staff/:id/status', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason, effectiveDate } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Check if user is trying to deactivate themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot change your own status' });
    }

    const previousStatus = user.isActive;
    user.isActive = isActive;
    user.currentStatus = isActive ? 'available' : 'off-duty';
    
    if (!isActive && reason) {
      user.deactivationReason = reason;
      user.deactivationDate = effectiveDate || new Date();
    } else if (isActive) {
      user.deactivationReason = undefined;
      user.deactivationDate = undefined;
    }

    await user.save();
    
    await logAudit('STAFF_STATUS_UPDATED', `Staff status changed from ${previousStatus} to ${isActive} for ${user.name}`, req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        currentStatus: user.currentStatus,
        deactivationReason: user.deactivationReason,
        deactivationDate: user.deactivationDate
      },
      message: `Staff member ${user.name} ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Search and Filter
app.get('/api/staff/search', authenticateToken, async (req, res) => {
  try {
    const { 
      query, 
      department, 
      role, 
      status, 
      experience, 
      skills,
      page = 1, 
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { designation: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (department) searchQuery.department = department;
    if (role) searchQuery.role = role;
    if (status) searchQuery.currentStatus = status;
    if (experience) searchQuery.experience = { $gte: parseInt(experience) };
    
    // Add staff role filter
    searchQuery.role = { $in: ['doctor', 'staff', 'admin', 'receptionist', 'nurse'] };

    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('-passwordHash')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }),
      User.countDocuments(searchQuery)
    ]);

    // If skills filter is provided, filter by staff profile skills
    let filteredUsers = users;
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      const staffProfiles = await StaffProfile.find({
        userId: { $in: users.map(u => u._id) },
        skills: { $in: skillArray }
      });
      
      const userIdsWithSkills = staffProfiles.map(sp => sp.userId.toString());
      filteredUsers = users.filter(user => userIdsWithSkills.includes(user._id.toString()));
    }

    res.json({
      success: true,
      data: filteredUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Staff search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Onboarding Checklist
app.post('/api/staff/:id/onboarding', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      checklistItems,
      completedBy,
      notes,
      nextSteps
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Create or update onboarding record
    const onboardingData = {
      userId: id,
      checklistItems: checklistItems || [
        'Email account created',
        'System access granted',
        'Training scheduled',
        'Equipment assigned',
        'Department introduction completed',
        'Safety training completed',
        'Policy acknowledgment signed'
      ],
      completedBy: completedBy || req.user._id,
      notes,
      nextSteps,
      status: 'In Progress',
      startDate: new Date(),
      lastUpdatedBy: req.user._id
    };

    // Update user onboarding status
    user.onboardingStatus = 'In Progress';
    user.onboardingStartDate = new Date();
    await user.save();

    await logAudit('STAFF_ONBOARDING_STARTED', `Onboarding started for ${user.name}`, req.user._id);

    res.json({
      success: true,
      data: onboardingData,
      message: `Onboarding process started for ${user.name}`
    });

  } catch (error) {
    console.error('Staff onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete Staff Onboarding
app.put('/api/staff/:id/onboarding/complete', authenticateToken, authorizeRoles('admin', 'super-admin', 'hr_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      completionDate,
      finalNotes,
      performanceRating
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Update user onboarding status
    user.onboardingStatus = 'Completed';
    user.onboardingCompletionDate = completionDate || new Date();
    user.currentStatus = 'available';
    await user.save();

    await logAudit('STAFF_ONBOARDING_COMPLETED', `Onboarding completed for ${user.name}`, req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        onboardingStatus: user.onboardingStatus,
        onboardingCompletionDate: user.onboardingCompletionDate,
        currentStatus: user.currentStatus
      },
      message: `Onboarding completed successfully for ${user.name}`
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Staff Performance Metrics
app.get('/api/staff/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get shift statistics
    const shiftStats = await StaffShift.aggregate([
      {
        $match: {
          staffId: user._id,
          shiftDate: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          completedShifts: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          onTimeShifts: { $sum: { $cond: [{ $eq: ['$attendance.checkIn.status', 'On Time'] }, 1, 0] } },
          totalHours: { $sum: '$attendance.totalHours' }
        }
      }
    ]);

    // Get leave statistics
    const leaveStats = await LeaveRequest.aggregate([
      {
        $match: {
          staffId: user._id,
          startDate: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalLeaves: { $sum: 1 },
          approvedLeaves: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
          totalLeaveDays: { $sum: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000 * 60 * 60 * 24] } }
        }
      }
    ]);

    const performanceData = {
      staff: {
        _id: user._id,
        name: user.name,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      },
      period: {
        start: startDate,
        end: now,
        type: period
      },
      metrics: {
        shifts: shiftStats[0] || {
          totalShifts: 0,
          completedShifts: 0,
          onTimeShifts: 0,
          totalHours: 0
        },
        leaves: leaveStats[0] || {
          totalLeaves: 0,
          approvedLeaves: 0,
          totalLeaveDays: 0
        }
      },
      calculated: {
        attendanceRate: shiftStats[0] ? (shiftStats[0].completedShifts / shiftStats[0].totalShifts * 100).toFixed(2) : 0,
        punctualityRate: shiftStats[0] ? (shiftStats[0].onTimeShifts / shiftStats[0].totalShifts * 100).toFixed(2) : 0,
        averageHoursPerShift: shiftStats[0] ? (shiftStats[0].totalHours / shiftStats[0].completedShifts).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hospital Management System Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
