import express from 'express';
import { body, validationResult } from 'express-validator';
import Prescription from '../models/Prescription.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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
      // For doctors, find the Doctor profile using userId
      const Doctor = await import('../models/Doctor.js').then(m => m.default);
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile) {
        filter.doctorId = doctorProfile._id;
      } else {
        // If no doctor profile found, return empty results
        filter.doctorId = null; // This will return no results
      }
    } else if (req.user.userType === 'pharmacist') {
      // For pharmacists, find the Pharmacy profile using userId
      const Pharmacy = await import('../models/Pharmacy.js').then(m => m.default);
      const pharmacyProfile = await Pharmacy.findOne({ userId: req.user.id });
      if (pharmacyProfile) {
        filter.pharmacyId = pharmacyProfile._id;
      } else {
        // If no pharmacy profile found, return empty results
        filter.pharmacyId = null; // This will return no results
      }
    }

    const prescriptions = await Prescription.find(filter)
      .populate({
        path: 'patientId',
        select: 'fullName userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'specialization userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
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
      .populate({
        path: 'patientId',
        select: 'fullName userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'specialization userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
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
    if (req.user.userType === 'pharmacist') {
      // For pharmacists, find the Pharmacy profile using userId
      const Pharmacy = await import('../models/Pharmacy.js').then(m => m.default);
      const pharmacyProfile = await Pharmacy.findOne({ userId: req.user.id });
      if (!pharmacyProfile) {
        return res.status(403).json({ message: 'Pharmacy profile not found' });
      }
      // Check if the prescription belongs to this pharmacy
      const prescriptionPharmacyId = prescription.pharmacyId?._id || prescription.pharmacyId;
      if (prescriptionPharmacyId.toString() !== pharmacyProfile._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions - Create new prescription (doctor only)
router.post('/', [
  authenticateToken,
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').trim().notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').trim().notEmpty().withMessage('Medication dosage is required'),
  body('medications.*.frequency').trim().notEmpty().withMessage('Medication frequency is required'),
  body('medications.*.duration').trim().notEmpty().withMessage('Medication duration is required'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('instructions').optional().trim(),
  body('pharmacyId').isMongoId().withMessage('Valid pharmacy ID is required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate prescription code
    let prescriptionCode;
    let attempts = 0;
    do {
      prescriptionCode = Prescription.generateCode();
      attempts++;
      if (attempts > 10) {
        return res.status(500).json({ message: 'Failed to generate unique prescription code' });
      }
    } while (await Prescription.findOne({ prescriptionCode }));

    // Calculate expiry date (default: 30 days from now if not provided)
    const expiryDate = req.body.expiryDate 
      ? new Date(req.body.expiryDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Find the Doctor profile for this user
    const Doctor = await import('../models/Doctor.js').then(m => m.default);
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescriptionData = {
      ...req.body,
      prescriptionCode,
      doctorId: doctorProfile._id, // Use Doctor profile ID, not User ID
      pharmacyId: req.body.pharmacyId,
      issueDate: new Date(),
      expiryDate,
      status: 'active',
      // Sync pharmacy.pharmacyId with pharmacyId
      pharmacy: {
        pharmacyId: req.body.pharmacyId
      }
    };

    const prescription = new Prescription(prescriptionData);
    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: 'patientId',
        select: 'fullName userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate({
        path: 'doctorId',
        select: 'specialization userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate('pharmacyId', 'pharmacyName');

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
    ).populate({
      path: 'patientId',
      select: 'fullName userId',
      populate: {
        path: 'userId',
        select: 'fullName email phone'
      }
    })
    .populate({
      path: 'doctorId',
      select: 'fullName specialization userId',
      populate: {
        path: 'userId',
        select: 'fullName email phone'
      }
    })
    .populate('pharmacyId', 'pharmacyName');

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions/:id/fill - Fill prescription (pharmacist only)
router.post('/:id/fill', [
  authenticateToken,
  body('filledAt').optional().isISO8601().withMessage('Valid fill date is required'),
  body('filledBy').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'patientId',
        select: 'fullName userId',
        populate: {
          path: 'userId',
          select: 'fullName email phone'
        }
      })
      .populate('pharmacyId', 'pharmacyName userId');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Verify pharmacist owns this pharmacy
    const Pharmacy = await import('../models/Pharmacy.js').then(m => m.default);
    const pharmacyProfile = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacyProfile) {
      return res.status(403).json({ message: 'Access denied: Pharmacy profile not found' });
    }
    
    // Check if prescription belongs to this pharmacy
    const prescriptionPharmacyId = prescription.pharmacyId?._id?.toString() || prescription.pharmacyId?.toString() || prescription.pharmacy?.pharmacyId?.toString();
    console.log('🔍 Fill prescription - prescriptionPharmacyId:', prescriptionPharmacyId);
    console.log('🔍 Fill prescription - pharmacyProfile._id:', pharmacyProfile._id.toString());
    console.log('🔍 Fill prescription - prescription.pharmacyId:', prescription.pharmacyId);
    console.log('🔍 Fill prescription - prescription.pharmacy:', prescription.pharmacy);
    
    if (prescriptionPharmacyId !== pharmacyProfile._id.toString()) {
      console.error('❌ Pharmacy ID mismatch:', {
        prescriptionPharmacyId,
        pharmacyProfileId: pharmacyProfile._id.toString(),
        prescription: {
          pharmacyId: prescription.pharmacyId,
          pharmacy: prescription.pharmacy
        }
      });
      return res.status(403).json({ 
        message: 'Access denied: This prescription does not belong to your pharmacy',
        details: {
          prescriptionPharmacyId,
          yourPharmacyId: pharmacyProfile._id.toString()
        }
      });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({ message: 'Prescription cannot be filled' });
    }

    // Check if expired but allow filling anyway (pharmacy may have received it before expiry)
    const isExpired = new Date() > new Date(prescription.expiryDate);
    if (isExpired) {
      console.warn('⚠️ Warning: Prescription has expired but allowing fill:', {
        prescriptionId: prescription._id,
        expiryDate: prescription.expiryDate,
        currentDate: new Date()
      });
      // Don't block, just log a warning - pharmacy can still prepare it
    }

    const filledAt = req.body.filledAt ? new Date(req.body.filledAt) : new Date();
    const filledBy = req.body.filledBy || pharmacyProfile.pharmacyName || 'Pharmacien';

    const updateData = {
      status: 'filled',
      'pharmacy.filledAt': filledAt,
      'pharmacy.filledBy': filledBy,
      'pharmacy.notes': req.body.notes || 'Ordonnance préparée et prête à être récupérée'
    };

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'patientId',
      select: 'fullName userId',
      populate: {
        path: 'userId',
        select: 'fullName email phone'
      }
    })
    .populate({
      path: 'doctorId',
      select: 'fullName specialization userId',
      populate: {
        path: 'userId',
        select: 'fullName email phone'
      }
    })
    .populate('pharmacyId', 'pharmacyName');

    // Create notification message to patient
    try {
      const Conversation = await import('../models/Conversation.js').then(m => m.default);
      const Message = await import('../models/Message.js').then(m => m.default);
      
      // Get patient userId - it's already an ObjectId from the populate
      const patientUserId = prescription.patientId.userId;
      const pharmacyUserId = pharmacyProfile.userId;
      
      console.log('📧 Creating notification - patientUserId:', patientUserId);
      console.log('📧 Creating notification - pharmacyUserId:', pharmacyUserId);
      console.log('📧 Creating notification - patientId._id:', prescription.patientId._id);
      console.log('📧 Creating notification - pharmacyProfile._id:', pharmacyProfile._id);
      
      if (!patientUserId) {
        console.error('❌ Patient userId not found for prescription:', prescription._id);
        console.error('❌ prescription.patientId:', prescription.patientId);
        throw new Error('Patient userId not found');
      }
      
      // Find or create conversation between pharmacy and patient
      let conversation = await Conversation.findOne({
        patient: prescription.patientId._id,
        pharmacist: pharmacyProfile._id
      });

      console.log('📧 Existing conversation found:', conversation ? conversation._id : 'none');

      if (!conversation) {
        console.log('📧 Creating new conversation...');
        conversation = new Conversation({
          patient: prescription.patientId._id,
          pharmacist: pharmacyProfile._id,
          lastMessage: null
        });
        await conversation.save();
        console.log('✅ New conversation created:', conversation._id);
      }

      // Create notification message
      const messageContent = `✅ Votre ordonnance (${prescription.prescriptionCode}) est prête à être récupérée !${req.body.notes ? '\n\n' + req.body.notes : ''}`;
      console.log('📧 Creating message with content:', messageContent);
      
      const notificationMessage = new Message({
        conversationId: conversation._id,
        senderId: pharmacyUserId,
        senderType: 'pharmacist',
        content: messageContent,
        type: 'text',
        status: 'sent'
      });
      await notificationMessage.save();
      console.log('✅ Message created:', notificationMessage._id);

      // Update conversation
      conversation.lastMessage = notificationMessage._id;
      conversation.updatedAt = new Date();
      await conversation.save();
      console.log('✅ Conversation updated');
      
      console.log('✅ Notification sent to patient:', patientUserId);
      console.log('✅ Conversation ID:', conversation._id);
      console.log('✅ Message ID:', notificationMessage._id);
    } catch (notificationError) {
      console.error('❌ Error sending notification to patient:', notificationError);
      console.error('❌ Error details:', notificationError.stack);
      console.error('❌ Error message:', notificationError.message);
      // Don't fail the request if notification fails
    }

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/prescriptions/:id/verify - Verify prescription
router.post('/:id/verify', [
  authenticateToken,
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
  authenticateToken
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
