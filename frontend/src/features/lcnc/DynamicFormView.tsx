import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Calendar, Type, Hash, CheckSquare, ChevronDown, Search } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../shared/ToastContext';
import type { ApiResponse } from '../../types';

interface FormField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX' | 'LOOKUP';
  placeholder?: string;
  required: boolean;
  metadata?: {
    lookupSource?: string;
  };
}

interface FormSchema {
  id: string;
  formKey: string;
  name: string;
  description?: string;
  fields: FormField[];
}

interface DynamicFormViewProps {
  formKey: string;
}

export const DynamicFormView: React.FC<DynamicFormViewProps> = ({ formKey }) => {
  const { showToast } = useToast();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchema();
    setFormData({}); // Reset data when form changes
  }, [formKey]);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<FormSchema>>(`/lcnc/forms/${formKey}`);
      setSchema(response.data.data);
    } catch (err) {
      showToast('Failed to load form schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In a real app, this would POST to a submissions endpoint
      // For now, we'll simulate it or use the extended data endpoint if it fits
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast(`${schema?.name} submitted successfully!`);
      setFormData({});
    } catch (err) {
      showToast('Failed to submit form', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.fieldKey,
      required: field.required,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}...`,
      value: formData[field.fieldKey] || '',
      onChange: (e: any) => handleInputChange(field.fieldKey, e.target.value),
      className: "w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
    };

    switch (field.fieldType) {
      case 'TEXT':
        return <input type="text" {...commonProps} />;
      case 'NUMBER':
        return <input type="number" {...commonProps} />;
      case 'DATE':
        return <input type="date" {...commonProps} />;
      case 'CHECKBOX':
        return (
          <div className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800">
            <input 
              type="checkbox" 
              checked={formData[field.fieldKey] || false}
              onChange={(e) => handleInputChange(field.fieldKey, e.target.checked)}
              className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500/50"
            />
            <label className="text-slate-300 font-medium">{field.label}</label>
          </div>
        );
      case 'LOOKUP':
        return (
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <select 
              {...commonProps}
              className={`${commonProps.className} pl-12 appearance-none`}
            >
              <option value="">Search for {field.metadata?.lookupSource?.toLowerCase()}...</option>
              {/* This would be dynamically populated via a search input in a full implementation */}
              <option value="temp-1">Loading {field.metadata?.lookupSource} options...</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        );
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-800 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-2xl"></div>)}
      </div>
    </div>
  );

  if (!schema) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
              <Rocket className="w-8 h-8 text-primary-500" />
            </div>
            {schema.name}
          </h2>
          <p className="text-slate-400 mt-2">{schema.description || 'Fill out the details below.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {schema.fields.map(field => (
            <div key={field.id} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {field.fieldType === 'NUMBER' && <Hash className="w-4 h-4" />}
                  {field.fieldType === 'DATE' && <Calendar className="w-4 h-4" />}
                  {field.fieldType === 'LOOKUP' && <Database className="w-4 h-4" />}
                  {field.label}
                </label>
                {field.required && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">REQUIRED</span>}
              </div>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary flex items-center gap-3 px-10 py-4 text-lg"
          >
            {submitting ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-6 h-6" />
                Submit {schema.name}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Internal icon dependency
const Rocket = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-4 5-4"></path>
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 4-5 4-5"></path>
  </svg>
);

const Database = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
    <path d="M3 12A9 3 0 0 0 21 12"></path>
  </svg>
);
