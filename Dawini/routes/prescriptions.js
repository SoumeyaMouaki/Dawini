import express from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Prescription from '../models/Prescription.js';
import { authenticateToken, requireOwnership, requireUserType } from '../middleware/auth.js';

const router = Router();

// GET /api/prescriptions - Get prescriptions with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      patientId, 
      doctorId, 
      pharmacyId, 
      dateFrom, 
      dateTo,
      page = 1, 
      limit = 10 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (pharmacyId) filter.pharmacyId = pharmacyId;
    
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }

    // Filter based on user type
    if (req.user.userType === 'patient') {
      filter.patientId = req.user.id;
    } else if (req.user.userType === 'doctor') {
      filter.doctorId = req.user.id;
    } else if (req.user.userType === 'pharmacist') {
      filter.pharmacyId = req.user.id;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName specialization')
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

// GET /api/prescriptions/:id - Get prescription by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName specialization')
      .populate('pharmacyId', 'pharmacyName');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check access rights
    if (req.user.userType === 'patient' && prescription.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.userType === 'doctor' && prescription.doctorId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.userType === 'pharmacist' && prescription.pharmacyId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions - Create new prescription (doctor only)
router.post('/', [
  authenticateToken,
  requireUserType(['doctor']),
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').trim().notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').trim().notEmpty().withMessage('Medication dosage is required'),
  body('medications.*.frequency').trim().notEmpty().withMessage('Medication frequency is required'),
  body('medications.*.duration').trim().notEmpty().withMessage('Medication duration is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('instructions').trim().notEmpty().withMessage('Instructions are required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescriptionData = {
      ...req.body,
      doctorId: req.user.id,
      issueDate: new Date(),
      status: 'active'
    };

    const prescription = new Prescription(prescriptionData);
    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName specialization');

    res.status(201).json(populatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/prescriptions/:id - Update prescription
router.put('/:id', [
  authenticateToken,
  body('medications').optional().isArray(),
  body('diagnosis').optional().trim().notEmpty(),
  body('instructions').optional().trim().notEmpty(),
  body('specialInstructions').optional().trim(),
  body('status').optional().isIn(['active', 'completed', 'cancelled', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check access rights
    if (req.user.userType === 'doctor' && prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = req.body;
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'fullName')
     .populate('doctorId', 'fullName specialization')
     .populate('pharmacyId', 'pharmacyName');

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions/:id/fill - Fill prescription (pharmacist only)
router.post('/:id/fill', [
  authenticateToken,
  requireUserType(['pharmacist']),
  body('filledAt').isISO8601().withMessage('Valid fill date is required'),
  body('filledBy').trim().notEmpty().withMessage('Pharmacist name is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({ message: 'Prescription cannot be filled' });
    }

    if (prescription.isExpired) {
      return res.status(400).json({ message: 'Prescription has expired' });
    }

    const updateData = {
      status: 'filled',
      'pharmacy.filledAt': new Date(req.body.filledAt),
      'pharmacy.filledBy': req.body.filledBy,
      'pharmacy.notes': req.body.notes
    };

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'fullName')
     .populate('doctorId', 'fullName specialization')
     .populate('pharmacyId', 'pharmacyName');

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions/:id/verify - Verify prescription
router.post('/:id/verify', [
  authenticateToken,
  requireUserType(['pharmacist']),
  body('verificationStatus').isIn(['verified', 'rejected']).withMessage('Valid verification status is required'),
  body('verificationNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const updateData = {
      'verification.status': req.body.verificationStatus,
      'verification.verifiedAt': new Date(),
      'verification.verifiedBy': req.user.id,
      'verification.notes': req.body.verificationNotes
    };

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'fullName')
     .populate('doctorId', 'fullName specialization')
     .populate('pharmacyId', 'pharmacyName');

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/prescriptions/:id - Delete prescription (doctor only)
router.delete('/:id', [
  authenticateToken,
  requireUserType(['doctor'])
], async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (prescription.status === 'filled') {
      return res.status(400).json({ message: 'Cannot delete filled prescription' });
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
