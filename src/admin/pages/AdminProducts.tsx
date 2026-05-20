import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Save, 
  Package, DollarSign, Tag, Hash, FileText, 
  Layers, Star, Truck, Award, Shield, Eye, EyeOff
} from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { useAuth } from '../../App';
import { productAPI } from '../../services/api';
import { notifyNewProduct } from '../../services/notifications';

interface ProductImage {
  url: string;
  publicId: string;
}

interface Specification {
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  category: string;
  subCategory?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  description: string;
  shortDescription?: string;
  features?: string[];
  specifications?: Specification[];
  tags?: string[];
  images?: ProductImage[];
  thumbnail?: string;
  emoji?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  isActive: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  warranty?: string;
  returnPolicy?: string;
  shipping?: { freeShipping: boolean; estimatedDays: number };
  rating?: number;
  numReviews?: number;
  createdAt?: any;
}

const CATEGORIES = ['Men', 'Women', 'Kids', 'Shoes', 'Bags', 'Beauty', 'Watches', 'Fragrance', 'Accessories'];

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'details' | 'shipping'>('basic');
  
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    brand: '',
    sku: '',
    category: 'Men',
    subCategory: '',
    price: 0,
    compareAtPrice: 0,
    cost: 0,
    stock: 0,
    description: '',
    shortDescription: '',
    features: [],
    specifications: [],
    tags: [],
    images: [],
    emoji: '👕',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    isActive: true,
    isFeatured: false,
    isNew: true,
    warranty: '',
    returnPolicy: '30 days return policy',
    shipping: { freeShipping: false, estimatedDays: 5 },
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // ⚠️ useEffect MUST come before any conditional returns
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productAPI.getAll({ limit: 100 });
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  // ⛔ Block non-admin users (AFTER all hooks)
  if (!user?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Only administrators can manage products.</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.sku?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'All' || p.category === selectedCategory)
  );

  const generateSKU = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        features: product.features || [],
        specifications: product.specifications || [],
        tags: product.tags || [],
        images: product.images || [],
        dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
        shipping: product.shipping || { freeShipping: false, estimatedDays: 5 },
      });
    } else {
      setEditingProduct(null);
      setFormData({
        id: '',
        name: '',
        brand: '',
        sku: generateSKU(),
        category: 'Men',
        subCategory: '',
        price: 0,
        compareAtPrice: 0,
        cost: 0,
        stock: 0,
        description: '',
        shortDescription: '',
        features: [],
        specifications: [],
        tags: [],
        images: [],
        emoji: '👕',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        isActive: true,
        isFeatured: false,
        isNew: true,
        warranty: '',
        returnPolicy: '30 days return policy',
        shipping: { freeShipping: false, estimatedDays: 5 },
      });
    }
    setActiveTab('basic');
    setShowModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index),
    });
  };

  const addSpecification = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: [
          ...(formData.specifications || []),
          { name: newSpecName.trim(), value: newSpecValue.trim() }
        ],
      });
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.brand?.trim()) {
      alert('Brand name is required');
      setActiveTab('basic');
      return;
    }
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      setActiveTab('basic');
      return;
    }
    if (!formData.description.trim()) {
      alert('Description is required');
      setActiveTab('details');
      return;
    }
    // Images are optional — product can be listed with emoji fallback

    setLoading(true);

    try {
      const productData: any = {
        ...formData,
        thumbnail: formData.images?.[0]?.url || '',
        rating: editingProduct?.rating || 0,
        numReviews: editingProduct?.numReviews || 0,
      };
      delete productData.id;

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
        alert('✅ Product updated! Changes are live on the website.');
      } else {
        const newProduct = await productAPI.create(productData);
        // Send real-time notification to ALL users
        await notifyNewProduct({
          id: newProduct._id,
          name: formData.name,
          price: formData.price,
          brand: formData.brand,
          thumbnail: formData.images?.[0]?.url || '',
          category: formData.category,
        });
        alert('✅ Product is now LIVE on the website! All users have been notified.');
      }
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Error: ' + (error.message || 'Failed to save product'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    try {
      await productAPI.delete(id);
      alert('Product deleted successfully');
      // Reload products
      const data = await productAPI.getAll({ limit: 100 });
      setProducts(data.products || []);
    } catch (error: any) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await productAPI.update(product.id, { isActive: !product.isActive });
      // Reload products
      const data = await productAPI.getAll({ limit: 100 });
      setProducts(data.products || []);
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    }
  };

  const getStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' };
    if (stock <= 5) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-600' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-600' };
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Manage your inventory ({products.length} {products.length === 1 ? 'product' : 'products'})
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          List New Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{products.length}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{products.filter(p => p.isActive).length}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{products.filter(p => p.isFeatured).length}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Featured</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold">{products.filter(p => p.stock <= 5).length}</p>
              <p className="text-[10px] md:text-xs text-gray-500">Low Stock</p>
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
            placeholder="Search by name, brand, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
        >
          <option>All</option>
          {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map(product => {
          const status = getStatus(product.stock);
          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{product.emoji || '👕'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {product.brand && (
                    <p className="text-[10px] text-purple-600 uppercase font-semibold tracking-wide">{product.brand}</p>
                  )}
                  <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category} • SKU: {product.sku}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-bold text-sm">${product.price}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">${product.compareAtPrice}</span>
                    )}
                    <span className="text-xs text-gray-500">• {product.stock} units</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    {product.isFeatured && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-600">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openModal(product)} className="p-1.5 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-4">Product</th>
              <th className="px-4 py-4">Brand</th>
              <th className="px-4 py-4">SKU</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Stock</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => {
              const status = getStatus(product.stock);
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{product.emoji || '👕'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-gray-900 block line-clamp-1">{product.name}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{product.shortDescription || product.description?.substring(0, 50)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 font-medium">{product.brand || '-'}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 font-mono">{product.sku || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div>${product.price}</div>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="text-xs text-gray-400 line-through">${product.compareAtPrice}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">{product.stock}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        product.isActive ? status.color : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.isActive ? status.label : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => toggleActive(product)} 
                        className="p-2 hover:bg-gray-100 rounded-lg" 
                        title={product.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {product.isActive ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => openModal(product)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No products found. Add your first product!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b">
              <div>
                <h2 className="text-lg md:text-xl font-bold">
                  {editingProduct ? 'Edit Product' : 'List New Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {editingProduct ? 'Update product details' : 'Fill in product details to list on store'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info', icon: Package },
                { id: 'images', label: 'Images', icon: FileText },
                { id: 'details', label: 'Details', icon: Layers },
                { id: 'shipping', label: 'Shipping', icon: Truck },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                {/* BASIC INFO TAB */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="e.g., Apple iPhone 15 Pro Max 256GB"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.name.length}/200 characters</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Brand <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={formData.brand}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                            placeholder="e.g., Apple, Nike, Samsung"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          SKU <span className="text-gray-400 text-xs">(auto-generated)</span>
                        </label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm font-mono"
                            placeholder="MEN-XXXXXX"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        >
                          {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Sub-Category</label>
                        <input
                          type="text"
                          value={formData.subCategory}
                          onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="e.g., Sneakers, Smartphones"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Sale Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">List Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.compareAtPrice}
                            onChange={(e) => setFormData({...formData, compareAtPrice: parseFloat(e.target.value) || 0})}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                    </div>

                    {formData.compareAtPrice && formData.compareAtPrice > formData.price && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                        💰 Customer saves <strong>${(formData.compareAtPrice - formData.price).toFixed(2)}</strong> ({Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100)}% off)
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          className="rounded text-purple-600"
                        />
                        <span className="text-sm">List on Store</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                          className="rounded text-purple-600"
                        />
                        <span className="text-sm">⭐ Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNew}
                          onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                          className="rounded text-purple-600"
                        />
                        <span className="text-sm">🆕 New Arrival</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'images' && (
                  <div className="space-y-4">
                    <ImageUploader
                      folder="products"
                      multiple
                      maxFiles={8}
                      maxFileSize={5}
                      label="Product Images (Required)"
                      helperText="Upload up to 8 high-quality images. The first image will be the main thumbnail. Recommended: 1000x1000px white background."
                      value={formData.images}
                      onChange={(images) => setFormData({...formData, images: images.filter(i => i.url) as ProductImage[]})}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Fallback Icon</label>
                      <p className="text-xs text-gray-500 mb-2">Used when no images are available</p>
                      <div className="flex gap-2 flex-wrap">
                        {['👕', '👟', '👗', '', '', '👜', '🧥', '👒', '👖', '👔', '⌚', '🌸', '👓', '💎'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({...formData, emoji})}
                            className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                              formData.emoji === emoji ? 'border-purple-600 bg-purple-50 scale-110' : 'border-gray-200'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Short Description (Bullet Point)
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="One-line summary that appears in search results"
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="Detailed product description, materials, use cases..."
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Key Features</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Add a feature (press Enter)"
                        />
                        <button type="button" onClick={addFeature} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Add</button>
                      </div>
                      <div className="space-y-1">
                        {formData.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                            <span className="text-purple-600">✓</span>
                            <span className="flex-1">{feature}</span>
                            <button type="button" onClick={() => removeFeature(i)}>
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specifications */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Specifications</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Spec name (e.g., Color)"
                        />
                        <input
                          type="text"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Value (e.g., Black)"
                        />
                        <button type="button" onClick={addSpecification} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Add Spec</button>
                      </div>
                      <div className="space-y-1">
                        {formData.specifications?.map((spec, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                            <span className="font-medium">{spec.name}:</span>
                            <span className="flex-1">{spec.value}</span>
                            <button type="button" onClick={() => removeSpecification(i)}>
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (for search)</label>
                      <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                            placeholder="Add tag (press Enter)"
                          />
                        </div>
                        <button type="button" onClick={addTag} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            #{tag}
                            <button type="button" onClick={() => removeTag(i)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SHIPPING TAB */}
                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Dimensions (cm)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="0"
                          value={formData.dimensions?.length}
                          onChange={(e) => setFormData({...formData, dimensions: { ...formData.dimensions!, length: parseFloat(e.target.value) || 0 }})}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Length"
                        />
                        <input
                          type="number"
                          min="0"
                          value={formData.dimensions?.width}
                          onChange={(e) => setFormData({...formData, dimensions: { ...formData.dimensions!, width: parseFloat(e.target.value) || 0 }})}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Width"
                        />
                        <input
                          type="number"
                          min="0"
                          value={formData.dimensions?.height}
                          onChange={(e) => setFormData({...formData, dimensions: { ...formData.dimensions!, height: parseFloat(e.target.value) || 0 }})}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                          placeholder="Height"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Delivery (days)</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.shipping?.estimatedDays}
                          onChange={(e) => setFormData({...formData, shipping: { ...formData.shipping!, estimatedDays: parseInt(e.target.value) || 5 }})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer pb-2">
                          <input
                            type="checkbox"
                            checked={formData.shipping?.freeShipping}
                            onChange={(e) => setFormData({...formData, shipping: { ...formData.shipping!, freeShipping: e.target.checked }})}
                            className="rounded text-purple-600"
                          />
                          <span className="text-sm font-medium">🚚 Free Shipping</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Warranty</label>
                      <input
                        type="text"
                        value={formData.warranty}
                        onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="e.g., 1 year manufacturer warranty"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Return Policy</label>
                      <input
                        type="text"
                        value={formData.returnPolicy}
                        onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="e.g., 30 days return policy"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50">
                <div className="text-xs text-gray-500 self-center">
                  <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'List Product')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
