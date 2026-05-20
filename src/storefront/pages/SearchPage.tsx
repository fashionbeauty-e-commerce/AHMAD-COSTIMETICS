import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Star, ShoppingBag, Heart, Filter, X } from 'lucide-react';
import { subscribeToProducts } from '../../services/firebase';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  numReviews?: number;
  images?: { url: string; publicId: string }[];
  thumbnail?: string;
  emoji?: string;
  description?: string;
  shortDescription?: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'relevance';
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');

  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((products) => {
      setAllProducts(products);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Smart search algorithm - searches across multiple fields
  const searchResults = allProducts
    .filter(p => p.isActive !== false) // Only active products
    .filter(product => {
      // Search query filter
      if (query) {
        const searchLower = query.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(searchLower);
        const matchesBrand = product.brand?.toLowerCase().includes(searchLower);
        const matchesCategory = product.category?.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        const matchesTags = product.tags?.some(t => t.toLowerCase().includes(searchLower));
        
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDescription && !matchesTags) {
          return false;
        }
      }
      
      // Category filter
      if (category !== 'All' && product.category !== category) return false;
      
      // Price filter
      if (product.price < minPrice || product.price > maxPrice) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': return 0; // Firebase already sorts by newest
        default: 
          // Relevance: featured first, then by name match
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
      }
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...Object.fromEntries(searchParams), q: searchInput });
  };

  const updateFilter = (key: string, value: string) => {
    const params = Object.fromEntries(searchParams);
    if (value && value !== 'All') {
      params[key] = value;
    } else {
      delete params[key];
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ q: query });
  };

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      {/* Search Header */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-32 py-3 md:py-4 border-2 border-gray-200 rounded-xl text-sm md:text-base focus:outline-none focus:border-black transition-all"
            placeholder="Search products, brands, categories..."
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="text-center text-sm text-gray-500 mt-3">
            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for <span className="font-semibold text-black">"{query}"</span>
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              {(category !== 'All' || minPrice > 0 || maxPrice < 10000) && (
                <button onClick={clearFilters} className="text-xs text-purple-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-purple-600">
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat}
                      onChange={() => updateFilter('category', cat)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm capitalize">{cat}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      ({cat === 'All' ? allProducts.length : allProducts.filter(p => p.category === cat).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                {[
                  { label: 'Under $25', min: 0, max: 25 },
                  { label: '$25 - $50', min: 25, max: 50 },
                  { label: '$50 - $100', min: 50, max: 100 },
                  { label: '$100 - $250', min: 100, max: 250 },
                  { label: 'Over $250', min: 250, max: 10000 },
                ].map(range => (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={minPrice === range.min && maxPrice === range.max}
                      onChange={() => {
                        const params = Object.fromEntries(searchParams);
                        params.minPrice = range.min.toString();
                        params.maxPrice = range.max.toString();
                        setSearchParams(params);
                      }}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
            <div className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Category</h4>
                  <select
                    value={category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-semibold text-black">{searchResults.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              >
                <Filter className="w-3 h-3" /> Filter
              </button>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-xs md:text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-gray-500 mb-6">
                {query ? `We couldn't find anything matching "${query}"` : 'Try adjusting your filters'}
              </p>
              <Link to="/products" className="inline-block px-6 py-2 bg-black text-white rounded-lg">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {searchResults.map(product => (
                <Link
                  to={`/products/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                    {product.thumbnail || product.images?.[0]?.url ? (
                      <img
                        src={product.thumbnail || product.images?.[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-5xl">{product.emoji || '👕'}</span>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                      </span>
                    )}
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-3 md:p-4">
                    {product.brand && (
                      <p className="text-[10px] md:text-xs text-purple-600 uppercase font-semibold tracking-wide mb-1">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="font-medium text-xs md:text-sm text-gray-800 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.rating !== undefined && product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm md:text-base">${product.price}</span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">${product.compareAtPrice}</span>
                      )}
                    </div>
                    <button className="w-full mt-2 py-1.5 bg-black text-white text-xs rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
