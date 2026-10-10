import React from 'react';
import {
  CheckCircle2,
  Printer,
  ChevronRight,
  ChefHat,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';

interface OrderSuccessModalProps {
  onNavigateToKDS: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  onNavigateToKDS,
}) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center ring-2 ring-emerald-500/20 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
          ¡COBRO COMPLETADO CON ÉXITO!
        </span>

        <h3 className="text-3xl font-black font-mono text-white mt-2">
          #ORD-{lastOrder.orderNumber}
        </h3>

        <p className="text-sm text-slate-300 mt-1 font-medium">
          Cliente: <strong className="text-white">{lastOrder.customerName}</strong>
        </p>

        {/* Order Details Card */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-left">
          <div className="flex justify-between text-slate-400">
            <span>Método de Pago:</span>
            <span className="font-bold text-slate-200 capitalize">
              {lastOrder.paymentMethod === 'gym_account'
                ? 'Cuenta Socio Gimnasio'
                : lastOrder.paymentMethod === 'card'
                ? 'Tarjeta / Contactless'
                : 'Efectivo'}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Total Cobrado:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              ${lastOrder.total.toFixed(2)}
            </span>
          </div>

          {lastOrder.cashChange !== undefined && lastOrder.cashChange > 0 && (
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-850">
              <span className="text-amber-400 font-bold">Cambio / Vuelto Entregado:</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                ${lastOrder.cashChange.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-850">
            <span>Destino de Preparación:</span>
            <span className="text-emerald-400 font-bold">
              Despachado a pantalla KDS Licuadoras
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full mt-6 space-y-2.5">
          {/* Print Label Action Button */}
          <button
            onClick={handlePrintLabel}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40"
          >
            <Printer className="w-5 h-5" />
            <span>Imprimir Etiqueta Adhesiva para Vaso</span>
          </button>

          {/* View in KDS Button */}
          <button
            onClick={() => {
              closeSuccessModal();
              onNavigateToKDS();
            }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
          >
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Ver Comanda en Tablero KDS</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Next Sale Button */}
          <button
            onClick={closeSuccessModal}
            className="w-full h-11 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-bold transition-all"
          >
            Nueva Venta (Cerrar)
          </button>
        </div>
      </div>
    </div>
  );
};
