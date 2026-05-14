import React, { useState } from 'react';
import { X, Search, BarChart3, LineChart, PieChart, Info, Plus, ArrowLeft, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { ReportDefinition } from '../../../types/dashboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reportId: string, type: string, title?: string) => void;
}

const WIDGET_TYPES = [
  { id: 'BAR_CHART', name: 'Bar Chart', icon: BarChart3, desc: 'Compare data across categories' },
  { id: 'LINE_CHART', name: 'Line Chart', icon: LineChart, desc: 'Visualize trends over time' },
  { id: 'KPI_CARD', name: 'KPI Card', icon: Info, desc: 'Show a single, important metric' },
  { id: 'PIE_CHART', name: 'Pie Chart', icon: PieChart, desc: 'Show proportions of a whole' },
];

const SYSTEM_ENTITIES = [
  { id: 'orders', name: 'Sales Orders', icon: '📦', description: 'Real-time order tracking' },
  { id: 'products', name: 'Product Inventory', icon: '🏷️', description: 'Stock levels' },
  { id: 'suppliers', name: 'Suppliers', icon: '🤝', description: 'Vendor metrics' },
];

const WidgetGallery: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [step, setStep] = useState<'type' | 'report'>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', selectedType],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return [];
      const res = await api.get(`/lcnc/reports?userId=${user.id}`);
      return res.data.data as ReportDefinition[];
    },
    enabled: step === 'report' && !!JSON.parse(localStorage.getItem('user') || '{}').id,
  });

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setStep('report');
  };

  const handleReportSelect = (id: string) => {
    if (selectedType) {
      const matchedReport = reports?.find(r => r.dataSource === id || r.id === id);
      const matchedEntity = SYSTEM_ENTITIES.find(e => e.id === id);
      
      const finalId = matchedReport ? matchedReport.id : id;
      const finalTitle = matchedReport ? matchedReport.name : (matchedEntity ? matchedEntity.name : 'New Widget');
      
      onSelect(finalId, selectedType, finalTitle);
      reset();
    }
  };

  const reset = () => {
    setStep('type');
    setSelectedType(null);
    setSearch('');
    onClose();
  };

  const filteredReports = reports?.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
              <div className="flex items-center gap-4">
                {step === 'report' && (
                  <button onClick={() => setStep('type')} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    {step === 'type' ? 'Choose Visualization' : 'Choose Data Source'}
                    <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-tighter">
                      Step {step === 'type' ? '1' : '2'} of 2
                    </span>
                  </h2>
                </div>
              </div>
              <button onClick={reset} className="p-3 hover:bg-white/5 rounded-2xl text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 'type' ? (
                  <motion.div
                    key="step-type"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {WIDGET_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className="group relative flex flex-col p-6 rounded-[32px] border border-zinc-900 bg-zinc-900/10 hover:bg-white/5 hover:border-zinc-700 transition-all text-left"
                      >
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-blue-500/50 transition-colors shadow-lg text-blue-400">
                          <type.icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{type.name}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">{type.desc}</p>
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-report"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input 
                        autoFocus
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reports or entities..." 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* System Entities */}
                      <div className="md:col-span-2">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">Standard Entities</h4>
                      </div>
                      {SYSTEM_ENTITIES.map(entity => (
                        <button
                          key={entity.id}
                          onClick={() => handleReportSelect(entity.id)}
                          className="flex items-center gap-4 p-5 rounded-3xl border border-zinc-900 bg-zinc-900/10 hover:bg-white/5 hover:border-zinc-700 transition-all text-left group"
                        >
                          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/50 transition-colors text-xl">
                            {entity.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{entity.name}</p>
                            <p className="text-xs text-zinc-500">{entity.description}</p>
                          </div>
                        </button>
                      ))}

                      {/* Custom Reports */}
                      {filteredReports && filteredReports.length > 0 && (
                        <>
                          <div className="md:col-span-2 mt-4">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">Custom Reports</h4>
                          </div>
                          {filteredReports.map(report => (
                            <button
                              key={report.id}
                              onClick={() => handleReportSelect(report.id)}
                              className="flex items-center gap-4 p-5 rounded-3xl border border-zinc-900 bg-zinc-900/10 hover:bg-white/5 hover:border-zinc-700 transition-all text-left group"
                            >
                              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/50 transition-colors">
                                <Layout size={20} className="text-zinc-500 group-hover:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{report.name}</p>
                                <p className="text-xs text-zinc-500 line-clamp-1">{report.dataSource}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WidgetGallery;
