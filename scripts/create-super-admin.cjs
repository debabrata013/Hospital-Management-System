const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms_local';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["super-admin", "admin", "doctor", "staff", "receptionist", "patient"], required: true },
  contactNumber: String,
  department: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com';
  const password = process.env.SUPERADMIN_PASS || 'dev123';

  let user = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);

  if (user) {
    await User.findByIdAndUpdate(user._id, { passwordHash, role: 'super-admin', isActive: true, updatedAt: new Date() });
    console.log('Updated super admin password');
  } else {
    user = new User({ name: 'Super Administrator', email, passwordHash, role: 'super-admin', contactNumber: '+91 9999999999', department: 'Administration', isActive: true });
    await user.save();
    console.log('Created super admin');
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  await mongoose.connection.close();
}

main().catch(async (e) => { console.error(e); try { await mongoose.connection.close(); } catch {} process.exit(1); });


