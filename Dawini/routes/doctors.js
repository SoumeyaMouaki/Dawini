import express from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { authenticateToken, requireDoctor, requireUserType } from '../middleware/auth.js';

const router = Router();

// GET /api/doctors - Get all doctors with filters
router.get('/', async (req, res) => {
  try {
    const { 
      specialization, 
      location, 
      available, 
      page = 1, 
      limit = 10,
      sortBy = 'fullName',
      sortOrder = 'asc'
    } = req.query;

    const filter = { isVerified: true, isActive: true };
    
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (available === 'true') {
      filter.isAvailable = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const doctors = await Doctor.find(filter)
      .populate('userId', 'fullName email phone address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Doctor.countDocuments(filter);

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'fullName email phone address')
      .select('-verificationDocuments');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/doctors/:id/profile - Get doctor profile (doctor only)
router.get('/:id/profile', authenticateToken, requireDoctor, async (req, res) => {
  try {
    if (req.user._id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'fullName email phone address');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/doctors/:id/profile - Update doctor profile
router.put('/:id/profile', [
  authenticateToken,
  requireDoctor,
  body('specialization').optional().trim().isLength({ min: 2, max: 100 }),
  body('biography').optional().trim().isLength({ max: 1000 }),
  body('consultationFee').optional().isFloat({ min: 0 }),
  body('consultationDuration').optional().isInt({ min: 15, max: 120 }),
  body('isAvailable').optional().isBoolean(),
  body('maxPatientsPerDay').optional().isInt({ min: 1, max: 50 }),
  body('services').optional().isObject(),
  body('languages').optional().isArray(),
  body('workingHours').optional().isObject(),
  body('education').optional().isArray(),
  body('certifications').optional().isArray()
], async (req, res) => {
  try {
    if (req.user._id !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone address');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/doctors/:id/appointments - Get doctor's appointments
router.get('/:id/appointments', authenticateToken, async (req, res) => {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;
    
    const filter = { doctorId: req.params.id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    if (status) {
      filter.status = status;
    }

    const Appointment = await import('../models/Appointment.js').then(m => m.default);
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'fullName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, time: 1 });

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/doctors/:id/prescriptions - Get doctor's prescriptions
router.get('/:id/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { doctorId: req.params.id };
    
    if (status) {
      filter.status = status;
    }

    const Prescription = await import('../models/Prescription.js').then(m => m.default);
    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'fullName')
      .populate('pharmacyId', 'pharmacyName')
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

// GET /api/doctors/:id/availability - Get doctor's availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const Appointment = await import('../models/Appointment.js').then(m => m.default);
    const appointments = await Appointment.find({
      doctorId: req.params.id,
      date: new Date(date),
      status: { $nin: ['cancelled', 'completed'] }
    });

    const workingHours = doctor.workingHours;
    const bookedSlots = appointments.map(apt => apt.time);

    res.json({
      workingHours,
      bookedSlots,
      isAvailable: doctor.isAvailable
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/doctors/:id/verify - Verify doctor (admin only)
router.post('/:id/verify', [
  authenticateToken,
  requireUserType(['admin']),
  body('isVerified').isBoolean(),
  body('verificationNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isVerified, verificationNotes } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified,
        verificationNotes: verificationNotes || undefined
      },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone address');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
