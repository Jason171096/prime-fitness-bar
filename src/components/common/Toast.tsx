import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePOSStore } from '../../store/posStore';

export const Toast: React.FC = () => {
  const toast = usePOSStore((s) => s.toast);
  const hideToast = usePOSStore((s) => s.hideToast);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce select-none">
      <div
        className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : toast.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : toast.type === 'warning'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            : 'bg-slate-900/90 border-slate-700 text-slate-200'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}

        <span className="text-xs font-bold font-sans">{toast.message}</span>

        <button
          onClick={hideToast}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
