import { useState, useEffect, useRef } from 'react';
import { 
  Printer, Download, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, Users, Package, Calendar, BarChart3, Eye
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  // Generate sample sales data based on period
  const generateSalesData = () => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 500) + 100,
      });
    }
    return data;
  };

  const salesData = generateSalesData();
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const totalVisitors = salesData.reduce((sum, d) => sum + d.visitors, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Category distribution
  const categoryData = products.reduce((acc: any, p) => {
    const cat = p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Top products
  const topProducts = [...products]
    .sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0))
    .slice(0, 5);

  // Sales by channel (demo data)
  const channelData = [
    { name: 'Website', value: 60, color: '#7c3aed' },
    { name: 'Mobile App', value: 25, color: '#3b82f6' },
    { name: 'POS', value: 10, color: '#10b981' },
    { name: 'Facebook', value: 5, color: '#f59e0b' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Revenue', 'Orders', 'Visitors'].join(','),
      ...salesData.map(d => [d.date, d.revenue, d.orders, d.visitors].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Trigger native print which can save as PDF
    window.print();
  };

  return (
    <div className="animate-fade-in">
      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold mb-2">Ahmad Costimetics</h1>
        <p className="text-gray-600">Analytics Report - {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500">Period: {period.toUpperCase()}</p>
        <hr className="my-4" />
      </div>

      {/* Header with print buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-xs md:text-sm text-gray-500">Real-time business insights</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KPICard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change="+18.6%"
            isUp={true}
            icon={DollarSign}
            color="bg-green-50 text-green-600"
          />
          <KPICard
            title="Total Orders"
            value={totalOrders.toLocaleString()}
            change="+12.4%"
            isUp={true}
            icon={ShoppingCart}
            color="bg-blue-50 text-blue-600"
          />
          <KPICard
            title="Visitors"
            value={totalVisitors.toLocaleString()}
            change="+8.2%"
            isUp={true}
            icon={Eye}
            color="bg-purple-50 text-purple-600"
          />
          <KPICard
            title="Avg Order Value"
            value={`$${avgOrderValue.toFixed(2)}`}
            change="-2.1%"
            isUp={false}
            icon={TrendingUp}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base md:text-lg">Revenue Trend</h3>
              <p className="text-xs text-gray-500">Daily revenue for selected period</p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders & Visitors Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:break-inside-avoid">
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-4">Orders Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-4">Sales by Channel</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {channelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:break-inside-avoid">
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-4">Products by Category</h3>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No products yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="font-bold text-base md:text-lg mb-4">Top Products</h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span>{p.emoji || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                    <p className="font-bold text-sm">${p.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No products yet</p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 print:break-inside-avoid">
          <h3 className="font-bold text-base md:text-lg mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-gray-600">Products</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-600">Orders</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-xs text-gray-600">Customers</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{period}</p>
              <p className="text-xs text-gray-600">Period</p>
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-xs text-gray-500 mt-8 pt-4 border-t">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p>Ahmad Costimetics © 2026 - Confidential Business Report</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

function KPICard({ title, value, change, isUp, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-lg md:text-2xl font-bold">{value}</p>
      <div className={`flex items-center gap-1 text-xs mt-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );
}
