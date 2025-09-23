import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  
  // Appointment details
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 120
  },
  
  // Appointment type
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'home-visit', 'video'],
    default: 'consultation'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  
  // Reason for visit
  reason: {
    type: String,
    trim: true
  },
  
  // Notes
  notes: {
    patient: String,
    doctor: String
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    scheduledFor: Date
  }],
  
  // Cancellation
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system']
    },
    cancelledAt: Date,
    reason: String
  },
  
  // Payment
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'DA'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    method: String,
    transactionId: String
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
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ date: 1, time: 1 });

// Virtual for appointment datetime
appointmentSchema.virtual('appointmentDateTime').get(function() {
  if (!this.date || !this.time) return null;
  
  const appointmentDate = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return appointmentDate;
});

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  if (!this.appointmentDateTime) return false;
  return this.appointmentDateTime > new Date() && this.status === 'confirmed';
});

// Virtual for is past
appointmentSchema.virtual('isPast').get(function() {
  if (!this.appointmentDateTime) return false;
  return this.appointmentDateTime < new Date();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  if (this.status !== 'confirmed' && this.status !== 'pending') return false;
  
  const now = new Date();
  const appointmentTime = this.appointmentDateTime;
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  // Can cancel up to 24 hours before appointment
  return hoursUntilAppointment > 24;
};

// Method to send reminder
appointmentSchema.methods.sendReminder = function(reminderType) {
  const reminder = {
    type: reminderType,
    scheduledFor: new Date(),
    sentAt: new Date()
  };
  
  this.reminders.push(reminder);
  return this.save();
};

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
