import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DashboardWidget as WidgetType } from '../../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MoreVertical, RefreshCcw, Trash2, Settings } from 'lucide-react';
import api from '../../../api/axios';

interface Props {
  widget: WidgetType;
  isEditMode?: boolean;
  onDelete?: (id: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const DashboardWidget: React.FC<Props> = ({ widget, isEditMode, onDelete }) => {
  console.log("widget", widget);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['report', widget.reportId],
    queryFn: async () => {
      const res = await api.post(`/lcnc/reports/${widget.reportId}/run`, {});
      return res.data.data;
    },
    refetchInterval: widget.refreshSecs ? widget.refreshSecs * 1000 : false,
  });

  const renderChart = () => {
    if (isLoading) return (
      <div className="h-full flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Fetching Data</span>
      </div>
    );

    if (!data || data.length === 0) return (
      <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
        No data available for this report
      </div>
    );

    // Extract keys from first data item for charts
    const keys = Object.keys(data[0]);
    const xKey = keys[0];
    const yKey = keys[1] || keys[0];

    switch (widget.widgetType) {
      case 'BAR_CHART':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'LINE_CHART':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
              />
              <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'PIE':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey={yKey}
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'KPI_CARD':
        const value = data[0][yKey];
        return (
          <div className="h-full flex flex-col justify-center items-center">
            <span className="text-4xl font-bold text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Latest Value</span>
          </div>
        );
      default:
        return <div className="h-full flex items-center justify-center text-zinc-600 text-xs">Unsupported widget type</div>;
    }
  };

  return (
    <div className={`h-full w-full bg-zinc-950/40 backdrop-blur-md border rounded-3xl p-5 flex flex-col group transition-all duration-300 ${isEditMode ? 'border-blue-500/30 ring-1 ring-blue-500/10 shadow-lg shadow-blue-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{widget.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode ? (
            <>
              <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
                <Settings size={14} />
              </button>
              <button 
                onClick={() => onDelete?.(widget.id)}
                className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => refetch()} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <RefreshCcw size={14} />
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
                <MoreVertical size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {renderChart()}
      </div>
    </div>
  );
};

export default DashboardWidget;
