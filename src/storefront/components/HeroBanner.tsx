import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../../config';

interface Slide {
  tagline: string;
  title: string;
  highlight: string;
  description: string;
  shopNowPath: string;
  explorePath: string;
  image: string;
}

const slides: Slide[] = [
  {
    tagline: `Fashion & Beauty by ${CONFIG.COMPANY.NAME}`,
    title: 'Style. Confidence.',
    highlight: 'You.',
    description: `Discover the latest in fashion, footwear, and beauty in ${CONFIG.COMPANY.ADDRESS}.`,
    shopNowPath: '/search',
    explorePath: '/about',
    image: '/images/hero-banner.jpg',
  },
  {
    tagline: 'New Arrivals Just Dropped',
    title: 'Fresh Looks.',
    highlight: 'Now Available.',
    description: 'Explore our latest collection of trendy fashion and accessories. Limited stock!',
    shopNowPath: '/search?sort=newest',
    explorePath: '/products',
    image: '/images/new-arrivals.jpg',
  },
  {
    tagline: 'Beauty Essentials Collection',
    title: 'Glow Up.',
    highlight: 'Be Beautiful.',
    description: 'Premium beauty products for every skin type. Get the look you deserve.',
    shopNowPath: '/search?category=Beauty',
    explorePath: '/search?category=Beauty',
    image: '/images/beauty-essentials.jpg',
  },
];

export default function HeroBanner() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slide = slides[currentSlide];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handleShopNow = () => {
    // Navigate to shop with current slide's filter
    navigate(slide.shopNowPath);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplore = () => {
    // Scroll to featured products section on the same page
    const featuredSection = document.querySelector('[data-section="featured-products"]');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If section not found, navigate to products page
      navigate(slide.explorePath);
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] md:h-[550px] overflow-hidden group">
      {/* Background slides with transition */}
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 sm:via-white/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 h-full flex items-center">
        <div className="max-w-md md:max-w-lg animate-fade-in" key={currentSlide}>
          <p className="text-xs md:text-sm tracking-widest text-gray-600 mb-2 md:mb-4 uppercase font-medium">
            {slide.tagline}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-1 md:mb-2">
            {slide.title}
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-amber-500 italic mb-4 md:mb-6">
            {slide.highlight}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-8 leading-relaxed">
            {slide.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* SHOP NOW BUTTON - Navigates to products with category filter */}
            <button 
              onClick={handleShopNow}
              className="group/btn flex items-center justify-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-black text-white text-sm md:text-base font-medium rounded-md hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 hover:gap-3"
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              SHOP NOW
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            
            {/* EXPLORE BUTTON - Smooth scrolls to featured products */}
            <button 
              onClick={handleExplore}
              className="group/btn flex items-center justify-center gap-2 px-6 md:px-8 py-2.5 md:py-3 border-2 border-black text-black text-sm md:text-base font-medium rounded-md hover:bg-black hover:text-white transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
              EXPLORE
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentSlide(idx);
            }}
            className={`transition-all rounded-full ${
              idx === currentSlide 
                ? 'w-8 h-2 bg-black' 
                : 'w-2 h-2 bg-black/40 hover:bg-black/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 rounded-full items-center justify-center hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 rounded-full items-center justify-center hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
