import { Link } from 'react-router-dom';
import { Truck, Sparkles, Headphones, MapPin } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-black text-white text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 md:gap-2 truncate">
          <Truck className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
          <span className="truncate">Free Shipping over $50</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>New Arrivals Just Dropped – Shop Now</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <Link to="/contact" className="hidden sm:flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <Headphones className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Customer </span>Support
          </Link>
          <Link to="/account" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Track Order</span>
            <span className="sm:hidden">Track</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
