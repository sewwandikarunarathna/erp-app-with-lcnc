import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, ArrowUpRight } from 'lucide-react';
import api from '../../api/axios';
import type { Product, ApiResponse, PageResponse } from '../../types';
import { Modal } from '../shared/Modal';
import { ProductForm } from './components/ProductForm';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<PageResponse<Product>>>('/inventory/products?size=20');
      setProducts(response.data.data.content);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchInventory();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-slate-400 text-sm">Monitor and manage your stock levels</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="btn-primary flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search products, SKUs..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <button className="p-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 bg-slate-800/5 h-16"></td>
                  </tr>
                ))
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-xs text-slate-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-lg">
                      {product.categoryName || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">${product.sellingPrice}</div>
                    <div className="text-[10px] text-slate-500">Cost: ${product.costPrice}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${product.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="text-slate-500 hover:text-primary-400 p-1 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm 
          product={selectedProduct}
          onSuccess={handleSuccess}
          onCancel={() => setIsDialogOpen(false)}
        />
      </Modal>
    </div>
  );
};
