import React, { useState, useEffect } from 'react';
import {
  Plus,
  Cpu,
  Trash2,
  Edit3,
  Globe,
  Loader2,
  Search,
  ExternalLink,
  MoreVertical,
  Terminal,
  RefreshCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import AIEditor from './AIEditor';

const Dashboard = ({ credentials, setIsCreating, setEditingWorker }: any) => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainModal, setDomainModal] = useState<any>(null);
  const [newDomain, setNewDomain] = useState('');
  const [zoneId, setZoneId] = useState('');

  const handleEdit = async (worker: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workers/${worker.id}?accountId=${credentials.cfAccountId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.cfToken}`,
          'X-Auth-Email': credentials.cfEmail
        }
      });
      const data = await response.json();
      if (data.success) {
        setEditingWorker({ ...worker, script: data.code });
      }
    } catch (error) {
      console.error('Failed to fetch worker script', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain || !zoneId) return;
    setLoading(true);
    try {
      const response = await fetch('/api/workers/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.cfToken}`,
          'X-Auth-Email': credentials.cfEmail
        },
        body: JSON.stringify({
          name: domainModal.id,
          domain: newDomain,
          accountId: credentials.cfAccountId,
          zoneId: zoneId
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Domain added successfully!');
        setDomainModal(null);
        setNewDomain('');
        setZoneId('');
      } else {
        alert('Error: ' + data.errors?.[0]?.message || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Domain add failed', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workers?accountId=${credentials.cfAccountId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.cfToken}`,
          'X-Auth-Email': credentials.cfEmail
        }
      });
      const data = await response.json();
      if (data.success) {
        setWorkers(data.result);
      }
    } catch (error) {
      console.error('Failed to fetch workers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete worker "${name}"?`)) return;

    try {
      const response = await fetch(`/api/workers/${name}?accountId=${credentials.cfAccountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${credentials.cfToken}`,
          'X-Auth-Email': credentials.cfEmail
        }
      });
      if (response.ok) {
        fetchWorkers();
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers', value: workers.length, icon: Cpu, color: 'text-indigo-400' },
          { label: 'Status', value: 'Healthy', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Region', value: 'Global', icon: Globe, color: 'text-blue-400' },
          { label: 'AI Model', value: 'Gemini 1.5', icon: Sparkles, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg bg-slate-800 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Cloudflare Workers</h2>
          <p className="text-slate-400">Manage and deploy your serverless functions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchWorkers}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
            <span>Create Worker</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))
        ) : workers.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-slate-800">
            <Terminal className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 text-lg">No workers found</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Deploy your first worker with AI
            </button>
          </div>
        ) : (
          workers.map((worker) => (
            <div
              key={worker.id}
              className="group bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Cpu className="text-indigo-400" size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => setDomainModal(worker)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                    title="Add Custom Domain"
                  >
                    <Globe size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate">{worker.id}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5 overflow-hidden">
                <Globe size={14} className="flex-shrink-0" />
                <span className="truncate">{worker.id}.{credentials.cfEmail.split('@')[0]}.workers.dev</span>
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Active</span>
                <a
                  href={`https://${worker.id}.${credentials.cfEmail.split('@')[0]}.workers.dev`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  View Live <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Domain Modal */}
      {domainModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Add Custom Domain</h3>
            <p className="text-slate-400 text-sm mb-6">Assign a custom domain to <span className="text-indigo-400 font-mono">{domainModal.id}</span></p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hostname</label>
                <input
                  type="text"
                  placeholder="worker.example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cloudflare Zone ID</label>
                <input
                  type="text"
                  placeholder="Your Zone ID"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDomainModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                disabled={loading || !newDomain || !zoneId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
