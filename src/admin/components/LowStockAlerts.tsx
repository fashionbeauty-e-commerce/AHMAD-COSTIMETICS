import { AlertTriangle } from 'lucide-react';

const items = [
  { name: 'Nike Air Max 270', stock: 5, emoji: '👟' },
  { name: 'Zara Slim Fit Shirt', stock: 8, emoji: '👔' },
  { name: 'Adidas Yeezy Boost 350', stock: 3, emoji: '👟' },
  { name: 'Women Handbag', stock: 6, emoji: '👜' },
  { name: 'Casio G-Shock Watch', stock: 4, emoji: '⌚' },
];

function getStockColor(stock: number) {
  if (stock <= 3) return 'text-red-500 bg-red-50';
  if (stock <= 5) return 'text-amber-500 bg-amber-50';
  return 'text-orange-500 bg-orange-50';
}

export default function LowStockAlerts() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-lg">{item.emoji}</span>
            <p className="text-xs font-medium text-gray-900 flex-1">{item.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStockColor(item.stock)}`}>
              Stock: {item.stock}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
