// Test script to check if login works without rate limiting issues
import axios from 'axios';

async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'dr.cherif@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Error:', error.message);
  }
}

testLogin();
