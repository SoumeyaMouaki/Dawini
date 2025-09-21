import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requirePatient, requireDoctor } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/appointments - Book a new appointment
router.post('/', [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required (HH:MM)'),
  body('type').optional().isIn(['consultation', 'follow-up', 'emergency', 'home-visit', 'video']),
  body('reason').optional().trim().isLength({ max: 500 }),
  body('notes.patient').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
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
      patientId, 
      doctorId, 
      date, 
      time, 
      type = 'consultation',
      reason,
      notes 
    } = req.body;

    // Verify patient owns this appointment or is a doctor
    if (req.userType === 'patient' && patientId !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only book appointments for yourself.' 
      });
    }

    // Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor not found' 
      });
    }

    if (!doctor.isAvailable || !doctor.isVerified) {
      return res.status(400).json({ 
        error: 'Doctor is not available for appointments' 
      });
    }

    // Check if patient exists
    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ 
        error: 'Patient not found' 
      });
    }

    // Check if doctor is available at the requested time
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const daySchedule = doctor.workingHours[dayOfWeek];
    
    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(400).json({ 
        error: 'Doctor does not work on this day' 
      });
    }

    if (time < daySchedule.start || time > daySchedule.end) {
      return res.status(400).json({ 
        error: 'Requested time is outside doctor\'s working hours' 
      });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        error: 'This time slot is already booked' 
      });
    }

    // Check if patient has conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      patientId,
      date: appointmentDate,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        error: 'You already have an appointment at this time' 
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      time,
      type,
      reason,
      notes,
      duration: doctor.consultationDuration || 30,
      payment: {
        amount: doctor.consultationFee || 0,
        currency: 'DA'
      }
    });

    await appointment.save();

    // Populate doctor and patient info for response
    await appointment.populate([
      { path: 'doctorId', select: 'fullName specialization address phone' },
      { path: 'patientId', select: 'fullName phone' }
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      error: 'Internal server error while booking appointment' 
    });
  }
});

// GET /api/appointments - Get appointments (filtered by user type)
router.get('/', [
  query('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']),
  query('date').optional().isISO8601(),
  query('type').optional().isIn(['consultation', 'follow-up', 'emergency', 'home-visit', 'video']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { status, date, type, page = 1, limit = 10 } = req.query;

    // Build query based on user type
    let query = {};
    
    if (req.userType === 'patient') {
      query.patientId = req.userId;
    } else if (req.userType === 'doctor') {
      query.doctorId = req.userId;
    } else {
      return res.status(403).json({ 
        error: 'Access denied. Only patients and doctors can view appointments.' 
      });
    }

    // Add filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .populate('patientId', 'fullName phone')
      .populate('doctorId', 'fullName specialization address phone')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

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

// GET /api/appointments/:id - Get specific appointment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'fullName phone address')
      .populate('doctorId', 'fullName specialization address phone');

    if (!appointment) {
      return res.status(404).json({ 
        error: 'Appointment not found' 
      });
    }

    // Check access rights
    if (req.userType === 'patient' && appointment.patientId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view your own appointments.' 
      });
    }

    if (req.userType === 'doctor' && appointment.doctorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view appointments with you.' 
      });
    }

    res.json({ appointment });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching appointment' 
    });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required (HH:MM)'),
  body('type').optional().isIn(['consultation', 'follow-up', 'emergency', 'home-visit', 'video']),
  body('reason').optional().trim().isLength({ max: 500 }),
  body('notes.doctor').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Appointment not found' 
      });
    }

    // Check access rights
    if (req.userType === 'patient' && appointment.patientId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update your own appointments.' 
      });
    }

    if (req.userType === 'doctor' && appointment.doctorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update appointments with you.' 
      });
    }

    // Check if appointment can be modified
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cannot modify completed or cancelled appointments' 
      });
    }

    // Update allowed fields based on user type
    const allowedFields = req.userType === 'patient' 
      ? ['reason', 'notes.patient']
      : ['date', 'time', 'type', 'notes.doctor', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          appointment[parent][child] = req.body[field];
        } else {
          appointment[field] = req.body[field];
        }
      }
    });

    // If date/time changed, check availability
    if (req.body.date || req.body.time) {
      const newDate = req.body.date ? new Date(req.body.date) : appointment.date;
      const newTime = req.body.time || appointment.time;

      // Check if the new time slot is available
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        date: newDate,
        time: newTime,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ 
          error: 'This time slot is already booked' 
        });
      }
    }

    await appointment.save();

    // Populate for response
    await appointment.populate([
      { path: 'patientId', select: 'fullName phone address' },
      { path: 'doctorId', select: 'fullName specialization address phone' }
    ]);

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating appointment' 
    });
  }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Appointment not found' 
      });
    }

    // Check access rights
    if (req.userType === 'patient' && appointment.patientId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only cancel your own appointments.' 
      });
    }

    if (req.userType === 'doctor' && appointment.doctorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only cancel appointments with you.' 
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({ 
        error: 'Appointment cannot be cancelled (too close to appointment time or already completed)' 
      });
    }

    // Update cancellation info
    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: req.userType,
      cancelledAt: new Date(),
      reason: req.body.reason || 'Cancelled by user'
    };

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      error: 'Internal server error while cancelling appointment' 
    });
  }
});

// GET /api/appointments/doctor/:doctorId/availability - Check doctor availability
router.get('/doctor/:doctorId/availability', [
  query('date').isISO8601().withMessage('Valid date is required'),
  query('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required (HH:MM)')
], async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, time } = req.query;

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor not found' 
      });
    }

    if (!doctor.isAvailable || !doctor.isVerified) {
      return res.status(400).json({ 
        error: 'Doctor is not available' 
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const daySchedule = doctor.workingHours[dayOfWeek];

    if (!daySchedule || !daySchedule.isWorking) {
      return res.json({
        available: false,
        reason: 'Doctor does not work on this day'
      });
    }

    // If specific time requested, check availability
    if (time) {
      if (time < daySchedule.start || time > daySchedule.end) {
        return res.json({
          available: false,
          reason: 'Time is outside working hours'
        });
      }

      // Check if time slot is booked
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: appointmentDate,
        time,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.json({
          available: false,
          reason: 'Time slot is already booked'
        });
      }

      return res.json({
        available: true,
        workingHours: daySchedule
      });
    }

    // Get all appointments for the day
    const appointments = await Appointment.find({
      doctorId,
      date: appointmentDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('time');

    const bookedTimes = appointments.map(apt => apt.time);

    // Generate available time slots
    const timeSlots = [];
    const startHour = parseInt(daySchedule.start.split(':')[0]);
    const endHour = parseInt(daySchedule.end.split(':')[0]);
    const interval = doctor.consultationDuration || 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (timeSlot < daySchedule.start || timeSlot >= daySchedule.end) continue;
        
        if (!bookedTimes.includes(timeSlot)) {
          timeSlots.push(timeSlot);
        }
      }
    }

    res.json({
      available: true,
      workingHours: daySchedule,
      availableTimeSlots: timeSlots,
      bookedTimes
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ 
      error: 'Internal server error while checking availability' 
    });
  }
});

export default router;
