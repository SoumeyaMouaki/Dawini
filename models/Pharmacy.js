import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  // Reference to User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Pharmacy information
  pharmacyName: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Contact information
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  
  // Location details
  location: {
    wilaya: {
      type: String,
      required: true
    },
    commune: {
      type: String,
      required: true
    },
    street: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Operating hours
  operatingHours: {
    monday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: false }
    },
    sunday: {
      start: String,
      end: String,
      isOpen: { type: Boolean, default: false }
    }
  },
  
  // Services
  services: {
    nightService: {
      type: Boolean,
      default: false
    },
    homeDelivery: {
      type: Boolean,
      default: false
    },
    prescriptionValidation: {
      type: Boolean,
      default: true
    }
  },
  
  // Specializations
  specializations: [String], // e.g., ["pediatrics", "cardiology", "general"]
  
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
  
  // Partnership status
  isPartner: {
    type: Boolean,
    default: false
  },
  partnershipLevel: {
    type: String,
    enum: ['basic', 'silver', 'gold', 'platinum'],
    default: 'basic'
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
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
pharmacySchema.index({ licenseNumber: 1 });
pharmacySchema.index({ userId: 1 });
pharmacySchema.index({ 'location.wilaya': 1, 'location.commune': 1 });
pharmacySchema.index({ isAvailable: 1, isVerified: 1 });
pharmacySchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for operating days
pharmacySchema.virtual('operatingDays').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.filter(day => this.operatingHours[day]?.isOpen);
});

// Method to check if pharmacy is open at a specific date/time
pharmacySchema.methods.isOpenAt = function(date) {
  if (!this.isAvailable) return false;
  
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = date.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[dayOfWeek];
  if (!daySchedule || !daySchedule.isOpen) return false;
  
  return time >= daySchedule.start && time <= daySchedule.end;
};

// Method to calculate distance from coordinates
pharmacySchema.methods.calculateDistance = function(lat, lng) {
  if (!this.location.coordinates) return null;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.location.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.location.coordinates.latitude * Math.PI / 180) * 
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
