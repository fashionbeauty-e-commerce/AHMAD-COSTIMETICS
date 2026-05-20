import { useState } from 'react';
import { Filter, Grid, List, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = ['All', 'Men', 'Women', 'Kids', 'Shoes', 'Bags', 'Beauty', 'Watches'];
const sortOptions = ['Featured', 'Newest', 'Price: Low to High', 'Price: High to Low'];

const products = [
  { id: 1, name: 'Nike Air Jordan 1 Retro', category: 'Shoes', price: 159.99, oldPrice: 189.99, rating: 4.8, reviews: 342, emoji: '👟' },
  { id: 2, name: 'Classic Black Hoodie', category: 'Men', price: 59.99, rating: 4.6, reviews: 298, emoji: '🧥' },
  { id: 3, name: 'Ahmad Perfume Oud', category: 'Beauty', price: 49.99, oldPrice: 69.99, rating: 4.9, reviews: 265, emoji: '🌸' },
  { id: 4, name: 'Women Maxi Dress', category: 'Women', price: 49.99, oldPrice: 79.99, rating: 4.7, reviews: 217, emoji: '👗' },
  { id: 5, name: 'Fossil Chronograph Watch', category: 'Watches', price: 49.99, rating: 4.5, reviews: 189, emoji: '⌚' },
  { id: 6, name: 'Leather Crossbody Bag', category: 'Bags', price: 89.99, oldPrice: 119.99, rating: 4.6, reviews: 156, emoji: '👜' },
  { id: 7, name: 'Kids T-Shirt Pack', category: 'Kids', price: 29.99, rating: 4.4, reviews: 124, emoji: '👕' },
  { id: 8, name: 'Running Sneakers', category: 'Shoes', price: 129.99, oldPrice: 149.99, rating: 4.7, reviews: 203, emoji: '👟' },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Featured');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const FilterContent = () => (
    <>
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-purple-600">
              <input 
                type="radio" 
                name="category" 
                checked={activeCategory === cat}
                onChange={() => { setActiveCategory(cat); setShowFilters(false); }}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <input type="range" className="w-full accent-purple-600" min="0" max="500" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0</span>
          <span>$500</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Rating</h4>
        {[5, 4, 3, 2, 1].map(stars => (
          <label key={stars} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-purple-600" />
            <div className="flex text-yellow-400 text-sm">
              {'★'.repeat(stars)}{'☆'.repeat(5-stars)}
            </div>
            <span className="text-xs text-gray-500">& Up</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
        <Link to="/" className="hover:text-black cursor-pointer">Home</Link>
        <span>/</span>
        <span className="text-black font-medium">Products</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 sticky top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
            <div className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 overflow-y-auto p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl border border-gray-200 gap-2 md:gap-4">
            <p className="text-xs md:text-sm text-gray-600">
              <span className="font-semibold text-black">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              >
                <Filter className="w-3 h-3" /> Filter
              </button>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs md:text-sm border border-gray-200 rounded-lg px-2 md:px-3 py-1.5 focus:outline-none focus:border-purple-500 max-w-[140px] md:max-w-none"
              >
                {sortOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-2 md:pl-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 md:p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 md:p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                >
                  <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className={`grid gap-3 md:gap-5 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProducts.map(product => (
              <Link 
                to={`/products/${product.id}`}
                key={product.id} 
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${viewMode === 'grid' ? 'h-36 md:h-48' : 'h-32 w-32'}`}>
                  <span className="text-4xl md:text-5xl">{product.emoji}</span>
                </div>
                <div className="p-3 md:p-4">
                  <p className="text-[10px] md:text-xs text-gray-400 mb-1">{product.category}</p>
                  <h3 className="font-medium text-xs md:text-base text-gray-800 mb-1 md:mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-1 md:mb-2">
                    <span className="text-yellow-400 text-xs md:text-sm">{'★'.repeat(Math.floor(product.rating))}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className="font-bold text-sm md:text-lg">${product.price}</span>
                    {product.oldPrice && (
                      <span className="text-xs md:text-sm text-gray-400 line-through">${product.oldPrice}</span>
                    )}
                  </div>
                  <button className="w-full mt-2 md:mt-3 py-1.5 md:py-2 bg-black text-white text-xs md:text-sm rounded-lg hover:bg-gray-800 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
