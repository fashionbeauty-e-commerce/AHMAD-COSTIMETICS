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
          
          setUser({
            uid: clerkUser.id,
            email,
            name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            firstName: clerkUser.firstName || undefined,
            lastName: clerkUser.lastName || undefined,
            picture: clerkUser.imageUrl,
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
    // No-op for now as admin checks were removed
  };

  return { user, loading: loading || !isLoaded, refresh, signOut };
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
