import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Printer,
  LayoutGrid,
  ChefHat,
  Boxes,
  User,
  Zap,
  Tag,
} from 'lucide-react';
import { useKDSStore } from '../../store/kdsStore';
import { useInventoryStore } from '../../store/inventoryStore';

export type AppViewMode = 'pos' | 'kds' | 'inventory';

interface HeaderProps {
  activeView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  onOpenQuickLabel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onOpenQuickLabel,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const kdsOrders = useKDSStore((s) => s.orders);
  const activeKDICount = kdsOrders.filter((o) => o.status !== 'delivered').length;

  const inventory = useInventoryStore((s) => s.inventory);
  const getItemStatus = useInventoryStore((s) => s.getItemStockStatus);
  const lowStockCount = inventory.filter(
    (item) => getItemStatus(item) !== 'optimal'
  ).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-18 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-lg select-none">
      {/* Brand & Bar Station */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/30" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-mono flex items-center gap-1.5">
              PRIME<span className="text-emerald-400">FITNESS</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans font-semibold">
                BAR POS
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Smoothies, Bowls & Suplementación Deportiva
          </p>
        </div>
      </div>

      {/* Main Mode Navigation (Large touch buttons min-h 48px) */}
      <nav className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
        <button
          id="nav-pos-btn"
          onClick={() => onViewChange('pos')}
          className={`flex items-center gap-2.5 px-5 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[130px] justify-center ${activeView === 'pos'
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Caja POS</span>
        </button>

        {/* <button
          id="nav-kds-btn"
          onClick={() => onViewChange('kds')}
          className={`flex items-center gap-2.5 px-5 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[150px] justify-center relative ${
            activeView === 'kds'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ChefHat className="w-5 h-5" />
          <span>KDS Licuadoras</span>
          {activeKDICount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-black rounded-full bg-red-600 text-white animate-pulse shadow-md">
              {activeKDICount}
            </span>
          )}
        </button> */}

        <button
          id="nav-inv-btn"
          onClick={() => onViewChange('inventory')}
          className={`flex items-center gap-2.5 px-5 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[155px] justify-center relative ${activeView === 'inventory'
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400/50'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Inventario BOM</span>
          {lowStockCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-black rounded-full bg-amber-500 text-slate-950 font-mono shadow-md">
              {lowStockCount} !
            </span>
          )}
        </button>
      </nav>

      {/* Right Controls: Thermal Printer Status, Cashier, Live Clock */}
      <div className="flex items-center gap-3">
        {onOpenQuickLabel && (
          <button
            onClick={onOpenQuickLabel}
            className="hidden lg:flex items-center gap-2 px-3.5 h-11 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold active:scale-95 transition-all"
            title="Vista rápida de etiqueta térmica adhesiva"
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Simulador Etiqueta</span>
          </button>
        )}

        {/* Printer Status Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <Printer className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Epson TM-L90
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              TÉRMICA ONLINE
            </span>
          </div>
        </div>

        {/* Cashier Info */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Cajero en Turno
            </span>
            <span className="text-xs font-bold text-slate-200">Marcos Vega</span>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold font-mono tracking-wider">
              {currentTime || '--:--:--'}
            </span>
            <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">
              {currentDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
