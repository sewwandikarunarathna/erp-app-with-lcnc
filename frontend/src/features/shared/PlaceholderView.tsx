import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description }) => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
    <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center border border-primary-500/20">
      <Construction className="w-10 h-10 text-primary-500" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 mt-2 max-w-md mx-auto">{description}</p>
    </div>
    <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-500 font-mono">
      Endpoint: Module implementation pending backend readiness
    </div>
  </div>
);
