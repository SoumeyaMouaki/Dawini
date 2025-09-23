import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  // Reference to User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Professional information
  nOrdre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  
  // Services offered
  services: {
    nightService: {
      type: Boolean,
      default: false
    },
    homeVisit: {
      type: Boolean,
      default: false
    },
    videoConsultation: {
      type: Boolean,
      default: false
    }
  },
  
  // Professional details
  biography: {
    type: String,
    trim: true
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    year: Number,
    expiryDate: Date
  }],
  languages: [{
    type: String,
    enum: ['fr', 'en', 'ar', 'kabyle', 'other']
  }],
  
  // Working hours
  workingHours: {
    monday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: true }
    },
    tuesday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: true }
    },
    wednesday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: true }
    },
    thursday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: true }
    },
    friday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: true }
    },
    saturday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: false }
    },
    sunday: {
      start: String,
      end: String,
      isWorking: { type: Boolean, default: false }
    }
  },
  
  // Consultation settings
  consultationDuration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 120
  },
  consultationFee: {
    type: Number,
    min: 0
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  maxPatientsPerDay: {
    type: Number,
    default: 20,
    min: 1,
    max: 50
  },
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
doctorSchema.index({ nOrdre: 1 });
doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'address.wilaya': 1, 'address.commune': 1 });
doctorSchema.index({ isAvailable: 1, isVerified: 1 });

// Virtual for full working hours
doctorSchema.virtual('workingDays').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.filter(day => this.workingHours[day]?.isWorking);
});

// Method to check if doctor is available on a specific date/time
doctorSchema.methods.isAvailableAt = function(date) {
  if (!this.isAvailable) return false;
  
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = date.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.workingHours[dayOfWeek];
  if (!daySchedule || !daySchedule.isWorking) return false;
  
  return time >= daySchedule.start && time <= daySchedule.end;
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
