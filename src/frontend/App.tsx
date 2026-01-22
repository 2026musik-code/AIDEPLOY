import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Cpu,
  Code,
  Terminal,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Settings,
  LogOut,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock components for now
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AIEditor from './components/AIEditor';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState<{
    cfEmail?: string;
    cfToken?: string;
    cfAccountId?: string;
    geminiKey?: string;
  }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_worker_creds');
    if (saved) {
      setCredentials(JSON.parse(saved));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (creds: any) => {
    setCredentials(creds);
    setIsLoggedIn(true);
    localStorage.setItem('ai_worker_creds', JSON.stringify(creds));
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_worker_creds');
    setIsLoggedIn(false);
    setCredentials({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Zap size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    AI WORKER
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
               {isCreating || editingWorker ? (
                 <AIEditor
                   credentials={credentials}
                   onClose={() => {
                     setIsCreating(false);
                     setEditingWorker(null);
                   }}
                   initialCode={editingWorker?.script}
                   workerName={editingWorker?.id}
                 />
               ) : (
                 <Dashboard
                   credentials={credentials}
                   setIsCreating={setIsCreating}
                   setEditingWorker={setEditingWorker}
                 />
               )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
