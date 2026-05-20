import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sign in to Ahmad Costimetics</p>
        </div>

        {/* Clerk Sign-In Component */}
        <SignIn 
          routing="path" 
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl border border-gray-100 rounded-2xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 
                'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              socialButtonsBlockButtonText: 'font-medium text-gray-700',
              formButtonPrimary: 
                'bg-black hover:bg-gray-800 text-white normal-case',
              footerActionLink: 'text-black hover:text-gray-700',
              identityPreviewEditButton: 'text-purple-600',
              formFieldInput: 
                'border border-gray-200 focus:border-black focus:ring-1 focus:ring-black',
            },
            variables: {
              colorPrimary: '#000000',
              colorText: '#1f2937',
              borderRadius: '0.5rem',
            },
          }}
        />
      </div>
    </div>
  );
}
