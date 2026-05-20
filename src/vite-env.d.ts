/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_COMPANY_NAME: string
  readonly VITE_COMPANY_EMAIL: string
  readonly VITE_COMPANY_PHONE: string
  readonly VITE_COMPANY_ADDRESS: string
  readonly VITE_COMPANY_HOURS_WEEKDAY: string
  readonly VITE_COMPANY_HOURS_WEEKEND: string
  readonly VITE_FACEBOOK_URL: string
  readonly VITE_TIKTOK_URL: string
  readonly VITE_WHATSAPP_NUMBER: string
  readonly VITE_INSTAGRAM_URL: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
  readonly VITE_SANITY_API_VERSION: string
  readonly VITE_SANITY_TOKEN: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_CLERK_SIGN_IN_URL: string
  readonly VITE_CLERK_SIGN_UP_URL: string
  readonly VITE_CLERK_AFTER_SIGN_IN_URL: string
  readonly VITE_CLERK_AFTER_SIGN_UP_URL: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_API_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_PAYPAL_CLIENT_ID: string
  readonly VITE_FLUTTERWAVE_PUBLIC_KEY: string
  readonly VITE_DEFAULT_CURRENCY: string
  readonly VITE_SUPPORTED_CURRENCIES: string
  readonly VITE_COMPANY_EMAIL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
