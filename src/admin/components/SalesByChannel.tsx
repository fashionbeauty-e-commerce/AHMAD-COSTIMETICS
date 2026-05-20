import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Website', value: 149154.30, percentage: '60%', color: '#7c3aed' },
  { name: 'Mobile App', value: 62147.63, percentage: '25%', color: '#3b82f6' },
  { name: 'POS System', value: 24859.05, percentage: '10%', color: '#10b981' },
  { name: 'Facebook Shop', value: 12429.52, percentage: '5%', color: '#f59e0b' },
];

export default function SalesByChannel() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Sales by Channel</h3>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View Details</button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-44 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-gray-900">$248,590.50</p>
            <p className="text-[10px] text-gray-400">Total</p>
          </div>
        </div>

        <div className="w-full mt-4 space-y-2.5">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-900 mr-2">{item.percentage}</span>
                <span className="text-[10px] text-gray-400">${item.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
