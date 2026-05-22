import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, ShoppingBag, Megaphone, MessageSquare, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  subscribeToUserNotifications,
  subscribeToAdminNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '../../services/notifications';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserNotifications(user.email, setNotifications);

    return () => unsubscribe();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.email);
  };

  const handleClickNotification = async (notif: Notification) => {
    if (!notif.isRead) await markAsRead(notif.id);
    setOpen(false);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_product': return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'order_update': return <Package className="w-4 h-4 text-blue-600" />;
      case 'promotion': return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-bold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you about new products and updates</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notif => (
                <Link
                  key={notif.id}
                  to={notif.link || '#'}
                  onClick={() => handleClickNotification(notif)}
                  className={`flex gap-3 p-3 border-b hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? 'bg-purple-50/50' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    {notif.image ? (
                      <img src={notif.image} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getIcon(notif.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm line-clamp-1 ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
