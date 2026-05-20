import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

// Simple API calls using fetch
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

async function apiRequest(endpoint: string, options: any = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

const ordersAPI = {
  getAll: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  updateStatus: (id: string, data: any) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: any[];
  pricing: {
    total: number;
    subtotal: number;
    shipping: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  status: string;
  shippingAddress: any;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  confirmed: 'bg-blue-100 text-blue-600',
  processing: 'bg-purple-100 text-purple-600',
  shipped: 'bg-indigo-100 text-indigo-600',
  out_for_delivery: 'bg-cyan-100 text-cyan-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-600',
  payment_pending: 'bg-orange-100 text-orange-600',
  payment_approved: 'bg-blue-100 text-blue-600',
  payment_rejected: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-600',
  failed: 'bg-red-100 text-red-600',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentStatusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter;
      
      const response = await ordersAPI.getAll(params);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      await ordersAPI.updateStatus(selectedOrder._id, {
        status: 'processing',
        message: notes || 'Payment verified and approved'
      });
      
      alert('Payment approved! Order is now processing.');
      setShowModal(false);
      loadOrders();
    } catch (error: any) {
      alert('Error approving payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder || !notes.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setProcessing(true);
    try {
      await ordersAPI.updateStatus(selectedOrder._id, {
        status: 'cancelled',
        message: `Payment rejected: ${notes}`
      });
      
      alert('Payment rejected. Order cancelled.');
      setShowModal(false);
      loadOrders();
    } catch (error: any) {
      alert('Error rejecting payment: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalModal = (order: Order, type: 'approve' | 'reject') => {
    setSelectedOrder(order);
    setActionType(type);
    setNotes('');
    setShowModal(true);
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500">Manage and verify customer orders ({orders.length} orders)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Verification', value: orders.filter(o => o.payment.status === 'payment_pending').length, icon: Package, color: 'bg-orange-50 text-orange-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, icon: Truck, color: 'bg-purple-50 text-purple-600' },
          { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'bg-blue-50 text-blue-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option>All Status</option>
          <option>pending</option>
          <option>confirmed</option>
          <option>processing</option>
          <option>shipped</option>
          <option>delivered</option>
          <option>cancelled</option>
        </select>
        <select 
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option>All Payments</option>
          <option>payment_pending</option>
          <option>payment_approved</option>
          <option>completed</option>
          <option>payment_rejected</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-purple-600">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium capitalize">{order.payment.method.replace('_', ' ')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${paymentStatusColors[order.payment.status]}`}>
                        {order.payment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">${order.pricing.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {order.payment.status === 'payment_pending' && (
                        <>
                          <button 
                            onClick={() => openApprovalModal(order, 'approve')}
                            className="p-2 hover:bg-green-50 rounded-lg" 
                            title="Approve Payment"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                          <button 
                            onClick={() => openApprovalModal(order, 'reject')}
                            className="p-2 hover:bg-red-50 rounded-lg" 
                            title="Reject Payment"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
              </h2>
              <p className="text-sm text-gray-500">Order {selectedOrder.orderNumber}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Customer</p>
                <p className="font-medium">{selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Amount</p>
                <p className="text-2xl font-bold">${selectedOrder.pricing.total.toFixed(2)}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                <p className="font-medium capitalize">{selectedOrder.payment.method.replace('_', ' ')}</p>
              </div>
              
              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                    rows={3}
                    placeholder="Please provide a reason for rejecting this payment..."
                  />
                </div>
              )}
              
              {actionType === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    rows={2}
                    placeholder="Add any notes about this approval..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprovePayment : handleRejectPayment}
                disabled={processing || (actionType === 'reject' && !notes.trim())}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  actionType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {processing ? 'Processing...' : (actionType === 'approve' ? 'Approve Payment' : 'Reject Payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
