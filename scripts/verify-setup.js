const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pattnaikd833:WCpNo7zqKCZ7oLET@cluster0.zbyg6hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  isActive: Boolean,
  createdAt: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verifySetup() {
  try {
    console.log('🔍 Verifying Super Admin Dashboard Setup...\n');
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful\n');

    // Check if super admin exists
    console.log('👤 Checking super admin user...');
    const superAdmin = await User.findOne({ email: 'superadmin@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ Super admin user not found!');
      console.log('💡 Run: node scripts/create-super-admin.js');
      return false;
    }

    console.log('✅ Super admin user found:');
    console.log(`   📧 Email: ${superAdmin.email}`);
    console.log(`   👤 Name: ${superAdmin.name}`);
    console.log(`   🔑 Role: ${superAdmin.role}`);
    console.log(`   📅 Created: ${superAdmin.createdAt}`);
    console.log(`   🟢 Active: ${superAdmin.isActive}\n`);

    // Test password verification
    console.log('🔐 Testing password verification...');
    const isPasswordValid = await bcrypt.compare('dev123', superAdmin.passwordHash);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful\n');
    } else {
      console.log('❌ Password verification failed\n');
      return false;
    }

    // Check database collections
    console.log('📊 Checking database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('✅ Available collections:');
    collectionNames.forEach(name => {
      console.log(`   📁 ${name}`);
    });
    console.log('');

    // Check environment variables
    console.log('🔧 Checking environment variables...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    let envVarsOk = true;

    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        envVarsOk = false;
      }
    });

    if (!envVarsOk) {
      console.log('\n💡 Please set missing environment variables in .env.local');
      return false;
    }

    console.log('\n🎉 Setup verification completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit: http://localhost:3000/login');
    console.log('3. Login with: superadmin@gmail.com / dev123');
    console.log('4. Access dashboard: http://localhost:3000/super-admin/dashboard');
    
    return true;

  } catch (error) {
    console.error('❌ Setup verification failed:', error.message);
    return false;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run verification
if (require.main === module) {
  verifySetup()
    .then((success) => {
      if (success) {
        console.log('\n✅ All systems ready!');
        process.exit(0);
      } else {
        console.log('\n❌ Setup incomplete. Please fix the issues above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifySetup };
