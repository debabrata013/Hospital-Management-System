const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const { authenticate } = require('./middleware/auth');
const { authorizeRoles } = require('./middleware/authorize');

// Route imports
const superAdminRoutes = require('./routes/superAdmin');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cleaningRoutes = require('./routes/cleaning');
// const fileRoutes = require('./routes/fileRoutes');

// Body parser & CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/super-admin', authenticate, authorizeRoles('super-admin'), superAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, authorizeRoles('admin', 'doctor', 'nurse'), adminRoutes);
app.use('/api/cleaning', authenticate, authorizeRoles('admin', 'super-admin'), cleaningRoutes);
// app.use('/api/files', fileRoutes);

// Static files
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes (avoid duplicates)

// DB connection and server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync();
    console.log('Database models synchronized.');
    app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
})();
