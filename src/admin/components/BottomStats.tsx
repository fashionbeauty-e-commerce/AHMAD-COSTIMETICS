import { Package, Users, FolderTree, Tag, Star, UserCog } from 'lucide-react';

const stats = [
  { icon: Package, label: 'Total Products', value: '1,892', change: '+12.5%', up: true, color: 'bg-blue-50 text-blue-600' },
  { icon: Users, label: 'Total Customers', value: '18,745', change: '+15.3%', up: true, color: 'bg-purple-50 text-purple-600' },
  { icon: FolderTree, label: 'Total Categories', value: '24', change: '+4.3%', up: true, color: 'bg-green-50 text-green-600' },
  { icon: Tag, label: 'Total Brands', value: '156', change: '+7.8%', up: true, color: 'bg-orange-50 text-orange-600' },
  { icon: Star, label: 'Total Reviews', value: '8,729', change: '+11.2%', up: true, color: 'bg-amber-50 text-amber-600' },
  { icon: UserCog, label: 'Total Staff', value: '12', change: '+0%', up: true, color: 'bg-pink-50 text-pink-600' },
];

export default function BottomStats() {
  return (
    <div className="grid grid-cols-6 gap-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <span className={`text-[10px] font-semibold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                ↑ {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
