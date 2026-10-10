import React from 'react';
import { X, Tag } from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import { StickerLabelPreview } from './StickerLabelPreview';

export const PrintSimulatorModal: React.FC = () => {
  const isLabelModalOpen = usePOSStore((s) => s.isLabelModalOpen);
  const previewLabelItem = usePOSStore((s) => s.previewLabelItem);
  const previewLabelOrderNumber = usePOSStore((s) => s.previewLabelOrderNumber);
  const closeLabelPreview = usePOSStore((s) => s.closeLabelPreview);
  const showToast = usePOSStore((s) => s.showToast);

  if (!isLabelModalOpen || !previewLabelItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20">
        {/* Modal Header */}
        <div className="h-16 px-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Simulador de Etiqueta Térmica
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Formato Vaso 58mm · Rollo Adhesivo
              </p>
            </div>
          </div>

          <button
            onClick={closeLabelPreview}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center justify-center overflow-y-auto">
          <StickerLabelPreview
            item={previewLabelItem}
            orderNumber={previewLabelOrderNumber}
            onPrintSuccess={() => {
              showToast('Etiqueta térmica emitida con éxito a Epson TM-L90', 'success');
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="h-16 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={closeLabelPreview}
            className="px-5 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
