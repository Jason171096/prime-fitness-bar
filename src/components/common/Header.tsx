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
import { useClosureStore } from '../../store/closureStore';

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

  const currentShift = useClosureStore((state) => state.currentShift);

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
    <header className="no-print bg-white border-b border-stone-200 px-3 lg:px-4 py-2 lg:py-0 lg:h-18 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-3 shrink-0 shadow-sm select-none">
      {/* Top Row on Portrait / Left + Right on Landscape */}
      <div className="flex items-center justify-between gap-3 lg:contents">
        {/* Brand & Bar Station */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-[#4A6B3E] p-0.5 flex items-center justify-center shadow-md shadow-[#4A6B3E]/20 shrink-0">
            <div className="w-full h-full bg-[#FAF6F0] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 xl:w-6 xl:h-6 text-[#4A6B3E] fill-[#4A6B3E]/20" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base xl:text-xl font-extrabold tracking-tight text-stone-900 font-mono flex items-center gap-1.5">
                PRIME<span className="text-[#4A6B3E]">FITNESS</span>
              </h1>
            </div>
            <p className="hidden xl:flex text-xs text-stone-500 items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-[#D96B43]" />
              Smoothies, Bowls & Suplementación Deportiva
            </p>
          </div>
        </div>

        {/* Right Controls: Thermal Printer Status, Cashier, Live Clock */}
        <div className="flex items-center gap-2 lg:order-3 shrink-0">
          {/* Printer Status Badge (Shown on Portrait <lg and Wide Landscape xl+, compact on 1024px) */}
          <div
            title="Epson TM-L90 · TÉRMICA ONLINE"
            className="flex lg:hidden xl:flex items-center justify-center xl:justify-start gap-2 min-w-[48px] min-h-[48px] xl:min-h-0 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl bg-[#FAF6F0] border border-stone-200"
          >
            <div className="relative flex items-center justify-center">
              <Printer className="w-4 h-4 text-emerald-700" />
              <span className="xl:hidden absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <div className="hidden xl:flex flex-col text-left">
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
          <div className="flex items-center gap-2 min-h-[48px] xl:min-h-0 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl bg-[#FAF6F0] border border-stone-200">
            <div className="w-7 h-7 rounded-lg bg-[#4A6B3E]/10 text-[#4A6B3E] flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left max-w-[100px] xl:max-w-none">
              <span className="hidden xl:block text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                Cajero en Turno
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900 truncate">
                  {currentShift?.cashierName || 'Sin turno activo'}
                </span>
                {currentShift?.status === 'closed' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    Cerrado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Digital Clock */}
          <div className="flex items-center gap-2 min-h-[48px] xl:min-h-0 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/25 text-[#4A6B3E]">
            <Clock className="w-4 h-4 text-[#4A6B3E] shrink-0" />
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
      </div>

      {/* Main Mode Navigation (Touch targets >= 48px, evenly spread on portrait, compact row on landscape) */}
      <nav className="lg:order-2 grid grid-cols-4 lg:flex items-center gap-1.5 xl:gap-2.5 bg-[#FAF6F0] p-1.5 rounded-2xl border border-stone-200/80 shadow-inner w-full lg:w-auto">
        <button
          id="nav-pos-btn"
          onClick={() => onViewChange('pos')}
          className={`flex items-center gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-4 min-h-[48px] min-w-[48px] rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all active:scale-95 justify-center cursor-pointer ${activeView === 'pos'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <LayoutGrid className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
          <span className="truncate">Toma Comandas</span>
        </button>

        <button
          id="nav-billing-btn"
          onClick={() => onViewChange('billing')}
          className={`flex items-center gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-4 min-h-[48px] min-w-[48px] rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all active:scale-95 justify-center relative cursor-pointer ${activeView === 'billing'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Receipt className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
          <span className="truncate">Caja / Cobro</span>
          {pendingBillingCount > 0 && (
            <span className="px-1.5 xl:px-2 py-0.5 text-[11px] font-black rounded-full bg-[#D96B43] text-white font-mono shadow-sm animate-pulse shrink-0">
              {pendingBillingCount}
            </span>
          )}
        </button>

        <button
          id="nav-closure-btn"
          onClick={() => onViewChange('closure')}
          className={`flex items-center gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-4 min-h-[48px] min-w-[48px] rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all active:scale-95 justify-center cursor-pointer ${activeView === 'closure'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Scale className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
          <span className="truncate">Cierre / Arqueo</span>
        </button>

        <button
          id="nav-inv-btn"
          onClick={() => onViewChange('inventory')}
          className={`flex items-center gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-4 min-h-[48px] min-w-[48px] rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all active:scale-95 justify-center relative cursor-pointer ${activeView === 'inventory'
            ? 'bg-[#4A6B3E] text-white shadow-md shadow-[#4A6B3E]/25'
            : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200/70'
            }`}
        >
          <Boxes className="w-4 h-4 xl:w-5 xl:h-5 shrink-0" />
          <span className="truncate">Inventario</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 xl:px-2 py-0.5 text-[11px] font-black rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono shadow-sm shrink-0">
              {lowStockCount}!
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};
