import { ShoppingBag, Clock, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';

const orderStats = [
  { icon: ShoppingBag, label: 'Total Orders', count: '2,345', change: '+12.4%', changeUp: true, color: 'bg-blue-50 text-blue-600' },
  { icon: Clock, label: 'Pending', count: '312', change: '+8.2%', changeUp: true, color: 'bg-amber-50 text-amber-600' },
  { icon: RefreshCcw, label: 'Processing', count: '564', change: '+5.1%', changeUp: true, color: 'bg-purple-50 text-purple-600' },
  { icon: CheckCircle2, label: 'Completed', count: '1,302', change: '+14.3%', changeUp: true, color: 'bg-green-50 text-green-600' },
  { icon: XCircle, label: 'Cancelled', count: '167', change: '-3.6%', changeUp: false, color: 'bg-red-50 text-red-600' },
];

export default function OrdersOverview() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Orders Overview</h3>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
      </div>

      <div className="space-y-3">
        {orderStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{stat.count}</p>
              <span className={`text-[10px] font-semibold ${stat.changeUp ? 'text-green-500' : 'text-red-500'}`}>
                {stat.changeUp ? '↑' : '↓'} {stat.change.replace(/[+-]/, '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
