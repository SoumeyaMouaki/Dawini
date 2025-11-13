import express from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireOwnership } from '../middleware/auth.js';

const router = Router();

// Mock Message model - In a real application, this would be a proper Mongoose model
class Message {
  constructor(data) {
    this.id = data.id || Math.random().toString(36).substr(2, 9);
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.content = data.content;
    this.type = data.type || 'text';
    this.status = data.status || 'sent';
    this.createdAt = data.createdAt || new Date();
    this.readAt = data.readAt;
    this.attachments = data.attachments || [];
  }

  static find(filter = {}) {
    // Mock find method
    return Promise.resolve(mockMessages.filter(msg => {
      for (let key in filter) {
        if (msg[key] !== filter[key]) return false;
      }
      return true;
    }));
  }

  static findById(id) {
    // Mock findById method
    const message = mockMessages.find(msg => msg.id === id);
    return Promise.resolve(message || null);
  }

  static create(data) {
    // Mock create method
    const message = new Message(data);
    mockMessages.push(message);
    return Promise.resolve(message);
  }

  static findByIdAndUpdate(id, update, options = {}) {
    // Mock findByIdAndUpdate method
    const index = mockMessages.findIndex(msg => msg.id === id);
    if (index === -1) return Promise.resolve(null);
    
    mockMessages[index] = { ...mockMessages[index], ...update };
    if (options.new) {
      return Promise.resolve(mockMessages[index]);
    }
    return Promise.resolve(mockMessages[index]);
  }

  static countDocuments(filter = {}) {
    // Mock countDocuments method
    return Promise.resolve(mockMessages.filter(msg => {
      for (let key in filter) {
        if (msg[key] !== filter[key]) return false;
      }
      return true;
    }).length);
  }
}

// Mock messages data
let mockMessages = [
  {
    id: '1',
    senderId: 'user1',
    receiverId: 'user2',
    content: 'Bonjour, j\'ai besoin d\'un rendez-vous',
    type: 'text',
    status: 'read',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    readAt: new Date('2024-01-15T10:05:00Z'),
    attachments: []
  },
  {
    id: '2',
    senderId: 'user2',
    receiverId: 'user1',
    content: 'Bonjour, je peux vous recevoir demain à 14h',
    type: 'text',
    status: 'sent',
    createdAt: new Date('2024-01-15T10:10:00Z'),
    readAt: null,
    attachments: []
  }
];

// GET /api/messages - Get messages with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      conversationId, 
      status, 
      type, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};
    
    if (conversationId) {
      filter.conversationId = conversationId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (type) {
      filter.type = type;
    }

    // Filter messages where user is sender or receiver
    const messages = await Message.find(filter);
    const userMessages = messages.filter(msg => 
      msg.senderId === req.user.id || msg.receiverId === req.user.id
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = userMessages.slice(startIndex, endIndex);

    const total = userMessages.length;

    res.json({
      messages: paginatedMessages,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/messages/conversations - Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find();
    const userMessages = messages.filter(msg => 
      msg.senderId === req.user.id || msg.receiverId === req.user.id
    );

    // Group messages by conversation
    const conversations = {};
    userMessages.forEach(msg => {
      const otherUserId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          lastMessage: msg,
          unreadCount: 0
        };
      }
      
      if (msg.receiverId === req.user.id && msg.status === 'sent') {
        conversations[otherUserId].unreadCount++;
      }
      
      if (!conversations[otherUserId].lastMessage || 
          msg.createdAt > conversations[otherUserId].lastMessage.createdAt) {
        conversations[otherUserId].lastMessage = msg;
      }
    });

    const conversationList = Object.values(conversations)
      .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    res.json({
      conversations: conversationList,
      total: conversationList.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/messages/:id - Get message by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or receiver
    if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if user is receiver
    if (message.receiverId === req.user.id && message.status === 'sent') {
      await Message.findByIdAndUpdate(req.params.id, {
        status: 'read',
        readAt: new Date()
      });
      message.status = 'read';
      message.readAt = new Date();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/messages - Send new message
router.post('/', [
  authenticateToken,
  body('receiverId').trim().notEmpty().withMessage('Receiver ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file', 'audio']).withMessage('Invalid message type'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, content, type = 'text', attachments = [] } = req.body;

    // Check if receiver exists (in a real app, validate against User model)
    if (receiverId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const messageData = {
      senderId: req.user.id,
      receiverId,
      content,
      type,
      attachments,
      status: 'sent',
      createdAt: new Date()
    };

    const message = await Message.create(messageData);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/messages/:id - Update message
router.put('/:id', [
  authenticateToken,
  body('content').optional().trim().notEmpty().withMessage('Message content cannot be empty'),
  body('status').optional().isIn(['sent', 'read', 'delivered']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can update message
    if (message.senderId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updating content and status
    const updateData = {};
    if (req.body.content) updateData.content = req.body.content;
    if (req.body.status) updateData.status = req.body.status;

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete message
    if (message.senderId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove from mock data
    const index = mockMessages.findIndex(msg => msg.id === req.params.id);
    if (index !== -1) {
      mockMessages.splice(index, 1);
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/messages/:id/read - Mark message as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      {
        status: 'read',
        readAt: new Date()
      },
      { new: true }
    );

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find();
    const unreadMessages = messages.filter(msg => 
      msg.receiverId === req.user.id && msg.status === 'sent'
    );

    res.json({
      unreadCount: unreadMessages.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
