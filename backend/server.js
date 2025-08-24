const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const { Sequelize, Op } = require('sequelize');
const mysql = require('mysql2');
const { Patient, Room } = require('./models');
=======
const { sequelize } = require('./models');
>>>>>>> 09f338b170c30e405622b6707e35d7bc332dd24c

const app = express();
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
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

=======
>>>>>>> 09f338b170c30e405622b6707e35d7bc332dd24c
// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3007'],
  credentials: true
}));
app.use(express.json());

// Routes
const { authenticate } = require('./middleware/auth');
const { authorizeRoles } = require('./middleware/authorize');
const superAdminRoutes = require('./routes/superAdmin');
const authRoutes = require('./routes/auth');
// const fileRoutes = require('./routes/fileRoutes');

app.use('/api/super-admin', authenticate, authorizeRoles('super-admin'), superAdminRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/files', fileRoutes);

// Static files
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));
app.use('/api/super-admin', require('./routes/superAdmin'));

<<<<<<< HEAD
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
=======
// DB connection and server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
})();
>>>>>>> 09f338b170c30e405622b6707e35d7bc332dd24c
