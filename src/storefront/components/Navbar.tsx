import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Men', path: '/search?category=Men' },
  { label: 'Women', path: '/search?category=Women' },
  { label: 'Kids', path: '/search?category=Kids' },
  { label: 'Shoes', path: '/search?category=Shoes' },
  { label: 'Bags', path: '/search?category=Bags' },
  { label: 'Beauty', path: '/search?category=Beauty' },
  { label: 'Watches', path: '/search?category=Watches' },
  { label: 'Fragrance', path: '/search?category=Fragrance' },
  { label: 'New Arrivals', path: '/products' },
  { label: 'Sale', path: '/products', isSale: true },
];

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  return (
    <nav className="hidden md:block bg-white border-b border-gray-200 px-4">
      <div className="max-w-[1400px] mx-auto">
        <ul className="flex items-center gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
          {navItems.map(item => {
            const isActive = currentPath === item.path || (item.path === '/' && location.pathname === '/');
            return (
              <li key={item.label} className="shrink-0">
                <Link
                  to={item.path}
                  className={`py-3 text-xs lg:text-sm font-medium transition-colors relative whitespace-nowrap inline-block ${
                    isActive
                      ? 'text-black border-b-2 border-black'
                      : item.isSale
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
