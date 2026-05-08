import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Plus,
  Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NavItem } from '../features/shared/DashboardUI';
import { DashboardOverview } from '../features/dashboard/DashboardOverview';
import { InventoryView } from '../features/inventory/InventoryView';
import { UsersView } from '../features/users/UsersView';
import { PlaceholderView } from '../features/shared/PlaceholderView';
import { LCNCConfigView } from '../features/lcnc/LCNCConfigView';
import { DynamicFormView } from '../features/lcnc/DynamicFormView';
import api from '../api/axios';
import type { ApiResponse } from '../types';

type ViewType = 'dashboard' | 'inventory' | 'sales' | 'users' | 'settings' | 'lcnc' | string;

interface FormShort {
  formKey: string;
  name: string;
  formType: 'SYSTEM' | 'CUSTOM';
}

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [customForms, setCustomForms] = useState<FormShort[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchCustomForms();
  }, [navigate]);

  const fetchCustomForms = async () => {
    try {
      const response = await api.get<ApiResponse<FormShort[]>>('/lcnc/forms');
      setCustomForms(response.data.data.filter(f => f.formType === 'CUSTOM'));
    } catch (err) {
      console.error('Failed to fetch sidebar forms', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderContent = () => {
    if (activeView.startsWith('dynamic:')) {
      const formKey = activeView.split(':')[1];
      return <DynamicFormView formKey={formKey} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'inventory':
        return <InventoryView />;
      case 'users':
        return <UsersView />;
      case 'sales':
        return <PlaceholderView 
          title="Sales Portal" 
          description="Manage orders, customers, and transactions. This module is currently under development." 
        />;
      case 'settings':
        return <PlaceholderView 
          title="Settings & Config" 
          description="Configure system preferences, user roles, and security policies." 
        />;
      case 'lcnc':
        return <LCNCConfigView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ERP LCNC
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Main Menu</p>
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')}
            />
            <NavItem 
              icon={<Package />} 
              label="Inventory" 
              active={activeView === 'inventory'} 
              onClick={() => setActiveView('inventory')}
            />
            <NavItem 
              icon={<ShoppingCart />} 
              label="Sales" 
              active={activeView === 'sales'} 
              onClick={() => setActiveView('sales')}
            />
            <NavItem 
              icon={<Users />} 
              label="Users" 
              active={activeView === 'users'} 
              onClick={() => setActiveView('users')}
            />
          </div>

          {customForms.length > 0 && (
            <div className="mb-4">
              <div className="h-px bg-slate-800/50 mx-4 mb-4"></div>
              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest px-4 mb-2">Operations</p>
              {customForms.map(form => (
                <NavItem 
                  key={form.formKey}
                  icon={<Plus className="w-4 h-4" />} 
                  label={form.name} 
                  active={activeView === `dynamic:${form.formKey}`} 
                  onClick={() => setActiveView(`dynamic:${form.formKey}`)}
                />
              ))}
            </div>
          )}

          <div className="mb-4">
            <div className="h-px bg-slate-800/50 mx-4 mb-4"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Administration</p>
            <NavItem 
              icon={<Settings />} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')}
            />
            <NavItem 
              icon={<Rocket className="w-4 h-4" />} 
              label="Form Designer" 
              active={activeView === 'lcnc'} 
              onClick={() => setActiveView('lcnc')}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 border border-slate-700/30 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.roles?.[0]}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
