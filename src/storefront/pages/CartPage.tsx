import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Truck, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { getCart, removeFromCart, updateCartQuantity, clearCart, type CartItem } from '../../services/cartStore';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(getCart());
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Listen for cart changes
  useEffect(() => {
    const onCartUpdate = (e: any) => setCartItems(e.detail || getCart());
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, []);

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newItems = updateCartQuantity(id, item.quantity + delta);
      setCartItems(newItems);
    }
  };

  const handleRemove = (id: string) => {
    const newItems = removeFromCart(id);
    setCartItems(newItems);
  };

  const handleClear = () => {
    if (confirm('Clear all items from cart?')) {
      clearCart();
      setCartItems([]);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      alert('Coupon applied! 10% off');
    } else {
      alert('Invalid promo code');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 py-4 md:py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Shopping Cart</h1>
      <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-8">
        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
      </p>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-sm md:text-base text-gray-500 mb-6">Browse our products and add items to your cart.</p>
          <Link to="/search" className="inline-block px-6 md:px-8 py-2.5 md:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cartItems.map(item => (
              <div key={item.id + (item.size || '') + (item.color || '')} className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                <div className="flex gap-3 md:gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">{item.emoji || '📦'}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {item.brand && (
                      <p className="text-[10px] md:text-xs text-purple-600 uppercase font-semibold">{item.brand}</p>
                    )}
                    <h3 className="font-medium text-sm md:text-base text-gray-800 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>| Color: {item.color}</span>}
                      {item.category && <span>| {item.category}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-2 md:mt-3">
                      {/* Price */}
                      <div>
                        <span className="font-bold text-sm md:text-base">${item.price}</span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through ml-2">${item.compareAtPrice}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1.5 md:p-2 hover:bg-gray-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 md:w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1.5 md:p-2 hover:bg-gray-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <p className="text-right text-xs text-gray-500 mt-1">
                      Subtotal: <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-2">
              <Link to="/search" className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                ← Continue Shopping
              </Link>
              <button 
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              {/* Promo Code */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? '🎉 FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-base">Total</span>
                  <span className="text-xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Truck className="w-4 h-4" />
                {subtotal >= 50 ? '✓ You qualify for free shipping!' : `Add $${(50 - subtotal).toFixed(2)} for free shipping`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
