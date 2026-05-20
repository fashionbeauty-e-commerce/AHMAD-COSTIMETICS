const products = [
  { name: 'Nike Air Jordan 1 Retro', category: 'Sneakers', sold: 342, revenue: '$54,711.58', emoji: '👟' },
  { name: 'Classic Black Hoodie', category: 'Men Clothing', sold: 298, revenue: '$17,880.02', emoji: '🧥' },
  { name: 'Ahmad Perfume Oud', category: 'Beauty', sold: 265, revenue: '$13,250.00', emoji: '🌸' },
  { name: 'Women Maxi Dress', category: 'Women Clothing', sold: 217, revenue: '$10,825.15', emoji: '👗' },
  { name: 'Fossil Chronograph Watch', category: 'Accessories', sold: 189, revenue: '$9,449.10', emoji: '⌚' },
];

export default function TopSellingProducts() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
        <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left text-[10px] text-gray-400 uppercase tracking-wider">
            <th className="pb-3 font-medium">#</th>
            <th className="pb-3 font-medium">Product</th>
            <th className="pb-3 font-medium text-right">Sold</th>
            <th className="pb-3 font-medium text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr key={product.name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-2.5 text-xs text-gray-400">{i + 1}</td>
              <td className="py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{product.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{product.name}</p>
                    <p className="text-[10px] text-gray-400">{product.category}</p>
                  </div>
                </div>
              </td>
              <td className="py-2.5 text-xs text-gray-600 text-right">{product.sold}</td>
              <td className="py-2.5 text-xs font-semibold text-gray-900 text-right">{product.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
