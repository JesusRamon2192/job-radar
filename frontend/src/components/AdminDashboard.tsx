import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Mail, Send, Activity, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';
import { getUsers, forceEmailSend, deleteUser } from '../api/admin';
import type { AdminUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleForceEmail = async (userId: number) => {
    try {
      const res = await forceEmailSend(userId);
      setActionMessage({ text: res.message || 'Email task queued successfully', type: 'success' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setActionMessage({ text: err.response?.data?.detail || 'Failed to queue email', type: 'error' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setActionMessage({ text: res.message || 'User deleted successfully', type: 'success' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setActionMessage({ text: err.response?.data?.detail || 'Failed to delete user', type: 'error' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (!user || (user.email !== 'jesus.ramon2192@gmail.com' && !user.is_admin)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldCheck className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You do not have permission to view this page.</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in relative pb-10">
      {/* Action Toast */}
      {actionMessage && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg border z-50 flex items-center gap-3 transition-all ${
          actionMessage.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-rose-900/90 border-rose-500/50 text-rose-100'
        }`}>
          {actionMessage.type === 'success' ? <Send className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Manage users and system actions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl h-fit sticky top-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Administrator</h3>
              <p className="text-sm text-indigo-300 font-medium">Pro Access Active</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-sm">Status: Active</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="col-span-1 md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Registered Users
            </h2>
            <div className="text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
              Total: {users.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{error}</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                    <th className="p-4 font-medium">ID / Email</th>
                    <th className="p-4 font-medium text-center">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                            {u.id}
                          </div>
                          <div>
                            <div className="text-slate-200 font-medium">{u.email}</div>
                            <div className="text-xs text-slate-500">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          u.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {u.is_admin && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleForceEmail(u.id)}
                            disabled={!u.is_active}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              u.is_active 
                                ? 'bg-slate-700/50 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-slate-600 hover:border-indigo-500 shadow-sm'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                            title={u.is_active ? "Force send vacantes email" : "Cannot send to inactive user"}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Force Email</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-slate-700/50 text-rose-400 hover:bg-rose-500 hover:text-white border border-slate-600 hover:border-rose-500 shadow-sm"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
