import React, { useState } from 'react';
import { Search, X, Sparkles, Filter } from 'lucide-react';
import { CategoryTabs } from './CategoryTabs';
import { ProductCard } from './ProductCard';
import { usePOSStore } from '../../store/posStore';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

export const ProductCatalog: React.FC = () => {
  const activeCategory = usePOSStore((s) => s.activeCategory);
  const searchQuery = usePOSStore((s) => s.searchQuery);
  const setSearchQuery = usePOSStore((s) => s.setSearchQuery);

  const [selectedTag, setSelectedTag] = useState<string>('todos');

  // Filter products by category, search text, and tag
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesCategory = product.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tags && product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag =
      selectedTag === 'todos' ||
      (product.tags && product.tags.includes(selectedTag)) ||
      (selectedTag === 'customizable' && product.isCustomizable);

    return matchesCategory && matchesSearch && matchesTag;
  });

  const availableTags = [
    { id: 'todos', label: 'Todos' },
    { id: 'Hipertrofia', label: '💪 Hipertrofia' },
    { id: 'Post-Workout', label: '⚡ Post-Workout' },
    { id: 'Definición', label: '🔥 Definición' },
    { id: 'Vegano', label: '🌱 Vegano' },
    { id: 'customizable', label: '⚙️ Con Modificadores' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF6F0] p-4 gap-3 select-none">
      {/* Category Tabs Row */}
      <CategoryTabs />

      {/* Search and Fast Tag Pills */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Touch Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="product-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por batido, proteína o ingrediente..."
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-1 focus:ring-[#4A6B3E] transition-all font-medium shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tags (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 h-9 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 cursor-pointer ${
                selectedTag === tag.id
                  ? 'bg-[#4A6B3E] text-white border border-[#4A6B3E] shadow-sm'
                  : 'bg-white text-stone-700 hover:text-stone-900 border border-stone-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid (Smooth scrollable, large cards) */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <Sparkles className="w-10 h-10 text-stone-400 mb-2" />
            <h4 className="text-base font-bold text-stone-900">
              No se encontraron productos
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm">
              Prueba cambiando la búsqueda o seleccionando otra categoría en la botonera superior.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('todos');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pb-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
