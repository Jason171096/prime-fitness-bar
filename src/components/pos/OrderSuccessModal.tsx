import React from 'react';
import {
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';

export const OrderSuccessModal: React.FC = () => {
  const isSuccessModalOpen = usePOSStore((s) => s.isSuccessModalOpen);
  const lastOrder = usePOSStore((s) => s.lastOrder);
  const closeSuccessModal = usePOSStore((s) => s.closeSuccessModal);
  const openLabelPreview = usePOSStore((s) => s.openLabelPreview);

  if (!isSuccessModalOpen || !lastOrder) return null;

  const handlePrintLabel = () => {
    if (lastOrder.items.length > 0) {
      openLabelPreview(lastOrder.items[0], lastOrder.orderNumber);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-sm mb-4">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ¡COBRO COMPLETADO CON ÉXITO!
        </span>

        <h3 className="text-3xl font-black font-mono text-stone-900 mt-3">
          #ORD-{lastOrder.orderNumber}
        </h3>

        <p className="text-sm text-stone-700 mt-1 font-medium">
          Cliente: <strong className="text-stone-900">{lastOrder.customerName}</strong>
        </p>

        {/* Order Details Card */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200 text-xs space-y-2 text-left">
          <div className="flex justify-between text-stone-500">
            <span>Método de Pago:</span>
            <span className="font-bold text-stone-900 capitalize">
              {lastOrder.paymentMethod === 'gym_account'
                ? 'Cuenta Socio Gimnasio'
                : lastOrder.paymentMethod === 'card'
                ? 'Tarjeta / Contactless'
                : 'Efectivo'}
            </span>
          </div>

          <div className="flex justify-between text-stone-500">
            <span>Total Cobrado:</span>
            <span className="font-mono font-black text-[#4A6B3E] text-sm">
              ${lastOrder.total.toFixed(2)}
            </span>
          </div>

          {lastOrder.cashChange !== undefined && lastOrder.cashChange > 0 && (
            <div className="flex justify-between pt-2 border-t border-stone-200">
              <span className="text-amber-800 font-bold">Cambio / Vuelto Entregado:</span>
              <span className="font-mono font-black text-amber-800 text-sm">
                ${lastOrder.cashChange.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full mt-6 space-y-2.5">
          {/* Print Label Action Button */}
          <button
            onClick={handlePrintLabel}
            className="w-full h-13 rounded-2xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir Etiqueta Adhesiva para Vaso</span>
          </button>

          {/* Next Sale Button */}
          <button
            onClick={closeSuccessModal}
            className="w-full h-11 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-700 hover:text-stone-900 text-xs font-bold border border-stone-200 transition-all cursor-pointer"
          >
            Nueva Venta (Cerrar)
          </button>
        </div>
      </div>
    </div>
  );
};
