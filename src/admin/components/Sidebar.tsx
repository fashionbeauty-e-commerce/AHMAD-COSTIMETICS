import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  LayoutDashboard, BarChart3, ShoppingCart, Package,
  Users, FolderTree, Tag, Ticket, Star, Settings,
  Globe, Smartphone, Store, CircleHelp, ChevronDown,
  MessageSquare, Shield
} from 'lucide-react';
// import { CONFIG } from '../../config';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders', badge: 'Pending' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: MessageSquare, label: 'Customer Chat', path: '/admin/chat' },
  { icon: Tag, label: 'Brands', path: '/admin/brands' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: Shield, label: 'Admin Users', path: '/admin/users', superAdminOnly: true, badge: 'Super' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const channels = [
  { icon: Globe, label: 'Website', status: 'Live', path: '/admin/channels' },
  { icon: Smartphone, label: 'Mobile App', status: 'Live', path: '/admin/channels' },
  { icon: Store, label: 'POS System', status: 'Offline', path: '/admin/channels' },
  { icon: Store, label: 'Facebook Shop', status: 'Live', path: '/admin/channels' },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className="w-[230px] bg-[#1a1a2e] text-gray-300 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none truncate w-24">Ahmad</h1>
            <span className="text-[9px] tracking-[0.15em] text-gray-400 uppercase">Costimetics</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-5 py-4 border-b border-white/10">
        <button className="flex items-center gap-3 w-full">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="text-left flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-none truncate">{user?.name || user?.email || 'Admin'}</p>
            <p className="text-[10px] text-purple-400 mt-0.5 uppercase tracking-tight">
              {user?.isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <ul className="space-y-0.5">
          {menuItems.filter(item => !item.superAdminOnly || user?.isSuperAdmin).map(({ icon: Icon, label, path, badge }) => (
            <li key={label}>
              <button
                onClick={() => {
                  setActiveItem(label);
                  navigate(path);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeItem === label
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    activeItem === label ? 'bg-white/20 text-white' : 'bg-purple-600/20 text-purple-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Sales Channels */}
        <div className="mt-6 mb-2">
          <button
            onClick={() => navigate('/admin/channels')}
            className="w-full px-3 text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-3 hover:text-purple-400 text-left flex items-center justify-between"
          >
            <span>Sales Channels</span>
            <span className="text-purple-400 normal-case tracking-normal">View All →</span>
          </button>
          <ul className="space-y-0.5">
            {channels.map(({ icon: Icon, label, status, path }) => (
              <li key={label}>
                <button 
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="flex-1 text-left">{label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    status === 'Live'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Help */}
      <div className="px-5 py-4 border-t border-white/10">
        <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
          <CircleHelp className="w-5 h-5" />
          <div className="text-left">
            <p className="text-sm font-medium">Need Help?</p>
            <p className="text-[10px] text-gray-500">Contact our support team</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
