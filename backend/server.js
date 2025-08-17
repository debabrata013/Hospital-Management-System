const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Import from models/index.js

const app = express();
const PORT = process.env.PORT || 5000;

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
const fileRoutes = require('./routes/fileRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Test the database connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database and start server
    // await sequelize.sync({ alter: true }); // Disabled due to permission issues on hosting
    // console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testDbConnection();
