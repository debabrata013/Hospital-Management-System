console.log('Script starting...');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('Dotenv configured.');

console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);

const bcrypt = require('bcryptjs');
const { User } = require('../backend/models');
const sequelize = require('../backend/config/database');

async function createSuperAdmin() {
  console.log('createSuperAdmin function started.');
  try {
    console.log('Attempting to authenticate with the database...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com';
    const password = process.env.SUPERADMIN_PASS || 'dev123';
    console.log(`Attempting to create/update super admin with email: ${email}`);

    const existingUser = await User.findOne({ where: { email } });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      console.log('Existing super admin found. Updating password.');
      await existingUser.update({
        password: hashedPassword,
        role: 'super-admin',
        isActive: true,
      });
      console.log('Super admin user updated successfully.');
    } else {
      console.log('No existing super admin found. Creating new user.');
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email,
        password: hashedPassword,
        role: 'super-admin',
        isActive: true,
      });
      console.log('Super admin user created successfully.');
    }

    console.log('--- Super Admin Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------');

  } catch (error) {
    console.error('ERROR: Unable to create super admin.', error);
  } finally {
    console.log('Closing database connection.');
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

createSuperAdmin();

