const orders = [
  { id: '#ORD-2536', customer: 'John Doe', amount: '$129.99', status: 'Processing', statusColor: 'text-amber-500 bg-amber-50' },
  { id: '#ORD-2535', customer: 'Sarah Smith', amount: '$89.50', status: 'Completed', statusColor: 'text-green-500 bg-green-50' },
  { id: '#ORD-2534', customer: 'Michael Brown', amount: '$199.00', status: 'Processing', statusColor: 'text-amber-500 bg-amber-50' },
  { id: '#ORD-2533', customer: 'Emily Davis', amount: '$49.99', status: 'Completed', statusColor: 'text-green-500 bg-green-50' },
  { id: '#ORD-2532', customer: 'David Wilson', amount: '$159.00', status: 'Cancelled', statusColor: 'text-red-500 bg-red-50' },
];

const initials = ['JD', 'SS', 'MB', 'ED', 'DW'];
const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
      </div>

      <div className="space-y-3">
        {orders.map((order, i) => (
          <div key={order.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`w-8 h-8 ${colors[i]} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {initials[i]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">{order.id}</p>
              <p className="text-[10px] text-gray-400">{order.customer}</p>
            </div>
            <p className="text-xs font-semibold text-gray-900">{order.amount}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${order.statusColor}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
