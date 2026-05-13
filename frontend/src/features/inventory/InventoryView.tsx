import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Package, Search, Filter, ArrowUpRight, X } from 'lucide-react';
import api from '../../api/axios';
import type { Product, ApiResponse, PageResponse } from '../../types';
import { Modal } from '../shared/Modal';
import { ProductForm } from './components/ProductForm';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomFieldDef {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
}

// ─── useDebounce hook ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── Search helpers ───────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────
export const InventoryView: React.FC = () => {
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [isDialogOpen, setIsDialogOpen]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce so the search only fires 300 ms after the user stops typing
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const fetchProductSchema = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<{ fields: CustomFieldDef[] }>>('/lcnc/forms/product');
      setCustomFieldDefs(res.data.data?.fields ?? []);
    } catch {
      setCustomFieldDefs([]);
    }
  }, []);

  const fetchInventory = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      // Server-side search: pass the search query as a param
      const url = `/inventory/products?size=20${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const response = await api.get<ApiResponse<PageResponse<Product>>>(url);
      setProducts(response.data.data.content);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductSchema();
  }, [fetchProductSchema]);

  useEffect(() => {
    fetchInventory(debouncedQuery);
  }, [debouncedQuery, fetchInventory]);


  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAddProduct = () => { setSelectedProduct(undefined); setIsDialogOpen(true); };
  const handleEditProduct = (p: Product) => { setSelectedProduct(p); setIsDialogOpen(true); };
  const handleSuccess = () => { setIsDialogOpen(false); fetchInventory(); };
  const handleClearSearch = () => { setSearchQuery(''); searchInputRef.current?.focus(); };

  // ─── Cell renderer for custom field values ───────────────────────────────
  const renderCustomValue = (product: Product, fieldKey: string, fieldType: string) => {
    const value = product.customFields?.[fieldKey];
    if (value === undefined || value === null || value === '') {
      return <span className="text-slate-600 italic text-xs">—</span>;
    }
    if (fieldType === 'CHECKBOX') {
      return (
        <span className={`text-xs font-semibold ${value ? 'text-emerald-400' : 'text-slate-500'}`}>
          {value ? '✓ Yes' : '✗ No'}
        </span>
      );
    }
    if (fieldType === 'NUMBER') {
      return <span className="text-slate-200 text-sm font-mono">{value}</span>;
    }
    return <span className="text-slate-200 text-sm truncate max-w-[140px] block">{String(value)}</span>;
  };

  const totalCols = 6 + customFieldDefs.length;
  const isFiltered = debouncedQuery.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          <p className="text-slate-400 text-sm">Monitor and manage your stock levels</p>
        </div>
        <button onClick={handleAddProduct} className="btn-primary flex items-center gap-2">
          <Package className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, SKU, category, custom fields…"
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-10 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button className="p-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Status bar: custom field badge + search result count */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {customFieldDefs.length > 0 && (
            <span className="flex items-center gap-1.5 text-primary-400">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              {customFieldDefs.length} custom field{customFieldDefs.length !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
        {!loading && (
          <span className="text-slate-500">
            {isFiltered
              ? <>{products.length} product{products.length !== 1 ? 's' : ''} match <strong className="text-slate-300">"{debouncedQuery}"</strong></>
              : <>{products.length} product{products.length !== 1 ? 's' : ''} total</>
            }
          </span>
        )}
      </div>

      {/* Table */}
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
                {customFieldDefs.map(field => (
                  <th
                    key={field.id}
                    className="px-6 py-4 text-xs font-semibold text-primary-500/80 uppercase tracking-wider whitespace-nowrap border-l border-primary-500/10"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={totalCols} className="px-6 py-4 bg-slate-800/5 h-16" />
                  </tr>
                ))
              ) : products.map(product => (
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
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${product.active
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {customFieldDefs.map(field => (
                    <td key={field.id} className="px-6 py-4 border-l border-primary-500/10">
                      {renderCustomValue(product, field.fieldKey, field.fieldType)}
                    </td>
                  ))}
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

          {/* Empty states */}
          {!loading && products.length === 0 && isFiltered && (
            <div className="py-16 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="font-medium text-slate-400">No products match "{debouncedQuery}"</p>
              <p className="text-sm text-slate-600 mt-1">Try a different name, SKU, or custom field value.</p>
              <button onClick={handleClearSearch} className="mt-4 text-xs text-primary-400 hover:underline">
                Clear search
              </button>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Package className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">No products found</p>
              <p className="text-sm text-slate-600 mt-1">Add your first product to get started.</p>
            </div>
          )}
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
