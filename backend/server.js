const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { Sequelize, Op } = require('sequelize');
const mysql = require('mysql2');
const { Patient, Room } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Create MySQL connection
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const { authenticate } = require('./middleware/auth')
const { authorizeRoles } = require('./middleware/authorize')
const superAdminRoutes = require('./routes/superAdmin')

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3007'], // Added frontend origin
  credentials: true
}));
app.use(express.json());
app.use('/api/super-admin', authenticate, authorizeRoles('super-admin'), superAdminRoutes)

// Serve static files from the 'uploads' directory
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Route imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, authorizeRoles('admin', 'doctor', 'nurse'), adminRoutes);

// Test database connection and sync models
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync();
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initializeDatabase();
