const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pattnaikd833:WCpNo7zqKCZ7oLET@cluster0.zbyg6hq.mongodb.net/arogya_hospital?retryWrites=true&w=majority&appName=Cluster0';

// User Schema (simplified for script)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["super-admin", "admin", "doctor", "staff", "receptionist", "patient"],
    required: true
  },
  contactNumber: String,
  department: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'superadmin@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Super admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      
      // Update password if needed
      const newPasswordHash = await bcrypt.hash('dev123', 12);
      await User.findByIdAndUpdate(existingAdmin._id, {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      });
      console.log('🔄 Password updated to: dev123');
      
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash('dev123', 12);

    // Create super admin user
    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'superadmin@gmail.com',
      passwordHash: passwordHash,
      role: 'super-admin',
      contactNumber: '+91 9999999999',
      department: 'Administration',
      isActive: true
    });

    console.log('👤 Creating super admin user...');
    await superAdmin.save();

    console.log('🎉 Super admin user created successfully!');
    console.log('📧 Email: superadmin@gmail.com');
    console.log('🔑 Password: dev123');
    console.log('👤 Role: super-admin');
    console.log('🆔 User ID:', superAdmin._id);

    // Create audit log entry
    const AuditLogSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      userRole: String,
      userName: String,
      action: String,
      actionType: String,
      resourceType: String,
      resourceId: String,
      ipAddress: String,
      riskLevel: String,
      createdAt: { type: Date, default: Date.now }
    });

    const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

    await AuditLog.create({
      userId: superAdmin._id,
      userRole: 'system',
      userName: 'System Setup',
      action: 'Created super admin user: superadmin@gmail.com',
      actionType: 'CREATE',
      resourceType: 'User',
      resourceId: superAdmin._id.toString(),
      ipAddress: '127.0.0.1',
      riskLevel: 'HIGH'
    });

    console.log('📝 Audit log entry created');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    
    if (error.code === 11000) {
      console.log('⚠️  User with this email already exists');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSuperAdmin };
