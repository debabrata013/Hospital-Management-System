// backend/scripts/seed-superadmin.js
const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');
const User = require('../models/User');

(async () => {
  try {
    await sequelize.authenticate();
    const email = 'superadmin@local';
    const exists = await User.findOne({ where: { email }});
    if (exists) { console.log('superadmin exists'); process.exit() }
    const passwordHash = await bcrypt.hash('SuperSecret123', 10);
    const user = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: passwordHash,
      role: 'super-admin',
      isActive: true
    });
    console.log('Created:', user.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
