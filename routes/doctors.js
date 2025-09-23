import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/doctors - Get all doctors with filters
router.get('/', async (req, res) => {
  try {
    const { 
      specialization, 
      wilaya,
      commune,
      available, 
      page = 1, 
      limit = 10,
      sortBy = 'fullName',
      sortOrder = 'asc'
    } = req.query;

    const filter = { isVerified: true };
    
    if (specialization) {
      // More flexible search - find partial matches and handle variations
      const searchTerm = specialization.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create multiple search patterns for better matching
      const patterns = [
        searchTerm, // Exact match
        searchTerm.replace(/ologue$/, 'ologie'), // cardiologue -> cardiologie
        searchTerm.replace(/ologie$/, 'ologue'), // cardiologie -> cardiologue
        searchTerm.replace(/iste$/, 'ie'), // dermatiste -> dermatologie
        searchTerm.replace(/ie$/, 'iste') // dermatologie -> dermatiste
      ];
      
      filter.specialization = { 
        $regex: patterns.join('|'), 
        $options: 'i' 
      };
    }

    if (available === 'true') {
      filter.isAvailable = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // First get all doctors with basic filters
    let doctors = await Doctor.find(filter)
      .populate('userId', 'fullName email phone address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    // Apply location filters after population
    const { lat, lng } = req.query;
    
    if (lat && lng) {
      // Search by coordinates (geolocation)
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = 50; // 50km radius
      
      doctors = doctors.filter(doctor => {
        if (!doctor.userId || !doctor.userId.address || !doctor.userId.address.coordinates) return false;
        
        const doctorLat = doctor.userId.address.coordinates.lat;
        const doctorLng = doctor.userId.address.coordinates.lng;
        
        if (typeof doctorLat !== 'number' || typeof doctorLng !== 'number') return false;
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = (doctorLat - userLat) * Math.PI / 180;
        const dLng = (doctorLng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(doctorLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= maxDistance;
      });
      
      // Sort by distance
      doctors.sort((a, b) => {
        const aLat = a.userId.address.coordinates.lat;
        const aLng = a.userId.address.coordinates.lng;
        const bLat = b.userId.address.coordinates.lat;
        const bLng = b.userId.address.coordinates.lng;
        
        const distA = Math.sqrt(Math.pow(aLat - userLat, 2) + Math.pow(aLng - userLng, 2));
        const distB = Math.sqrt(Math.pow(bLat - userLat, 2) + Math.pow(bLng - userLng, 2));
        
        return distA - distB;
      });
    } else if (wilaya || commune) {
      // Text-based location search
      doctors = doctors.filter(doctor => {
        if (!doctor.userId || !doctor.userId.address) return false;
        
        const address = doctor.userId.address;
        let matchesWilaya = true;
        let matchesCommune = true;
        
        if (wilaya) {
          matchesWilaya = address.wilaya && 
            address.wilaya.toLowerCase().includes(wilaya.toLowerCase());
        }
        
        if (commune) {
          matchesCommune = address.commune && 
            address.commune.toLowerCase().includes(commune.toLowerCase());
        }
        
        return matchesWilaya && matchesCommune;
      });
    }

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

// GET /api/doctors/specialties - Get unique specialties for suggestions
router.get('/specialties', async (req, res) => {
  try {
    const { q } = req.query;
    
    let query = { isVerified: true };
    if (q && q.length >= 2) {
      query.specialization = { $regex: q, $options: 'i' };
    }

    const specialties = await Doctor.distinct('specialization', query);
    
    // Filter and sort suggestions
    const filteredSpecialties = specialties
      .filter(specialty => 
        !q || specialty.toLowerCase().includes(q.toLowerCase())
      )
      .sort()
      .slice(0, 10); // Limit to 10 suggestions

    res.json({
      success: true,
      specialties: filteredSpecialties
    });

  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch specialties' 
    });
  }
});

// GET /api/doctors/locations - Get unique locations for suggestions
router.get('/locations', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Get unique wilaya and commune combinations
    const locations = await Doctor.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.address.wilaya': { $exists: true, $ne: null },
          'user.address.commune': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            wilaya: '$user.address.wilaya',
            commune: '$user.address.commune'
          }
        }
      },
      {
        $project: {
          location: {
            $concat: ['$_id.wilaya', ', ', '$_id.commune']
          }
        }
      }
    ]);

    let filteredLocations = locations.map(loc => loc.location);
    
    if (q && q.length >= 2) {
      filteredLocations = filteredLocations.filter(location =>
        location.toLowerCase().includes(q.toLowerCase())
      );
    }

    res.json({
      success: true,
      locations: filteredLocations.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch locations' 
    });
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
router.get('/:id/profile', authenticateToken, async (req, res) => {
  try {
    // Find the doctor profile and verify ownership
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'fullName email phone address');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/doctors/:id/profile - Update doctor profile
router.put('/:id/profile', [
  authenticateToken,
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
    // Find the doctor profile and verify ownership
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone address');

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(updatedDoctor);
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

// GET /api/doctors/:id/patients/search - Search patients (doctor only)
router.get('/:id/patients/search', [
  authenticateToken,
  query('name').optional().trim(),
  query('email').optional().trim().isEmail(),
  query('nss').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, nss, page = 1, limit = 10 } = req.query;
    
    // Verify doctor owns this profile
    // Find the doctor profile by ID and check if it belongs to the current user
    const doctorProfile = await Doctor.findById(id);
    if (!doctorProfile) {
      return res.status(404).json({ 
        error: 'Doctor profile not found' 
      });
    }
    
    if (doctorProfile.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
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

    // Import Patient model
    const Patient = await import('../models/Patient.js').then(m => m.default);
    const User = await import('../models/User.js').then(m => m.default);

    // Build query for patients
    const patientQuery = {};
    
    if (nss) {
      patientQuery.nss = { $regex: nss, $options: 'i' };
    }

    // Build query for users (name and email)
    const userQuery = {};
    
    if (name) {
      userQuery.fullName = { $regex: name, $options: 'i' };
    }
    
    if (email) {
      userQuery.email = { $regex: email, $options: 'i' };
    }

    // If no search criteria provided, return empty result
    if (!name && !email && !nss) {
      return res.json({
        success: true,
        patients: [],
        total: 0,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        },
        filters: {
          name: null,
          email: null,
          nss: null
        }
      });
    }

    const skip = (page - 1) * limit;
    
    // Find patients with populated user data
    const patients = await Patient.find(patientQuery)
      .populate({
        path: 'userId',
        match: Object.keys(userQuery).length > 0 ? userQuery : {},
        select: 'fullName email phone address isVerified'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out patients where user doesn't match (due to populate match)
    const filteredPatients = patients.filter(patient => patient.userId !== null);

    // Get total count
    const totalQuery = { ...patientQuery };
    if (Object.keys(userQuery).length > 0) {
      const matchingUsers = await User.find(userQuery).select('_id');
      const userIds = matchingUsers.map(user => user._id);
      totalQuery.userId = { $in: userIds };
    }

    const total = await Patient.countDocuments(totalQuery);

    // Enhanced response with patient details
    const patientsWithDetails = filteredPatients.map(patient => ({
      _id: patient._id,
      userId: patient.userId,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      nss: patient.nss,
      bloodType: patient.bloodType,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      emergencyContact: patient.emergencyContact,
      preferredLanguage: patient.preferredLanguage,
      insuranceProvider: patient.insuranceProvider,
      insuranceNumber: patient.insuranceNumber,
      age: patient.age, // Virtual field
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }));

    res.json({
      success: true,
      patients: patientsWithDetails,
      total: filteredPatients.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        name: name || null,
        email: email || null,
        nss: nss || null
      }
    });

  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error while searching patients',
      message: 'Unable to search patients at this time. Please try again later.'
    });
  }
});

// POST /api/doctors/:id/verify - Verify doctor (admin only)
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


// GET /api/doctors/locations - Get unique locations for suggestions
router.get('/locations', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Get unique wilaya and commune combinations
    const locations = await Doctor.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.address.wilaya': { $exists: true, $ne: null },
          'user.address.commune': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            wilaya: '$user.address.wilaya',
            commune: '$user.address.commune'
          }
        }
      },
      {
        $project: {
          location: {
            $concat: ['$user.address.commune', ', ', '$user.address.wilaya']
          }
        }
      }
    ]);

    let filteredLocations = locations.map(loc => loc.location);
    
    if (q && q.length >= 2) {
      filteredLocations = filteredLocations.filter(location =>
        location.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Sort and limit suggestions
    const sortedLocations = filteredLocations
      .sort()
      .slice(0, 10);

    res.json({
      success: true,
      locations: sortedLocations
    });

  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch locations' 
    });
  }
});

// GET /api/doctors/:id/availability - Get doctor's availability for a specific date
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ 
        error: 'Date parameter is required' 
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ 
        error: 'Doctor not found' 
      });
    }

    // Get existing appointments for the date
    const Appointment = await import('../models/Appointment.js').then(m => m.default);
    const existingAppointments = await Appointment.find({
      doctorId: id,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    // Extract booked time slots
    const bookedSlots = existingAppointments.map(apt => apt.time);

    res.json({
      success: true,
      workingHours: doctor.workingHours,
      bookedSlots,
      consultationDuration: doctor.consultationDuration || 30
    });

  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ 
      error: 'Failed to fetch doctor availability' 
    });
  }
});

export default router;
