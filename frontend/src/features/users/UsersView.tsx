import React, { useEffect, useState } from 'react';
import { Users, Search, UserPlus, Shield, Mail } from 'lucide-react';
import api from '../../api/axios';
import type { User, ApiResponse, PageResponse } from '../../types';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<ApiResponse<PageResponse<User>>>('/auth/users?size=20');
        setUsers(response.data.data.content);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Users</h2>
          <p className="text-slate-400 text-sm">Manage user access and permissions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Roles</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4 bg-slate-800/5 h-16"></td>
                      </tr>
                    ))
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-xs">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{u.fullName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map(role => (
                            <span key={role} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary-500 text-xs font-semibold hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-l-4 border-primary-500">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-400" />
              Role Overview
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm font-bold text-white">ADMIN</p>
                <p className="text-xs text-slate-400 mt-1">Full system access and user management</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm font-bold text-white">INVENTORY</p>
                <p className="text-xs text-slate-400 mt-1">Manage products and stock movements</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm font-bold text-white">SALES</p>
                <p className="text-xs text-slate-400 mt-1">Create orders and view customer data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
