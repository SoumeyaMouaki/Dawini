import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/users/upload-profile-picture - Upload profile picture
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const userId = req.userId;
    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Profile picture uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture'
    });
  }
});

// DELETE /api/users/profile-picture/:userId - Remove profile picture
router.delete('/profile-picture/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can delete this profile picture
    if (req.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete file from filesystem
    if (user.profilePicture) {
      const filePath = path.join(process.cwd(), 'public', user.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
    }

    // Remove profile picture from database
    await User.findByIdAndUpdate(userId, { $unset: { profilePicture: 1 } });

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture'
    });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', [
  body('fullName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().trim().isLength({ min: 10, max: 15 }),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.wilaya').optional().trim(),
  body('address.commune').optional().trim(),
  body('address.zipCode').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { fullName, phone, address } = req.body;
    const updateData = {};
    
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = { ...req.user.address, ...address };

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// GET /api/users/search - Search users for messaging
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    // Parse user types to search for
    const userTypes = type ? type.split(',') : ['patient', 'doctor', 'pharmacist'];
    
    // Build search query
    const searchQuery = {
      userType: { $in: userTypes },
      _id: { $ne: req.userId }, // Exclude current user
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    // Search users
    const users = await User.find(searchQuery)
      .select('fullName email userType profilePicture')
      .limit(20);

    // Get additional info for doctors and pharmacists
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        let additionalInfo = {};
        
        if (user.userType === 'doctor') {
          const Doctor = await import('../models/Doctor.js').then(m => m.default);
          const doctorProfile = await Doctor.findOne({ userId: user._id })
            .select('specialization');
          if (doctorProfile) {
            additionalInfo.specialization = doctorProfile.specialization;
          }
        } else if (user.userType === 'pharmacist') {
          const Pharmacy = await import('../models/Pharmacy.js').then(m => m.default);
          const pharmacyProfile = await Pharmacy.findOne({ userId: user._id })
            .select('pharmacyName');
          if (pharmacyProfile) {
            additionalInfo.pharmacyName = pharmacyProfile.pharmacyName;
          }
        }

        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          userType: user.userType,
          profilePicture: user.profilePicture,
          ...additionalInfo
        };
      })
    );

    res.json({
      success: true,
      users: usersWithDetails
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

export default router;
