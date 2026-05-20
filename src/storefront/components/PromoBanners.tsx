import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const banners = [
  {
    tag: 'NEW ARRIVALS',
    title: 'Stay Ahead\nOf Fashion',
    image: '/images/new-arrivals.jpg',
    path: '/search?sort=newest',
    buttonText: 'SHOP NOW',
  },
  {
    tag: 'TRENDING SHOES',
    title: 'Step Up\nYour Style',
    image: '/images/trending-shoes.jpg',
    path: '/search?category=Shoes',
    buttonText: 'SHOP SHOES',
  },
  {
    tag: "MEN'S COLLECTION",
    title: 'Sharp Looks.\nStronger You.',
    image: '/images/mens-collection.jpg',
    path: '/search?category=Men',
    buttonText: 'SHOP MEN',
  },
  {
    tag: 'BEAUTY ESSENTIALS',
    title: 'Beauty That\nDefines You',
    image: '/images/beauty-essentials.jpg',
    path: '/search?category=Beauty',
    buttonText: 'SHOP BEAUTY',
  },
];

export default function PromoBanners() {
  const navigate = useNavigate();

  const handleBannerClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 pb-6 md:pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {banners.map((banner) => (
          <div
            key={banner.tag}
            onClick={() => handleBannerClick(banner.path)}
            className="relative h-[180px] sm:h-[200px] md:h-[220px] rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow"
          >
            <img
              src={banner.image}
              alt={banner.tag}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-colors" />
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end text-white">
              <span className="text-[10px] md:text-xs font-semibold tracking-wider mb-1 opacity-90 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full self-start">
                {banner.tag}
              </span>
              <h3 className="text-lg md:text-xl font-bold leading-tight whitespace-pre-line mb-2 md:mb-3 mt-2">
                {banner.title}
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(banner.path);
                }}
                className="self-start flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 bg-white text-black text-xs font-semibold rounded hover:gap-2 hover:bg-gray-100 transition-all shadow-lg"
              >
                {banner.buttonText}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
