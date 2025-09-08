const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let authToken = null;

// Test data for different scenarios
const testData = {
  validUser: {
    name: 'Test Admin',
    email: 'testadmin@hospital.com',
    password: 'admin123',
    role: 'admin'
  },
  validPatient: {
    name: 'John Doe',
    age: 30,
    phone: '9876543210',
    email: 'john.doe@test.com',
    address: '123 Test Street',
    emergencyContact: '9876543211'
  },
  validDoctor: {
    name: 'Dr. Smith',
    email: 'dr.smith@hospital.com',
    specialization: 'Cardiology',
    phone: '9876543212',
    license: 'DOC123456'
  },
  validMedicine: {
    name: 'Paracetamol',
    category: 'Painkiller',
    price: 10.50,
    stock: 100,
    manufacturer: 'Test Pharma',
    expiryDate: '2025-12-31'
  }
};

const API_ENDPOINTS = [
  // Authentication Flow
  {
    category: 'Authentication',
    name: 'Register Admin User',
    method: 'POST',
    endpoint: '/api/auth/register',
    data: testData.validUser,
    description: 'Register a new admin user'
  },
  {
    category: 'Authentication',
    name: 'Login Admin User',
    method: 'POST',
    endpoint: '/api/auth/login',
    data: { email: testData.validUser.email, password: testData.validUser.password },
    description: 'Login with admin credentials',
    saveToken: true
  },
  {
    category: 'Authentication',
    name: 'Get Session',
    method: 'GET',
    endpoint: '/api/auth/session',
    requiresAuth: true,
    description: 'Get current user session'
  },

  // Patient Management
  {
    category: 'Patient Management',
    name: 'Get All Patients',
    method: 'GET',
    endpoint: '/api/patients',
    description: 'Retrieve all patients'
  },
  {
    category: 'Patient Management',
    name: 'Create Patient (Admin)',
    method: 'POST',
    endpoint: '/api/admin/patients',
    data: testData.validPatient,
    requiresAuth: true,
    description: 'Create a new patient via admin endpoint'
  },
  {
    category: 'Patient Management',
    name: 'Get Patient by ID',
    method: 'GET',
    endpoint: '/api/patients/1',
    description: 'Get specific patient details'
  },

  // Doctor Management
  {
    category: 'Doctor Management',
    name: 'Get Doctor Dashboard Stats',
    method: 'GET',
    endpoint: '/api/doctor/dashboard-stats',
    requiresAuth: true,
    description: 'Get doctor dashboard statistics'
  },
  {
    category: 'Doctor Management',
    name: 'Get Doctor Patients',
    method: 'GET',
    endpoint: '/api/doctor/patients',
    requiresAuth: true,
    description: 'Get patients assigned to doctor'
  },
  {
    category: 'Doctor Management',
    name: 'Get Doctor Appointments',
    method: 'GET',
    endpoint: '/api/doctor/appointments',
    requiresAuth: true,
    description: 'Get doctor appointments'
  },

  // Admin Management
  {
    category: 'Admin Management',
    name: 'Get Admin Dashboard Stats',
    method: 'GET',
    endpoint: '/api/admin/dashboard-stats',
    requiresAuth: true,
    description: 'Get admin dashboard statistics'
  },
  {
    category: 'Admin Management',
    name: 'Get All Admins',
    method: 'GET',
    endpoint: '/api/admin/admins',
    requiresAuth: true,
    description: 'Get all admin users'
  },
  {
    category: 'Admin Management',
    name: 'Get Admin Appointments',
    method: 'GET',
    endpoint: '/api/admin/appointments',
    requiresAuth: true,
    description: 'Get all appointments for admin view'
  },

  // Super Admin Management
  {
    category: 'Super Admin Management',
    name: 'Get Super Admin Dashboard Stats',
    method: 'GET',
    endpoint: '/api/super-admin/dashboard-stats',
    requiresAuth: true,
    description: 'Get super admin dashboard statistics'
  },
  {
    category: 'Super Admin Management',
    name: 'Create Doctor',
    method: 'POST',
    endpoint: '/api/super-admin/doctors',
    data: testData.validDoctor,
    requiresAuth: true,
    description: 'Create a new doctor'
  },
  {
    category: 'Super Admin Management',
    name: 'Get All Doctors',
    method: 'GET',
    endpoint: '/api/super-admin/doctors',
    requiresAuth: true,
    description: 'Get all doctors'
  },

  // Pharmacy Management
  {
    category: 'Pharmacy Management',
    name: 'Get Pharmacy Dashboard',
    method: 'GET',
    endpoint: '/api/pharmacy/dashboard',
    description: 'Get pharmacy dashboard data'
  },
  {
    category: 'Pharmacy Management',
    name: 'Get All Medicines',
    method: 'GET',
    endpoint: '/api/pharmacy/medicines',
    description: 'Get all medicines in inventory'
  },
  {
    category: 'Pharmacy Management',
    name: 'Create Medicine',
    method: 'POST',
    endpoint: '/api/pharmacy/medicines',
    data: testData.validMedicine,
    description: 'Add new medicine to inventory'
  },
  {
    category: 'Pharmacy Management',
    name: 'Get Stock Alerts',
    method: 'GET',
    endpoint: '/api/pharmacy/alerts',
    description: 'Get low stock alerts'
  },
  {
    category: 'Pharmacy Management',
    name: 'Search Medicines',
    method: 'GET',
    endpoint: '/api/pharmacy/search?q=paracetamol',
    description: 'Search medicines by name'
  },

  // Appointment Management
  {
    category: 'Appointment Management',
    name: 'Book Appointment',
    method: 'POST',
    endpoint: '/api/book-appointment',
    data: {
      patientName: 'Test Patient',
      phone: '9876543210',
      email: 'patient@test.com',
      date: '2024-01-15',
      time: '10:00',
      department: 'General'
    },
    description: 'Book a new appointment'
  },

  // Room Management
  {
    category: 'Room Management',
    name: 'Get All Rooms',
    method: 'GET',
    endpoint: '/api/admin/rooms',
    requiresAuth: true,
    description: 'Get all hospital rooms'
  },
  {
    category: 'Room Management',
    name: 'Create Room',
    method: 'POST',
    endpoint: '/api/admin/rooms',
    data: {
      roomNumber: '101',
      type: 'general',
      status: 'available',
      floor: 1,
      capacity: 2
    },
    requiresAuth: true,
    description: 'Create a new room'
  },

  // Staff Management
  {
    category: 'Staff Management',
    name: 'Get Staff Profiles',
    method: 'GET',
    endpoint: '/api/staff/profiles',
    description: 'Get all staff profiles'
  },
  {
    category: 'Staff Management',
    name: 'Create Staff Member',
    method: 'POST',
    endpoint: '/api/staff/create',
    data: {
      name: 'Nurse Jane',
      email: 'jane@hospital.com',
      department: 'Nursing',
      role: 'nurse',
      phone: '9876543213'
    },
    description: 'Create new staff member'
  },

  // File Upload
  {
    category: 'File Management',
    name: 'Test R2 Connection',
    method: 'GET',
    endpoint: '/api/test-r2',
    description: 'Test Cloudflare R2 connection'
  },

  // Logout
  {
    category: 'Authentication',
    name: 'Logout',
    method: 'POST',
    endpoint: '/api/auth/logout',
    requiresAuth: true,
    description: 'Logout current user'
  }
];

async function testAPI(endpoint) {
  try {
    const url = `${BASE_URL}${endpoint.endpoint}`;
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add authentication if required
    if (endpoint.requiresAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (endpoint.data && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
      options.body = JSON.stringify(endpoint.data);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Save token if this is a login request
    if (endpoint.saveToken && response.ok && data.token) {
      authToken = data.token;
    }

    return {
      category: endpoint.category,
      name: endpoint.name,
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      requestData: endpoint.data || null,
      description: endpoint.description,
      success: response.ok
    };
  } catch (error) {
    return {
      category: endpoint.category,
      name: endpoint.name,
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      error: error.message,
      requestData: endpoint.data || null,
      description: endpoint.description,
      success: false
    };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive API Testing...\n');
  const results = [];
  
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    console.log(`Testing ${i + 1}/${API_ENDPOINTS.length}: ${endpoint.name}`);
    console.log(`   ${endpoint.method} ${endpoint.endpoint}`);
    
    const result = await testAPI(endpoint);
    results.push(result);
    
    // Show immediate result
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`   ${statusIcon} ${result.status || 'ERROR'} ${result.statusText || result.error}\n`);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Generate comprehensive documentation
  const documentation = generateComprehensiveDocumentation(results);
  
  // Save to file
  const outputPath = path.join(__dirname, 'COMPREHENSIVE_API_DOCUMENTATION.md');
  fs.writeFileSync(outputPath, documentation);
  
  console.log(`\n✅ Comprehensive API Testing Complete!`);
  console.log(`📄 Documentation saved to: ${outputPath}`);
  
  // Generate summary
  const summary = generateTestSummary(results);
  console.log(summary);
  
  return results;
}

function generateComprehensiveDocumentation(results) {
  let doc = `# Hospital Management System - Comprehensive API Documentation\n\n`;
  doc += `**Generated on:** ${new Date().toISOString()}\n`;
  doc += `**Total Endpoints Tested:** ${results.length}\n`;
  doc += `**Base URL:** ${BASE_URL}\n\n`;
  
  // Table of Contents
  doc += `## Table of Contents\n\n`;
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(category => {
    doc += `- [${category}](#${category.toLowerCase().replace(/\s+/g, '-')})\n`;
  });
  doc += `\n`;

  // Group by category
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    
    doc += `## ${category}\n\n`;
    
    categoryResults.forEach(result => {
      const statusIcon = result.success ? '✅' : '❌';
      doc += `### ${statusIcon} ${result.name}\n\n`;
      doc += `**Description:** ${result.description}\n\n`;
      doc += `**Endpoint:** \`${result.method} ${result.endpoint}\`\n\n`;
      
      if (result.requestData) {
        doc += `**Request Body:**\n\`\`\`json\n${JSON.stringify(result.requestData, null, 2)}\n\`\`\`\n\n`;
      }
      
      if (result.error) {
        doc += `**Status:** ❌ Error\n`;
        doc += `**Error:** ${result.error}\n\n`;
      } else {
        doc += `**Status:** ${result.status} ${result.statusText}\n\n`;
        
        if (result.headers && result.headers['content-type']) {
          doc += `**Content-Type:** ${result.headers['content-type']}\n\n`;
        }
        
        doc += `**Response:**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n\n`;
      }
      
      doc += `---\n\n`;
    });
  });

  // API Usage Examples
  doc += `## API Usage Examples\n\n`;
  doc += `### Authentication Flow\n\n`;
  doc += `\`\`\`javascript\n`;
  doc += `// 1. Register a new user\n`;
  doc += `const registerResponse = await fetch('${BASE_URL}/api/auth/register', {\n`;
  doc += `  method: 'POST',\n`;
  doc += `  headers: { 'Content-Type': 'application/json' },\n`;
  doc += `  body: JSON.stringify(${JSON.stringify(testData.validUser, null, 2)})\n`;
  doc += `});\n\n`;
  doc += `// 2. Login to get token\n`;
  doc += `const loginResponse = await fetch('${BASE_URL}/api/auth/login', {\n`;
  doc += `  method: 'POST',\n`;
  doc += `  headers: { 'Content-Type': 'application/json' },\n`;
  doc += `  body: JSON.stringify({\n`;
  doc += `    email: '${testData.validUser.email}',\n`;
  doc += `    password: '${testData.validUser.password}'\n`;
  doc += `  })\n`;
  doc += `});\n\n`;
  doc += `const { token } = await loginResponse.json();\n\n`;
  doc += `// 3. Use token for authenticated requests\n`;
  doc += `const protectedResponse = await fetch('${BASE_URL}/api/admin/dashboard-stats', {\n`;
  doc += `  headers: { 'Authorization': \`Bearer \${token}\` }\n`;
  doc += `});\n`;
  doc += `\`\`\`\n\n`;

  // Summary
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  
  doc += `## Test Summary\n\n`;
  doc += `| Metric | Value |\n`;
  doc += `|--------|-------|\n`;
  doc += `| Total Endpoints | ${results.length} |\n`;
  doc += `| Successful | ${successCount} |\n`;
  doc += `| Failed | ${errorCount} |\n`;
  doc += `| Success Rate | ${((successCount / results.length) * 100).toFixed(1)}% |\n\n`;

  // Status Code Breakdown
  const statusCodes = {};
  results.forEach(r => {
    if (r.status) {
      statusCodes[r.status] = (statusCodes[r.status] || 0) + 1;
    }
  });

  doc += `### Status Code Breakdown\n\n`;
  doc += `| Status Code | Count | Description |\n`;
  doc += `|-------------|-------|-------------|\n`;
  Object.entries(statusCodes).forEach(([code, count]) => {
    const description = getStatusDescription(code);
    doc += `| ${code} | ${count} | ${description} |\n`;
  });
  doc += `\n`;

  return doc;
}

function getStatusDescription(code) {
  const descriptions = {
    '200': 'OK - Success',
    '201': 'Created - Resource created successfully',
    '400': 'Bad Request - Invalid input',
    '401': 'Unauthorized - Authentication required',
    '403': 'Forbidden - Access denied',
    '404': 'Not Found - Resource not found',
    '405': 'Method Not Allowed - HTTP method not supported',
    '500': 'Internal Server Error - Server error'
  };
  return descriptions[code] || 'Unknown status';
}

function generateTestSummary(results) {
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  const successRate = ((successCount / results.length) * 100).toFixed(1);
  
  let summary = `\n📊 TEST SUMMARY\n`;
  summary += `================\n`;
  summary += `Total Endpoints: ${results.length}\n`;
  summary += `✅ Successful: ${successCount}\n`;
  summary += `❌ Failed: ${errorCount}\n`;
  summary += `📈 Success Rate: ${successRate}%\n\n`;
  
  // Show failed endpoints
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    summary += `❌ FAILED ENDPOINTS:\n`;
    failed.forEach(f => {
      summary += `   • ${f.method} ${f.endpoint} - ${f.error || f.statusText}\n`;
    });
  }
  
  return summary;
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);
