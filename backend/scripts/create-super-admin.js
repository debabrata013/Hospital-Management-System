require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const sequelize = require('../config/database');

async function createSuperAdmin() {
  console.log('Starting super admin creation script...');
  try {
    console.log('Authenticating with the database...');
    await sequelize.authenticate();
    console.log('Database connection successful.');

    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com';
    const password = process.env.SUPERADMIN_PASS || 'dev123';

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        role: 'super-admin',
        isActive: true,
      }
    });

    if (created) {
      console.log('Super admin user created successfully.');
    } else {
      await user.update({ password: hashedPassword, role: 'super-admin', isActive: true });
      console.log('Super admin user already existed. Password has been updated.');
    }

    console.log('--- Super Admin Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

createSuperAdmin();
