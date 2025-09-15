const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function showAllUsersOrganized() {
  console.log('👥 HOSPITAL MANAGEMENT SYSTEM - ALL USERS');
  console.log('=' .repeat(80));
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get all users
    const [users] = await connection.execute(`
      SELECT id, user_id, name, email, contact_number, role, is_active, created_at 
      FROM users 
      ORDER BY 
        CASE role 
          WHEN 'super-admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'doctor' THEN 3
          WHEN 'staff' THEN 4
          WHEN 'receptionist' THEN 5
          WHEN 'pharmacy' THEN 6
          ELSE 7
        END,
        name
    `);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      const role = user.role || 'unknown';
      if (!acc[role]) acc[role] = [];
      acc[role].push(user);
      return acc;
    }, {});

    // Display users by role
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      const roleTitle = role.toUpperCase().replace('-', ' ');
      console.log(`\n🏷️  ${roleTitle} (${roleUsers.length} users)`);
      console.log('-' .repeat(60));
      
      roleUsers.forEach((user, index) => {
        const status = user.is_active ? '🟢 Active' : '🔴 Inactive';
        const mobile = user.contact_number || 'No mobile';
        const email = user.email || 'No email';
        
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   ID: ${user.id} | User ID: ${user.user_id}`);
        console.log(`   Mobile: ${mobile} | Email: ${email}`);
        console.log(`   Status: ${status} | Created: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}`);
        console.log('');
      });
    });

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('=' .repeat(40));
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Inactive Users: ${inactiveUsers}`);
    
    console.log('\nUsers by Role:');
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      const activeCount = roleUsers.filter(u => u.is_active).length;
      console.log(`  ${role}: ${roleUsers.length} (${activeCount} active)`);
    });

    await connection.end();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

showAllUsersOrganized();
