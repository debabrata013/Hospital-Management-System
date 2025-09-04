
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const sequelize = new Sequelize(
  process.env.DB_NAME || 'u153229971_Hospital',
  process.env.DB_USER || 'u153229971_admin',
  process.env.DB_PASSWORD || 'Admin!2025',
  {
    host: process.env.DB_HOST || 'srv2047.hstgr.io',
    dialect: 'mysql',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    logging: false, // Set to true to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true, // Automatically add createdAt and updatedAt
      underscored: true, // Use snake_case for table and column names
    },
  }
);

export default sequelize;
