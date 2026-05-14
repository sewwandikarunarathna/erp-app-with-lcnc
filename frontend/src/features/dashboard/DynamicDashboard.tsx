import React, { useState, useEffect, useRef } from 'react';
import { Responsive, type Layout as LayoutType } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { Dashboard, DashboardWidget as WidgetType } from '../../types/dashboard';
import DashboardWidget from './components/DashboardWidget';
import WidgetGallery from './components/WidgetGallery';
import { Plus, Layout, Save, X, ChevronDown, Trash2, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useToast } from '../shared/ToastContext';

const DynamicDashboard: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [localDashboard, setLocalDashboard] = useState<Dashboard | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // Safely retrieve user from localStorage
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  // Fetch all dashboards for this user
  const { data: dashboards, isLoading: dashboardsLoading } = useQuery({
    queryKey: ['dashboards', user?.id],
    queryFn: async () => {
      const res = await api.get(`/lcnc/dashboards?userId=${user.id}`);
      return res.data.data as Dashboard[];
    },
    enabled: !!user?.id,
  });

  // Fetch specific dashboard detail
  const { data: activeDashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', activeDashboardId],
    queryFn: async () => {
      if (!activeDashboardId) {
        // Initially, if no ID is selected, try to get the default
        const res = await api.get(`/lcnc/dashboards/default?userId=${user.id}`); 
        return res.data.data as Dashboard;
      }
      // Otherwise, fetch the specific one
      const res = await api.get(`/lcnc/dashboards/${activeDashboardId}`); 
      return res.data.data as Dashboard;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (dashboards && dashboards.length > 0 && !activeDashboardId) {
      setActiveDashboardId(dashboards[0].id);
    }
  }, [dashboards]);

  useEffect(() => {
    if (activeDashboard) {
      setLocalDashboard(activeDashboard);
    }
  }, [activeDashboard]);

  // Handle Container Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Persistence Mutations
  const saveMutation = useMutation({
    mutationFn: (dash: Dashboard) => api.post('/lcnc/dashboards', dash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', activeDashboardId] });
      setIsEditMode(false);
      showToast('Dashboard saved successfully', 'success');
    },
    onError: () => showToast('Failed to save dashboard', 'error'),
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [isNewShared, setIsNewShared] = useState(false);
  const [isNewDefault, setIsNewDefault] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: { name: string, shared: boolean, isDefault: boolean }) => api.post('/lcnc/dashboards', {
      name: data.name,
      ownerId: user.id,
      layout: [],
      widgets: [],
      shared: data.shared,
      isDefault: data.isDefault
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      setActiveDashboardId(res.data.data.id);
      setIsEditMode(true);
      setIsCreateModalOpen(false);
      setNewDashName('');
      setIsNewShared(false);
      setIsNewDefault(false);
      showToast('New dashboard created', 'success');
    }
  });

  const onLayoutChange = (newLayout: LayoutType[]) => {
    if (!localDashboard) return;
    setLocalDashboard({ ...localDashboard, layout: newLayout });
  };

  const addWidget = (reportId: string, type: any, title?: string) => {
    if (!localDashboard) return;
    const newWidget: WidgetType = {
      id: `new-${Date.now()}`,
      reportId,
      widgetType: type,
      title: title || 'New Widget',
      config: {},
      position: { x: 0, y: 0, w: 4, h: 4 },
      refreshSecs: 300,
    };
    
    setLocalDashboard({
      ...localDashboard,
      widgets: [...localDashboard.widgets, newWidget],
      layout: [...(localDashboard.layout as any[]), { i: newWidget.id, x: 0, y: 0, w: 4, h: 4 }]
    });
    setIsGalleryOpen(false);
  };

  const deleteWidget = (widgetId: string) => {
    if (!localDashboard) return;
    setLocalDashboard({
      ...localDashboard,
      widgets: localDashboard.widgets.filter(w => w.id !== widgetId),
      layout: (localDashboard.layout as any[]).filter(l => l.i !== widgetId)
    });
  };

  const handleSave = () => {
    if (localDashboard) {
      saveMutation.mutate(localDashboard);
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (dashboardsLoading || dashboardLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      {/* Create Dashboard Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">Create New Dashboard</h2>
              <p className="text-zinc-500 text-sm mb-6">Configure your new workspace settings.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Dashboard Name</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newDashName}
                    onChange={(e) => setNewDashName(e.target.value)}
                    placeholder="e.g., Sales Overview 2024"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-200">Publicly Shared</span>
                      <span className="text-[10px] text-zinc-500">Allow others to view</span>
                    </div>
                    <button 
                      onClick={() => setIsNewShared(!isNewShared)}
                      className={`w-11 h-6 rounded-full transition-all relative ${isNewShared ? 'bg-blue-600' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${isNewShared ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-200">Set as Default</span>
                      <span className="text-[10px] text-zinc-500">Auto-load on startup</span>
                    </div>
                    <button 
                      onClick={() => setIsNewDefault(!isNewDefault)}
                      className={`w-11 h-6 rounded-full transition-all relative ${isNewDefault ? 'bg-blue-600' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${isNewDefault ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={!newDashName || createMutation.isPending}
                  onClick={() => createMutation.mutate({ name: newDashName, shared: isNewShared, isDefault: isNewDefault })}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white shadow-lg shadow-blue-600/20 transition-all"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Dashboard'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col relative">
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <h1 className="text-2xl font-bold tracking-tight text-white">{localDashboard?.name || 'Select Dashboard'}</h1>
              <ChevronDown size={18} className={`text-zinc-500 group-hover:text-zinc-300 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                >
                  <p className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Switch Workspace</p>
                  {dashboards?.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setActiveDashboardId(d.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors ${d.id === activeDashboardId ? 'text-blue-400 bg-blue-500/5' : 'text-zinc-300'}`}
                    >
                      <Layout size={14} />
                      {d.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Workspace / Dashboard</p>
          </div>
          
          <div className="h-10 w-px bg-zinc-800 mx-2" />
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all border border-transparent hover:border-zinc-800"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {!isEditMode ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 px-5 py-2.5 rounded-2xl transition-all text-sm font-semibold shadow-sm shadow-black"
              >
                <Layout size={18} className="text-blue-400" />
                Customize Layout
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  key="cancel"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setLocalDashboard(activeDashboard || null);
                    setIsEditMode(false);
                  }}
                  className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Discard Changes
                </motion.button>
                <motion.button
                  key="save"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 px-6 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                >
                  {saveMutation.isPending ? 'Saving...' : <><Save size={18} /> Save Workspace</>}
                </motion.button>
              </div>
            )}
          </AnimatePresence>
          
          {isEditMode && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-2.5 bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-2xl text-sm font-bold shadow-xl transition-all active:scale-95"
            >
              <Plus size={18} />
              Add Widget
            </motion.button>
          )}
        </div>
      </div>

      <WidgetGallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        onSelect={addWidget}
      />

      {/* Grid Canvas */}
      <div 
        ref={containerRef}
        className={`relative transition-all duration-500 ease-in-out min-h-[70vh] rounded-[40px] ${isEditMode ? 'bg-zinc-900/10 border-2 border-dashed border-zinc-800/50 p-6' : ''}`}
      >
        {isEditMode && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-12 gap-6 p-6 opacity-20">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-full border-x border-zinc-800 border-dashed" />
            ))}
          </div>
        )}

        {localDashboard && localDashboard.widgets.length > 0 ? (
          <Responsive
            className="layout"
            layouts={{ lg: localDashboard.layout as any }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={width}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            onLayoutChange={onLayoutChange}
            margin={[24, 24]}
            draggableHandle=".widget-handle" 
          >
            {localDashboard.widgets.map((widget) => (
              <div key={widget.id}>
                <DashboardWidget 
                  widget={widget} 
                  isEditMode={isEditMode} 
                  onDelete={deleteWidget}
                />
              </div>
            ))}
          </Responsive>
        ) : (
          !dashboardLoading && (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
                <Layout size={32} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold text-white">This dashboard is empty</h2>
              <p className="text-zinc-500 text-sm mt-2 mb-8">Start personalizing your view by adding widgets</p>
              <button 
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <Plus size={20} className="text-blue-500" />
                Customize Workspace
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DynamicDashboard;
