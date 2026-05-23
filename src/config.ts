import { getApiBaseUrl } from './utils/apiBase';

// All sensitive data is loaded from environment variables
export const CONFIG = {
  BASE_URL: getApiBaseUrl(),
  
  COMPANY: {
    NAME: import.meta.env.VITE_COMPANY_NAME || 'Ahmad Costimetics',
    EMAIL: import.meta.env.VITE_COMPANY_EMAIL || '',
    PHONE: import.meta.env.VITE_COMPANY_PHONE || '',
    ADDRESS: import.meta.env.VITE_COMPANY_ADDRESS || '',
    HOURS_WEEKDAY: import.meta.env.VITE_COMPANY_HOURS_WEEKDAY || '',
    HOURS_WEEKEND: import.meta.env.VITE_COMPANY_HOURS_WEEKEND || '',
  },
  
  SOCIAL: {
    FACEBOOK: import.meta.env.VITE_FACEBOOK_URL || '#',
    TIKTOK: import.meta.env.VITE_TIKTOK_URL || '#',
    WHATSAPP: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`,
    INSTAGRAM: import.meta.env.VITE_INSTAGRAM_URL || '#',
  },
  
  SANITY: {
    PROJECT_ID: import.meta.env.VITE_SANITY_PROJECT_ID || '',
    DATASET: import.meta.env.VITE_SANITY_DATASET || 'production',
    API_VERSION: import.meta.env.VITE_SANITY_API_VERSION || '2026-11-09',
    TOKEN: import.meta.env.VITE_SANITY_TOKEN || '',
  },
  
  CLERK: {
    // Hardcoded fallback ensures Clerk works even if env vars aren't loaded
    PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aG90LWxhY2V3aW5nLTQwLmNsZXJrLmFjY291bnRzLmRldiQ',
  },
  
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
    MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  },
  
  ADMIN: {
    EMAILS: (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim()),
  }
};
