import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dawini')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Find a real user from the database
const findUserAndTest = async () => {
  try {
    const user = await User.findOne({ userType: 'patient' });
    if (!user) {
      console.log('❌ No patient found in database');
      return;
    }
    
    console.log('✅ Found user:', user.email, user.userType);
    
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        userType: user.userType,
        email: user.email 
      }, 
      'your-super-secret-jwt-key-here',
      { expiresIn: '1h' }
    );

    console.log('Test token:', token);
    
    // Test appointment data
    const appointmentData = {
      patientId: user._id.toString(), // User ID
      doctorId: '68d1b9b45e79f27329610b1b', // Replace with actual doctor ID
      date: '2025-01-01',
      time: '10:00',
      type: 'consultation',
      reason: 'Test appointment',
      notes: { patient: 'Test notes' }
    };

    console.log('Appointment data:', appointmentData);

    // Test the API call
    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
};

findUserAndTest();
