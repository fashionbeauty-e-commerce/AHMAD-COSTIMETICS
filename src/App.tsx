import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import StorefrontLayout from './storefront/StorefrontLayout';
import HomePage from './storefront/pages/HomePage';
import ProductsPage from './storefront/pages/ProductsPage';
import ProductDetailPage from './storefront/pages/ProductDetailPage';
import CartPage from './storefront/pages/CartPage';
import CheckoutPage from './storefront/pages/CheckoutPage';
import AboutPage from './storefront/pages/AboutPage';
import ContactPage from './storefront/pages/ContactPage';
import WishlistPage from './storefront/pages/WishlistPage';
import AccountPage from './storefront/pages/AccountPage';
import FAQPage from './storefront/pages/FAQPage';
import SignInPage from './storefront/pages/SignInPage';
import SignUpPage from './storefront/pages/SignUpPage';
import SearchPage from './storefront/pages/SearchPage';
import PrivacyPolicyPage from './storefront/pages/PrivacyPolicyPage';
import TermsPage from './storefront/pages/TermsPage';
import CookiePolicyPage from './storefront/pages/CookiePolicyPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import AdminCategories from './admin/pages/AdminCategories';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminSettings from './admin/pages/AdminSettings';
import AdminChat from './admin/pages/AdminChat';
import AdminUsers from './admin/pages/AdminUsers';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminBrands from './admin/pages/AdminBrands';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminReviews from './admin/pages/AdminReviews';
import AdminSalesChannels from './admin/pages/AdminSalesChannels';
import { hasAdminAccess, isSuperAdmin, getAdminDetails, updateLastLogin } from './services/adminAuth';
import { CONFIG } from './config';

const CLERK_PUBLISHABLE_KEY = CONFIG.CLERK.PUBLISHABLE_KEY || 'pk_test_aG90LWxhY2V3aW5nLTQwLmNsZXJrLmFjY291bnRzLmRldiQ';

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('⚠️ Missing Clerk Publishable Key - Authentication will not work');
}

interface AuthUser {
  uid?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminRole?: string;
  permissions?: string[];
}

// Custom auth hook that combines Clerk with admin checking
export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn && clerkUser) {
        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        
        try {
          // Import auth API
          const { authAPI, setAuthToken } = await import('./services/api');
          
          // Sync Clerk user to backend and get JWT token
          const authData = await authAPI.syncClerk(
            email,
            clerkUser.firstName || '',
            clerkUser.lastName || '',
            clerkUser.id,
            clerkUser.imageUrl || undefined
          );
          
          // Store JWT token for API calls
          if (authData.token) {
            setAuthToken(authData.token);
          }
          
          // Check admin access
          const adminAccess = await hasAdminAccess(email);
          const superAdmin = isSuperAdmin(email);
          const adminDetails = adminAccess ? await getAdminDetails(email) : null;
          
          // Update last login if admin
          if (adminAccess && !superAdmin) {
            updateLastLogin(email);
          }

          setUser({
            uid: clerkUser.id,
            email,
            name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            picture: clerkUser.imageUrl,
            isAdmin: adminAccess,
            isSuperAdmin: superAdmin,
            adminRole: adminDetails?.role,
            permissions: adminDetails?.permissions || [],
          });
        } catch (error) {
          console.error('Auth state error:', error);
          setUser({
            uid: clerkUser.id,
            email,
            name: clerkUser.fullName || email,
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            picture: clerkUser.imageUrl,
            isAdmin: false,
            isSuperAdmin: false,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [isLoaded, isSignedIn, clerkUser]);

  const signOut = async () => {
    const { clearAuthToken } = await import('./services/api');
    clearAuthToken();
    await clerkSignOut();
    setUser(null);
  };

  const refresh = async () => {
    if (clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const adminAccess = await hasAdminAccess(email);
      const superAdmin = isSuperAdmin(email);
      setUser(prev => prev ? { ...prev, isAdmin: adminAccess, isSuperAdmin: superAdmin } : null);
    }
  };

  return { user, loading: loading || !isLoaded, refresh, signOut };
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in?redirect_url=/admin" />;
  }

  if (!user.isAdmin) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md text-center border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-2">This area is restricted to authorized administrators only.</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-6 mt-4">
            <p className="text-xs text-gray-500 mb-1">Logged in as:</p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            If you believe you should have access, please contact a super administrator.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="search" element={<SearchPage />} />
          
          {/* Legal Pages */}
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-service" element={<TermsPage />} />
          <Route path="cookie-policy" element={<CookiePolicyPage />} />
          
          {/* Authentication Routes - Clerk handles all OAuth flows */}
          <Route path="sign-in/*" element={<SignInPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
        </Route>
      
      {/* Admin Routes - Hidden, only accessible via direct URL */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="channels" element={<AdminSalesChannels />} />
            <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignInUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/'}
      afterSignUpUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || '/'}
      signInUrl={import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in'}
      signUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up'}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}

// Re-export Clerk components for convenience
export { SignedIn, SignedOut };
