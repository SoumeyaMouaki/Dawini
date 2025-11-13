import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Pharmacy from '../models/Pharmacy.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.userId;
    const userType = req.userType;

    // Find the current user's profile ID
    let currentUserProfileId;
    if (userType === 'patient') {
      const patientProfile = await Patient.findOne({ userId });
      currentUserProfileId = patientProfile?._id;
    } else if (userType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId });
      currentUserProfileId = doctorProfile?._id;
    } else if (userType === 'pharmacist') {
      const pharmacyProfile = await Pharmacy.findOne({ userId });
      currentUserProfileId = pharmacyProfile?._id;
    }

    if (!currentUserProfileId) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Build query based on user type and profile ID
    let query = {};
    if (userType === 'patient') {
      query.patient = currentUserProfileId;
    } else if (userType === 'doctor') {
      query.doctor = currentUserProfileId;
    } else if (userType === 'pharmacist') {
      query.pharmacist = currentUserProfileId;
    }

    const conversations = await Conversation.find(query)
      .populate('patient', 'userId')
      .populate('doctor', 'userId')
      .populate('pharmacist', 'userId')
      .populate('lastMessage')
      .populate({
        path: 'patient.userId',
        select: 'fullName email profilePicture'
      })
      .populate({
        path: 'doctor.userId',
        select: 'fullName email profilePicture specialization'
      })
      .populate({
        path: 'pharmacist.userId',
        select: 'fullName email profilePicture'
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations: conversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// POST /api/messages/conversations - Create new conversation
router.post('/conversations', [
  body('participantId').isMongoId().withMessage('Valid participant ID is required'),
  body('participantType').isIn(['patient', 'doctor', 'pharmacist']).withMessage('Valid participant type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { participantId, participantType } = req.body;
    const currentUserId = req.userId;
    const currentUserType = req.userType;

    // Find the profile IDs for both current user and participant
    let currentUserProfileId, participantProfileId;

    // Get current user's profile ID
    if (currentUserType === 'patient') {
      const patientProfile = await Patient.findOne({ userId: currentUserId });
      currentUserProfileId = patientProfile?._id;
    } else if (currentUserType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: currentUserId });
      currentUserProfileId = doctorProfile?._id;
    } else if (currentUserType === 'pharmacist') {
      const pharmacyProfile = await Pharmacy.findOne({ userId: currentUserId });
      currentUserProfileId = pharmacyProfile?._id;
    }

    // Get participant's profile ID
    if (participantType === 'patient') {
      const patientProfile = await Patient.findOne({ userId: participantId });
      participantProfileId = patientProfile?._id;
    } else if (participantType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: participantId });
      participantProfileId = doctorProfile?._id;
    } else if (participantType === 'pharmacist') {
      const pharmacyProfile = await Pharmacy.findOne({ userId: participantId });
      participantProfileId = pharmacyProfile?._id;
    }

    if (!currentUserProfileId || !participantProfileId) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
        details: { currentUserProfileId, participantProfileId }
      });
    }

    // Check if conversation already exists
    let existingConversation;
    if (currentUserType === 'patient') {
      if (participantType === 'doctor') {
        existingConversation = await Conversation.findOne({
          patient: currentUserProfileId,
          doctor: participantProfileId
        });
      } else if (participantType === 'pharmacist') {
        existingConversation = await Conversation.findOne({
          patient: currentUserProfileId,
          pharmacist: participantProfileId
        });
      }
    } else if (currentUserType === 'doctor') {
      if (participantType === 'patient') {
        existingConversation = await Conversation.findOne({
          doctor: currentUserProfileId,
          patient: participantProfileId
        });
      } else if (participantType === 'pharmacist') {
        existingConversation = await Conversation.findOne({
          doctor: currentUserProfileId,
          pharmacist: participantProfileId
        });
      }
    } else if (currentUserType === 'pharmacist') {
      if (participantType === 'patient') {
        existingConversation = await Conversation.findOne({
          pharmacist: currentUserProfileId,
          patient: participantProfileId
        });
      } else if (participantType === 'doctor') {
        existingConversation = await Conversation.findOne({
          pharmacist: currentUserProfileId,
          doctor: participantProfileId
        });
      }
    }

    if (existingConversation) {
      return res.json({
        success: true,
        conversation: existingConversation
      });
    }

    // Create new conversation
    const conversationData = {};
    if (currentUserType === 'patient') {
      conversationData.patient = currentUserProfileId;
      if (participantType === 'doctor') {
        conversationData.doctor = participantProfileId;
      } else if (participantType === 'pharmacist') {
        conversationData.pharmacist = participantProfileId;
      }
    } else if (currentUserType === 'doctor') {
      conversationData.doctor = currentUserProfileId;
      if (participantType === 'patient') {
        conversationData.patient = participantProfileId;
      } else if (participantType === 'pharmacist') {
        conversationData.pharmacist = participantProfileId;
      }
    } else if (currentUserType === 'pharmacist') {
      conversationData.pharmacist = currentUserProfileId;
      if (participantType === 'patient') {
        conversationData.patient = participantProfileId;
      } else if (participantType === 'doctor') {
        conversationData.doctor = participantProfileId;
      }
    }

    const conversation = new Conversation(conversationData);
    await conversation.save();

    // Populate the conversation
    await conversation.populate([
      { path: 'patient', select: 'userId' },
      { path: 'doctor', select: 'userId' },
      { path: 'pharmacist', select: 'userId' },
      { path: 'patient.userId', select: 'fullName email profilePicture' },
      { path: 'doctor.userId', select: 'fullName email profilePicture specialization' },
      { path: 'pharmacist.userId', select: 'fullName email profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      conversation: conversation
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

// GET /api/messages/:conversationId - Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if user is participant
    const userId = req.userId;
    const userType = req.userType;

    // Find the current user's profile ID
    let currentUserProfileId;
    if (userType === 'patient') {
      const patientProfile = await Patient.findOne({ userId });
      currentUserProfileId = patientProfile?._id;
    } else if (userType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId });
      currentUserProfileId = doctorProfile?._id;
    } else if (userType === 'pharmacist') {
      const pharmacyProfile = await Pharmacy.findOne({ userId });
      currentUserProfileId = pharmacyProfile?._id;
    }

    if (!currentUserProfileId) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Check if user is participant by comparing profile IDs
    const isParticipant = 
      (conversation.patient && conversation.patient.toString() === currentUserProfileId.toString()) ||
      (conversation.doctor && conversation.doctor.toString() === currentUserProfileId.toString()) ||
      (conversation.pharmacist && conversation.pharmacist.toString() === currentUserProfileId.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get messages
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// POST /api/messages - Send a new message
router.post('/', [
  body('conversationId').isMongoId().withMessage('Valid conversation ID is required'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content is required (1-2000 characters)'),
  body('type').optional().isIn(['text', 'image', 'file', 'prescription'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { conversationId, content, type = 'text' } = req.body;
    const userId = req.userId;
    const userType = req.userType;

    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if user is participant
    // Find the current user's profile ID
    let currentUserProfileId;
    if (userType === 'patient') {
      const patientProfile = await Patient.findOne({ userId });
      currentUserProfileId = patientProfile?._id;
    } else if (userType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId });
      currentUserProfileId = doctorProfile?._id;
    } else if (userType === 'pharmacist') {
      const pharmacyProfile = await Pharmacy.findOne({ userId });
      currentUserProfileId = pharmacyProfile?._id;
    }

    if (!currentUserProfileId) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Check if user is participant by comparing profile IDs
    const isParticipant = 
      (conversation.patient && conversation.patient.toString() === currentUserProfileId.toString()) ||
      (conversation.doctor && conversation.doctor.toString() === currentUserProfileId.toString()) ||
      (conversation.pharmacist && conversation.pharmacist.toString() === currentUserProfileId.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      senderType: userType,
      content,
      type
    });

    await message.save();

    // Update conversation's last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info
    await message.populate('senderId', 'fullName email profilePicture');

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Check if user is already in readBy array
    const alreadyRead = message.readBy.some(read => 
      read.userId.toString() === userId
    );

    if (!alreadyRead) {
      message.readBy.push({
        userId: userId,
        readAt: new Date()
      });
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    });
  }
});

export default router;
