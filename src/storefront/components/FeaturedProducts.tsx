import { useEffect, useState } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
}

const productColors = [
  'from-rose-50 to-pink-50',
  'from-blue-50 to-indigo-50',
  'from-amber-50 to-orange-50',
  'from-emerald-50 to-teal-50',
  'from-violet-50 to-purple-50',
  'from-cyan-50 to-sky-50',
  'from-yellow-50 to-amber-50',
  'from-fuchsia-50 to-pink-50',
];

// Demo fallback products if Firebase has no data yet
const demoProducts: Product[] = [
  { id: 'demo-1', name: 'Nike Air Jordan 1 Retro', brand: 'Nike', category: 'Shoes', price: 159.99, compareAtPrice: 189.99, rating: 4.8, numReviews: 342, emoji: '👟', isFeatured: true },
  { id: 'demo-2', name: 'Classic Black Hoodie', brand: 'Zara', category: 'Men', price: 59.99, rating: 4.6, numReviews: 298, emoji: '🧥', isNew: true },
  { id: 'demo-3', name: 'Ahmad Perfume Oud', brand: 'Ahmad', category: 'Beauty', price: 49.99, compareAtPrice: 69.99, rating: 4.9, numReviews: 265, emoji: '🌸' },
  { id: 'demo-4', name: 'Women Maxi Dress', brand: 'H&M', category: 'Women', price: 49.99, compareAtPrice: 79.99, rating: 4.7, numReviews: 217, emoji: '👗' },
  { id: 'demo-5', name: 'Fossil Watch', brand: 'Fossil', category: 'Watches', price: 49.99, rating: 4.5, numReviews: 189, emoji: '⌚' },
  { id: 'demo-6', name: 'Leather Bag', brand: 'Coach', category: 'Bags', price: 89.99, compareAtPrice: 119.99, rating: 4.6, numReviews: 156, emoji: '👜' },
  { id: 'demo-7', name: 'Adidas Yeezy Boost', brand: 'Adidas', category: 'Shoes', price: 229.99, rating: 4.8, numReviews: 412, emoji: '👟' },
  { id: 'demo-8', name: 'Zara Slim Shirt', brand: 'Zara', category: 'Men', price: 39.99, compareAtPrice: 54.99, rating: 4.4, numReviews: 178, emoji: '👔' },
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((firebaseProducts: any[]) => {
      const active = firebaseProducts.filter(p => p.isActive !== false);
      // Show featured first, then newest
      const featured = active.filter(p => p.isFeatured);
      const others = active.filter(p => !p.isFeatured);
      const sorted = [...featured, ...others].slice(0, 8);
      
      // If no products in Firebase, show demo products
      setProducts(sorted.length > 0 ? sorted : demoProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div data-section="featured-products" className="max-w-[1400px] mx-auto px-4 py-6 md:py-10 scroll-mt-24">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Featured Products</h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Handpicked just for you</p>
        </div>
        <Link to="/search" className="text-xs md:text-sm text-purple-600 hover:text-purple-800 font-medium">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {products.map((product, i) => (
            <Link
              to={`/products/${product.id}`}
              key={product.id}
              className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`relative h-36 sm:h-44 md:h-52 bg-gradient-to-br ${productColors[i % productColors.length]} flex items-center justify-center overflow-hidden`}>
                {product.thumbnail || product.images?.[0]?.url ? (
                  <img
                    src={product.thumbnail || product.images?.[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl">{product.emoji || '👕'}</span>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1">
                  {product.isFeatured && (
                    <span className="bg-amber-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
                      ⭐ Featured
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
                      🆕 New
                    </span>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="absolute top-2 md:top-3 right-2 md:right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 md:gap-2">
                  <button className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 hover:text-red-500" />
                  </button>
                  <button className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-50 transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-3 md:p-4">
                {product.brand && (
                  <p className="text-[10px] md:text-xs text-purple-600 uppercase font-semibold tracking-wide mb-1 truncate">
                    {product.brand}
                  </p>
                )}
                <h3 className="font-medium text-xs md:text-sm mb-1 md:mb-2 text-gray-800 group-hover:text-black transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {product.rating !== undefined && product.rating > 0 && (
                  <div className="flex items-center gap-1 mb-1 md:mb-2">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] md:text-xs font-medium text-gray-700">{product.rating.toFixed(1)}</span>
                    <span className="text-[10px] md:text-xs text-gray-400">({product.numReviews || 0})</span>
                  </div>
                )}
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                  <span className="font-bold text-sm md:text-base text-gray-900">${product.price}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs md:text-sm text-gray-400 line-through">${product.compareAtPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
