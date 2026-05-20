import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'May 13', thisP: 8000, lastP: 5000 },
  { date: 'May 18', thisP: 12000, lastP: 7000 },
  { date: 'May 23', thisP: 10000, lastP: 8000 },
  { date: 'May 28', thisP: 15000, lastP: 6000 },
  { date: 'Jun 2', thisP: 22000, lastP: 9000 },
  { date: 'Jun 7', thisP: 28000, lastP: 11000 },
  { date: 'Jun 12', thisP: 32000, lastP: 10000 },
];

export default function SalesChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Sales Overview</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple-600 rounded" />
              <span className="text-xs text-gray-500">This Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-300 rounded border-dashed" style={{ borderBottom: '1px dashed' }} />
              <span className="text-xs text-gray-500">Last Period</span>
            </div>
          </div>
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:border-purple-500">
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="lastP" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" fill="none" />
          <Area type="monotone" dataKey="thisP" stroke="#7c3aed" strokeWidth={2.5} fill="url(#colorThis)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
