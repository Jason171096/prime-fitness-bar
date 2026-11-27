import React from 'react';
import { SlidersHorizontal, Plus, Flame, Dumbbell, Zap } from 'lucide-react';
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
    <button
      type="button"
      onClick={handleClick}
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-[#4A6B3E]/70 flex flex-col overflow-hidden transition-transform duration-150 active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md min-h-[300px] text-left select-none w-full"
    >
      {/* Product Image Header */}
      <div className="relative h-34 md:h-36 w-full overflow-hidden bg-[#FAF6F0] shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Quick Mode Indicator (Customizable vs 1-Tap) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {product.isCustomizable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-stone-200 text-[#4A6B3E] text-[11px] font-extrabold shadow-sm">
              <SlidersHorizontal className="w-3 h-3" />
              Personalizable
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4A6B3E]/95 backdrop-blur-md text-white text-[11px] font-extrabold shadow-sm">
              <Zap className="w-3 h-3" />
              1 Toque
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <div className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 font-mono font-extrabold text-base shadow-md flex items-center gap-0.5">
            <span className="text-[#4A6B3E] text-xs font-sans font-bold">$</span>
            {product.basePrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5 w-full">
        <div>
          <h3 className="font-bold text-stone-900 text-sm md:text-base leading-snug group-hover:text-[#4A6B3E] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Key Macros & Tactile Action Indicator */}
        <div className="pt-2.5 border-t border-stone-100 flex flex-col gap-2.5">
          {/* Macros clave (Kcal / Proteína) */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF6F0] border border-stone-200/80 text-[11px] font-mono font-bold text-stone-700">
              <Flame className="w-3.5 h-3.5 text-[#D96B43]" />
              {product.baseMacros.calories} kcal
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#4A6B3E]/10 border border-[#4A6B3E]/20 text-[11px] font-mono font-extrabold text-[#4A6B3E]">
              <Dumbbell className="w-3.5 h-3.5 text-[#4A6B3E]" />
              {product.baseMacros.protein}g Prot
            </span>
          </div>

          {/* Action Touch Indicator (>= 48px height) */}
          <div
            className={`w-full min-h-[48px] px-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm ${product.isCustomizable
              ? 'bg-[#FAF6F0] group-hover:bg-[#4A6B3E] text-stone-800 group-hover:text-white border border-stone-200 group-hover:border-[#4A6B3E]'
              : 'bg-[#4A6B3E] group-hover:bg-[#3d5933] text-white'
              }`}
          >
            {product.isCustomizable ? (
              <>
                <SlidersHorizontal className="w-4 h-4 text-[#4A6B3E] group-hover:text-white transition-colors shrink-0" />
                <span>Configurar Batido</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 shrink-0" />
                <span>Agregar Rápido</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
