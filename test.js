const http = require('http');

const baseUrl = 'http://localhost:3000';

// Test data
const testUrl = 'https://www.example.com/very/long/url/that/needs/to/be/shortened';

// Helper function to make HTTP requests
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
};

// Test functions
const testHealthCheck = async () => {
  console.log('🧪 Testing health check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    
    console.log('✅ Health check passed:', response.statusCode === 200);
    console.log('Response:', JSON.parse(response.body));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
};

const testShortenUrl = async () => {
  console.log('\n🧪 Testing URL shortening...');
  try {
    const postData = JSON.stringify({ url: testUrl });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/shorten',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    console.log('✅ URL shortening passed:', response.statusCode === 201);
    const result = JSON.parse(response.body);
    console.log('Short URL:', result.shortUrl);
    console.log('Short Code:', result.shortCode);
    
    return result.shortCode;
  } catch (error) {
    console.error('❌ URL shortening failed:', error.message);
    return null;
  }
};

const testRedirect = async (shortCode) => {
  if (!shortCode) return;
  
  console.log('\n🧪 Testing redirect...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/${shortCode}`,
      method: 'GET'
    });
    
    console.log('✅ Redirect passed:', response.statusCode === 301);
    console.log('Location header:', response.headers.location);
  } catch (error) {
    console.error('❌ Redirect failed:', error.message);
  }
};

const testStats = async (shortCode) => {
  if (!shortCode) return;
  
  console.log('\n🧪 Testing stats...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/stats/${shortCode}`,
      method: 'GET'
    });
    
    console.log('✅ Stats passed:', response.statusCode === 200);
    console.log('Stats:', JSON.parse(response.body));
  } catch (error) {
    console.error('❌ Stats failed:', error.message);
  }
};

const testInvalidUrl = async () => {
  console.log('\n🧪 Testing invalid URL...');
  try {
    const postData = JSON.stringify({ url: 'invalid-url' });
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/shorten',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    console.log('✅ Invalid URL handling passed:', response.statusCode === 400);
    console.log('Error response:', JSON.parse(response.body));
  } catch (error) {
    console.error('❌ Invalid URL test failed:', error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting API tests...\n');
  
  await testHealthCheck();
  const shortCode = await testShortenUrl();
  await testRedirect(shortCode);
  await testStats(shortCode);
  await testInvalidUrl();
  
  console.log('\n✨ All tests completed!');
};

// Wait for server to start then run tests
setTimeout(runTests, 5000);