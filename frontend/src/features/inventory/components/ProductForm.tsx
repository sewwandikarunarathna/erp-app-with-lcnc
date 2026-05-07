import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import api from '../../../api/axios';
import type { Product, Category, ApiResponse } from '../../../types';
import { useToast } from '../../shared/ToastContext';
import { DynamicField } from '../../lcnc/components/DynamicField';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core fields
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    unitOfMeasure: product?.unitOfMeasure || 'UNIT',
    costPrice: product?.costPrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    reorderPoint: product?.reorderPoint || 0,
    active: product?.active ?? true,
  });

  // LCNC fields from backend
  const [schema, setSchema] = useState<any>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(product?.customFields || {});

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await api.get<ApiResponse<any>>('/lcnc/forms/product');
        setSchema(response.data.data);
      } catch (err) {
        console.error('Failed to fetch LCNC schema', err);
      }
    };
    fetchSchema();
    
    const fetchCategories = async () => {
      try {
        const response = await api.get<ApiResponse<Category[]>>('/inventory/categories');
        setCategories(response.data.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare payload
    const payload = {
      ...formData,
      active: product ? formData.active : true,
      customFields: customFieldValues,
    };

    try {
      if (product?.id) {
        await api.put(`/inventory/products/${product.id}`, payload);
        showToast('Product updated successfully');
      } else {
        await api.post('/inventory/products', payload);
        showToast('Product created successfully');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-shake">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* System Fields Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Core Information</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">SKU</label>
            <input
              required
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. PROD-001"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Product Name</label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="Enter product name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all resize-none placeholder:text-slate-600"
            placeholder="Describe the product..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Unit of Measure</label>
            <input
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. PCS, KG, BOX"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Cost Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Selling Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Reorder Point</label>
            <input
              type="number"
              name="reorderPoint"
              value={formData.reorderPoint}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* LCNC Section (Custom Fields from Config) */}
      {schema && schema.fields && schema.fields.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Extended Information (LCNC)</h4>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {schema.fields.map((field: any) => (
              <DynamicField
                key={field.fieldKey}
                field={field}
                value={customFieldValues[field.fieldKey]}
                onChange={(val) => handleCustomFieldChange(field.fieldKey, val)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-8 min-w-[160px] justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {product ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};
