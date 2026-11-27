import React from 'react';
import { EggFried, Flame, Sandwich, Salad, Citrus, CupSoda } from 'lucide-react';
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
    label: 'Smoothies',
    sublabel: 'Whey, Matcha & Creatina',
    icon: CupSoda,
  },
  {
    id: 'omelets',
    label: 'Omelets & Huevos',
    sublabel: 'Con Hash Brown & Desayunos',
    icon: EggFried,
  },
  {
    id: 'chilaquiles',
    label: 'Chilaquiles Fit',
    sublabel: 'Pollo o Bistec a Elegir',
    icon: Flame,
  },
  {
    id: 'toasts',
    label: 'Tost',
    sublabel: 'Aguacate, Requesón & Salmón',
    icon: Sandwich,
  },
  {
    id: 'salads',
    label: 'Ensaladas',
    sublabel: 'Pollo, Atún, Tofu & Pavo',
    icon: Salad,
  },
  {
    id: 'juices',
    label: 'Jugos',
    sublabel: 'Detox, Betabel & Cítricos',
    icon: Citrus,
  },
];

export const CategoryTabs: React.FC = () => {
  const activeCategory = usePOSStore((s) => s.activeCategory);
  const setActiveCategory = usePOSStore((s) => s.setActiveCategory);

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-1.5 px-0.5 scrollbar-none touch-pan-x snap-x snap-mandatory select-none shrink-0">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        const count = MOCK_PRODUCTS.filter((p) => p.category === cat.id).length;

        return (
          <button
            key={cat.id}
            id={`category-tab-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl min-h-[56px] min-w-[48px] transition-all text-left active:scale-[0.98] border shrink-0 snap-start cursor-pointer ${isActive
                ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-md shadow-[#4A6B3E]/25'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm'
              }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FAF6F0] text-[#4A6B3E] border border-stone-200/70'
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
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#FAF6F0] text-stone-600'
                    }`}
                >
                  {count}
                </span>
              </div>
              <span
                className={`text-[11px] whitespace-nowrap ${isActive ? 'text-white/85 font-medium' : 'text-stone-500'
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
