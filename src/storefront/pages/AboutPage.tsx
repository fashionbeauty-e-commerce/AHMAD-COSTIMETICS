import { Award, Users, Globe, Heart } from 'lucide-react';
import { CONFIG } from '../../config';

const stats = [
  { icon: Users, value: '50K+', label: 'Happy Customers' },
  { icon: Award, value: '10+', label: 'Years Experience' },
  { icon: Globe, value: '15+', label: 'Countries Served' },
  { icon: Heart, value: '99%', label: 'Satisfaction Rate' },
];

const values = [
  { title: 'Quality First', desc: 'We source only the finest products from trusted brands worldwide.' },
  { title: 'Customer Centric', desc: 'Your satisfaction is our top priority, 24/7 support always available.' },
  { title: 'Sustainable Fashion', desc: 'Committed to eco-friendly practices and ethical sourcing.' },
  { title: 'Authentic Products', desc: '100% genuine products with verified authenticity guarantee.' },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">About {CONFIG.COMPANY.NAME}</h1>
          <p className="text-base md:text-xl text-purple-200 max-w-2xl mx-auto">
            Your trusted destination for fashion, beauty, and lifestyle products since 2014.
            Based in {CONFIG.COMPANY.ADDRESS}.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1400px] mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-xs md:text-base text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-gray-50 py-10 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Our Story</h2>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed">
                Founded in 2014, {CONFIG.COMPANY.NAME} started with a simple mission: to bring 
                the world's best fashion and beauty products to our customers. What began as a 
                small boutique has grown into a trusted e-commerce platform serving thousands 
                of customers across Nigeria and beyond.
              </p>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                We believe that everyone deserves to look and feel their best. That's why we 
                carefully curate our collection to offer premium quality at accessible prices.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl h-60 md:h-80 flex items-center justify-center order-first md:order-last">
              <span className="text-7xl md:text-8xl">🛍️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-[1400px] mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {values.map(({ title, desc }) => (
            <div key={title} className="bg-white p-5 md:p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-base md:text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
