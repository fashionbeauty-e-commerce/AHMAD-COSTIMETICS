import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      // Save to Firebase
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        source: 'homepage_newsletter',
        active: true,
      });

      setStatus('success');
      setMessage(`🎉 Welcome! Check ${email} for your 10% off code.`);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error: any) {
      setStatus('error');
      setMessage('Subscription failed. Please try again.');
      console.error('Newsletter error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-10 md:py-14">
      <div className="max-w-[1400px] mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">Stay in the Loop</h2>
        <p className="text-sm md:text-base text-purple-200 mb-6 md:mb-8 max-w-md mx-auto">
          Subscribe and get 10% off your first order plus exclusive access to new arrivals.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch max-w-md mx-auto gap-2 sm:gap-0">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="flex-1 py-3 px-4 md:px-5 rounded-lg sm:rounded-r-none text-sm focus:outline-none disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={loading || !email.trim()}
            className="bg-black text-white py-3 px-6 rounded-lg sm:rounded-l-none hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in ${
            status === 'success' 
              ? 'bg-green-500/20 text-white border border-green-400/30' 
              : 'bg-red-500/20 text-white border border-red-400/30'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message}
          </div>
        )}

        <p className="text-xs text-purple-200/70 mt-6">
          🔒 We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
