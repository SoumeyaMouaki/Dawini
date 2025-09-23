import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Pharmacy from '../models/Pharmacy.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('userType').isIn(['patient', 'doctor', 'pharmacist']).withMessage('Invalid user type'),
  body('address.wilaya').trim().notEmpty().withMessage('Wilaya is required'),
  body('address.commune').trim().notEmpty().withMessage('Commune is required'),
  body('address.coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
  body('address.coordinates.lng').optional().isFloat({ min: -180, max: 180 })
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { 
      fullName, 
      email, 
      password, 
      phone, 
      userType, 
      address,
      ...additionalData 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      password,
      phone,
      userType,
      address
    });

    await user.save();

    // Create specific profile based on user type
    let profile;
    switch (userType) {
      case 'patient':
        const { dateOfBirth, gender, nss, ...patientData } = additionalData;
        profile = new Patient({
          userId: user._id,
          dateOfBirth,
          gender,
          nss,
          ...patientData
        });
        break;

      case 'doctor':
        const { nOrdre, specialization, ...doctorData } = additionalData;
        
        // Check if nOrdre already exists
        const existingDoctor = await Doctor.findOne({ nOrdre });
        if (existingDoctor) {
          // Delete the created user if doctor creation fails
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({ 
            error: 'Doctor with this registration number already exists',
            field: 'nOrdre'
          });
        }
        
        profile = new Doctor({
          userId: user._id,
          nOrdre,
          specialization,
          ...doctorData
        });
        break;

      case 'pharmacist':
        const { pharmacyName, licenseNumber, ...pharmacyData } = additionalData;
        profile = new Pharmacy({
          userId: user._id,
          pharmacyName,
          licenseNumber,
          ...pharmacyData
        });
        break;
    }

    if (profile) {
      await profile.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toPublicJSON(),
      profile: profile ? profile.toObject() : null
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let message = `${field} already exists`;
      
      // Clean up created user if profile creation fails
      if (error.keyValue.userId) {
        await User.findByIdAndDelete(error.keyValue.userId);
      }
      
      // Provide specific error messages
      if (field === 'email') {
        message = 'Email address already exists';
      } else if (field === 'nOrdre') {
        message = 'Doctor registration number already exists';
      } else if (field === 'nss') {
        message = 'Patient social security number already exists';
      } else if (field === 'licenseNumber') {
        message = 'Pharmacy license number already exists';
      }
      
      return res.status(400).json({ 
        error: message,
        field: field
      });
    }

    // Clean up created user if any other error occurs
    if (user && user._id) {
      await User.findByIdAndDelete(user._id);
    }

    res.status(500).json({ 
      error: 'Internal server error during registration',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }

    // Verify password
    console.log('Login attempt for:', email);
    console.log('User found:', !!user);
    console.log('User password hash:', user.password);
    console.log('Provided password:', password);
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Get user profile
    let profile = null;
    switch (user.userType) {
      case 'patient':
        profile = await Patient.findOne({ userId: user._id });
        break;
      case 'doctor':
        profile = await Doctor.findOne({ userId: user._id });
        break;
      case 'pharmacist':
        profile = await Pharmacy.findOne({ userId: user._id });
        break;
    }

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicJSON(),
      profile: profile ? profile.toObject() : null
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token is required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user data
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'User not found or inactive' 
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error during token refresh' 
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Since JWT is stateless, we just return success
  // The client should remove the token
  res.json({ 
    message: 'Logout successful' 
  });
});

export default router;
