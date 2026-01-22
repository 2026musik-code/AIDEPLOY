import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Code,
  Play,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Terminal as TerminalIcon,
  ChevronRight,
  Zap
} from 'lucide-react';

const AIEditor = ({ credentials, onClose, initialCode, workerName: initialName }: any) => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(initialCode || '// Your AI generated code will appear here...');
  const [workerName, setWorkerName] = useState(initialName || '');
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [model, setModel] = useState('gemini-1.5-flash');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const generateCode = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    addLog(`Generating code with ${model}...`);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          geminiKey: credentials.geminiKey,
          existingCode: code
        })
      });

      const data = await response.json();
      if (data.success) {
        setCode(data.code);
        if (data.name && !workerName) setWorkerName(data.name);
        addLog('Code generated successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!workerName) {
      setError("Please provide a worker name");
      return;
    }
    setDeploying(true);
    setError(null);
    setStatus('Deploying to Cloudflare...');
    addLog(`Starting deployment for ${workerName}...`);

    try {
      const response = await fetch('/api/workers/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.cfToken}`,
          'X-Auth-Email': credentials.cfEmail
        },
        body: JSON.stringify({
          name: workerName,
          code,
          accountId: credentials.cfAccountId
        })
      });

      const data = await response.json();
      if (data.success) {
        setStatus('Deployed successfully!');
        addLog('Deployment complete!');
        setTimeout(() => setStatus(null), 3000);
      } else {
        const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        addLog(`Deployment failed: ${errorMsg}`);

        // Enhance error message for AI if it's a module issue
        let enhancedError = errorMsg;
        if (errorMsg.includes('imported from') || errorMsg.includes('not found') || errorMsg.includes('hono')) {
           enhancedError = `Module resolution error: ${errorMsg}. REMINDER: You MUST NOT use any external imports or libraries like 'hono'. Use native Cloudflare Workers APIs only.`;
        }

        // AUTO-FIX LOGIC
        addLog('Attempting auto-fix with AI...');
        await autoFix(enhancedError);
      }
    } catch (err: any) {
      setError(err.message);
      addLog(`Deployment Error: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  const autoFix = async (errorMsg: string) => {
    setLoading(true);
    setStatus('Auto-fixing code...');
    try {
      const response = await fetch('/api/ai/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errorMsg,
          code,
          model,
          geminiKey: credentials.geminiKey
        })
      });
      const data = await response.json();
      if (data.success) {
        setCode(data.code);
        addLog('Auto-fix complete! Retrying deployment...');
        // We could automatically retry here
        setTimeout(handleDeploy, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(`Auto-fix failed: ${err.message}`);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-lg text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">AI Builder</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Worker Name</label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-cool-worker"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">AI Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
              <option value="gemini-3.0-pro">Gemini 3.0 Pro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Prompt AI</label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what your worker should do..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
            <button
              onClick={generateCode}
              disabled={loading || !prompt}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Code
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button
            onClick={handleDeploy}
            disabled={deploying || loading || !code || code.includes('//')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
          >
            {deploying ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Deploy Worker
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col bg-[#0d1117]">
        <div className="border-b border-slate-800/80 px-4 py-2 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Code size={16} />
            <span>worker.ts</span>
          </div>
          {status && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 animate-pulse">
              <CheckCircle2 size={14} />
              {status}
            </div>
          )}
        </div>

        <div className="flex-1 relative font-mono text-sm group">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900/20 border-r border-slate-800/50 flex flex-col items-center pt-6 text-slate-600 select-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="leading-6 h-6">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="absolute inset-0 w-full h-full bg-transparent pl-16 pr-6 py-6 text-slate-300 focus:outline-none resize-none overflow-auto leading-6"
            spellCheck={false}
          />
        </div>

        {/* Console / Logs */}
        <div className="h-48 border-t border-slate-800 bg-slate-950 flex flex-col">
          <div className="px-4 py-1.5 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <TerminalIcon size={12} />
            Console
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="text-slate-400">
                <span className="text-indigo-500 mr-2">›</span>
                {log}
              </div>
            ))}
            {error && (
              <div className="text-red-400 flex items-start gap-2 pt-1">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEditor;
