const customers = [
  { name: 'John Doe', email: 'john.doe@email.com', spent: '$5,650.20', initials: 'JD', color: 'bg-blue-500' },
  { name: 'Sarah Smith', email: 'sarah.smith@email.com', spent: '$4,230.80', initials: 'SS', color: 'bg-pink-500' },
  { name: 'Michael Brown', email: 'michael.brown@email.com', spent: '$3,980.50', initials: 'MB', color: 'bg-green-500' },
  { name: 'Emily Davis', email: 'emily.davis@email.com', spent: '$3,450.75', initials: 'ED', color: 'bg-purple-500' },
  { name: 'David Wilson', email: 'david.wilson@email.com', spent: '$2,890.30', initials: 'DW', color: 'bg-orange-500' },
];

export default function TopCustomers() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Top Customers</h3>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
      </div>

      <div className="space-y-3">
        {customers.map((customer, i) => (
          <div key={customer.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-xs text-gray-400 w-3">{i + 1}</span>
            <div className={`w-8 h-8 ${customer.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {customer.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900">{customer.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{customer.email}</p>
            </div>
            <p className="text-xs font-bold text-gray-900">{customer.spent}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
