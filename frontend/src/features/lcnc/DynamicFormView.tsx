import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, Calendar, Hash, CheckSquare, ChevronDown, Search,
  Plus, List, RefreshCw, Inbox, Clock, ArrowLeft, X
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../shared/ToastContext';
import type { ApiResponse } from '../../types';

// ─── useDebounce hook ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX' | 'LOOKUP';
  placeholder?: string;
  required: boolean;
  metadata?: { lookupSource?: string };
}

interface FormSchema {
  id: string;
  formKey: string;
  name: string;
  description?: string;
  fields: FormField[];
}

interface Submission {
  id: string;
  data: Record<string, any>;
  reference?: string;
  submittedAt: string;
}

interface DynamicFormViewProps {
  formKey: string;
}

type ActiveTab = 'form' | 'submissions';

// ─── Component ────────────────────────────────────────────────────────────────

export const DynamicFormView: React.FC<DynamicFormViewProps> = ({ formKey }) => {
  const { showToast } = useToast();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lookupOptions, setLookupOptions] = useState<Record<string, { id: string; label: string }[]>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery.trim(), 300);

  // Reset when the form changes
  useEffect(() => {
    setFormData({});
    setSchema(null);
    setSubmissions([]);
    setSelectedSubmission(null);
    setSearchQuery('');
    setActiveTab('submissions');
    fetchSchema();
  }, [formKey]);

  useEffect(() => {
    if (activeTab === 'submissions' && schema) {
      fetchSubmissions(false, debouncedSearch);
    }
  }, [debouncedSearch]);

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<FormSchema>>(`/lcnc/forms/${formKey}`);
      const s = res.data.data;
      setSchema(s);
      s.fields.forEach(f => {
        if (f.fieldType === 'LOOKUP' && f.metadata?.lookupSource) {
          fetchLookupOptions(f.metadata.lookupSource);
        }
      });
      fetchSubmissions(true);
    } catch {
      showToast('Failed to load form schema', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupOptions = async (source: string) => {
    try {
      const res = await api.get<ApiResponse<{ id: string; label: string }[]>>(`/lcnc/lookup/${source}`);
      setLookupOptions(prev => ({ ...prev, [source]: res.data.data }));
    } catch (err) {
      console.error(`Failed to fetch lookup options for ${source}`, err);
    }
  };

  const fetchSubmissions = useCallback(async (silent = false, search?: string) => {
    if (!silent) setSubmissionsLoading(true);
    try {
      const url = `/lcnc/forms/${formKey}/submissions${search ? `?search=${encodeURIComponent(search)}` : ''}`;
      const res = await api.get<ApiResponse<Submission[]>>(url);
      setSubmissions(res.data.data);
    } catch {
      /* silently ignore — form may have no submissions yet */
    } finally {
      setSubmissionsLoading(false);
    }
  }, [formKey]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schema) return;

    // Required field validation
    const missing = schema.fields
      .filter(f => f.required && !formData[f.fieldKey])
      .map(f => f.label);
    if (missing.length) {
      showToast(`Required: ${missing.join(', ')}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/lcnc/forms/${formKey}/submit`, formData);
      showToast(`${schema.name} submitted successfully!`);
      setFormData({});
      fetchSubmissions();
      setActiveTab('submissions');
    } catch {
      showToast('Failed to submit form', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Field Renderer ────────────────────────────────────────────────────────

  const renderField = (field: FormField, readOnly = false) => {
    const base =
      'w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all';
    const commonProps = {
      id: field.fieldKey,
      required: field.required,
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}...`,
      value: formData[field.fieldKey] ?? '',
      onChange: (e: any) => handleInputChange(field.fieldKey, e.target.value),
      className: base,
      disabled: readOnly,
    };

    switch (field.fieldType) {
      case 'TEXT':    return <input type="text"   {...commonProps} />;
      case 'NUMBER':  return <input type="number" {...commonProps} />;
      case 'DATE':    return <input type="date"   {...commonProps} />;

      case 'CHECKBOX':
        return (
          <div className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800">
            <input
              type="checkbox"
              checked={formData[field.fieldKey] || false}
              onChange={e => handleInputChange(field.fieldKey, e.target.checked)}
              disabled={readOnly}
              className="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500/50"
            />
            <label className="text-slate-300 font-medium">{field.label}</label>
          </div>
        );

      case 'LOOKUP': {
        const source = field.metadata?.lookupSource;
        const options = source ? (lookupOptions[source] ?? []) : [];
        return (
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <select {...commonProps} className={`${base} pl-12 appearance-none`}>
              <option value="">Select {source?.toLowerCase()}…</option>
              {options.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        );
      }

      default: return <input type="text" {...commonProps} />;
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getLookupLabel = (field: FormField, value: any) => {
    if (field.fieldType !== 'LOOKUP' || !field.metadata?.lookupSource) return String(value ?? '—');
    const options = lookupOptions[field.metadata.lookupSource] ?? [];
    return options.find(o => o.id === value)?.label ?? value ?? '—';
  };

  const getCellValue = (field: FormField, value: any): string => {
    if (value === undefined || value === null || value === '') return '—';
    if (field.fieldType === 'CHECKBOX') return value ? '✓ Yes' : '✗ No';
    if (field.fieldType === 'LOOKUP') return getLookupLabel(field, value);
    if (field.fieldType === 'DATE') return new Date(value).toLocaleDateString('en-GB');
    return String(value);
  };

  // ─── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-slate-800 rounded-xl w-1/3" />
      <div className="h-12 bg-slate-800/60 rounded-2xl w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!schema) return null;

  const hasSubmissions = submissions.length > 0;

  // ─── Detail drawer (click a row) ──────────────────────────────────────────
  if (selectedSubmission) return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => setSelectedSubmission(null)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to submissions
      </button>

      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{schema.name} — Detail</h3>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Submitted {formatDate(selectedSubmission.submittedAt)}
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold">
            #{selectedSubmission.id.slice(0, 8)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schema.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{field.label}</label>
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white">
                {getCellValue(field, selectedSubmission.data[field.fieldKey])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Rocket className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{schema.name}</h2>
            <p className="text-slate-400 mt-1">{schema.description || 'Fill out the form below.'}</p>
          </div>
        </div>

        {hasSubmissions && (
          <span className="px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-full text-sm font-semibold">
            {submissions.length} record{submissions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'submissions'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-4 h-4" />
          Records
          {hasSubmissions && (
            <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
              activeTab === 'submissions' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
            }`}>
              {submissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'form'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* ── TAB: Submissions grid ────────────────────────────────────────── */}
      {activeTab === 'submissions' && (
        <div className="glass-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/30 gap-4">
            <h3 className="font-semibold text-white">All Submissions</h3>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search records..."
                  className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-10 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => fetchSubmissions(false, debouncedSearch)}
                disabled={submissionsLoading}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${submissionsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {submissionsLoading ? (
            <div className="divide-y divide-slate-800">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 animate-pulse bg-slate-800/20 mx-6 my-3 rounded-xl" />
              ))}
            </div>
          ) : !hasSubmissions ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Inbox className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">
                {searchQuery ? 'No matching records found' : 'No records yet'}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                {searchQuery 
                  ? 'Try a different search term.' 
                  : <>Click <strong className="text-slate-400">New Entry</strong> to submit the first record.</>}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-xs text-primary-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      #
                    </th>
                    {schema.fields.slice(0, 5).map(f => (
                      <th key={f.id} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {submissions.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {String(submissions.length - idx).padStart(3, '0')}
                      </td>
                      {schema.fields.slice(0, 5).map(f => (
                        <td key={f.id} className="px-6 py-4 text-slate-200 max-w-[180px] truncate">
                          {getCellValue(f, sub.data[f.fieldKey])}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {formatDate(sub.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: New Entry form ──────────────────────────────────────────── */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
          {schema.fields.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No fields configured for this form yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {schema.fields.map(field => (
                <div key={field.id} className={`space-y-3 ${field.fieldType === 'CHECKBOX' ? 'flex flex-col justify-end' : ''}`}>
                  {field.fieldType !== 'CHECKBOX' && (
                    <div className="flex items-center justify-between px-1">
                      <label htmlFor={field.fieldKey} className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        {field.fieldType === 'NUMBER' && <Hash className="w-4 h-4" />}
                        {field.fieldType === 'DATE' && <Calendar className="w-4 h-4" />}
                        {field.fieldType === 'LOOKUP' && <DatabaseIcon className="w-4 h-4" />}
                        {field.label}
                      </label>
                      {field.required && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                          REQUIRED
                        </span>
                      )}
                    </div>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {schema.fields.length > 0 && (
            <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFormData({})}
                className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-all text-sm font-semibold"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-3 px-10 py-4 text-lg"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Submit {schema.name}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

// ─── Internal SVG icons ────────────────────────────────────────────────────────

const Rocket = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-4 5-4" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 4-5 4-5" />
  </svg>
);

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);
