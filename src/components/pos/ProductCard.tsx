import React from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';
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
      className="group relative bg-white rounded-2xl border border-stone-200 hover:border-[#4A6B3E]/60 flex flex-col overflow-hidden transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md min-h-[290px] select-none"
    >
      {/* Product Image Header */}
      <div className="relative h-36 w-full overflow-hidden bg-[#FAF6F0]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <div className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 font-mono font-extrabold text-base shadow-md flex items-center gap-0.5">
            <span className="text-[#4A6B3E] text-xs font-sans font-bold">$</span>
            {product.basePrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-[#4A6B3E] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Macro Pill & Tags */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col gap-2">

          {/* Action Touch Trigger */}
          <button
            className={`w-full h-11 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all mt-1 active:scale-95 shadow-sm cursor-pointer ${product.isCustomizable
              ? 'bg-[#FAF6F0] group-hover:bg-[#4A6B3E] text-stone-700 group-hover:text-white border border-stone-200 group-hover:border-[#4A6B3E]'
              : 'bg-[#4A6B3E] hover:bg-[#3d5933] text-white'
              }`}
          >
            {product.isCustomizable ? (
              <>
                <SlidersHorizontal className="w-4 h-4 text-[#4A6B3E] group-hover:text-white transition-colors" />
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
