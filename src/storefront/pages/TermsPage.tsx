import { FileText, Scale, AlertTriangle, Mail } from 'lucide-react';
import { CONFIG } from '../../config';

export default function TermsPage() {
  const lastUpdated = 'June 15, 2026';

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-bold text-amber-900 mb-2">Important</h2>
            <p className="text-sm text-amber-800">
              Please read these Terms of Service carefully. By accessing or using {CONFIG.COMPANY.NAME}, you agree to be bound by these terms.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            1. Agreement to Terms
          </h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using the {CONFIG.COMPANY.NAME} website ("Service") operated by us, you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">2. Account Registration</h2>
          <p className="text-gray-700 mb-3">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Maintaining the security of your account and password</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring your information is up-to-date</li>
          </ul>
          <p className="text-gray-700 mt-3">
            We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">3. Products and Pricing</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>All product descriptions and pricing are subject to change without notice</li>
            <li>We reserve the right to limit quantities and refuse orders</li>
            <li>Prices are displayed in USD unless otherwise stated</li>
            <li>Product images are for illustration; actual products may vary slightly</li>
            <li>We strive for accuracy but errors may occur in product descriptions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">4. Orders and Payment</h2>
          <p className="text-gray-700 mb-3">By placing an order, you:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Confirm you are 18 years or older (or have parental consent)</li>
            <li>Authorize us to charge your payment method</li>
            <li>Agree to provide accurate billing and shipping information</li>
            <li>Accept that orders are subject to availability</li>
          </ul>
          <p className="text-gray-700 mt-3">
            We accept Visa, MasterCard, PayPal, Mobile Money, and Bank Transfer. Payment must be received before order processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">5. Shipping and Delivery</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Delivery times are estimates and not guaranteed</li>
            <li>Risk of loss passes to you upon delivery</li>
            <li>You are responsible for providing accurate shipping information</li>
            <li>Free shipping applies to orders over $50</li>
            <li>International shipping may incur customs fees (your responsibility)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">6. Returns and Refunds</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>30-day return policy from date of delivery</li>
            <li>Items must be unused, in original packaging</li>
            <li>Sale and intimate items are final sale</li>
            <li>Refunds processed within 5-7 business days</li>
            <li>Customer pays return shipping unless item is defective</li>
            <li>Refunds issued to original payment method</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">7. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            All content on this website—text, graphics, logos, images, audio, video, and software—is the property of {CONFIG.COMPANY.NAME} or its content suppliers and is protected by international copyright laws. Unauthorized use is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">8. User Content</h2>
          <p className="text-gray-700 mb-3">When you post reviews, comments, or other content, you:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>Grant us a worldwide, royalty-free license to use it</li>
            <li>Confirm the content is original and lawful</li>
            <li>Take responsibility for the content's accuracy</li>
            <li>Agree not to post offensive, illegal, or harmful content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">9. Prohibited Uses</h2>
          <p className="text-gray-700 mb-3">You may not use our Service:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
            <li>For any unlawful purpose</li>
            <li>To violate any laws or regulations</li>
            <li>To infringe upon others' intellectual property rights</li>
            <li>To harass, abuse, or harm another person</li>
            <li>To submit false or misleading information</li>
            <li>To upload viruses or malicious code</li>
            <li>To collect users' information without consent</li>
            <li>To interfere with the security features of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">11. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            In no event shall {CONFIG.COMPANY.NAME}, its directors, employees, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our total liability shall not exceed the amount you paid for the product or service in question.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">12. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed">
            You agree to indemnify and hold harmless {CONFIG.COMPANY.NAME} and its affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">13. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of {CONFIG.COMPANY.ADDRESS}.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">14. Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We may terminate or suspend your account at any time without prior notice for conduct that violates these Terms or is harmful to other users, us, or third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-3">15. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these Terms at any time. Updated terms will be posted on this page with a new "Last Updated" date. Continued use of the Service after changes constitutes acceptance.
          </p>
        </section>

        <section className="bg-gray-50 rounded-xl p-4 md:p-6 mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">16. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-blue-600" />
              <a href={`mailto:${CONFIG.COMPANY.EMAIL}`} className="hover:text-blue-600">
                {CONFIG.COMPANY.EMAIL}
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Address:</strong> {CONFIG.COMPANY.ADDRESS}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> {CONFIG.COMPANY.PHONE}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
