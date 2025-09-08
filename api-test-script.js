const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = [
  // Authentication APIs
  { method: 'POST', endpoint: '/api/auth/login', data: { email: 'admin@hospital.com', password: 'admin123' } },
  { method: 'POST', endpoint: '/api/auth/register', data: { name: 'Test User', email: 'test@test.com', password: 'test123', role: 'admin' } },
  { method: 'GET', endpoint: '/api/auth/session' },
  { method: 'POST', endpoint: '/api/auth/logout' },
  { method: 'POST', endpoint: '/api/auth/send-otp', data: { email: 'test@test.com' } },
  { method: 'POST', endpoint: '/api/auth/verify-otp', data: { email: 'test@test.com', otp: '123456' } },

  // Patient APIs
  { method: 'GET', endpoint: '/api/patients' },
  { method: 'POST', endpoint: '/api/patients', data: { name: 'John Doe', age: 30, phone: '1234567890', email: 'john@test.com' } },
  { method: 'GET', endpoint: '/api/patients/1' },
  { method: 'PUT', endpoint: '/api/patients/1', data: { name: 'John Updated' } },
  { method: 'GET', endpoint: '/api/patients/1/appointments' },

  // Appointment APIs
  { method: 'GET', endpoint: '/api/appointments/1' },
  { method: 'PUT', endpoint: '/api/appointments/1', data: { status: 'completed' } },
  { method: 'POST', endpoint: '/api/book-appointment', data: { patientName: 'Test Patient', phone: '1234567890', date: '2024-01-01', time: '10:00' } },

  // Doctor APIs
  { method: 'GET', endpoint: '/api/doctor/patients' },
  { method: 'GET', endpoint: '/api/doctor/appointments' },
  { method: 'GET', endpoint: '/api/doctor/pending-tasks' },
  { method: 'GET', endpoint: '/api/doctor/consultations' },
  { method: 'POST', endpoint: '/api/doctor/consultations', data: { patientId: 1, diagnosis: 'Test diagnosis', prescription: 'Test prescription' } },
  { method: 'GET', endpoint: '/api/doctor/dashboard-stats' },
  { method: 'GET', endpoint: '/api/doctor/recent-patients' },

  // Admin APIs
  { method: 'GET', endpoint: '/api/admin/patients' },
  { method: 'POST', endpoint: '/api/admin/patients', data: { name: 'Admin Patient', age: 25, phone: '9876543210' } },
  { method: 'GET', endpoint: '/api/admin/appointments' },
  { method: 'POST', endpoint: '/api/admin/appointments', data: { patientId: 1, doctorId: 1, date: '2024-01-01', time: '10:00' } },
  { method: 'GET', endpoint: '/api/admin/admins' },
  { method: 'POST', endpoint: '/api/admin/admins', data: { name: 'New Admin', email: 'newadmin@test.com', password: 'admin123' } },
  { method: 'GET', endpoint: '/api/admin/dashboard-stats' },
  { method: 'GET', endpoint: '/api/admin/appointment-stats' },
  { method: 'GET', endpoint: '/api/admin/appointment-data' },
  { method: 'GET', endpoint: '/api/admin/doctor-schedules' },
  { method: 'GET', endpoint: '/api/admin/patients-list' },
  { method: 'GET', endpoint: '/api/admin/admitted-patients' },
  { method: 'GET', endpoint: '/api/admin/stock-alerts' },
  { method: 'GET', endpoint: '/api/admin/rooms' },
  { method: 'POST', endpoint: '/api/admin/rooms', data: { roomNumber: '101', type: 'general', status: 'available' } },
  { method: 'GET', endpoint: '/api/admin/room-assignments' },
  { method: 'POST', endpoint: '/api/admin/room-assignments', data: { patientId: 1, roomId: 1 } },
  { method: 'GET', endpoint: '/api/admin/room-cleaning' },
  { method: 'POST', endpoint: '/api/admin/room-cleaning', data: { roomId: 1, status: 'cleaning' } },
  { method: 'GET', endpoint: '/api/admin/cleaning' },
  { method: 'POST', endpoint: '/api/admin/cleaning', data: { roomId: 1, cleaningType: 'deep', assignedTo: 'staff1' } },

  // Super Admin APIs
  { method: 'GET', endpoint: '/api/super-admin/dashboard-stats' },
  { method: 'GET', endpoint: '/api/super-admin/analytics' },
  { method: 'GET', endpoint: '/api/super-admin/admins' },
  { method: 'POST', endpoint: '/api/super-admin/admins', data: { name: 'Super Admin', email: 'superadmin@test.com', password: 'super123' } },
  { method: 'GET', endpoint: '/api/super-admin/doctors' },
  { method: 'POST', endpoint: '/api/super-admin/doctors', data: { name: 'Dr. Test', email: 'doctor@test.com', specialization: 'General' } },
  { method: 'GET', endpoint: '/api/super-admin/doctors/1' },
  { method: 'PUT', endpoint: '/api/super-admin/doctors/1', data: { name: 'Dr. Updated' } },
  { method: 'GET', endpoint: '/api/super-admin/doctors/stats' },
  { method: 'GET', endpoint: '/api/super-admin/users' },
  { method: 'POST', endpoint: '/api/super-admin/users', data: { name: 'New User', email: 'user@test.com', role: 'staff' } },
  { method: 'GET', endpoint: '/api/super-admin/users/1' },
  { method: 'PUT', endpoint: '/api/super-admin/users/1', data: { name: 'Updated User' } },
  { method: 'GET', endpoint: '/api/super-admin/staff' },
  { method: 'POST', endpoint: '/api/super-admin/staff', data: { name: 'Staff Member', email: 'staff@test.com', department: 'nursing' } },
  { method: 'GET', endpoint: '/api/super-admin/staff/1' },
  { method: 'PUT', endpoint: '/api/super-admin/staff/1', data: { name: 'Updated Staff' } },

  // Pharmacy APIs
  { method: 'GET', endpoint: '/api/pharmacy/medicines' },
  { method: 'POST', endpoint: '/api/pharmacy/medicines', data: { name: 'Paracetamol', category: 'painkiller', price: 10, stock: 100 } },
  { method: 'GET', endpoint: '/api/pharmacy/medicines/1' },
  { method: 'PUT', endpoint: '/api/pharmacy/medicines/1', data: { stock: 150 } },
  { method: 'GET', endpoint: '/api/pharmacy/vendors' },
  { method: 'POST', endpoint: '/api/pharmacy/vendors', data: { name: 'Vendor 1', contact: '1234567890', email: 'vendor@test.com' } },
  { method: 'GET', endpoint: '/api/pharmacy/vendors/1' },
  { method: 'PUT', endpoint: '/api/pharmacy/vendors/1', data: { name: 'Updated Vendor' } },
  { method: 'GET', endpoint: '/api/pharmacy/prescriptions' },
  { method: 'POST', endpoint: '/api/pharmacy/prescriptions', data: { patientId: 1, doctorId: 1, medicines: [{ medicineId: 1, quantity: 2 }] } },
  { method: 'GET', endpoint: '/api/pharmacy/prescriptions/1' },
  { method: 'POST', endpoint: '/api/pharmacy/prescriptions/1/dispense', data: { dispensedBy: 'pharmacist1' } },
  { method: 'GET', endpoint: '/api/pharmacy/stock' },
  { method: 'POST', endpoint: '/api/pharmacy/stock', data: { medicineId: 1, quantity: 50, type: 'in', reason: 'purchase' } },
  { method: 'GET', endpoint: '/api/pharmacy/stock/transactions' },
  { method: 'GET', endpoint: '/api/pharmacy/search?q=paracetamol' },
  { method: 'GET', endpoint: '/api/pharmacy/alerts' },
  { method: 'GET', endpoint: '/api/pharmacy/dashboard' },
  { method: 'GET', endpoint: '/api/pharmacy/reports' },
  { method: 'POST', endpoint: '/api/pharmacy/billing/create', data: { patientId: 1, items: [{ medicineId: 1, quantity: 2, price: 20 }] } },
  { method: 'GET', endpoint: '/api/pharmacy/billing/search-patients?q=john' },
  { method: 'GET', endpoint: '/api/pharmacy/billing/prescriptions/1' },

  // Staff APIs
  { method: 'GET', endpoint: '/api/staff/profiles' },
  { method: 'POST', endpoint: '/api/staff/create', data: { name: 'Staff Member', email: 'staff@test.com', department: 'nursing', role: 'nurse' } },
  { method: 'GET', endpoint: '/api/staff/shifts' },
  { method: 'POST', endpoint: '/api/staff/shifts', data: { staffId: 1, date: '2024-01-01', startTime: '08:00', endTime: '16:00' } },

  // File Upload APIs
  { method: 'GET', endpoint: '/api/upload' },
  { method: 'GET', endpoint: '/api/test-r2' }
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

    if (endpoint.data && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
      options.body = JSON.stringify(endpoint.data);
    }

    const response = await fetch(url, options);
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    return {
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: parsedData,
      requestData: endpoint.data || null
    };
  } catch (error) {
    return {
      endpoint: endpoint.endpoint,
      method: endpoint.method,
      error: error.message,
      requestData: endpoint.data || null
    };
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Testing...\n');
  const results = [];
  
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    console.log(`Testing ${i + 1}/${API_ENDPOINTS.length}: ${endpoint.method} ${endpoint.endpoint}`);
    
    const result = await testAPI(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate documentation
  const documentation = generateAPIDocumentation(results);
  
  // Save to file
  const outputPath = path.join(__dirname, 'API_DOCUMENTATION.md');
  fs.writeFileSync(outputPath, documentation);
  
  console.log(`\n✅ API Testing Complete! Documentation saved to: ${outputPath}`);
  return results;
}

function generateAPIDocumentation(results) {
  let doc = `# Hospital Management System - API Documentation\n\n`;
  doc += `**Generated on:** ${new Date().toISOString()}\n`;
  doc += `**Total Endpoints Tested:** ${results.length}\n\n`;
  
  // Group by category
  const categories = {
    'Authentication': results.filter(r => r.endpoint.includes('/auth/')),
    'Patients': results.filter(r => r.endpoint.includes('/patients')),
    'Appointments': results.filter(r => r.endpoint.includes('/appointments') || r.endpoint.includes('/book-appointment')),
    'Doctor': results.filter(r => r.endpoint.includes('/doctor/')),
    'Admin': results.filter(r => r.endpoint.includes('/admin/')),
    'Super Admin': results.filter(r => r.endpoint.includes('/super-admin/')),
    'Pharmacy': results.filter(r => r.endpoint.includes('/pharmacy/')),
    'Staff': results.filter(r => r.endpoint.includes('/staff/')),
    'File Upload': results.filter(r => r.endpoint.includes('/upload') || r.endpoint.includes('/test-r2'))
  };

  Object.entries(categories).forEach(([category, endpoints]) => {
    if (endpoints.length === 0) return;
    
    doc += `## ${category} APIs\n\n`;
    
    endpoints.forEach(result => {
      doc += `### ${result.method} ${result.endpoint}\n\n`;
      
      if (result.requestData) {
        doc += `**Request Body:**\n\`\`\`json\n${JSON.stringify(result.requestData, null, 2)}\n\`\`\`\n\n`;
      }
      
      if (result.error) {
        doc += `**Status:** ❌ Error\n`;
        doc += `**Error:** ${result.error}\n\n`;
      } else {
        const statusIcon = result.status < 400 ? '✅' : '❌';
        doc += `**Status:** ${statusIcon} ${result.status} ${result.statusText}\n\n`;
        
        if (result.headers && result.headers['content-type']) {
          doc += `**Content-Type:** ${result.headers['content-type']}\n\n`;
        }
        
        doc += `**Response:**\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\`\n\n`;
      }
      
      doc += `---\n\n`;
    });
  });

  // Summary
  const successCount = results.filter(r => !r.error && r.status < 400).length;
  const errorCount = results.filter(r => r.error || r.status >= 400).length;
  
  doc += `## Summary\n\n`;
  doc += `- **Total Endpoints:** ${results.length}\n`;
  doc += `- **Successful:** ${successCount}\n`;
  doc += `- **Failed:** ${errorCount}\n`;
  doc += `- **Success Rate:** ${((successCount / results.length) * 100).toFixed(1)}%\n\n`;

  return doc;
}

// Run the tests
runAllTests().catch(console.error);
