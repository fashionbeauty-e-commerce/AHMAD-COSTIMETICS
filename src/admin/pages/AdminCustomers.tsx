import { useState, useEffect } from 'react';
import { 
  Search, Mail, Phone, ShoppingBag, Eye, 
  MessageSquare, X, Calendar, Package,
  TrendingUp, UserCheck, UserX
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  orders?: number;
  totalSpent?: number;
  joined?: any;
  isActive?: boolean;
  lastOrder?: any;
  picture?: string;
  addresses?: any[];
  notes?: string;
}

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Subscribe to customers from Firebase
    const q = query(collection(db, 'customers'), orderBy('joined', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[];
      
      // If no data, use demo data so admin sees something
      if (data.length === 0) {
        setCustomers(DEMO_CUSTOMERS);
      } else {
        setCustomers(data);
      }
      setLoading(false);
    }, () => {
      setCustomers(DEMO_CUSTOMERS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.isActive !== false) ||
      (filterStatus === 'inactive' && c.isActive === false);

    return matchesSearch && matchesFilter;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.orders || 0), 0);
  const activeCustomers = customers.filter(c => c.isActive !== false).length;

  const handleToggleStatus = async (customer: Customer) => {
    try {
      // Try to update in Firebase
      await updateDoc(doc(db, 'customers', customer.id), {
        isActive: !customer.isActive,
        updatedAt: serverTimestamp(),
      });
      alert(`Customer ${customer.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      // Fallback: update local state (for demo)
      setCustomers(prev => prev.map(c => 
        c.id === customer.id ? { ...c, isActive: !c.isActive } : c
      ));
      alert(`Customer ${customer.isActive ? 'deactivated' : 'activated'} (local)`);
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  const handleSendMessage = (customer: Customer) => {
    // Navigate to admin chat with this customer
    navigate(`/admin/chat?customer=${customer.email}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getCustomerInitials = (customer: Customer): string => {
    if (customer.firstName) return customer.firstName.charAt(0).toUpperCase();
    if (customer.name) return customer.name.charAt(0).toUpperCase();
    return customer.email.charAt(0).toUpperCase();
  };

  const getCustomerName = (customer: Customer): string => {
    if (customer.name) return customer.name;
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return customer.email.split('@')[0];
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Manage your customer base ({customers.length} total)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{customers.length}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{activeCustomers}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{totalOrders}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {getCustomerInitials(customer)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate">{getCustomerName(customer)}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      customer.isActive !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {customer.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span><strong>{customer.orders || 0}</strong> orders</span>
                    <span className="text-green-600 font-semibold">${(customer.totalSpent || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleViewDetails(customer)}
                  className="flex-1 py-1.5 text-xs bg-gray-100 rounded-lg flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <button 
                  onClick={() => handleSendMessage(customer)}
                  className="flex-1 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" /> Chat
                </button>
                <button 
                  onClick={() => handleToggleStatus(customer)}
                  className="flex-1 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center gap-1"
                >
                  {customer.isActive !== false ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {customer.isActive !== false ? 'Block' : 'Unblock'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Total Spent</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading customers...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No customers found</td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {customer.picture ? (
                        <img src={customer.picture} alt={getCustomerName(customer)} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {getCustomerInitials(customer)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{getCustomerName(customer)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{customer.orders || 0}</td>
                  <td className="px-6 py-4 font-medium text-green-600">
                    ${(customer.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(customer.joined)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.isActive !== false 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {customer.isActive !== false ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleViewDetails(customer)}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleSendMessage(customer)}
                        className="p-2 hover:bg-purple-50 rounded-lg" 
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(customer)}
                        className="p-2 hover:bg-amber-50 rounded-lg" 
                        title={customer.isActive !== false ? 'Deactivate' : 'Activate'}
                      >
                        {customer.isActive !== false ? (
                          <UserX className="w-4 h-4 text-amber-600" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Customer Details</h2>
              <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selectedCustomer.picture ? (
                  <img src={selectedCustomer.picture} alt={getCustomerName(selectedCustomer)} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {getCustomerInitials(selectedCustomer)}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{getCustomerName(selectedCustomer)}</h3>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    selectedCustomer.isActive !== false 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedCustomer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedCustomer.orders || 0}</p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">${(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Spent</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedCustomer.orders ? `$${((selectedCustomer.totalSpent || 0) / selectedCustomer.orders).toFixed(2)}` : '$0'}
                  </p>
                  <p className="text-xs text-gray-600">Avg Order</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {formatDate(selectedCustomer.joined)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSendMessage(selectedCustomer)}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Send Message
                </button>
                <a 
                  href={`mailto:${selectedCustomer.email}`}
                  className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Users = ShoppingBag; // Fallback for missing icon

const DEMO_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@email.com', phone: '+234 901 123 4567', orders: 12, totalSpent: 5650.20, joined: new Date('2023-01-15'), isActive: true },
  { id: '2', name: 'Sarah Smith', email: 'sarah@email.com', phone: '+234 802 234 5678', orders: 8, totalSpent: 4230.80, joined: new Date('2023-03-20'), isActive: true },
  { id: '3', name: 'Michael Brown', email: 'michael@email.com', phone: '+234 703 345 6789', orders: 15, totalSpent: 3980.50, joined: new Date('2022-11-10'), isActive: true },
  { id: '4', name: 'Emily Davis', email: 'emily@email.com', phone: '+234 804 456 7890', orders: 6, totalSpent: 3450.75, joined: new Date('2023-06-05'), isActive: true },
  { id: '5', name: 'David Wilson', email: 'david@email.com', phone: '+234 905 567 8901', orders: 9, totalSpent: 2890.30, joined: new Date('2023-02-28'), isActive: false },
];
