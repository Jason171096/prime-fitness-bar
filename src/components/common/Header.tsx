import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Printer,
  LayoutGrid,
  Boxes,
  User,
  Zap,
  Receipt,
  Scale,
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useBillingStore } from '../../store/billingStore';

export type AppViewMode = 'pos' | 'billing' | 'closure' | 'inventory';

interface HeaderProps {
  activeView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  onOpenQuickLabel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onOpenQuickLabel: _onOpenQuickLabel,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const billingOrders = useBillingStore((s) => s.orders);
  const pendingBillingCount = billingOrders.filter((o) => o.status === 'pending_payment').length;

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
    <header className="no-print h-18 bg-white border-b border-stone-200 px-4 flex items-center justify-between shrink-0 shadow-sm select-none">
      {/* Brand & Bar Station */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#4A6B3E] p-0.5 flex items-center justify-center shadow-md shadow-[#4A6B3E]/20">
          <div className="w-full h-full bg-[#FAF6F0] rounded-[10px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#4A6B3E] fill-[#4A6B3E]/20" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-stone-900 font-mono flex items-center gap-1.5">
              PRIME<span className="text-[#4A6B3E]">FITNESS</span>
              {/* <span className="text-xs px-2 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] border border-[#4A6B3E]/20 font-sans font-semibold">
                BAR POS
              </span> */}
            </h1>
          </div>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 text-[#D96B43]" />
            Smoothies, Bowls & Suplementación Deportiva
          </p>
        </div>
      </div>

      {/* Main Mode Navigation (Large touch buttons min-h 48px) */}
      <nav className="flex items-center gap-1.5 bg-[#FAF6F0] p-1.5 rounded-2xl border border-stone-200/80 shadow-inner">
        <button
          id="nav-pos-btn"
          onClick={() => onViewChange('pos')}
          className={`flex items-center gap-2.5 px-4 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[125px] justify-center cursor-pointer ${activeView === 'pos'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Toma Comandas</span>
        </button>

        <button
          id="nav-billing-btn"
          onClick={() => onViewChange('billing')}
          className={`flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[145px] justify-center relative cursor-pointer ${activeView === 'billing'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Caja / Cobro</span>
          {pendingBillingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-black rounded-full bg-[#D96B43] text-white font-mono shadow-sm animate-pulse">
              {pendingBillingCount}
            </span>
          )}
        </button>

        <button
          id="nav-closure-btn"
          onClick={() => onViewChange('closure')}
          className={`flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[145px] justify-center cursor-pointer ${activeView === 'closure'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Scale className="w-5 h-5" />
          <span>Cierre / Arqueo</span>
        </button>

        <button
          id="nav-inv-btn"
          onClick={() => onViewChange('inventory')}
          className={`flex items-center gap-2 px-4 h-12 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-95 min-w-[135px] justify-center relative cursor-pointer ${activeView === 'inventory'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Inventario</span>
          {lowStockCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-black rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono shadow-sm">
              {lowStockCount} !
            </span>
          )}
        </button>
      </nav>

      {/* Right Controls: Thermal Printer Status, Cashier, Live Clock */}
      <div className="flex items-center gap-2.5">

        {/* Printer Status Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-stone-200">
          <Printer className="w-4 h-4 text-emerald-700" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
              Epson TM-L90
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping inline-block" />
              TÉRMICA ONLINE
            </span>
          </div>
        </div>

        {/* Cashier Info */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-stone-200">
          <div className="w-7 h-7 rounded-lg bg-[#4A6B3E]/10 text-[#4A6B3E] flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
              Cajero en Turno
            </span>
            <span className="text-xs font-bold text-stone-900">Marcos Vega</span>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/25 text-[#4A6B3E]">
          <Clock className="w-4 h-4 text-[#4A6B3E]" />
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold font-mono tracking-wider text-stone-900">
              {currentTime || '--:--:--'}
            </span>
            <span className="text-[10px] text-[#4A6B3E] uppercase font-semibold">
              {currentDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
