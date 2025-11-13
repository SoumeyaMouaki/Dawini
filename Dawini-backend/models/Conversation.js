import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  // Participants
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  },
  
  // Last message for quick access
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Conversation metadata
  isActive: {
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
conversationSchema.index({ lastMessage: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure only one conversation between same participants
conversationSchema.index(
  { patient: 1, doctor: 1, pharmacist: 1 },
  { unique: true, sparse: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;