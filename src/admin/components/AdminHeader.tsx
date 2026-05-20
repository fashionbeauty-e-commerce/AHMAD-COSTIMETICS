import { Search, MessageSquare, ExternalLink, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../../storefront/components/NotificationBell';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 border border-gray-200 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="hidden sm:inline">View Store</span>
          <span className="sm:hidden">Store</span>
          <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - Hidden on mobile */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-48 lg:w-64 pl-10 pr-16 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>

        {/* Mobile Search */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Search className="w-4 h-4 text-gray-600" />
        </button>

        {/* Real-time Notifications */}
        <NotificationBell />

        {/* Messages */}
        <button className="relative w-8 h-8 md:w-9 md:h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
          <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-purple-500 text-white text-[8px] md:text-[9px] rounded-full flex items-center justify-center font-bold">5</span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold cursor-pointer">
          AA
        </div>
      </div>
    </header>
  );
}
