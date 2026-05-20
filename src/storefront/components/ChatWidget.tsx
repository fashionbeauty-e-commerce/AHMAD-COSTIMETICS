import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ChevronUp, Paperclip } from 'lucide-react';
import { uploadChatAttachment } from '../../services/cloudinary';
import { useAuth } from '../../App';
import { 
  subscribeToChatRooms, 
  subscribeToMessages, 
  sendMessage, 
  createChatRoom 
} from '../../services/firebase';

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
}

const ADMIN_ID = 'admin';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const initChat = async () => {
      try {
        const userId = user.email; // Use email as identifier
        const roomId = await createChatRoom(userId, ADMIN_ID);
        setChatRoom({ id: roomId, participants: [userId, ADMIN_ID], lastMessage: '', lastMessageAt: null });
      } catch (error) {
        console.error('Error creating chat room:', error);
      }
    };

    initChat();
  }, [user, isOpen]);

  useEffect(() => {
    if (!chatRoom?.id || !user) return;

    const unsubscribeRooms = subscribeToChatRooms(user.email, (rooms) => {
      if (rooms.length > 0) {
        setChatRoom(rooms[0]);
      }
    });

    return () => unsubscribeRooms();
  }, [user, chatRoom?.id]);

  useEffect(() => {
    if (!chatRoom?.id) return;

    const unsubscribe = subscribeToMessages(chatRoom.id, setMessages);
    return () => unsubscribe();
  }, [chatRoom?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom || !user) return;

    setIsLoading(true);
    try {
      await sendMessage(chatRoom.id, user.email, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center z-50"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 md:inset-auto md:bottom-24 md:right-6 md:w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Customer Support</h3>
                  <p className="text-xs text-purple-200">We typically reply in a few minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {!user ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold mb-2">Sign in to chat</p>
                <p className="text-xs">Please sign in to chat with our support team</p>
                <a href="/sign-in" className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                  Sign In
                </a>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start a conversation with our support team</p>
                <p className="text-xs mt-1">Ask about products, orders, or anything else!</p>
              </div>
            ) : (
              messages.map(message => {
                const isMe = message.senderId === user?.email;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {message.text.startsWith('📷 Image: ') ? (
                        <img 
                          src={message.text.replace('📷 Image: ', '')} 
                          alt="Chat attachment" 
                          className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer"
                          onClick={() => window.open(message.text.replace('📷 Image: ', ''), '_blank')}
                        />
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {user && (
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2 items-center">
              <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg" title="Attach image">
                <Paperclip className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !chatRoom || !user) return;
                    setIsLoading(true);
                    try {
                      const result = await uploadChatAttachment(file);
                      await sendMessage(chatRoom.id, user.email, `📷 Image: ${result.secure_url}`);
                    } catch (err: any) {
                      alert('Failed to upload: ' + err.message);
                    } finally {
                      setIsLoading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
