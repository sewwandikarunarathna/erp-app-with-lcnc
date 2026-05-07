import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, GripVertical, Settings2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../shared/ToastContext';
import type { ApiResponse } from '../../types';

interface FormField {
  id?: string;
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX';
  placeholder?: string;
  required: boolean;
  sortOrder: number;
  options?: any[];
  validation?: any;
}

interface FormSchema {
  id: string;
  formKey: string;
  name: string;
  fields: FormField[];
}

export const LCNCConfigView: React.FC = () => {
  const { showToast } = useToast();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await api.get<ApiResponse<FormSchema>>('/lcnc/forms/product');
      setSchema(response.data.data);
    } catch (err) {
      showToast('Failed to fetch form schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!schema) return;
    const newField: FormField = {
      fieldKey: `custom_field_${schema.fields.length + 1}`,
      label: 'New Custom Field',
      fieldType: 'TEXT',
      required: false,
      sortOrder: schema.fields.length,
    };
    setSchema({ ...schema, fields: [...schema.fields, newField] });
  };

  const removeField = (index: number) => {
    if (!schema) return;
    const newFields = schema.fields.filter((_, i) => i !== index);
    setSchema({ ...schema, fields: newFields });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!schema) return;
    const newFields = schema.fields.map((f, i) => i === index ? { ...f, ...updates } : f);
    setSchema({ ...schema, fields: newFields });
  };

  const handleSave = async () => {
    if (!schema) return;
    setSaving(true);
    try {
      await api.put(`/lcnc/forms/${schema.formKey}/fields`, schema.fields);
      showToast('Form configuration saved successfully');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-10 bg-slate-800 rounded-xl w-1/4"></div>
    <div className="h-64 bg-slate-800 rounded-2xl"></div>
  </div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-primary-500" />
            LCNC Form Configuration
          </h2>
          <p className="text-slate-400 text-sm">Configure dynamic fields for the {schema?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={addField}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-primary-400" />
          <p className="text-xs text-slate-400">These fields will be automatically rendered in the product add/edit form.</p>
        </div>
        
        <div className="divide-y divide-slate-800">
          {schema?.fields.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">No custom fields configured for this form.</p>
            </div>
          ) : (
            schema?.fields.map((field, index) => (
              <div key={index} className="p-6 flex items-start gap-6 group hover:bg-slate-900/50 transition-colors">
                <div className="pt-2 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="grid grid-cols-3 gap-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Label</label>
                    <input 
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field ID (Key)</label>
                    <input 
                      value={field.fieldKey}
                      onChange={(e) => updateField(index, { fieldKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Type</label>
                    <select 
                      value={field.fieldType}
                      onChange={(e) => updateField(index, { fieldType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none appearance-none"
                    >
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="DATE">Date</option>
                      <option value="SELECT">Select</option>
                      <option value="CHECKBOX">Checkbox</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id={`req-${index}`}
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500/50"
                    />
                    <label htmlFor={`req-${index}`} className="text-xs text-slate-400">Required</label>
                  </div>
                  
                  <button 
                    onClick={() => removeField(index)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
