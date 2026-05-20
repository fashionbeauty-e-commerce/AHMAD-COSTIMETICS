import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const faqs = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days within Nigeria. Express shipping is available for 1-2 business day delivery.' },
      { q: 'How can I track my order?', a: 'Once your order ships, you will receive an email with a tracking number. You can also track your order in your account under "My Orders".' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free standard shipping on all orders over $50.' },
      { q: 'Do you ship internationally?', a: 'Currently, we only ship within Nigeria. International shipping coming soon!' },
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 30-day return policy for all unused items in original packaging. Sale items are final sale.' },
      { q: 'How do I return an item?', a: 'Contact our support team to initiate a return. We will provide a return label and instructions.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after we receive your returned item.' },
    ]
  },
  {
    category: 'Products',
    items: [
      { q: 'Are your products authentic?', a: 'Yes! All our products are 100% authentic and sourced directly from authorized distributors.' },
      { q: 'What if an item is out of stock?', a: 'You can join the waitlist and we will notify you when the item is back in stock.' },
      { q: 'Do you offer size exchanges?', a: 'Yes, size exchanges are available within 14 days of delivery, subject to availability.' },
    ]
  },
  {
    category: 'Payment',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, Paystack, bank transfers, and cash on delivery for select areas.' },
      { q: 'Is my payment information secure?', a: 'Absolutely! We use SSL encryption and never store your full card details.' },
      { q: 'Can I pay on delivery?', a: 'Cash on delivery is available for orders under ₦100,000 in select cities.' },
    ]
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="max-w-[900px] mx-auto px-3 md:px-4 py-6 md:py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-500">Find answers to common questions about our products and services.</p>
      </div>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {filteredFaqs.map((category, catIndex) => (
          <div key={category.category}>
            <h2 className="text-xl font-bold mb-4">{category.category}</h2>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => {
                const id = `${catIndex}-${itemIndex}`;
                const isOpen = openItems.includes(id);
                return (
                  <div key={id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">{item.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-gray-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 text-center p-8 bg-purple-50 rounded-xl">
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">Can't find the answer you're looking for? Please contact our support team.</p>
        <a href="/contact" className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
          Contact Support
        </a>
      </div>
    </div>
  );
}
