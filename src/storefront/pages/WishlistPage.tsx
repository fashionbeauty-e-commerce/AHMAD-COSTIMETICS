import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { getWishlist, removeFromWishlist, type WishlistItem } from '../../services/cartStore';
import { addToCart } from '../../services/cartStore';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(getWishlist());

  useEffect(() => {
    const onUpdate = (e: any) => setWishlistItems(e.detail || getWishlist());
    window.addEventListener('wishlist-updated', onUpdate);
    return () => window.removeEventListener('wishlist-updated', onUpdate);
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeFromWishlist(id);
    setWishlistItems(updated);
  };

  const handleMoveToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      emoji: item.emoji,
      thumbnail: item.thumbnail,
      category: item.category,
    });
    handleRemove(item.id);
    alert(`${item.name} moved to cart!`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
          <p className="text-sm text-gray-500">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        <Link to="/search" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
          Continue Shopping →
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist.</p>
          <Link to="/search" className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {wishlistItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
              <Link to={`/products/${item.id}`} className="block">
                <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-6xl">{item.emoji || '❤️'}</span>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </Link>
              <div className="p-3 md:p-4">
                {item.brand && (
                  <p className="text-[10px] md:text-xs text-purple-600 uppercase font-semibold">{item.brand}</p>
                )}
                <h3 className="font-medium text-xs md:text-sm text-gray-800 mb-2 line-clamp-2">{item.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-sm md:text-base">${item.price}</span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-xs text-gray-400 line-through">${item.compareAtPrice}</span>
                  )}
                </div>
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={!item.inStock}
                  className="w-full py-2 bg-black text-white rounded-lg text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {item.inStock ? 'Move to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
