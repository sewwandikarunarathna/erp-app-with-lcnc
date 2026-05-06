import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  negative?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, negative }) => (
  <div className="glass-card p-6 flex flex-col justify-between h-32">
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <div className="flex items-end justify-between mt-2">
      <h3 className="text-3xl font-bold text-white">{value}</h3>
      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${negative ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
        {change}
      </span>
    </div>
  </div>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <span className={`${active ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);
