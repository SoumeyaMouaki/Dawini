import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  // Patient information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Doctor information
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  // Prescription details
  prescriptionCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Date and validity
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'filled', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: String,
    quantity: Number,
    unit: String
  }],
  
  // Diagnosis
  diagnosis: {
    type: String,
    trim: true
  },
  
  // Instructions
  instructions: {
    type: String,
    trim: true
  },
  
  // Special instructions
  specialInstructions: [String],
  
  // Pharmacy information
  pharmacy: {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy'
    },
    filledAt: Date,
    filledBy: String,
    notes: String
  },
  
  // Digital signature
  digitalSignature: {
    doctorSignature: String,
    timestamp: Date,
    certificate: String
  },
  
  // Verification
  verification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy'
    },
    verifiedAt: Date,
    verificationCode: String
  },
  
  // Related appointment
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
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

// Indexes for efficient queries (prescriptionCode already has unique index from schema)
prescriptionSchema.index({ patientId: 1, issueDate: -1 });
prescriptionSchema.index({ doctorId: 1, issueDate: -1 });
prescriptionSchema.index({ status: 1, expiryDate: 1 });
prescriptionSchema.index({ 'pharmacy.pharmacyId': 1 });

// Virtual for is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for is active
prescriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Virtual for days until expiry
prescriptionSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to generate prescription code
prescriptionSchema.statics.generateCode = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PRES-${timestamp}-${random}`.toUpperCase();
};

// Method to check if prescription can be filled
prescriptionSchema.methods.canBeFilled = function() {
  return this.status === 'active' && !this.isExpired;
};

// Method to fill prescription
prescriptionSchema.methods.fillPrescription = function(pharmacyId, filledBy, notes) {
  this.pharmacy = {
    pharmacyId,
    filledAt: new Date(),
    filledBy,
    notes
  };
  this.status = 'filled';
  return this.save();
};

// Method to verify prescription
prescriptionSchema.methods.verifyPrescription = function(pharmacyId, verificationCode) {
  this.verification = {
    verifiedBy: pharmacyId,
    verifiedAt: new Date(),
    verificationCode
  };
  return this.save();
};

// Ensure virtual fields are serialized
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
