import { Link } from 'react-router-dom';

const categories = [
  { name: 'Men', emoji: '👔', path: '/search?category=Men' },
  { name: 'Women', emoji: '👗', path: '/search?category=Women' },
  { name: 'Kids', emoji: '🧒', path: '/search?category=Kids' },
  { name: 'Shoes', emoji: '👟', path: '/search?category=Shoes' },
  { name: 'Bags', emoji: '👜', path: '/search?category=Bags' },
  { name: 'Beauty', emoji: '💄', path: '/search?category=Beauty' },
  { name: 'Watches', emoji: '⌚', path: '/search?category=Watches' },
  { name: 'Fragrance', emoji: '🌸', path: '/search?category=Fragrance' },
  { name: 'Sale', emoji: '🔴', path: '/search?sort=price-low', isSale: true },
];

export default function Categories() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-10">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:items-center md:justify-center gap-4 sm:gap-6 md:gap-10">
        {categories.map(cat => (
          <Link
            to={cat.path}
            key={cat.name}
            className="flex flex-col items-center gap-2 md:gap-3 group"
          >
            <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 transition-all ${
              cat.isSale
                ? 'bg-red-50 border-red-200 group-hover:border-red-400 group-hover:shadow-lg'
                : 'bg-gray-50 border-gray-200 group-hover:border-black group-hover:shadow-lg'
            }`}>
              {cat.emoji}
            </div>
            <span className={`text-xs md:text-sm font-medium ${cat.isSale ? 'text-red-500' : 'text-gray-700'} group-hover:text-black transition-colors`}>
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
