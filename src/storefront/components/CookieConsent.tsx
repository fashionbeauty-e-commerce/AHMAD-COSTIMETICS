import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }));
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('cookie_preferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 md:p-4 animate-fade-in">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 md:p-6">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm md:text-base mb-1">We Value Your Privacy</h3>
              <p className="text-xs md:text-sm text-gray-600">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze traffic. 
                <Link to="/cookie-policy" className="text-purple-600 hover:underline ml-1 font-medium">
                  Learn more
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 whitespace-nowrap"
            >
              Essential Only
            </button>
            <Link
              to="/cookie-policy"
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 text-center whitespace-nowrap"
            >
              Customize
            </Link>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs md:text-sm font-medium hover:bg-gray-800 whitespace-nowrap"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
