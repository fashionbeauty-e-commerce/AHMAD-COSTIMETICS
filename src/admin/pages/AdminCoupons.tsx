import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Ticket, Copy, Calendar, Search, Tag } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategory?: string;
}

const COUPONS_COLLECTION = 'coupons';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [formData, setFormData] = useState<any>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    applicableCategory: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, COUPONS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Coupon[]);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const isExpired = (coupon: Coupon) => {
    return new Date(coupon.endDate) < new Date();
  };

  const filtered = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.isActive && !isExpired(c)) ||
      (filterStatus === 'expired' && isExpired(c));
    return matchesSearch && matchesFilter;
  });

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditing(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscount: coupon.maxDiscount || 0,
        usageLimit: coupon.usageLimit || 100,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        isActive: coupon.isActive,
        applicableCategory: coupon.applicableCategory || '',
      });
    } else {
      setEditing(null);
      setFormData({
        code: '', description: '', discountType: 'percentage', discountValue: 10,
        minOrderAmount: 0, maxDiscount: 0, usageLimit: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true, applicableCategory: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert('Coupon code is required');
      return;
    }
    setProcessing(true);
    try {
      const data: any = {
        ...formData,
        code: formData.code.toUpperCase(),
        updatedAt: serverTimestamp(),
      };

      if (editing) {
        await setDoc(doc(db, COUPONS_COLLECTION, editing.id), data, { merge: true });
        alert('Coupon updated!');
      } else {
        const id = data.code + '-' + Date.now();
        data.createdAt = serverTimestamp();
        data.usedCount = 0;
        await setDoc(doc(db, COUPONS_COLLECTION, id), data);
        alert('Coupon created!');
      }
      setShowModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteDoc(doc(db, COUPONS_COLLECTION, id));
      alert('Coupon deleted');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied!`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Coupons & Discounts</h1>
          <p className="text-xs md:text-sm text-gray-500">Create promotional codes ({coupons.length} total)</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Coupons" value={coupons.length} icon={Ticket} color="bg-purple-50 text-purple-600" />
        <StatCard label="Active" value={coupons.filter(c => c.isActive && !isExpired(c)).length} icon={Tag} color="bg-green-50 text-green-600" />
        <StatCard label="Expired" value={coupons.filter(isExpired).length} icon={Calendar} color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Uses" value={coupons.reduce((s, c) => s + (c.usedCount || 0), 0)} icon={Copy} color="bg-blue-50 text-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No coupons yet. Create your first promotion!</p>
          </div>
        ) : (
          filtered.map(coupon => {
            const expired = isExpired(coupon);
            return (
              <div key={coupon.id} className={`relative bg-white rounded-xl border-2 border-dashed p-4 ${
                expired ? 'border-gray-300 opacity-75' : 'border-purple-300'
              }`}>
                {/* Decorative corners */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
                  </div>
                  <button onClick={() => copyCode(coupon.code)} className="p-1.5 hover:bg-purple-50 rounded">
                    <Copy className="w-4 h-4 text-purple-600" />
                  </button>
                </div>

                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                </div>

                {coupon.description && (
                  <p className="text-xs text-gray-600 mb-2">{coupon.description}</p>
                )}

                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                    <p>Min order: ${coupon.minOrderAmount}</p>
                  )}
                  <p>Used: {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</p>
                  <p>Valid: {coupon.startDate} → {coupon.endDate}</p>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    expired ? 'bg-red-100 text-red-600' :
                    coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(coupon)} className="p-1.5 hover:bg-blue-50 rounded">
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-1.5 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg md:text-xl font-bold">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text" required value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                    placeholder="SAVE10"
                  />
                  <button type="button" onClick={generateCode} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input type="text" value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="e.g., 10% off your first order"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Value</label>
                  <input type="number" required min="0" value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Order ($)</label>
                  <input type="number" min="0" value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Usage Limit</label>
                  <input type="number" min="0" value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input type="date" required value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input type="date" required value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded text-purple-600"
                />
                <span className="text-sm font-medium">Activate immediately</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
                  <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-lg md:text-xl font-bold">{value}</p>
          <p className="text-[10px] md:text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
