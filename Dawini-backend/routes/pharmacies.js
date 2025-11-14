import express from 'express';
import { body, validationResult } from 'express-validator';
import Pharmacy from '../models/Pharmacy.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pharmacies - Get all pharmacies with filters
router.get('/', async (req, res) => {
  try {
    const { 
      location, 
      services, 
      specializations, 
      isPartner, 
      page = 1, 
      limit = 10,
      sortBy = 'pharmacyName',
      sortOrder = 'asc'
    } = req.query;

    // Make filters optional for development - only apply if explicitly set
    const filter = {};
    
    // Only filter by isVerified/isActive if they exist in the query, otherwise return all
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (services) {
      const serviceArray = services.split(',');
      filter.services = { $in: serviceArray };
    }
    
    if (specializations) {
      const specArray = specializations.split(',');
      filter.specializations = { $in: specArray };
    }
    
    if (isPartner !== undefined) {
      filter.isPartner = isPartner === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pharmacies = await Pharmacy.find(filter)
      .populate('userId', 'fullName email phone address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Pharmacy.countDocuments(filter);

    res.json({
      pharmacies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pharmacies/:id - Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'fullName email phone address')
      .select('-verificationDocuments');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pharmacies/:id/profile - Get pharmacy profile (pharmacist only)
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'fullName email phone address');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/pharmacies/:id/profile - Update pharmacy profile
router.put('/:id/profile', [
  authenticateToken,
  body('pharmacyName').optional().trim().isLength({ min: 2, max: 100 }),
  body('contactInfo.phone').optional().trim().isMobilePhone(),
  body('contactInfo.email').optional().trim().isEmail(),
  body('operatingHours').optional().isObject(),
  body('services').optional().isArray(),
  body('specializations').optional().isArray(),
  body('isAvailable').optional().isBoolean()
], async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone address');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pharmacies/:id/prescriptions - Get pharmacy's prescriptions
router.get('/:id/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { pharmacyId: req.params.id };
    
    if (status) {
      filter.status = status;
    }

    const Prescription = await import('../models/Prescription.js').then(m => m.default);
    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ issueDate: -1 });

    const total = await Prescription.countDocuments(filter);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pharmacies/:id/operating-hours - Get pharmacy operating hours
router.get('/:id/operating-hours', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .select('operatingHours isAvailable');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({
      operatingHours: pharmacy.operatingHours,
      isAvailable: pharmacy.isAvailable
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/pharmacies/:id/verify - Verify pharmacy (admin only)
router.post('/:id/verify', [
  authenticateToken,
  body('isVerified').isBoolean(),
  body('verificationNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isVerified, verificationNotes } = req.body;
    
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified,
        verificationNotes: verificationNotes || undefined
      },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone address');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pharmacies/nearby - Get nearby pharmacies
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const pharmacies = await Pharmacy.find({
      isVerified: true,
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    })
    .populate('userId', 'fullName phone address')
    .select('pharmacyName location services specializations isPartner')
    .limit(parseInt(limit))
    .sort({ 'location.coordinates': 1 });

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
