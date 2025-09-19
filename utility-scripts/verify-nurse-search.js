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
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data),
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

async function testNurseSearch() {
  console.log('Starting nurse search test...');
  console.log('Server URL:', LIVE_SERVER_URL);
  
  try {
    // 1. First, try to access the nurses page to get any required cookies
    console.log('\n--- Testing access to nurses page ---');
    const pageResponse = await makeRequest(`${LIVE_SERVER_URL}/admin/nurses`);
    
    // 2. Now fetch the nurses data
    console.log('\n--- Fetching nurses data ---');
    const apiUrl = `${LIVE_SERVER_URL}/api/admin/nurses`;
    console.log(`Fetching nurses from: ${apiUrl}`);
    
    const response = await makeRequest(apiUrl);
    
    if (!response.ok) {
      console.error(`Error fetching nurses: ${response.status} ${response.statusText}`);
      console.error('Response headers:', JSON.stringify(response.headers, null, 2));
      return;
    }

    // The response should be the actual data, not wrapped in a 'data' property
    const nurses = Array.isArray(response) ? response : [];
    console.log(`Successfully fetched ${nurses.length} nurses.`);

    if (nurses.length === 0) {
      console.log('WARNING: No nurses returned from the API. The search functionality will not work without data.');
      return;
    }
    
    // Log the first nurse as a sample
    console.log('\nSample nurse data:', JSON.stringify(nurses[0], null, 2));

    // 2. Simulate search functionality
    console.log('\n--- Simulating Search ---\n');

    const testSearches = ['debabrata', '9000000000', 'Kiran', '999999', 'nonexistent'];

    testSearches.forEach(searchTerm => {
      console.log(`Searching for: "${searchTerm}"`);
      
      const filteredNurses = nurses.filter(nurse => 
        nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nurse.mobile && nurse.mobile.includes(searchTerm))
      );

      if (filteredNurses.length > 0) {
        console.log(`  Found ${filteredNurses.length} match(es):`);
        filteredNurses.forEach(nurse => {
          console.log(`    - ${nurse.name} (${nurse.mobile})`);
        });
      } else {
        console.log('  No matches found.');
      }
      console.log('---');
    });

  } catch (error) {
    console.error('An unexpected error occurred during the test:', error);
  }
}

testNurseSearch();
