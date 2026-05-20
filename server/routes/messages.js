import express from 'express';
import Message, { ChatRoom } from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/messages/rooms
// @desc    Get user's chat rooms
// @access  Private
router.get('/rooms', protect, asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({
    participants: req.user._id,
    isActive: true
  })
    .populate('participants', 'firstName lastName email avatar')
    .populate('lastMessage', 'content type createdAt sender')
    .sort({ lastMessageAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { rooms }
  });
}));

// @route   POST /api/messages/rooms
// @desc    Create or get chat room
// @access  Private
router.post('/rooms', protect, asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    throw new AppError('Participant ID is required', 400);
  }

  // Check if participant exists
  const participant = await User.findById(participantId);
  if (!participant) {
    throw new AppError('User not found', 404);
  }

  // Find existing room
  let room = await ChatRoom.findOne({
    participants: { $all: [req.user._id, participantId] },
    isActive: true
  });

  if (!room) {
    // Create new room
    room = await ChatRoom.create({
      participants: [req.user._id, participantId],
      type: 'direct'
    });
  }

  const populatedRoom = await ChatRoom.findById(room._id)
    .populate('participants', 'firstName lastName email avatar');

  res.json({
    success: true,
    data: { room: populatedRoom }
  });
}));

// @route   GET /api/messages/rooms/:roomId
// @desc    Get chat room messages
// @access  Private
router.get('/rooms/:roomId', protect, asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const room = await ChatRoom.findById(roomId);

  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  // Check if user is participant
  if (!room.participants.includes(req.user._id)) {
    throw new AppError('Not authorized to access this chat', 403);
  }

  const messages = await Message.find({
    room: roomId,
    isDeleted: false
  })
    .populate('sender', 'firstName lastName avatar')
    .populate('recipient', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Mark messages as read
  await Message.updateMany(
    {
      room: roomId,
      recipient: req.user._id,
      isRead: false
    },
    {
      $set: { isRead: true, readAt: new Date() }
    }
  );

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Return in chronological order
      room
    }
  });
}));

// @route   POST /api/messages
// @desc    Send message
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { roomId, content, type = 'text', recipientId } = req.body;

  if (!content || !content.trim()) {
    throw new AppError('Message content is required', 400);
  }

  let room;
  if (roomId) {
    room = await ChatRoom.findById(roomId);
  } else if (recipientId) {
    // Find or create room
    room = await ChatRoom.findOne({
      participants: { $all: [req.user._id, recipientId] },
      isActive: true
    });

    if (!room) {
      room = await ChatRoom.create({
        participants: [req.user._id, recipientId],
        type: 'direct'
      });
    }
  } else {
    throw new AppError('Room ID or recipient ID is required', 400);
  }

  if (!room.isActive) {
    throw new AppError('This chat room is no longer active', 400);
  }

  // Check if user is participant
  if (!room.participants.includes(req.user._id)) {
    throw new AppError('Not authorized to send messages in this chat', 403);
  }

  // Determine recipient
  const recipient = room.participants.find(p => p.toString() !== req.user._id.toString());

  // Create message
  const message = await Message.create({
    room: room._id,
    sender: req.user._id,
    recipient,
    content: content.trim(),
    type
  });

  // Update room's last message
  await room.updateLastMessage(message._id);

  // Populate message
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'firstName lastName avatar')
    .populate('recipient', 'firstName lastName avatar');

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${recipient}`).emit('receive_message', {
      ...populatedMessage.toObject(),
      room: room._id
    });
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message: populatedMessage }
  });
}));

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.recipient.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  await message.markAsRead();

  res.json({
    success: true,
    message: 'Message marked as read'
  });
}));

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this message', 403);
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  await message.save();

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    isRead: false,
    isDeleted: false
  });

  res.json({
    success: true,
    data: { count }
  });
}));

export default router;
