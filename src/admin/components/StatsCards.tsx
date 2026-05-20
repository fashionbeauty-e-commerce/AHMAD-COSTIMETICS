import { DollarSign, ShoppingCart, Users, TrendingUp, ShoppingBag } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '$248,590.50',
    change: '+18.6%',
    changeType: 'up' as const,
    period: 'vs Apr 13 – May 12, 2026',
    icon: DollarSign,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Total Orders',
    value: '2,345',
    change: '+12.4%',
    changeType: 'up' as const,
    period: 'vs Apr 13 – May 12, 2026',
    icon: ShoppingCart,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Total Customers',
    value: '18,745',
    change: '+15.3%',
    changeType: 'up' as const,
    period: 'vs Apr 13 – May 12, 2026',
    icon: Users,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Conversion Rate',
    value: '3.35%',
    change: '+8.2%',
    changeType: 'up' as const,
    period: 'vs Apr 13 – May 12, 2026',
    icon: TrendingUp,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    title: 'Average Order Value',
    value: '$105.88',
    change: '+6.1%',
    changeType: 'up' as const,
    period: 'vs Apr 13 – May 12, 2026',
    icon: ShoppingBag,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <div className={`w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-[18px] h-[18px] ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${
                stat.changeType === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{stat.period}</p>
          </div>
        );
      })}
    </div>
  );
}
