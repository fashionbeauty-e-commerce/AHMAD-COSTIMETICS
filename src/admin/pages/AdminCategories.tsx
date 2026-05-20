import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save } from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import ImageUploader from '../../components/ImageUploader';

interface CategoryImage {
  url: string;
  publicId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CategoryImage;
  banner?: CategoryImage;
  parent?: string;
  productCount?: number;
  isActive: boolean;
  isFeatured?: boolean;
  order: number;
}

const CATEGORIES_COLLECTION = 'categories';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    order: 0,
    isActive: true,
    isFeatured: false,
  });
  const [image, setImage] = useState<CategoryImage[]>([]);
  const [banner, setBanner] = useState<CategoryImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(cats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent: category.parent || '',
        order: category.order || 0,
        isActive: category.isActive,
        isFeatured: category.isFeatured || false,
      });
      setImage(category.image ? [category.image] : []);
      setBanner(category.banner ? [category.banner] : []);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parent: '',
        order: 0,
        isActive: true,
        isFeatured: false,
      });
      setImage([]);
      setBanner([]);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const slug = formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const categoryData: any = {
        ...formData,
        slug,
        image: image[0] || null,
        banner: banner[0] || null,
        updatedAt: serverTimestamp(),
      };

      if (editingCategory) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, editingCategory.id), categoryData, { merge: true });
        showMessage('success', 'Category updated successfully');
      } else {
        const newId = slug + '-' + Date.now();
        categoryData.createdAt = serverTimestamp();
        categoryData.productCount = 0;
        await setDoc(doc(db, CATEGORIES_COLLECTION, newId), categoryData);
        showMessage('success', 'Category created successfully');
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Error:', error);
      showMessage('error', error.message || 'Failed to save category');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
      showMessage('success', 'Category deleted successfully');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-xs md:text-sm text-gray-500">Organize your catalog ({categories.length} categories)</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>No categories yet. Create your first one!</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {category.image?.url ? (
                  <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => openModal(category)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <h3 className="font-bold text-sm md:text-lg truncate">{category.name}</h3>
                  <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shrink-0 ${
                    category.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 hidden md:block">{category.description || 'No description'}</p>
                <p className="text-[10px] md:text-xs text-gray-400">{category.productCount || 0} products</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg md:text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  placeholder="e.g., Men's Shoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  rows={3}
                  placeholder="Category description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Parent</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({...formData, parent: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <ImageUploader
                folder="categories"
                multiple={false}
                maxFileSize={3}
                label="Category Image"
                helperText="Recommended: square image, at least 400x400px"
                value={image}
                onChange={(imgs) => setImage(imgs.filter(i => i.url) as CategoryImage[])}
              />

              {/* Cloudinary Banner Upload */}
              <ImageUploader
                folder="banners"
                multiple={false}
                maxFileSize={5}
                label="Category Banner (Optional)"
                helperText="Wide banner for category page header"
                value={banner}
                onChange={(imgs) => setBanner(imgs.filter(i => i.url) as CategoryImage[])}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm font-medium">Active (show on website)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  <Save className="w-4 h-4" />
                  {processing ? 'Saving...' : (editingCategory ? 'Update' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
