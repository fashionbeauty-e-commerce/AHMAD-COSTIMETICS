import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, ShoppingCart, Users, TrendingUp, Package, 
  Eye, Star, AlertTriangle, ArrowRight, ShoppingBag,
  CheckCircle, Clock, XCircle, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, subscribeToProducts } from '../services/firebase';
import { useAuth } from '../App';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: { url: string }[];
  thumbnail?: string;
  emoji?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  numReviews?: number;
  rating?: number;
  createdAt?: any;
}

// Chart colors
const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);

  // Subscribe to all real-time data
  useEffect(() => {
    const unsubProducts = subscribeToProducts(setProducts);

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setOrders([])
    );

    const unsubCustomers = onSnapshot(
      collection(db, 'customers'),
      (snap) => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setCustomers([])
    );

    const unsubChat = onSnapshot(
      query(collection(db, 'chatRooms'), orderBy('lastMessageAt', 'desc')),
      (snap) => setChatRooms(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setChatRooms([])
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
      unsubChat();
    };
  }, []);

  // Computed values
  const activeProducts = products.filter(p => p.isActive !== false);
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock >= 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.pricing?.total || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  // Category distribution from REAL products
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Demo sales chart data (replace with real orders when available)
  const salesData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    salesData.push({
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 4000) + 1000,
    });
  }

  const today = new Date().toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="animate-fade-in space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Welcome back, {user?.firstName || 'Admin'}! Here's your store overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg border">{today}</span>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-purple-700 shadow-md"
          >
            <BarChart3 className="w-4 h-4" />
            Full Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Total Products"
          value={products.length.toString()}
          subtitle={`${activeProducts.length} active`}
          icon={Package}
          color="bg-blue-50 text-blue-600"
          onClick={() => navigate('/admin/products')}
        />
        <KPICard
          title="Total Orders"
          value={orders.length.toString()}
          subtitle={`${orders.filter(o => o.status === 'pending').length} pending`}
          icon={ShoppingCart}
          color="bg-green-50 text-green-600"
          onClick={() => navigate('/admin/orders')}
        />
        <KPICard
          title="Customers"
          value={customers.length.toString()}
          subtitle="Registered users"
          icon={Users}
          color="bg-purple-50 text-purple-600"
          onClick={() => navigate('/admin/customers')}
        />
        <KPICard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle="All time"
          icon={DollarSign}
          color="bg-amber-50 text-amber-600"
          onClick={() => navigate('/admin/analytics')}
        />
      </div>

      {/* Main Row: Sales Chart + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base">Sales Overview</h3>
              <p className="text-xs text-gray-500">Last 14 days revenue</p>
            </div>
            <Link to="/admin/analytics" className="text-xs text-purple-600 hover:text-purple-800 font-medium">
              Details →
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#dashGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution - REAL DATA */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base">Products by Category</h3>
              <p className="text-xs text-gray-500">{products.length} total products</p>
            </div>
            <Link to="/admin/categories" className="text-xs text-purple-600 hover:text-purple-800 font-medium">
              Manage →
            </Link>
          </div>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-gray-700">{cat.name}</span>
                    </div>
                    <span className="font-semibold">{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No products yet</p>
                <Link to="/admin/products" className="text-purple-600 text-xs">Add products →</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products + Orders + Low Stock Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

        {/* ALL PRODUCTS - REAL DATA FROM FIREBASE */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base">Products</h3>
              <p className="text-xs text-gray-500">{products.length} total</p>
            </div>
            <Link to="/admin/products" className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {products.slice(0, 10).map((product, i) => (
                <div
                  key={product.id}
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.thumbnail || product.images?.[0]?.url ? (
                      <img 
                        src={product.thumbnail || product.images?.[0]?.url} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <span className="text-lg">{product.emoji || '📦'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {product.brand && <span className="text-purple-600">{product.brand} · </span>}
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold">${product.price}</p>
                    <p className={`text-[10px] ${
                      product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {product.stock === 0 ? 'Out' : `${product.stock} left`}
                    </p>
                  </div>
                </div>
              ))}
              {products.length > 10 && (
                <Link
                  to="/admin/products"
                  className="block text-center text-xs text-purple-600 py-2 hover:underline font-medium"
                >
                  + {products.length - 10} more products
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">No products listed yet</p>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700"
              >
                <Package className="w-3 h-3" /> Add Your First Product
              </Link>
            </div>
          )}
        </div>

        {/* ORDERS OVERVIEW - REAL DATA */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base">Recent Orders</h3>
              <p className="text-xs text-gray-500">{orders.length} total</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {orders.slice(0, 8).map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate('/admin/orders')}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle className="w-4 h-4" /> :
                     order.status === 'cancelled' ? <XCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{order.orderNumber || `#ORD-${order.id.slice(-6)}`}</p>
                    <p className="text-[10px] text-gray-500">{order.customerEmail || order.shippingAddress?.email || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">${(order.total || order.pricing?.total || 0).toFixed(2)}</p>
                    <span className={`text-[10px] capitalize ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'cancelled' ? 'text-red-500' :
                      'text-amber-600'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders yet</p>
              <p className="text-xs mt-1">Orders will appear here in real-time</p>
            </div>
          )}
        </div>

        {/* LOW STOCK ALERTS - REAL DATA */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base">Low Stock</h3>
              {lowStockProducts.length > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                  {lowStockProducts.length} items
                </span>
              )}
            </div>
            <Link to="/admin/products" className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {lowStockProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.thumbnail || product.images?.[0]?.url ? (
                      <img src={product.thumbnail || product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-lg">{product.emoji || '📦'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-500">{product.category}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {product.stock === 0 ? 'OUT' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All products are well-stocked</p>
              <p className="text-xs mt-1">Products with ≤5 stock will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickStat label="Active Products" value={activeProducts.length} icon={Eye} color="bg-blue-50 text-blue-600" />
        <QuickStat label="Total Stock" value={totalStock.toLocaleString()} icon={Package} color="bg-purple-50 text-purple-600" />
        <QuickStat label="Featured" value={products.filter(p => p.isFeatured).length} icon={Star} color="bg-amber-50 text-amber-600" />
        <QuickStat label="Low Stock" value={lowStockProducts.length} icon={AlertTriangle} color="bg-red-50 text-red-600" />
        <QuickStat label="Categories" value={Object.keys(categoryMap).length} icon={TrendingUp} color="bg-green-50 text-green-600" />
        <QuickStat label="Chats" value={chatRooms.length} icon={Users} color="bg-pink-50 text-pink-600" />
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-3 md:p-5 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <p className="text-xs text-gray-500">{title}</p>
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm md:text-base font-bold">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}
