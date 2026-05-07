import React from 'react';

interface DynamicFieldProps {
  field: {
    fieldKey: string;
    label: string;
    fieldType: string;
    placeholder?: string;
    required: boolean;
    options?: any;
  };
  value: any;
  onChange: (value: any) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ field, value, onChange }) => {
  const commonClasses = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600";

  switch (field.fieldType) {
    case 'NUMBER':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{field.label}</label>
          <input
            type="number"
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        </div>
      );
    case 'DATE':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{field.label}</label>
          <input
            type="date"
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          />
        </div>
      );
    case 'SELECT':
      const options = field.options || [];
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{field.label}</label>
          <select
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses + " appearance-none cursor-pointer"}
          >
            <option value="">Select...</option>
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'CHECKBOX':
      return (
        <div className="flex items-center gap-3 py-2">
          <input
            type="checkbox"
            id={field.fieldKey}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 rounded border-slate-800 bg-slate-950 text-primary-500 focus:ring-primary-500/50"
          />
          <label htmlFor={field.fieldKey} className="text-sm font-medium text-slate-300 cursor-pointer">
            {field.label}
          </label>
        </div>
      );
    default:
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{field.label}</label>
          <input
            type="text"
            required={field.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        </div>
      );
  }
};
