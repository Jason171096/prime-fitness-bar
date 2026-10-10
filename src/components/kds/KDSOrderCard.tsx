import React from 'react';
import {
  Clock,
  Printer,
  CheckCircle,
  RotateCcw,
  Play,
  Check,
} from 'lucide-react';
import type { KDSOrder } from '../../types/kds.types';
import { useKDSStore } from '../../store/kdsStore';
import { usePOSStore } from '../../store/posStore';

interface KDSOrderCardProps {
  order: KDSOrder;
}

export const KDSOrderCard: React.FC<KDSOrderCardProps> = ({ order }) => {
  const advanceOrderStatus = useKDSStore((s) => s.advanceOrderStatus);
  const regressOrderStatus = useKDSStore((s) => s.regressOrderStatus);
  const markLabelPrinted = useKDSStore((s) => s.markLabelPrinted);
  const openLabelPreview = usePOSStore((s) => s.openLabelPreview);
  const showToast = usePOSStore((s) => s.showToast);

  // Time calculation & color alert rules:
  // Green: < 120s (2 min)
  // Yellow: 120s - 300s (2-5 min)
  // Red: > 300s (5+ min)
  const minutes = Math.floor(order.elapsedSeconds / 60);
  const seconds = order.elapsedSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  let alertBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  let cardBorderClass = 'border-slate-800 hover:border-slate-700';
  let isDelayed = false;

  if (order.elapsedSeconds >= 300) {
    // > 5 minutes: RED DELAYED
    alertBadgeClass = 'bg-rose-500 text-white font-black animate-pulse';
    cardBorderClass = 'border-rose-500 ring-2 ring-rose-500/40 animate-pulse-glow';
    isDelayed = true;
  } else if (order.elapsedSeconds >= 120) {
    // 2-5 minutes: YELLOW WARNING
    alertBadgeClass = 'bg-amber-500 text-slate-950 font-black';
    cardBorderClass = 'border-amber-500/60 ring-1 ring-amber-500/30';
  }

  const handlePrintLabel = () => {
    markLabelPrinted(order.id);
    if (order.items.length > 0) {
      openLabelPreview(order.items[0], order.orderNumber);
    } else {
      showToast(`Etiqueta para orden #${order.orderNumber} enviada a impresora`, 'success');
    }
  };

  return (
    <div
      className={`bg-slate-900 rounded-2xl border p-4 flex flex-col justify-between shadow-xl transition-all select-none ${cardBorderClass}`}
    >
      <div>
        {/* Card Header: Order #, Customer, and Timer Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono text-white tracking-tight">
                #ORD-{order.orderNumber}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {order.createdAt}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
              {order.customerName}
            </div>
          </div>

          {/* Real-time Stopwatch Alert */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-md ${alertBadgeClass}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
            {isDelayed && <span className="text-[10px] uppercase font-sans">¡DEMORADO!</span>}
          </div>
        </div>

        {/* Assigned Blender Station Tag */}
        {order.blenderStation && (
          <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Estación Asignada:</span>
            <span className="font-bold text-amber-400">{order.blenderStation}</span>
          </div>
        )}

        {/* Order Items & Recipe Breakdown */}
        <div className="mt-3 space-y-3">
          {order.items.map((item, idx) => {
            const custom = item.customization;

            return (
              <div
                key={item.cartItemId || idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 space-y-2"
              >
                {/* Item Name & Size */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-sm text-slate-100 block">
                      {item.quantity}x {item.product.name}
                    </span>
                    {custom && (
                      <span className="text-xs font-extrabold text-emerald-400 font-mono">
                        {custom.size.label} ({custom.size.volumeLabel})
                      </span>
                    )}
                  </div>

                  {custom && (
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {custom.calculatedMacros.calories} kcal · {custom.calculatedMacros.protein}g P
                    </span>
                  )}
                </div>

                {/* Explicit Recipe Ingredients Checkmarks for Kitchen Operator */}
                {custom && (
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span className="w-3 h-3 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                      <span>Base: <strong>{custom.liquidBase.shortName}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span className="w-3 h-3 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                      <span>
                        Proteína: <strong>{custom.proteinScoops}x {custom.protein.flavor}</strong>
                      </span>
                    </div>

                    {custom.extras.length > 0 && (
                      <div className="pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">
                          SUPLEMENTOS ADICIONALES:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {custom.extras.map((ex) => (
                            <span
                              key={ex.id}
                              className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            >
                              ★ {ex.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {custom.specialNotes && (
                      <div className="mt-1 p-1.5 bg-amber-950/40 border border-amber-800/40 rounded text-[11px] font-bold text-amber-300">
                        ⚠ NOTA COCINA: {custom.specialNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        {/* Thermal Label Action */}
        <button
          onClick={handlePrintLabel}
          className={`h-11 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
            order.labelPrinted
              ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 animate-pulse'
          }`}
          title="Imprimir etiqueta adhesiva para el vaso"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>{order.labelPrinted ? 'Reimprimir' : 'Imprimir'}</span>
        </button>

        {/* State Transition Actions */}
        <div className="flex items-center gap-1.5">
          {order.status !== 'pending' && (
            <button
              onClick={() => regressOrderStatus(order.id)}
              className="w-10 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              title="Regresar estado previo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {order.status === 'pending' && (
            <button
              onClick={() => advanceOrderStatus(order.id)}
              className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Licuadora</span>
            </button>
          )}

          {order.status === 'blending' && (
            <button
              onClick={() => advanceOrderStatus(order.id)}
              className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Marcar Listo</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => advanceOrderStatus(order.id)}
              className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Entregar al Cliente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
