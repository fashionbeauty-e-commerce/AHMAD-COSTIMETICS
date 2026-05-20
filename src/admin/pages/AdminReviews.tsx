import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Search, MessageSquare, Flag } from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userEmail: string;
  userName?: string;
  rating: number;
  title?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  helpful?: number;
  createdAt?: any;
  adminResponse?: string;
}

const REVIEWS_COLLECTION = 'reviews';

const DEMO_REVIEWS: Review[] = [
  { id: '1', productId: 'p1', productName: 'Nike Air Jordan', userEmail: 'john@email.com', userName: 'John D.', rating: 5, title: 'Amazing shoes!', content: 'Best purchase ever. Comfortable and stylish.', status: 'approved', helpful: 12 },
  { id: '2', productId: 'p2', productName: 'Ahmad Perfume', userEmail: 'sarah@email.com', userName: 'Sarah S.', rating: 4, title: 'Great scent', content: 'Love the fragrance, lasts all day.', status: 'pending', helpful: 5 },
  { id: '3', productId: 'p3', productName: 'Leather Bag', userEmail: 'mike@email.com', userName: 'Mike B.', rating: 2, title: 'Disappointed', content: 'Quality not as described.', status: 'pending', helpful: 1 },
  { id: '4', productId: 'p4', productName: 'Watch', userEmail: 'emma@email.com', userName: 'Emma D.', rating: 5, title: 'Perfect!', content: 'Exactly what I wanted. Fast shipping too!', status: 'approved', helpful: 8 },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
      setReviews(data.length > 0 ? data : DEMO_REVIEWS);
      setLoading(false);
    }, () => {
      setReviews(DEMO_REVIEWS);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = reviews.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = 
      r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, REVIEWS_COLLECTION, id), { status, updatedAt: serverTimestamp() });
      alert(`Review ${status}!`);
    } catch {
      // Local fallback
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      alert(`Review ${status} (local)`);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, REVIEWS_COLLECTION, id), { isFeatured: !current });
    } catch {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isFeatured: !current } : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
    } catch {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSendResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;
    try {
      await updateDoc(doc(db, REVIEWS_COLLECTION, selectedReview.id), {
        adminResponse: responseText,
        respondedAt: serverTimestamp(),
      });
      alert('Response sent!');
      setResponseText('');
      setSelectedReview(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) 
      : '0.0',
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Reviews & Ratings</h1>
        <p className="text-xs md:text-sm text-gray-500">Moderate product reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard label="Pending" value={stats.pending} color="bg-amber-50 text-amber-600" />
        <StatCard label="Approved" value={stats.approved} color="bg-green-50 text-green-600" />
        <StatCard label="Rejected" value={stats.rejected} color="bg-red-50 text-red-600" />
        <StatCard label="Avg Rating" value={stats.avgRating} color="bg-yellow-50 text-yellow-600" suffix="⭐" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading reviews...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          filtered.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Avatar & Rating */}
                <div className="flex md:flex-col items-center gap-3 md:gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(review.userName || review.userEmail).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex md:flex-col items-center md:items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold">{review.rating}.0</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{review.userName || review.userEmail.split('@')[0]}</span>
                    <span className="text-xs text-gray-500">on</span>
                    <span className="font-medium text-sm text-purple-600">{review.productName || 'Product'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      review.status === 'approved' ? 'bg-green-100 text-green-600' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {review.status}
                    </span>
                    {review.isFeatured && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ Featured</span>
                    )}
                  </div>
                  {review.title && <h4 className="font-bold text-sm md:text-base mb-1">{review.title}</h4>}
                  <p className="text-sm text-gray-700 mb-2">{review.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>👍 {review.helpful || 0} helpful</span>
                    <span>•</span>
                    <span>{review.userEmail}</span>
                  </div>
                  {review.adminResponse && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-xs font-semibold text-purple-700 mb-1">Admin Response:</p>
                      <p className="text-xs text-gray-700">{review.adminResponse}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 flex-wrap">
                  {review.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(review.id, 'approved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => updateStatus(review.id, 'rejected')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 flex items-center gap-1">
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelectedReview(review)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Reply
                  </button>
                  <button onClick={() => toggleFeatured(review.id, review.isFeatured || false)} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs hover:bg-amber-200 flex items-center gap-1">
                    <Flag className="w-3 h-3" /> {review.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => handleDelete(review.id)} className="px-3 py-1.5 bg-gray-100 text-red-600 rounded-lg text-xs hover:bg-red-50 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">Respond to Review</h2>
              <button onClick={() => setSelectedReview(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-semibold">{selectedReview.userName || selectedReview.userEmail}</p>
                <div className="flex items-center gap-1 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{selectedReview.content}</p>
              </div>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                placeholder="Type your professional response..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setSelectedReview(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button onClick={handleSendResponse} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Send Response</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, suffix }: any) {
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100">
      <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-1 ${color}`}>{label}</div>
      <p className="text-xl font-bold">{value}{suffix && <span className="text-sm ml-1">{suffix}</span>}</p>
    </div>
  );
}
