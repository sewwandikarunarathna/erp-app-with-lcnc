import React, { useEffect, useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import type { Product, ApiResponse, PageResponse } from '../../types';
import { StatCard } from '../shared/DashboardUI';

export const DashboardOverview: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get<ApiResponse<PageResponse<Product>>>('/inventory/products?size=5');
        setProducts(response.data.data.content);
      } catch (err) {
        console.error('Failed to fetch recent items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Revenue" value="$124,500" change="+12.5%" />
        <StatCard label="Active Orders" value="48" change="+5.2%" />
        <StatCard label="Low Stock Items" value="12" change="-2" negative />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Inventory</h2>
          <button className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-4 bg-slate-800/10 h-16"></td>
                  </tr>
                ))
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-xs text-slate-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-white">${product.sellingPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${product.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
