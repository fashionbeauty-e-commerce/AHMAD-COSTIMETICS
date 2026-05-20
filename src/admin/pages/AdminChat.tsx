import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../App';
import { 
  Send, MessageSquare, Search, Paperclip, 
  CheckCheck, Clock, Users, Smile, Phone, Video,
  MoreVertical, ArrowLeft
} from 'lucide-react';
import { 
  subscribeToAllChatRooms, 
  subscribeToMessages, 
  sendMessage,
  markMessagesAsRead
} from '../../services/firebase';
import { uploadChatAttachment } from '../../services/cloudinary';

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: any;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read?: boolean;
}

const ADMIN_ID = 'admin'; // Special admin identifier

export default function AdminChat() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to ALL chat rooms (admin sees everything)
  useEffect(() => {
    if (!user?.isAdmin) return;

    const unsubscribe = subscribeToAllChatRooms((rooms) => {
      setChatRooms(rooms);
      // Auto-select first room if nothing selected
      if (rooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(rooms[0].id);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages for selected room
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedRoomId, setMessages);
    return () => unsubscribe();
  }, [selectedRoomId]);

  // Mark messages as read when admin opens a chat
  useEffect(() => {
    if (selectedRoomId && user) {
      markMessagesAsRead(selectedRoomId, ADMIN_ID);
    }
  }, [selectedRoomId, messages.length, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when room changes
  useEffect(() => {
    if (selectedRoomId) {
      inputRef.current?.focus();
    }
  }, [selectedRoomId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const text = newMessage.trim();
    if (!text || !selectedRoomId || isSending) return;

    setIsSending(true);
    setNewMessage(''); // Clear immediately for better UX
    
    try {
      // Send as ADMIN_ID so customer knows it's from admin
      await sendMessage(selectedRoomId, ADMIN_ID, text);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
      setNewMessage(text); // Restore on error
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoomId) return;

    setIsUploading(true);
    try {
      const result = await uploadChatAttachment(file);
      await sendMessage(selectedRoomId, ADMIN_ID, `📷 Image: ${result.secure_url}`);
    } catch (err: any) {
      alert('Failed to upload: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleQuickReply = async (text: string) => {
    if (!selectedRoomId || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(selectedRoomId, ADMIN_ID, text);
    } catch (error: any) {
      alert('Failed to send: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString();
  };

  const getCustomerEmail = (room: ChatRoom): string => {
    return room.participants.find(p => p !== ADMIN_ID && p !== user?.email) || 'Unknown Customer';
  };

  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  const filteredRooms = chatRooms.filter(room =>
    getCustomerEmail(room).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);
  const customerEmail = selectedRoom ? getCustomerEmail(selectedRoom) : '';

  const quickReplies = [
    "Hi! How can I help you today? 👋",
    "Thank you for your order! 🛍️",
    "Your order is being processed.",
    "Please send me your order number.",
    "I'll check that for you right away.",
    "Thanks for reaching out!",
  ];

  return (
    <div className="animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customer Support Chat</h1>
          <p className="text-xs md:text-sm text-gray-500">
            {chatRooms.length} {chatRooms.length === 1 ? 'conversation' : 'conversations'} • Real-time messaging
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Online</span>
        </div>
      </div>

      <div className="flex-1 flex bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Conversations List */}
        <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-80 flex-col border-r bg-gray-50`}>
          {/* Search */}
          <div className="p-3 border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Customers will appear here when they message</p>
              </div>
            ) : (
              filteredRooms.map(room => {
                const email = getCustomerEmail(room);
                const isSelected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setShowMobileChat(true);
                    }}
                    className={`w-full p-3 text-left border-b hover:bg-white transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(email)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-semibold text-sm truncate text-gray-900">{email}</p>
                          <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                            {formatTime(room.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {room.lastMessage 
                            ? (room.lastMessage.startsWith('📷') ? '📷 Image' : room.lastMessage)
                            : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${!showMobileChat ? 'hidden' : 'flex'} md:flex flex-1 flex-col`}>
          {selectedRoomId && selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(customerEmail)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{customerEmail}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Voice call">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="Video call">
                    <Video className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-1">No messages yet</p>
                      <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isMe = message.senderId === ADMIN_ID || message.senderId === user?.email;
                    const showDate = index === 0 || 
                      (messages[index - 1]?.createdAt && message.createdAt && 
                       formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt));
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-3 py-2 rounded-2xl ${
                                isMe
                                  ? 'bg-purple-600 text-white rounded-br-sm'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                              }`}
                            >
                              {message.text.startsWith('📷 Image: ') ? (
                                <img 
                                  src={message.text.replace('📷 Image: ', '')} 
                                  alt="Attachment" 
                                  className="rounded-lg max-w-full max-h-64 cursor-pointer"
                                  onClick={() => window.open(message.text.replace('📷 Image: ', ''), '_blank')}
                                />
                              ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-gray-500">{formatTime(message.createdAt)}</span>
                              {isMe && (
                                message.read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 0 && (
                <div className="p-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Quick replies:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(reply)}
                        disabled={isSending}
                        className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:border-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg shrink-0" title="Attach image">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading || isSending}
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    type="button"
                    className="hidden md:block p-2 hover:bg-gray-100 rounded-lg shrink-0"
                    title="Emoji"
                  >
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isUploading ? 'Uploading...' : 'Type a message...'}
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500"
                    disabled={isUploading || isSending}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isSending || isUploading || !newMessage.trim()}
                    className="p-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {isSending && (
                  <p className="text-[10px] text-gray-500 mt-1 text-center">Sending...</p>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Welcome to Customer Chat</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {chatRooms.length === 0 
                    ? 'No customer conversations yet. When customers message you through the chat widget, they will appear here.'
                    : 'Select a conversation from the list to start chatting with customers in real-time.'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-bold text-purple-700">⚡ Real-time</p>
                    <p className="text-purple-600 text-[10px] mt-1">Messages appear instantly</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-bold text-green-700">🔔 Notifications</p>
                    <p className="text-green-600 text-[10px] mt-1">Get alerts for new messages</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
