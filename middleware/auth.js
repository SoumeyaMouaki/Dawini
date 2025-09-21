import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'User not found or inactive' 
      });
    }

    // Add user info to request
    req.user = user;
    req.userId = user._id;
    req.userType = user.userType;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
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
      error: 'Internal server error during authentication' 
    });
  }
};

// Middleware to check if user is a specific type
export const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!allowedTypes.includes(req.userType)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Middleware to check if user is a patient
export const requirePatient = requireUserType(['patient']);

// Middleware to check if user is a doctor
export const requireDoctor = requireUserType(['doctor']);

// Middleware to check if user is a pharmacist
export const requirePharmacist = requireUserType(['pharmacist']);

// Middleware to check if user is a healthcare professional (doctor or pharmacist)
export const requireHealthcareProfessional = requireUserType(['doctor', 'pharmacist']);

// Middleware to check if user owns the resource or is admin
export const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          error: 'Resource not found' 
        });
      }

      // Check if user owns the resource or is admin
      const ownerField = req.userType === 'patient' ? 'patientId' : 
                        req.userType === 'doctor' ? 'doctorId' : 
                        req.userType === 'pharmacist' ? 'pharmacyId' : null;
      
      if (ownerField && resource[ownerField] && resource[ownerField].toString() !== req.userId.toString()) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own resources.' 
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during ownership check' 
      });
    }
  };
};

// Middleware to rate limit specific actions
export const rateLimitAction = (action, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.userId}-${action}`;
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({ 
        error: 'Too many attempts. Please try again later.' 
      });
    }
    
    // Add current attempt
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);
    
    next();
  };
};
