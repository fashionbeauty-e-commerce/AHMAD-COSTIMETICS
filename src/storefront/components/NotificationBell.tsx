import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, ShoppingBag, Megaphone, MessageSquare, Package, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  subscribeToUserNotifications,
  subscribeToAdminNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '../../services/notifications';

type NormalizedNotification = Notification & {
  id: string;
  image?: string;
};

type LocationState = {
  status: 'idle' | 'loading' | 'detected' | 'denied' | 'unavailable';
  label?: string;
  coords?: { lat: number; lng: number };
};

const normalizeNotification = (notification: Notification): NormalizedNotification => {
  const id = (notification as Notification & { _id?: string; id?: string })._id || notification.id || '';
  const image = notification.image || notification.data?.thumbnail || notification.data?.productImage;

  return {
    ...notification,
    id,
    image,
    type: notification.type || 'system',
  };
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>({ status: 'idle' });
  const ref = useRef<HTMLDivElement>(null);
  const previousIdsRef = useRef<string[]>([]);
  const hasLoadedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unlockAudio = async () => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const playNotificationTone = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) {
      await unlockAudio();
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    if (!user) return;
    const handleIncomingNotifications = (incoming: Notification[]) => {
      const normalized = incoming.map(normalizeNotification);
      setNotifications(normalized);

      if (hasLoadedRef.current) {
        const newProductNotifications = normalized.filter(
          (notification) =>
            notification.type === 'product' &&
            !notification.isRead &&
            !previousIdsRef.current.includes(notification.id)
        );

        if (newProductNotifications.length > 0) {
          void playNotificationTone();
        }
      }

      previousIdsRef.current = normalized.map((notification) => notification.id);
      hasLoadedRef.current = true;
    };

    const unsubscribe = user.isAdmin
      ? subscribeToAdminNotifications(handleIncomingNotifications)
      : subscribeToUserNotifications(user.email, handleIncomingNotifications);

    const handleIncomingNotifications = (incoming: Notification[]) => {
      const normalized = incoming.map(normalizeNotification);
      setNotifications(normalized);

      if (hasLoadedRef.current) {
        const newProductNotifications = normalized.filter(
          (notification) =>
            notification.type === 'product' &&
            !notification.isRead &&
            !previousIdsRef.current.includes(notification.id)
        );

        if (newProductNotifications.length > 0) {
          void playNotificationTone();
        }
      }

      previousIdsRef.current = normalized.map((notification) => notification.id);
      hasLoadedRef.current = true;
    };

    const unsubscribe = user.isAdmin
      ? subscribeToAdminNotifications(handleIncomingNotifications)
      : subscribeToUserNotifications(user.email, handleIncomingNotifications);
>>>>>>> f3d9a92 (Save local changes)

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState({ status: 'unavailable' });
      return;
    }

    setLocationState({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocationState({
          status: 'detected',
          coords,
          label: `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`,
        });
      },
      () => {
        setLocationState({ status: 'denied' });
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockAudio();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleMarkAllRead = async () => {
    const success = await markAllAsRead();

    if (success) {
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    }
  };

  const handleClickNotification = async (notification: NormalizedNotification) => {
    if (!notification.isRead) {
      const success = await markAsRead(notification.id);

      if (success) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item
          )
        );
      }
    }

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
      case 'product':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'promotion':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'New update available';
      case 'order':
        return 'Order update';
      case 'promotion':
        return 'Promo alert';
      case 'message':
        return 'New message';
      default:
        return 'Update';
    }
  };

  const handleToggleOpen = async () => {
    if (!open) {
      await unlockAudio();
    }

    setOpen(!open);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggleOpen}
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

          {locationState.status === 'loading' && (
            <div className="px-3 py-2 border-b bg-gray-50 text-[11px] text-gray-500">
              Detecting your location automatically...
            </div>
          )}

          {locationState.status === 'detected' && locationState.label && (
            <div className="px-3 py-2 border-b bg-purple-50/60">
              <p className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Auto location detected
              </p>
              <p className="text-[10px] text-gray-600">{locationState.label}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you about new products and updates</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.link || '#'}
                  onClick={() => handleClickNotification(notification)}
                  className={`flex gap-3 p-3 border-b hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    {notification.image ? (
                      <img src={notification.image} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm line-clamp-1 ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notification.message}</p>
                    <p className="text-[10px] font-medium text-purple-600 mt-1">{getNotificationLabel(notification.type)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
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
