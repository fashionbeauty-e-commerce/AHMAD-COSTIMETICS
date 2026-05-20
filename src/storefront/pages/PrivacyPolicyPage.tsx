import { Shield, Lock, Eye, FileText, Mail, Phone } from 'lucide-react';
import { CONFIG } from '../../config';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 15, 2026';

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
      </div>

      {/* Quick Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 mb-8 border border-purple-100">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          Privacy at a Glance
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ We protect your personal information with industry-standard encryption</li>
          <li>✓ We never sell your data to third parties</li>
          <li>✓ You can delete your account and data anytime</li>
          <li>✓ We only collect what's necessary to provide our services</li>
        </ul>
      </div>

      <div className="prose prose-sm md:prose-base max-w-none space-y-6 md:space-y-8">
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            1. Introduction
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to {CONFIG.COMPANY.NAME} ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">2. Information We Collect</h2>
          <h3 className="font-semibold mt-4 mb-2">Personal Information</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely via Stripe/PayPal)</li>
            <li>Account credentials (encrypted)</li>
            <li>Order history and preferences</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">Automatic Information</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>IP address and browser type</li>
            <li>Device information and operating system</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send promotional emails (only with your consent)</li>
            <li>Prevent fraud and ensure security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            4. Data Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We implement industry-standard security measures including SSL encryption, secure payment processing, regular security audits, and access controls to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">5. Sharing Your Information</h2>
          <p className="text-gray-700 mb-3">We do NOT sell your personal information. We may share data with:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li><strong>Payment Processors</strong>: Stripe, PayPal (for payment processing)</li>
            <li><strong>Shipping Partners</strong>: To deliver your orders</li>
            <li><strong>Authentication</strong>: Clerk (for secure login)</li>
            <li><strong>Cloud Services</strong>: Firebase, Cloudinary (for data storage)</li>
            <li><strong>Legal Authorities</strong>: When required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">6. Your Rights (GDPR/CCPA)</h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li><strong>Access</strong> your personal data</li>
            <li><strong>Correct</strong> inaccurate information</li>
            <li><strong>Delete</strong> your account and data</li>
            <li><strong>Object</strong> to data processing</li>
            <li><strong>Export</strong> your data</li>
            <li><strong>Withdraw consent</strong> for marketing</li>
            <li><strong>Lodge complaints</strong> with regulatory authorities</li>
          </ul>
          <p className="text-gray-700 mt-3">
            To exercise these rights, contact us at <a href={`mailto:${CONFIG.COMPANY.EMAIL}`} className="text-purple-600 hover:underline">{CONFIG.COMPANY.EMAIL}</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">7. Cookies & Tracking</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar tracking technologies. For details, see our <a href="/cookie-policy" className="text-purple-600 hover:underline font-medium">Cookie Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">8. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for children under 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">9. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your personal information only as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">10. International Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">11. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our website. Your continued use after changes indicates acceptance.
          </p>
        </section>

        <section className="bg-gray-50 rounded-xl p-4 md:p-6 mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">12. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or your data, please contact us:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-purple-600" />
              <a href={`mailto:${CONFIG.COMPANY.EMAIL}`} className="hover:text-purple-600">
                {CONFIG.COMPANY.EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-purple-600" />
              <span>{CONFIG.COMPANY.PHONE}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
