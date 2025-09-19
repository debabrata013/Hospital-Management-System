// Server URL (without trailing slash)
const LIVE_SERVER_URL = 'http://212.1.213.166:3500';

const { URL } = require('url');
const https = require('https');
const http = require('http');

// A simple function to make GET requests using Node's built-in modules
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const protocol = isHttps ? https : http;

    // Default headers
    const defaultHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': `${LIVE_SERVER_URL}/admin/nurses`,
      'Sec-Ch-Ua': '"Not/A)Brand";v="99", "Google Chrome";v="115"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    };

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: { ...defaultHeaders, ...headers },
      rejectUnauthorized: false // Only for testing, not for production
    };

    console.log('Making request to:', parsedUrl.href);

    const req = protocol.request(options, (res) => {
      console.log(`Response received: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = [];
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        const responseData = Buffer.concat(data).toString();
        console.log('Raw Response:', responseData);
        
        let parsedData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          return reject(new Error(`Invalid JSON response: ${responseData}`));
        }
        
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: () => Promise.resolve(parsedData),
          text: () => Promise.resolve(responseData),
        });
      });
    });

    // Set a timeout for the request
    req.setTimeout(10000, () => {
      req.destroy(new Error('Request timed out after 10 seconds'));
    });

    req.on('error', (error) => {
      console.error('Request error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      reject(error);
    });

    // Log the request details
    console.log('Request options:', {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: options.port,
      path: options.path,
      method: options.method,
      headers: options.headers
    });

    req.end();
  });
}

async function testStaffCreation() {
  console.log('Starting staff creation test...');
  console.log('Server URL:', LIVE_SERVER_URL);
  
  try {
    // Test the staff creation API endpoint
    console.log('\n--- Testing Staff Creation API ---');
    const staffApiUrl = `${LIVE_SERVER_URL}/api/super-admin/staff`;
    console.log(`Testing staff creation at: ${staffApiUrl}`);
    
    // Test data for creating a nurse
    const testNurseData = {
      name: 'Test Nurse',
      mobile: '9876543210',
      password: '123456',
      role: 'nurse',
      department: 'General Medicine',
      shift: 'Morning',
      specialization: 'General Nursing'
    };
    
    console.log('Test nurse data:', JSON.stringify(testNurseData, null, 2));
    
    const response = await makePostRequest(staffApiUrl, testNurseData);
    
    console.log(`\nStaff Creation Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Error creating staff: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error response:', errorData);
      return;
    }

    // Parse the response data
    const responseData = await response.json();
    console.log('\nStaff Creation Response:', JSON.stringify(responseData, null, 2));
    
    if (responseData.success) {
      console.log('\n✅ Staff creation successful!');
      console.log('Created staff:', responseData.staff);
    } else {
      console.log('\n❌ Staff creation failed:', responseData.error);
    }

  } catch (error) {
    console.error('An unexpected error occurred during staff creation test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

async function testNurseSearch() {
  console.log('Starting nurse search test...');
  console.log('Server URL:', LIVE_SERVER_URL);
  
  try {
    // Skip the page request and go directly to the API
    console.log('\n--- Testing Nurses API endpoint ---');
    const apiUrl = `${LIVE_SERVER_URL}/api/admin/nurses`;
    console.log(`Fetching nurses from: ${apiUrl}`);
    
    const response = await makeRequest(apiUrl);
    
    console.log(`\nAPI Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Error fetching nurses: ${response.status} ${response.statusText}`);
      const errorData = await response.text();
      console.error('Error response:', errorData);
      return;
    }

    // Parse the response data
    const responseData = await response.json();
    console.log('\nFull API Response:', JSON.stringify(responseData, null, 2));
    
    // Check if it has the expected structure and extract nurses
    let nurses = [];
    if (responseData && typeof responseData === 'object') {
      if (responseData.nurses) {
        nurses = responseData.nurses;
        console.log(`\nFound ${nurses.length} nurses in response.nurses`);
        if (nurses.length > 0) {
          console.log('Sample nurse:', JSON.stringify(nurses[0], null, 2));
        }
      } else if (Array.isArray(responseData)) {
        nurses = responseData;
        console.log(`\nResponse is an array with ${nurses.length} items`);
        if (nurses.length > 0) {
          console.log('Sample item:', JSON.stringify(nurses[0], null, 2));
        }
      } else {
        console.log('\nResponse structure:', Object.keys(responseData));
      }
    }

    // Test search functionality if we have nurses
    if (nurses.length > 0) {
      console.log('\n--- Testing Search Functionality ---\n');

      const testSearches = ['debabrata', '9000000000', 'Kiran', '999999', 'test', 'nonexistent'];

      testSearches.forEach(searchTerm => {
        console.log(`Searching for: "${searchTerm}"`);
        
        const filteredNurses = nurses.filter(nurse => 
          nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nurse.mobile && nurse.mobile.includes(searchTerm)) ||
          (nurse.contact_number && nurse.contact_number.includes(searchTerm))
        );

        if (filteredNurses.length > 0) {
          console.log(`  Found ${filteredNurses.length} match(es):`);
          filteredNurses.forEach(nurse => {
            console.log(`    - ${nurse.name} (${nurse.mobile || nurse.contact_number})`);
          });
        } else {
          console.log('  No matches found.');
        }
        console.log('---');
      });
    } else {
      console.log('\n--- Cannot Test Search ---');
      console.log('No nurses found in the API response, so search functionality cannot be tested.');
    }

  } catch (error) {
    console.error('An unexpected error occurred during the test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Test what's actually in the database
async function testDatabaseRoles() {
  console.log('Testing what roles exist in the database...');
  
  try {
    // Try to access a general users endpoint to see what roles exist
    const usersUrl = `${LIVE_SERVER_URL}/api/super-admin/staff`;
    console.log(`Testing staff endpoint: ${usersUrl}`);
    
    const response = await makeRequest(usersUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Staff API Response:', JSON.stringify(data, null, 2));
      
      if (data.staff && Array.isArray(data.staff)) {
        const roles = [...new Set(data.staff.map(s => s.role))];
        console.log('Unique roles found:', roles);
        
        const nurseUsers = data.staff.filter(s => 
          s.role && s.role.toLowerCase().includes('nurse')
        );
        console.log(`Users with 'nurse' in role: ${nurseUsers.length}`);
        if (nurseUsers.length > 0) {
          console.log('Sample nurse user:', nurseUsers[0]);
        }
      }
    } else {
      console.log('Staff endpoint also requires auth, testing nurses endpoint...');
      await testNurseSearch();
    }
  } catch (error) {
    console.error('Error testing database roles:', error);
    await testNurseSearch();
  }
}

testDatabaseRoles();
