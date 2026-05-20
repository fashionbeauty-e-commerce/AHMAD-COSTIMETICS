import { useState, useEffect } from 'react';
import { Cookie, Settings, ToggleLeft, ToggleRight, Mail, Info } from 'lucide-react';
import { CONFIG } from '../../config';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookiePolicyPage() {
  const lastUpdated = 'June 15, 2026';
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: true,
    marketing: false,
    functional: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie_preferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
    localStorage.setItem('cookie_consent', 'true');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const acceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(all);
    localStorage.setItem('cookie_preferences', JSON.stringify(all));
    localStorage.setItem('cookie_consent', 'true');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rejectOptional = () => {
    const minimal: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(minimal);
    localStorage.setItem('cookie_preferences', JSON.stringify(minimal));
    localStorage.setItem('cookie_consent', 'true');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cookieCategories = [
    {
      key: 'necessary' as const,
      title: 'Strictly Necessary Cookies',
      icon: '🔒',
      description: 'Essential for the website to function. Cannot be disabled.',
      examples: ['User authentication', 'Shopping cart', 'Security tokens', 'Form submissions'],
      always: true,
    },
    {
      key: 'functional' as const,
      title: 'Functional Cookies',
      icon: '⚙️',
      description: 'Enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'Region settings', 'Recently viewed products', 'Theme preferences'],
    },
    {
      key: 'analytics' as const,
      title: 'Analytics Cookies',
      icon: '📊',
      description: 'Help us understand how visitors interact with our website.',
      examples: ['Page views', 'Traffic sources', 'User behavior', 'Performance metrics'],
    },
    {
      key: 'marketing' as const,
      title: 'Marketing Cookies',
      icon: '📣',
      description: 'Used to track visitors and show relevant advertisements.',
      examples: ['Targeted ads', 'Social media tracking', 'Conversion tracking', 'Retargeting'],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Cookie className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
      </div>

      {/* Cookie Preferences Manager */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 mb-8 border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg md:text-xl font-bold">Manage Your Cookie Preferences</h2>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          You're in control. Choose which cookies you allow us to use. Essential cookies are required for the site to function.
        </p>

        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ Your preferences have been saved successfully!
          </div>
        )}

        <div className="space-y-3">
          {cookieCategories.map(cat => (
            <div key={cat.key} className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{cat.icon}</span>
                    <h3 className="font-semibold text-sm md:text-base">{cat.title}</h3>
                    {cat.always && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Always Active</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2">{cat.description}</p>
                  <div className="text-xs text-gray-500">
                    <strong>Examples:</strong> {cat.examples.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => togglePreference(cat.key)}
                  disabled={cat.always}
                  className={`shrink-0 ${cat.always ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {preferences[cat.key] ? (
                    <ToggleRight className="w-10 h-10 text-purple-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={savePreferences}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm"
          >
            Save My Preferences
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 text-sm"
          >
            Accept All Cookies
          </button>
          <button
            onClick={rejectOptional}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm"
          >
            Reject Optional
          </button>
        </div>
      </div>

      {/* Educational Content */}
      <div className="space-y-6 md:space-y-8">
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-600" />
            What Are Cookies?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files that are placed on your device when you visit a website. They help websites remember information about your visit, making your next visit easier and the site more useful to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">How We Use Cookies</h2>
          <p className="text-gray-700 mb-3">
            {CONFIG.COMPANY.NAME} uses cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Keep you signed in to your account</li>
            <li>Remember items in your shopping cart</li>
            <li>Personalize your shopping experience</li>
            <li>Analyze website performance and traffic</li>
            <li>Show relevant advertisements</li>
            <li>Prevent fraud and ensure security</li>
            <li>Improve our products and services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Types of Cookies We Use</h2>
          
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Session Cookies</h3>
              <p className="text-sm text-gray-700">
                Temporary cookies that are deleted when you close your browser. Used to maintain your shopping session.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Persistent Cookies</h3>
              <p className="text-sm text-gray-700">
                Remain on your device for a set period (typically 30 days to 2 years). Used to remember your preferences and login.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Third-Party Cookies</h3>
              <p className="text-sm text-gray-700">
                Set by external services we use (e.g., Google Analytics, Stripe, Clerk for authentication). Each has its own privacy policy.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Third-Party Services</h2>
          <p className="text-gray-700 mb-3">We use these third-party services that may set cookies:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Service</th>
                  <th className="text-left p-3">Purpose</th>
                  <th className="text-left p-3">Privacy Policy</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">Clerk</td>
                  <td className="p-3 text-gray-600">Authentication</td>
                  <td className="p-3"><a href="https://clerk.com/privacy" target="_blank" rel="noopener" className="text-purple-600 hover:underline">View</a></td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Stripe</td>
                  <td className="p-3 text-gray-600">Payment Processing</td>
                  <td className="p-3"><a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-purple-600 hover:underline">View</a></td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Firebase</td>
                  <td className="p-3 text-gray-600">Database & Real-time Chat</td>
                  <td className="p-3"><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener" className="text-purple-600 hover:underline">View</a></td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Cloudinary</td>
                  <td className="p-3 text-gray-600">Image Storage</td>
                  <td className="p-3"><a href="https://cloudinary.com/privacy" target="_blank" rel="noopener" className="text-purple-600 hover:underline">View</a></td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Google Analytics</td>
                  <td className="p-3 text-gray-600">Website Analytics</td>
                  <td className="p-3"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-purple-600 hover:underline">View</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Managing Cookies in Your Browser</h2>
          <p className="text-gray-700 mb-3">
            You can also control cookies through your browser settings. Note that disabling cookies may affect functionality.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
              { name: 'Firefox', url: 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer' },
              { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
              { name: 'Edge', url: 'https://support.microsoft.com/help/4027947' },
            ].map(browser => (
              <a
                key={browser.name}
                href={browser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:text-purple-600 text-sm font-medium"
              >
                {browser.name}
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Do Not Track Signals</h2>
          <p className="text-gray-700 leading-relaxed">
            Some browsers offer a "Do Not Track" (DNT) signal. While we strive to respect your privacy choices, our website does not currently respond to DNT signals due to lack of industry standardization.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Updates to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy from time to time. Any changes will be posted here with an updated "Last Updated" date.
          </p>
        </section>

        <section className="bg-gray-50 rounded-xl p-4 md:p-6 mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about our Cookie Policy:
          </p>
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-amber-600" />
            <a href={`mailto:${CONFIG.COMPANY.EMAIL}`} className="hover:text-amber-600">
              {CONFIG.COMPANY.EMAIL}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
