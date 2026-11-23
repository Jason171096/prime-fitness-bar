import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePOSStore } from '../../store/posStore';

export const Toast: React.FC = () => {
  const toast = usePOSStore((s) => s.toast);
  const hideToast = usePOSStore((s) => s.hideToast);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-bounce select-none">
      <div
        className={`px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : toast.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />}
        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-800 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-[#4A6B3E] shrink-0" />}

        <span className="text-xs font-bold font-sans">{toast.message}</span>

        <button
          onClick={hideToast}
          className="p-1 rounded-lg hover:bg-stone-200/70 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
