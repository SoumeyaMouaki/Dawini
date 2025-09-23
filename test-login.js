<<<<<<< HEAD
// Test script to check if login works without rate limiting issues
import axios from 'axios';
=======
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb://localhost:27017/dawini');
>>>>>>> 8446e6d (updates backend)

async function testLogin() {
  try {
    console.log('Testing login...');
    
<<<<<<< HEAD
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
=======
    // Find user
    const user = await User.findOne({ email: 'ahmed.patient@test.com' });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User email:', user.email);
      console.log('User type:', user.userType);
      console.log('Password hash exists:', !!user.password);
      
      // Test password
      const isValidPassword = await bcrypt.compare('password123', user.password);
      console.log('Password valid:', isValidPassword);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
>>>>>>> 8446e6d (updates backend)
  }
}

testLogin();
