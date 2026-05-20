import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Award, Search } from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ImageUploader from '../../components/ImageUploader';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: { url: string; publicId: string };
  website?: string;
  country?: string;
  founded?: number;
  isActive: boolean;
  isFeatured?: boolean;
  productCount?: number;
}

const BRANDS_COLLECTION = 'brands';

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    country: '',
    founded: 0,
    isActive: true,
    isFeatured: false,
  });
  const [logo, setLogo] = useState<{url: string; publicId: string}[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, BRANDS_COLLECTION), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setBrands(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Brand[]);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const filtered = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditing(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        website: brand.website || '',
        country: brand.country || '',
        founded: brand.founded || 0,
        isActive: brand.isActive,
        isFeatured: brand.isFeatured || false,
      });
      setLogo(brand.logo ? [brand.logo] : []);
    } else {
      setEditing(null);
      setFormData({ name: '', description: '', website: '', country: '', founded: 0, isActive: true, isFeatured: false });
      setLogo([]);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const slug = formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const data: any = {
        ...formData,
        slug,
        logo: logo[0] || null,
        updatedAt: serverTimestamp(),
      };

      if (editing) {
        await setDoc(doc(db, BRANDS_COLLECTION, editing.id), data, { merge: true });
        alert('Brand updated successfully!');
      } else {
        const id = slug + '-' + Date.now();
        data.createdAt = serverTimestamp();
        data.productCount = 0;
        await setDoc(doc(db, BRANDS_COLLECTION, id), data);
        alert('Brand created successfully!');
      }
      setShowModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, BRANDS_COLLECTION, id));
      alert('Brand deleted');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Brands</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage product brands ({brands.length} total)</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No brands yet. Add your first brand!</p>
          </div>
        ) : (
          filtered.map(brand => (
            <div key={brand.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow group">
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                {brand.logo?.url ? (
                  <img src={brand.logo.url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <Award className="w-12 h-12 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openModal(brand)} className="p-2 bg-white rounded-lg hover:bg-gray-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(brand.id, brand.name)} className="p-2 bg-white rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm md:text-base truncate">{brand.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                  brand.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {brand.isActive ? 'Active' : 'Off'}
                </span>
              </div>
              {brand.country && <p className="text-xs text-gray-500">📍 {brand.country}</p>}
              {brand.founded ? <p className="text-xs text-gray-500">Est. {brand.founded}</p> : null}
              <p className="text-[10px] text-gray-400 mt-1">{brand.productCount || 0} products</p>
              {brand.isFeatured && <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ Featured</span>}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg md:text-xl font-bold">{editing ? 'Edit Brand' : 'Add Brand'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Name *</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Nike, Apple, Samsung"
                />
              </div>

              <ImageUploader
                folder="categories"
                multiple={false}
                maxFileSize={2}
                label="Brand Logo"
                helperText="Square logo, transparent background recommended"
                value={logo}
                onChange={(imgs) => setLogo(imgs.filter(i => i.url))}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea rows={3} value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input type="text" value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., USA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Founded Year</label>
                  <input type="number" value={formData.founded || ''}
                    onChange={(e) => setFormData({...formData, founded: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="e.g., 1976"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input type="url" value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm">⭐ Featured</span>
                </label>
              </div>

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
