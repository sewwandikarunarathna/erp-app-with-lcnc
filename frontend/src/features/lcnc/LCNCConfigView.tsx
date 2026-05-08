import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Trash2, 
  GripVertical, 
  Settings2, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  Layout,
  Database,
  Calendar,
  Type,
  Hash,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../shared/ToastContext';
import type { ApiResponse } from '../../types';

interface FormField {
  id?: string;
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX' | 'LOOKUP';
  placeholder?: string;
  required: boolean;
  sortOrder: number;
  options?: any[];
  validation?: any;
  metadata?: {
    lookupSource?: string;
    [key: string]: any;
  };
}

interface FormSchema {
  id: string;
  formKey: string;
  name: string;
  description?: string;
  formType: 'SYSTEM' | 'CUSTOM';
  active: boolean;
  fields: FormField[];
}

type ViewMode = 'LIST' | 'EDIT' | 'CREATE';

export const LCNCConfigView: React.FC = () => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [lookupEntities, setLookupEntities] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', formKey: '', description: '' });

  useEffect(() => {
    if (viewMode === 'LIST') {
      fetchForms();
      fetchLookupEntities();
    }
  }, [viewMode]);

  const fetchLookupEntities = async () => {
    try {
      const response = await api.get<ApiResponse<string[]>>('/lcnc/lookup/entities');
      setLookupEntities(response.data.data);
    } catch (err) {
      console.error('Failed to fetch lookup entities', err);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.formKey) {
      showToast('Name and Key are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post<ApiResponse<FormSchema>>('/lcnc/forms', {
        ...newForm,
        formType: 'CUSTOM',
        active: true,
        fields: []
      });
      showToast('Form created successfully');
      setSelectedForm(response.data.data);
      setViewMode('EDIT');
      setNewForm({ name: '', formKey: '', description: '' });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create form', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<FormSchema[]>>('/lcnc/forms');
      setForms(response.data.data);
    } catch (err) {
      showToast('Failed to fetch forms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDetails = async (formKey: string) => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<FormSchema>>(`/lcnc/forms/${formKey}`);
      setSelectedForm(response.data.data);
      setViewMode('EDIT');
    } catch (err) {
      showToast('Failed to fetch form details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!selectedForm) return;
    const newField: FormField = {
      fieldKey: `custom_field_${selectedForm.fields.length + 1}`,
      label: 'New Custom Field',
      fieldType: 'TEXT',
      required: false,
      sortOrder: selectedForm.fields.length,
    };
    setSelectedForm({ ...selectedForm, fields: [...selectedForm.fields, newField] });
  };

  const removeField = (index: number) => {
    if (!selectedForm) return;
    const newFields = selectedForm.fields.filter((_, i) => i !== index);
    setSelectedForm({ ...selectedForm, fields: newFields });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!selectedForm) return;
    const newFields = selectedForm.fields.map((f, i) => i === index ? { ...f, ...updates } : f);
    setSelectedForm({ ...selectedForm, fields: newFields });
  };

  const handleSave = async () => {
    if (!selectedForm) return;
    setSaving(true);
    try {
      await api.put(`/lcnc/forms/${selectedForm.formKey}/fields`, selectedForm.fields);
      showToast('Form configuration saved successfully');
      setViewMode('LIST');
    } catch (err) {
      showToast('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type className="w-4 h-4" />;
      case 'NUMBER': return <Hash className="w-4 h-4" />;
      case 'DATE': return <Calendar className="w-4 h-4" />;
      case 'SELECT': return <ChevronDown className="w-4 h-4" />;
      case 'CHECKBOX': return <CheckSquare className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  if (loading && viewMode === 'LIST') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-800/50 rounded-3xl border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  const renderCreateView = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-4 text-primary-500">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Layout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Create New Custom Form</h3>
            <p className="text-sm text-slate-400">Initialize a new dynamic form with basic metadata.</p>
          </div>
        </div>

        <form onSubmit={handleCreateForm} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Form Name</label>
            <input 
              required
              value={newForm.name}
              onChange={(e) => {
                const name = e.target.value;
                const key = name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
                setNewForm({ ...newForm, name, formKey: key });
              }}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600"
              placeholder="e.g. Supplier Evaluation"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Form Key (Unique ID)</label>
            <input 
              required
              value={newForm.formKey}
              onChange={(e) => setNewForm({ ...newForm, formKey: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/50 outline-none font-mono text-sm transition-all"
              placeholder="e.g. supplier_evaluation"
            />
            <p className="text-[10px] text-slate-500 px-1">This ID will be used in URLs and API requests.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Description (Optional)</label>
            <textarea 
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              rows={3}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all resize-none placeholder:text-slate-600"
              placeholder="Describe the purpose of this form..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setViewMode('LIST')}
              className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-[2] btn-primary flex items-center justify-center gap-2 px-6 py-4 text-lg"
            >
              {saving ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ChevronRight className="w-6 h-6" />
                  Create & Design
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
              <Settings2 className="w-8 h-8 text-primary-500" />
            </div>
            {viewMode === 'LIST' ? 'Form Management' : viewMode === 'CREATE' ? 'New Form' : selectedForm?.name}
          </h2>
          <p className="text-slate-400 mt-2">
            {viewMode === 'LIST' 
              ? 'Design and manage dynamic forms and system extensions.' 
              : viewMode === 'CREATE'
              ? 'Define metadata for your new custom module.'
              : `Configuring fields for ${selectedForm?.formKey}`}
          </p>
        </div>
        
        <div className="flex gap-3">
          {viewMode === 'LIST' ? (
            <button 
              onClick={() => setViewMode('CREATE')}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              Create New Form
            </button>
          ) : viewMode === 'EDIT' ? (
            <>
              <button 
                onClick={() => setViewMode('LIST')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to List
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Configuration
              </button>
            </>
          ) : null}
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div 
              key={form.id} 
              className="glass-card group cursor-pointer hover:border-primary-500/50 transition-all hover:translate-y-[-4px]"
              onClick={() => fetchFormDetails(form.formKey)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${form.formType === 'SYSTEM' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                    {form.formType === 'SYSTEM' ? <Database className="w-6 h-6" /> : <Layout className="w-6 h-6" />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${form.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    {form.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">{form.name}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">{form.formKey}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <span className="text-xs text-slate-400">{form.fields?.length || 0} Fields Configured</span>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'CREATE' ? (
        renderCreateView()
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button 
              onClick={addField}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-primary-400" />
              <p className="text-xs text-slate-400">
                Editing fields for <strong>{selectedForm?.name}</strong>. Drag to reorder.
              </p>
            </div>
            
            <div className="divide-y divide-slate-800">
              {selectedForm?.fields?.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <Plus className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500">No fields configured. Click "Add Field" to start.</p>
                </div>
              ) : (
                selectedForm?.fields?.map((field, index) => (
                  <div key={index} className="p-6 flex items-start gap-6 group hover:bg-slate-900/50 transition-colors">
                    <div className="pt-2 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Label</label>
                        <div className="relative">
                          <input 
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                            placeholder="e.g. Supplier Name"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Key</label>
                        <input 
                          value={field.fieldKey}
                          onChange={(e) => updateField(index, { fieldKey: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none font-mono transition-all"
                          placeholder="e.g. supplier_name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Field Type</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            {getFieldIcon(field.fieldType)}
                          </div>
                          <select 
                            value={field.fieldType}
                            onChange={(e) => updateField(index, { fieldType: e.target.value as any })}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="TEXT">Text Input</option>
                            <option value="NUMBER">Numeric Value</option>
                            <option value="DATE">Date Picker</option>
                            <option value="SELECT">Dropdown Menu</option>
                            <option value="CHECKBOX">Boolean Checkbox</option>
                            <option value="LOOKUP">Entity Lookup</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {field.fieldType === 'LOOKUP' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 mt-4 ml-11">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-3 h-3" />
                            Lookup Source Entity
                          </label>
                          <select 
                            value={field.metadata?.lookupSource || ''}
                            onChange={(e) => updateField(index, { 
                              metadata: { ...field.metadata, lookupSource: e.target.value } 
                            })}
                            className="w-full bg-primary-500/5 border border-primary-500/20 rounded-xl px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="">Select Entity...</option>
                            {lookupEntities.map(entity => (
                              <option key={entity} value={entity}>
                                {entity.charAt(0) + entity.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 pt-6">
                          <p className="text-[10px] text-slate-500 italic">
                            This field will show a searchable list of records from the selected entity.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 group/check cursor-pointer">
                        <input 
                          type="checkbox"
                          id={`req-${index}`}
                          checked={field.required}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                          className="w-4 h-4 rounded-lg border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500/50 cursor-pointer"
                        />
                        <label htmlFor={`req-${index}`} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer group-hover/check:text-slate-300">Required</label>
                      </div>
                      
                      <button 
                        onClick={() => removeField(index)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Delete Field"
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
      )}
    </div>
  );
};
