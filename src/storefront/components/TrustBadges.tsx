import { Truck, RotateCcw, ShieldCheck, Award, Headphones } from 'lucide-react';

const badges = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% secure checkout' },
  { icon: Award, title: 'Top Quality', desc: 'Premium products only' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here for you" },
];

export default function TrustBadges() {
  return (
    <div className="border-t border-b border-gray-100 py-6 md:py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm text-gray-800 truncate">{title}</p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
