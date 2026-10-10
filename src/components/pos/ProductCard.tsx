import React from 'react';
import { SlidersHorizontal, Plus, Flame, Sparkles } from 'lucide-react';
import type { Product } from '../../types/pos.types';
import { usePOSStore } from '../../store/posStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = usePOSStore((s) => s.addToCart);
  const openCustomizer = usePOSStore((s) => s.openCustomizer);

  const handleClick = () => {
    if (product.isCustomizable) {
      openCustomizer(product);
    } else {
      addToCart(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/50 flex flex-col overflow-hidden transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg hover:shadow-emerald-500/10 min-h-[290px] select-none"
    >
      {/* Product Image Header */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-950">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {product.popularBadge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              {product.popularBadge}
            </span>
          )}
          {product.isCustomizable && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              Personalizable
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <div className="px-3 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-white font-mono font-extrabold text-base shadow-lg flex items-center gap-0.5">
            <span className="text-emerald-400 text-xs font-sans font-bold">$</span>
            {product.basePrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-base leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Macro Pill & Tags */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="font-bold text-slate-200">{product.baseMacros.calories}</span>
              <span className="text-[10px] text-slate-400">kcal</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
              <span>{product.baseMacros.protein}g</span>
              <span className="text-[10px] text-emerald-400/80 uppercase font-sans">Prot</span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              <span className="text-slate-300">{product.baseMacros.carbs}g</span> C ·{' '}
              <span className="text-slate-300">{product.baseMacros.fat}g</span> F
            </div>
          </div>

          {/* Action Touch Trigger */}
          <button
            className={`w-full h-11 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all mt-1 active:scale-95 shadow-md ${
              product.isCustomizable
                ? 'bg-slate-800 hover:bg-emerald-600/90 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {product.isCustomizable ? (
              <>
                <SlidersHorizontal className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                <span>Configurar Modificadores</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Agregar Rápido</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
