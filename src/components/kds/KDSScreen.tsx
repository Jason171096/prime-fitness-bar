import React, { useEffect } from 'react';
import {
  ChefHat,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { KDSOrderCard } from './KDSOrderCard';

export const KDSScreen: React.FC = () => {
  const orders = useKDSStore((s) => s.orders);
  const tickTimers = useKDSStore((s) => s.tickTimers);
  const filterStation = useKDSStore((s) => s.filterStation);
  const setFilterStation = useKDSStore((s) => s.setFilterStation);

  // Tick the live stopwatch for all active orders
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimers]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const blendingOrders = orders.filter((o) => o.status === 'blending');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const delayedCount = orders.filter(
    (o) => o.status !== 'delivered' && o.elapsedSeconds >= 300
  ).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 gap-4 overflow-hidden select-none">
      {/* KDS Control & Metrics Bar */}
      <div className="h-16 px-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              KDS · Barra de Licuadoras & Batidos
            </h2>
            <p className="text-xs text-slate-400">
              Estación de preparación en tiempo real
            </p>
          </div>
        </div>

        {/* Legend of Alert Times */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>&lt; 2 min (Óptimo)</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>2 - 5 min (Atención)</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>&gt; 5 min (Crítico)</span>
            {delayedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/40 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                {delayedCount} demorado{delayedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterStation('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStation === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({orders.filter((o) => o.status !== 'delivered').length})
          </button>
          <button
            onClick={() => setFilterStation('blender')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStation === 'blender'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Licuadoras
          </button>
        </div>
      </div>

      {/* 3-Column Real-time Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: PENDIENTES */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          {/* Column Header */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Por Iniciar (Cola)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/40">
              {pendingOrders.length}
            </span>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-slate-700 mb-2" />
                <span className="text-xs font-semibold">Sin órdenes pendientes</span>
              </div>
            ) : (
              pendingOrders.map((ord) => <KDSOrderCard key={ord.id} order={ord} />)
            )}
          </div>
        </div>

        {/* COLUMN 2: EN LICUADORA / PREPARACIÓN */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          {/* Column Header */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                En Licuadora / Batido
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/40">
              {blendingOrders.length}
            </span>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {blendingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                <ChefHat className="w-8 h-8 text-slate-700 mb-2" />
                <span className="text-xs font-semibold">
                  Ningún batido en preparación en este momento
                </span>
              </div>
            ) : (
              blendingOrders.map((ord) => <KDSOrderCard key={ord.id} order={ord} />)
            )}
          </div>
        </div>

        {/* COLUMN 3: LISTO PARA ENTREGA */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
          {/* Column Header */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                Listo para Recoger
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-black text-xs border border-blue-500/40">
              {readyOrders.length}
            </span>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500">
                <Clock className="w-8 h-8 text-slate-700 mb-2" />
                <span className="text-xs font-semibold">Sin pedidos por entregar</span>
              </div>
            ) : (
              readyOrders.map((ord) => <KDSOrderCard key={ord.id} order={ord} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
