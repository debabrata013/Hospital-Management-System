const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models'); // Import from models/index.js

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the 'uploads' directory
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Route imports
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/fileRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
