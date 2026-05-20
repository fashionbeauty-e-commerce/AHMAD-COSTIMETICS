import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { CONFIG } from '../../config';
import { 
  FacebookIcon, 
  InstagramIcon, 
  TikTokIcon, 
  WhatsAppIcon,
  PaymentMethodsRow
} from '../../components/BrandIcons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg">{CONFIG.COMPANY.NAME}</h3>
                <span className="text-[8px] tracking-[0.2em] text-gray-400 uppercase">Costimetics</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
              Premium fashion, beauty & lifestyle products in {CONFIG.COMPANY.ADDRESS}.
            </p>
            <div className="flex gap-2 md:gap-3">
              <a 
                href={CONFIG.SOCIAL.FACEBOOK} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all" 
                title="Facebook"
              >
                <FacebookIcon size={20} className="text-[#1877F2]" />
              </a>
              <a 
                href={CONFIG.SOCIAL.INSTAGRAM} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all" 
                title="Instagram"
              >
                <InstagramIcon size={20} />
              </a>
              <a 
                href={CONFIG.SOCIAL.WHATSAPP} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all" 
                title="WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </a>
              <a 
                href={CONFIG.SOCIAL.TIKTOK} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all" 
                title="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Service</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Categories</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Kids</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Shoes</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Beauty</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Contact Us</h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 mt-0.5 shrink-0" />
                <span className="break-all">{CONFIG.COMPANY.EMAIL}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 mt-0.5 shrink-0" />
                <span>{CONFIG.COMPANY.PHONE}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 mt-0.5 shrink-0" />
                <span>{CONFIG.COMPANY.ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-8 md:mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-0 text-center md:text-left">We Accept</p>
            </div>
            <div className="bg-white p-2 md:p-3 rounded-xl">
              <PaymentMethodsRow size={28} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 text-xs md:text-sm text-gray-500">
          <p className="text-center md:text-left">© 2026 {CONFIG.COMPANY.NAME}. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
