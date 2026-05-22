import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, LogOut, Package, Menu, X, Shield, Crown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../App';
import { getCartCount, getWishlistCount } from '../../services/cartStore';
import NotificationBell from './NotificationBell';
import { VoiceSearchButton, CameraSearchButton, QRScannerButton } from './SearchEnhancements';

export default function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(getCartCount());
  const [wishlistCount, setWishlistCount] = useState(getWishlistCount());
  const menuRef = useRef<HTMLDivElement>(null);

  // Listen for cart/wishlist updates from anywhere in the app
  useEffect(() => {
    const onCartUpdate = () => setCartCount(getCartCount());
    const onWishlistUpdate = () => setWishlistCount(getWishlistCount());
    window.addEventListener('cart-updated', onCartUpdate);
    window.addEventListener('wishlist-updated', onWishlistUpdate);
    return () => {
      window.removeEventListener('cart-updated', onCartUpdate);
      window.removeEventListener('wishlist-updated', onWishlistUpdate);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 py-3 md:py-4 px-3 md:px-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 md:gap-8">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          aria-label="Menu"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0">
          <div className="w-9 h-9 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-base md:text-lg">A</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight leading-none">Ahmad</h1>
            <span className="text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] text-gray-500 uppercase">Costimetics</span>
          </div>
        </Link>

        {/* Search Bar - Desktop with Camera, Voice, QR */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl">
          <div className="relative flex items-center border border-gray-300 rounded-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 py-2.5 px-5 text-sm focus:outline-none rounded-l-lg bg-transparent"
            />
            <div className="flex items-center gap-0.5 px-1 border-l border-gray-200">
              <CameraSearchButton />
              <VoiceSearchButton onResult={(text) => { setSearchQuery(text); navigate(`/search?q=${encodeURIComponent(text)}`); }} />
              <QRScannerButton />
            </div>
            <button type="submit" className="px-3 py-2.5 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {!user ? (
            <Link 
              to="/sign-in"
              className="flex items-center gap-2 hover:text-gray-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <div className="hidden md:block text-left text-sm">
                <p className="text-xs text-gray-500">Sign In</p>
                <p className="font-medium text-sm leading-none">My Account</p>
              </div>
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 md:gap-3 relative"
              >
                <div className="relative">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold">
                      {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="hidden lg:block text-left text-sm">
                  <p className="text-xs text-gray-500">Welcome,</p>
                  <p className="font-medium text-sm leading-none">{user.firstName || user.email.split('@')[0]}</p>
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold truncate flex-1">{user.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link to="/account" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/account" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <div className="border-t my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          <Link to="/wishlist" className="hidden sm:flex items-center gap-1 hover:text-gray-600 transition-colors relative">
            <Heart className="w-5 h-5" />
            <span className="hidden xl:inline text-sm">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-right-3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{wishlistCount}</span>
            )}
          </Link>
          <Link to="/cart" className="flex items-center gap-1 hover:text-gray-600 transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden xl:inline text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-right-3 bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar with Voice, Camera, QR */}
      {showSearch && (
        <form onSubmit={handleSearch} className="md:hidden mt-3 pb-1">
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-black">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="flex-1 py-2.5 px-3 text-sm focus:outline-none bg-transparent"
            />
            <div className="flex items-center gap-0.5 pr-1 border-l border-gray-200 ml-1">
              <CameraSearchButton />
              <VoiceSearchButton onResult={(text) => { setSearchQuery(text); navigate(`/search?q=${encodeURIComponent(text)}`); }} />
              <QRScannerButton />
            </div>
          </div>
        </form>
      )}

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Shop', path: '/products' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
                { label: 'FAQ', path: '/faq' },
                { label: 'My Cart', path: '/cart' },
                { label: 'Wishlist', path: '/wishlist' },
                { label: 'My Account', path: '/account' },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-4 py-3 hover:bg-gray-50 rounded-lg text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
