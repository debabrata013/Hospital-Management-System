const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

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