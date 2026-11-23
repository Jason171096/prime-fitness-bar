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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-16 px-6 bg-[#FAF6F0] border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/20 text-[#4A6B3E] flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Simulador de Etiqueta Térmica
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Formato Vaso 58mm · Rollo Adhesivo
              </p>
            </div>
          </div>

          <button
            onClick={closeLabelPreview}
            className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-white flex flex-col items-center justify-center overflow-y-auto">
          <StickerLabelPreview
            item={previewLabelItem}
            orderNumber={previewLabelOrderNumber}
            onPrintSuccess={() => {
              showToast('Etiqueta térmica emitida con éxito a Epson TM-L90', 'success');
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="h-16 px-6 bg-[#FAF6F0] border-t border-stone-200 flex items-center justify-end shrink-0">
          <button
            onClick={closeLabelPreview}
            className="px-5 h-11 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
