import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../../App';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
];

const orders = [
  { id: '#ORD-2536', date: '2026-06-15', total: '$129.99', status: 'Delivered', items: ['Nike Air Jordan 1'] },
  { id: '#ORD-2535', date: '2026-06-10', total: '$89.50', status: 'Shipped', items: ['Classic Black Hoodie'] },
  { id: '#ORD-2534', date: '2026-06-05', total: '$199.00', status: 'Processing', items: ['Ahmad Perfume Oud'] },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/sign-in');
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Profile Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input type="text" defaultValue={user.firstName || ''} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input type="text" defaultValue={user.lastName || ''} className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" defaultValue={user.email} className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input type="tel" placeholder="+234..." className="w-full px-4 py-3 border border-gray-200 rounded-lg" />
              </div>
            </div>
            <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Save Changes
            </button>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Order History</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                  <p className="font-semibold mt-2">{order.total}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Saved Addresses</h2>
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Add New</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-purple-600 rounded-xl p-4 relative">
                <span className="absolute top-3 right-3 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Default</span>
                <p className="font-semibold">Home</p>
                <p className="text-sm text-gray-600 mt-1">123 Main Street</p>
                <p className="text-sm text-gray-600">Katsina, Nigeria</p>
                <p className="text-sm text-gray-600">+234 901 158 3912</p>
              </div>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <button className="px-4 py-2 bg-black text-white rounded-lg text-sm">Add Card</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white">
                <p className="text-lg font-mono mb-4">**** **** **** 4242</p>
                <p className="text-sm opacity-80">Expires 12/25</p>
                <p className="font-semibold mt-2">{user.name?.toUpperCase() || 'USER'}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.name || user.firstName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {/* Admin badge hidden from public view */}
                </div>
              </div>
            </div>
            <nav className="p-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              {/* Admin Dashboard link removed - admins access via direct URL /admin */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
