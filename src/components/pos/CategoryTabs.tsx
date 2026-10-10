import React from 'react';
import { CupSoda, Utensils, Salad, Cookie, Droplets } from 'lucide-react';
import type { Category } from '../../types/pos.types';
import { usePOSStore } from '../../store/posStore';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

interface CategoryItem {
  id: Category;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'smoothies',
    label: 'Smoothies Proteicos',
    sublabel: 'Batidos & Shakes Fit',
    icon: CupSoda,
  },
  {
    id: 'bowls',
    label: 'Bowls & Açaí Power',
    sublabel: 'Tazones con Toppings',
    icon: Utensils,
  },
  {
    id: 'salads',
    label: 'Ensaladas & Meals',
    sublabel: 'Pollo, Salmón & Wraps',
    icon: Salad,
  },
  {
    id: 'snacks',
    label: 'Snacks & Barritas',
    sublabel: 'Whey Cookies & Barras',
    icon: Cookie,
  },
  {
    id: 'drinks',
    label: 'Bebidas & Hidratación',
    sublabel: 'BCAA & Electrolitos',
    icon: Droplets,
  },
];

export const CategoryTabs: React.FC = () => {
  const activeCategory = usePOSStore((s) => s.activeCategory);
  const setActiveCategory = usePOSStore((s) => s.setActiveCategory);

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto p-1 py-2 scrollbar-none select-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        const count = MOCK_PRODUCTS.filter((p) => p.category === cat.id).length;

        return (
          <button
            key={cat.id}
            id={`category-tab-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3.5 px-4.5 py-3 rounded-2xl min-h-[58px] transition-all text-left active:scale-[0.98] border shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 text-white border-emerald-400/60 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-800/90 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-emerald-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight whitespace-nowrap">
                  {cat.label}
                </span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-black/25 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>
              <span
                className={`text-[11px] ${
                  isActive ? 'text-emerald-100 font-medium' : 'text-slate-400'
                }`}
              >
                {cat.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
