import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requirePatient } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requirePatient);

// GET /api/patients/:id/appointments
router.get('/:id/appointments', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own appointments.' 
      });
    }

    // Build query
    const query = { patientId: id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Get appointments with pagination
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .populate('doctorId', 'fullName specialization address')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching appointments' 
    });
  }
});

// GET /api/patients/:id/appointments/upcoming
router.get('/:id/appointments/upcoming', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own appointments.' 
      });
    }

    const upcomingAppointments = await Appointment.find({
      patientId: id,
      status: 'confirmed',
      date: { $gte: new Date() }
    })
    .populate('doctorId', 'fullName specialization address phone')
    .sort({ date: 1, time: 1 })
    .limit(5);

    res.json({ upcomingAppointments });

  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching upcoming appointments' 
    });
  }
});

// GET /api/patients/:id/appointments/history
router.get('/:id/appointments/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own appointments.' 
      });
    }

    const skip = (page - 1) * limit;
    const pastAppointments = await Appointment.find({
      patientId: id,
      date: { $lt: new Date() }
    })
    .populate('doctorId', 'fullName specialization address')
    .sort({ date: -1, time: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Appointment.countDocuments({
      patientId: id,
      date: { $lt: new Date() }
    });

    res.json({
      pastAppointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointment history error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching appointment history' 
    });
  }
});

// GET /api/patients/:id/prescriptions
router.get('/:id/prescriptions', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own prescriptions.' 
      });
    }

    // Build query
    const query = { patientId: id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'fullName specialization')
      .populate('pharmacy.pharmacyId', 'pharmacyName address')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching prescriptions' 
    });
  }
});

// GET /api/patients/:id/prescriptions/active
router.get('/:id/prescriptions/active', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own prescriptions.' 
      });
    }

    const activePrescriptions = await Prescription.find({
      patientId: id,
      status: 'active',
      expiryDate: { $gt: new Date() }
    })
    .populate('doctorId', 'fullName specialization')
    .sort({ expiryDate: 1 });

    res.json({ activePrescriptions });

  } catch (error) {
    console.error('Get active prescriptions error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching active prescriptions' 
    });
  }
});

// GET /api/patients/:id/profile
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own profile.' 
      });
    }

    const patient = await Patient.findOne({ userId: id })
      .populate('userId', 'fullName email phone address isVerified');

    if (!patient) {
      return res.status(404).json({ 
        error: 'Patient profile not found' 
      });
    }

    res.json({ patient });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching patient profile' 
    });
  }
});

// PUT /api/patients/:id/profile
router.put('/:id/profile', [
  body('emergencyContact.name').optional().trim().isLength({ min: 2, max: 100 }),
  body('emergencyContact.phone').optional().trim().isLength({ min: 10 }),
  body('emergencyContact.relationship').optional().trim().isLength({ min: 2, max: 50 }),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('allergies').optional().isArray(),
  body('chronicConditions').optional().isArray(),
  body('preferredLanguage').optional().isIn(['fr', 'en', 'ar']),
  body('insuranceProvider').optional().trim(),
  body('insuranceNumber').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update your own profile.' 
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const patient = await Patient.findOne({ userId: id });
    if (!patient) {
      return res.status(404).json({ 
        error: 'Patient profile not found' 
      });
    }

    // Update allowed fields
    const allowedFields = [
      'emergencyContact', 'bloodType', 'allergies', 'chronicConditions',
      'preferredLanguage', 'insuranceProvider', 'insuranceNumber'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    res.json({ 
      message: 'Profile updated successfully',
      patient 
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating patient profile' 
    });
  }
});

// GET /api/patients/:id/doctors/search
router.get('/:id/doctors/search', [
  query('specialization').optional().trim(),
  query('wilaya').optional().trim(),
  query('commune').optional().trim(),
  query('date').optional().isISO8601(),
  query('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      specialization, 
      wilaya, 
      commune, 
      date, 
      time, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Verify patient owns this profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only search from your own profile.' 
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Build query
    const query = { isAvailable: true, isVerified: true };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (wilaya) {
      query['address.wilaya'] = { $regex: wilaya, $options: 'i' };
    }
    
    if (commune) {
      query['address.commune'] = { $regex: commune, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const doctors = await Doctor.find(query)
      .populate('userId', 'fullName address phone')
      .sort({ 'address.wilaya': 1, 'address.commune': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    // Filter by availability if date and time provided
    let availableDoctors = doctors;
    if (date && time) {
      const searchDate = new Date(date);
      const searchTime = time;
      const dayOfWeek = searchDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      availableDoctors = doctors.filter(doctor => {
        const daySchedule = doctor.workingHours[dayOfWeek];
        return daySchedule && daySchedule.isWorking && 
               searchTime >= daySchedule.start && 
               searchTime <= daySchedule.end;
      });
    }

    res.json({
      doctors: availableDoctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ 
      error: 'Internal server error while searching doctors' 
    });
  }
});

export default router;
