import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  BookOpen,
  Clock,
  Flame,
  Salad,
  Zap,
  Edit3,
  Trash2,
  Save,
  X,
  ChefHat,
  Sparkles,
  Check,
  RotateCcw,
  Printer,
  ChevronLeft,
  Utensils,
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import type {
  RecipeBOM,
  RecipeStation,
  BOMIngredient,
  PreparationStep,
} from '../../types/inventory.types';
import { usePOSStore } from '../../store/posStore';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import {
  INGREDIENT_IMAGE_MAP,
  DEFAULT_INGREDIENT_IMAGE,
  DEFAULT_STEP_IMAGE,
} from '../../data/mockRecipes';

// =============================================================================
// HELPERS EDITORIALES Y DE IMAGEN
// =============================================================================

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
}

const EditorialImage: React.FC<EditorialImageProps> = ({ src, alt, className = '' }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = !src || failedSrc === src;

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EFE8DC] text-[#7B7263] ${className}`}
        aria-label={alt}
      >
        <Utensils className="w-6 h-6 opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
};

const splitEditorialTitle = (name: string): { scriptPart: string; boldPart: string } => {
  if (name.includes('/')) {
    const [left, right] = name.split('/').map((s) => s.trim());
    return { scriptPart: left, boldPart: right };
  }

  if (name.includes('(') && name.includes(')')) {
    const openIdx = name.indexOf('(');
    const closeIdx = name.indexOf(')');
    const left = name.slice(0, openIdx).trim();
    const inside = name.slice(openIdx + 1, closeIdx).trim();
    return { scriptPart: left, boldPart: inside };
  }

  if (name.includes(':')) {
    const [left, right] = name.split(':').map((s) => s.trim());
    return { scriptPart: left, boldPart: right };
  }

  if (name.includes('&')) {
    const ampIdx = name.indexOf('&');
    const left = name.slice(0, ampIdx + 1).trim();
    const right = name.slice(ampIdx + 1).trim();
    return { scriptPart: left, boldPart: right };
  }

  const words = name.split(' ').filter(Boolean);
  if (words.length <= 2) {
    return { scriptPart: words[0] || '', boldPart: words.slice(1).join(' ') || name };
  }
  const splitIndex = Math.ceil(words.length / 2);
  return {
    scriptPart: words.slice(0, splitIndex).join(' '),
    boldPart: words.slice(splitIndex).join(' '),
  };
};

const getCategoryDisplayLabel = (category: string): string => {
  switch (category) {
    case 'omelets':
      return 'Omelets & Huevos';
    case 'chilaquiles':
      return 'Chilaquiles Fit';
    case 'toasts':
      return 'Tost Artesanal';
    case 'salads':
      return 'Ensaladas Fit';
    case 'juices':
      return 'Cold-Pressed';
    case 'smoothies':
      return 'Smoothie Proteico';
    default:
      return category;
  }
};

export const InventoryScreen: React.FC = () => {
  const inventory = useInventoryStore((s) => s.inventory);
  const recipes = useInventoryStore((s) => s.recipes);
  const getItemStockStatus = useInventoryStore((s) => s.getItemStockStatus);
  const updateRecipe = useInventoryStore((s) => s.updateRecipe);
  const showToast = usePOSStore((s) => s.showToast);

  // Tabs
  const [activeTab, setActiveTab] = useState<'stock' | 'bom'>('stock');

  // Tab 1 (Stock) States
  const [filterStockCategory, setFilterStockCategory] = useState<string>('all');
  const [searchStockQuery, setSearchStockQuery] = useState<string>('');

  // Tab 2 (Recipe BOM) States
  const [searchRecipeQuery, setSearchRecipeQuery] = useState<string>('');
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedRecipeProductId, setSelectedRecipeProductId] = useState<string>(
    recipes[0]?.productId || ''
  );

  // Pasos completados interactivamente por receta (estado táctil de cocina)
  const [completedSteps, setCompletedSteps] = useState<Record<string, Record<number, boolean>>>({});

  // Modal de Edición Rápida
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeBOM | null>(null);
  const [newStepText, setNewStepText] = useState<string>('');

  // Ingrediente a agregar en modal de edición
  const [selectedNewInventoryId, setSelectedNewInventoryId] = useState<string>('');
  const [newIngredientQty, setNewIngredientQty] = useState<number>(10);

  // ===========================================================================
  // FILTRADO TAB 1: STOCK
  // ===========================================================================
  const filteredStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCat =
        filterStockCategory === 'all' || item.category === filterStockCategory;
      const matchesQuery =
        item.name.toLowerCase().includes(searchStockQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchStockQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [inventory, filterStockCategory, searchStockQuery]);

  // ===========================================================================
  // FILTRADO TAB 2: RECIPES BOM
  // ===========================================================================
  const filteredRecipes = useMemo(() => {
    return recipes.filter((rec) => {
      const matchesStation =
        filterStation === 'all' || rec.station === filterStation;
      const matchesCategory =
        filterCategory === 'all' || rec.category === filterCategory;

      const q = searchRecipeQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.productName.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q) ||
        rec.tagline.toLowerCase().includes(q) ||
        (rec.ingredients || rec.baseIngredients || []).some((ing) =>
          ing.name.toLowerCase().includes(q)
        );

      return matchesStation && matchesCategory && matchesSearch;
    });
  }, [recipes, filterStation, filterCategory, searchRecipeQuery]);

  // Receta seleccionada actual (permite cerrar la vista cuando selectedRecipeProductId === '')
  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeProductId) return null;
    return recipes.find((r) => r.productId === selectedRecipeProductId) || null;
  }, [recipes, selectedRecipeProductId]);

  // Metadatos de producto desde mockProducts
  const selectedProductMeta = useMemo(() => {
    if (!selectedRecipe) return null;
    return MOCK_PRODUCTS.find((p) => p.id === selectedRecipe.productId) || null;
  }, [selectedRecipe]);

  // ===========================================================================
  // HELPERS DE ESTADO Y ESTACIONES
  // ===========================================================================
  const getStationBadge = (station: RecipeStation) => {
    switch (station) {
      case 'Cocina Caliente / Plancha':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: Flame,
          label: 'Cocina Caliente',
        };
      case 'Barra Fría / Ensaladas':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: Salad,
          label: 'Barra Fría',
        };
      case 'Barra de Smoothies y Jugos':
      default:
        return {
          bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          dot: 'bg-cyan-400',
          icon: Zap,
          label: 'Barra de Bebidas',
        };
    }
  };

  const getRecipeIngredientsStatus = (recipe: RecipeBOM) => {
    const ingredients = recipe.ingredients || recipe.baseIngredients || [];
    let hasCritical = false;
    let hasWarning = false;

    for (const ing of ingredients) {
      const inv = inventory.find((i) => i.id === ing.inventoryItemId);
      if (inv) {
        const st = getItemStockStatus(inv);
        if (st === 'critical') hasCritical = true;
        if (st === 'warning') hasWarning = true;
      }
    }

    if (hasCritical) return 'critical';
    if (hasWarning) return 'warning';
    return 'optimal';
  };

  const toggleStepCompleted = (productId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const currentRecipeSteps = prev[productId] || {};
      return {
        ...prev,
        [productId]: {
          ...currentRecipeSteps,
          [stepIndex]: !currentRecipeSteps[stepIndex],
        },
      };
    });
  };

  const resetRecipeSteps = (productId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [productId]: {},
    }));
    showToast('Pasos de preparación reiniciados', 'info');
  };

  const handlePrintRecipe = () => {
    if (!selectedRecipe) return;
    showToast(`Preparando ficha de cocina: ${selectedRecipe.productName}`, 'info');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // ===========================================================================
  // ACCIONES DEL MODAL DE EDICIÓN RÁPIDA
  // ===========================================================================
  const handleOpenEditModal = () => {
    if (!selectedRecipe) return;
    setEditingRecipe(JSON.parse(JSON.stringify(selectedRecipe)));
    setNewStepText('');
    setSelectedNewInventoryId(inventory[0]?.id || '');
    setNewIngredientQty(10);
    setIsEditModalOpen(true);
  };

  const handleUpdateIngredientQuantity = (ingredientId: string, newQty: number) => {
    if (!editingRecipe) return;
    const qty = Math.max(0.1, Number(newQty) || 1);
    const updatedIngredients = (editingRecipe.ingredients || editingRecipe.baseIngredients).map(
      (ing) => (ing.ingredientId === ingredientId ? { ...ing, quantity: qty } : ing)
    );
    setEditingRecipe({
      ...editingRecipe,
      ingredients: updatedIngredients,
      baseIngredients: updatedIngredients,
    });
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    if (!editingRecipe) return;
    const currentList = editingRecipe.ingredients || editingRecipe.baseIngredients;
    if (currentList.length <= 1) {
      showToast('La receta debe contener al menos 1 insumo', 'warning');
      return;
    }
    const updated = currentList.filter((ing) => ing.ingredientId !== ingredientId);
    setEditingRecipe({
      ...editingRecipe,
      ingredients: updated,
      baseIngredients: updated,
    });
  };

  const handleAddIngredient = () => {
    if (!editingRecipe || !selectedNewInventoryId) return;
    const invItem = inventory.find((i) => i.id === selectedNewInventoryId);
    if (!invItem) return;

    const currentList = editingRecipe.ingredients || editingRecipe.baseIngredients;
    const alreadyExists = currentList.some((ing) => ing.inventoryItemId === invItem.id);
    if (alreadyExists) {
      showToast('El insumo ya está agregado en la receta', 'warning');
      return;
    }

    const newIng: BOMIngredient = {
      ingredientId: `ing_${Date.now()}`,
      inventoryItemId: invItem.id,
      name: invItem.name,
      itemName: invItem.name,
      quantity: Number(newIngredientQty) || 10,
      unit: invItem.unit,
      imageUrl: INGREDIENT_IMAGE_MAP[invItem.id] || DEFAULT_INGREDIENT_IMAGE,
    };

    const updated = [...currentList, newIng];
    setEditingRecipe({
      ...editingRecipe,
      ingredients: updated,
      baseIngredients: updated,
    });
    showToast(`Insumo añadido: ${invItem.name}`, 'info');
  };

  const handleAddStep = () => {
    if (!editingRecipe || !newStepText.trim()) return;
    const nextNumber = editingRecipe.preparationSteps.length + 1;
    const newStep: PreparationStep = {
      stepNumber: nextNumber,
      imageUrl: DEFAULT_STEP_IMAGE,
      instruction: newStepText.trim(),
    };
    setEditingRecipe({
      ...editingRecipe,
      preparationSteps: [...editingRecipe.preparationSteps, newStep],
    });
    setNewStepText('');
  };

  const handleUpdateStepInstruction = (index: number, instruction: string) => {
    if (!editingRecipe) return;
    const updatedSteps = editingRecipe.preparationSteps.map((st, i) =>
      i === index ? { ...st, instruction } : st
    );
    setEditingRecipe({
      ...editingRecipe,
      preparationSteps: updatedSteps,
    });
  };

  const handleRemoveStep = (index: number) => {
    if (!editingRecipe) return;
    const updatedSteps = editingRecipe.preparationSteps
      .filter((_, i) => i !== index)
      .map((st, idx) => ({ ...st, stepNumber: idx + 1 }));
    setEditingRecipe({
      ...editingRecipe,
      preparationSteps: updatedSteps,
    });
  };

  const handleSaveRecipeChanges = () => {
    if (!editingRecipe) return;
    updateRecipe(editingRecipe);
    setIsEditModalOpen(false);
    showToast(`Receta actualizada con éxito: ${editingRecipe.productName}`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6F0] text-stone-900 p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden select-none">
      {/* =========================================================================== */}
      {/* TOP INVENTORY TOOLBAR */}
      {/* =========================================================================== */}
      <div className="no-print min-h-16 px-4 sm:px-5 py-2 rounded-2xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF1E8] text-[#4A6B3E] border border-[#D4E2CE] flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
              Control de Inventario & BOM (Recetario / Fichas Técnicas)
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-500">
              Descuento automático en tiempo real por cada porción y gramo vendido
            </p>
          </div>
        </div>

        {/* View Switcher: Stock vs Recipe BOM */}
        <div className="flex items-center gap-1.5 bg-[#FAF6F0] p-1.5 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-[#4A6B3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Insumos ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bom'
                ? 'bg-[#4A6B3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Recetario & BOM ({recipes.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================== */}
      {/* TAB 1: STOCK MONITOR (Grams, Scoops, Liters, Unidades) */}
      {/* =========================================================================== */}
      {activeTab === 'stock' && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3">
          {/* Subheader Filters */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchStockQuery}
                onChange={(e) => setSearchStockQuery(e.target.value)}
                placeholder="Filtrar insumo, proveedor o materia prima..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A6B3E] font-medium shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'dairy_egg', label: 'Huevos & Lácteos' },
                { id: 'poultry_meat', label: 'Carnes & Aves' },
                { id: 'bakery_grains', label: 'Panadería & Granos' },
                { id: 'produce_veggies', label: 'Frutas & Vegetales' },
                { id: 'liquid_base', label: 'Bases & Líquidos' },
                { id: 'protein_powder', label: 'Proteínas (Polvo)' },
                { id: 'supplement', label: 'Suplementos' },
                { id: 'superfood', label: 'Superfoods' },
                { id: 'condiments_sauces', label: 'Salsas & Aderezos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterStockCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    filterStockCategory === cat.id
                      ? 'bg-[#4A6B3E] text-white border border-[#4A6B3E] shadow-sm'
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-6">
              {filteredStockItems.map((item) => {
                const status = getItemStockStatus(item);
                const percent = Math.round((item.currentStock / item.maxCapacity) * 100);

                let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let badgeText = 'ÓPTIMO';
                let progressColor = 'bg-emerald-600';

                if (status === 'critical') {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
                  badgeText = 'CRÍTICO (<15%)';
                  progressColor = 'bg-rose-500';
                } else if (status === 'warning') {
                  badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  badgeText = 'REORDENAR (<30%)';
                  progressColor = 'bg-amber-500';
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col justify-between shadow-sm relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate">
                          {item.supplier}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-stone-900 mt-1 leading-snug line-clamp-2">
                        {item.name}
                      </h4>

                      <span className="text-[11px] text-stone-500 block mt-0.5 truncate">
                        {item.containerInfo}
                      </span>

                      <div className="mt-3 p-3 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black font-mono text-[#4A6B3E] tracking-tight">
                            {item.unit === 'ml'
                              ? `${(item.currentStock / 1000).toFixed(2)} L`
                              : item.unit === 'g'
                                ? `${
                                    item.currentStock >= 1000
                                      ? (item.currentStock / 1000).toFixed(2) + ' kg'
                                      : item.currentStock + ' g'
                                  }`
                                : `${item.currentStock} ${item.unit}`}
                          </span>

                          <span className="text-xs font-bold text-stone-600 font-mono">
                            {item.portionsRemaining}{' '}
                            {item.unit === 'g'
                              ? 'porciones'
                              : item.unit === 'ml'
                                ? 'servicios'
                                : item.unit}
                          </span>
                        </div>

                        <div className="mt-2 w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                            style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[10px] font-mono text-stone-500">
                          <span>
                            Mín: {item.minThreshold} {item.unit}
                          </span>
                          <span className="font-bold">{percent}% Capacidad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 2: RECIPE BILL OF MATERIALS (BOM) - INFOGRAFÍA EDITORIAL CULINARIA */}
      {/* =========================================================================== */}
      {activeTab === 'bom' && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3">
          {/* Subheader: Búsqueda y Filtros de Estación / Categoría */}
          <div className="no-print flex flex-wrap items-center justify-between gap-2.5 shrink-0 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
            {/* Buscador de Receta o Insumo */}
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchRecipeQuery}
                onChange={(e) => setSearchRecipeQuery(e.target.value)}
                placeholder="Buscar platillo, jugo, smoothie o insumo..."
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#FAF6F0] border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A6B3E] font-medium"
              />
              {searchRecipeQuery && (
                <button
                  onClick={() => setSearchRecipeQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro rápido de Estación */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'Todas las estaciones' },
                { id: 'Cocina Caliente / Plancha', label: 'Cocina Caliente' },
                { id: 'Barra Fría / Ensaladas', label: 'Barra Fría' },
                { id: 'Barra de Smoothies y Jugos', label: 'Barra Bebidas' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStation(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterStation === st.id
                      ? 'bg-[#EBF1E8] text-[#3E5C33] border border-[#C5D8BC]'
                      : 'text-stone-600 hover:text-stone-900 bg-[#FAF6F0] border border-stone-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Chips de Categorías */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'Todo' },
                { id: 'omelets', label: 'Omelets & Huevos' },
                { id: 'chilaquiles', label: 'Chilaquiles' },
                { id: 'toasts', label: 'Toasts' },
                { id: 'salads', label: 'Ensaladas' },
                { id: 'juices', label: 'Jugos' },
                { id: 'smoothies', label: 'Smoothies' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    filterCategory === c.id
                      ? 'bg-[#4A6B3E] text-white border border-[#4A6B3E]'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Maestro-Detalle Responsivo para POS Táctil */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-4">
            {/* =================================================================== */}
            {/* COLUMNA IZQUIERDA: LISTA MAESTRO DE RECETAS                         */}
            {/* =================================================================== */}
            <div
              className={`no-print w-full lg:w-80 xl:w-96 bg-white rounded-2xl border border-stone-200 p-3 flex-col gap-2 overflow-y-auto shrink-0 shadow-sm ${
                selectedRecipe ? 'hidden lg:flex' : 'flex flex-1 lg:flex-initial'
              }`}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Catálogo de Recetas ({filteredRecipes.length})
                </span>
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Search className="w-6 h-6 text-slate-600" />
                  <span>No se encontraron recetas con los filtros seleccionados</span>
                  <button
                    onClick={() => {
                      setSearchRecipeQuery('');
                      setFilterStation('all');
                      setFilterCategory('all');
                    }}
                    className="text-cyan-400 underline mt-1 font-bold cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                filteredRecipes.map((rec) => {
                  const isSelected = selectedRecipe?.productId === rec.productId;
                  const stationInfo = getStationBadge(rec.station);
                  const stockStatus = getRecipeIngredientsStatus(rec);
                  const StationIcon = stationInfo.icon;
                  const ingredientsCount = (rec.ingredients || rec.baseIngredients || []).length;

                  return (
                    <button
                      key={rec.productId}
                      onClick={() => setSelectedRecipeProductId(rec.productId)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#EBF1E8] border-[#4A6B3E] ring-1 ring-[#4A6B3E]/30 shadow-sm'
                          : 'bg-[#FAF6F0]/70 border-stone-200 hover:border-stone-300 hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {/* Miniatura Editorial */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-white shrink-0">
                        <EditorialImage
                          src={rec.heroImageUrl}
                          alt={rec.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        {/* Cabecera de la tarjeta */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${stationInfo.bg}`}
                          >
                            <StationIcon className="w-3 h-3" />
                            <span>{stationInfo.label}</span>
                          </span>

                          {/* Indicador discreto de salud de inventario */}
                          <span
                            title={
                              stockStatus === 'critical'
                                ? 'Insumo en nivel crítico'
                                : stockStatus === 'warning'
                                  ? 'Insumo con stock bajo'
                                  : 'Todos los insumos disponibles'
                            }
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              stockStatus === 'critical'
                                ? 'bg-rose-500 animate-pulse'
                                : stockStatus === 'warning'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Nombre del Producto */}
                        <span
                          className={`font-black text-sm leading-snug line-clamp-1 ${
                            isSelected ? 'text-[#3E5C33]' : 'text-stone-900'
                          }`}
                        >
                          {rec.productName}
                        </span>

                        {/* Metadatos inferiores */}
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Boxes className="w-3 h-3 text-stone-400" />
                            <span>{ingredientsCount} insumos</span>
                          </span>

                          <span className="flex items-center gap-1 text-stone-700 font-bold">
                            <Clock className="w-3 h-3 text-[#4A6B3E]" />
                            <span>{rec.prepTimeMinutes} min</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* =================================================================== */}
            {/* COLUMNA DERECHA: FICHA DE RECETA EDITORIAL / INFOGRAFÍA CULINARIA   */}
            {/* =================================================================== */}
            <div
              className={`flex-1 overflow-y-auto rounded-3xl print-recipe-sheet ${
                selectedRecipe
                  ? 'bg-[#FAF6F0] text-[#2B2A27] border border-[#E6DDD0] shadow-2xl'
                  : 'hidden lg:flex bg-[#FAF6F0]/95 text-[#2B2A27] border border-[#E6DDD0]'
              }`}
            >
              {selectedRecipe ? (
                <div className="max-w-5xl mx-auto p-5 sm:p-8 lg:p-10 space-y-10">
                  {/* Botón volver para pantallas táctiles medianas/pequeñas */}
                  <div className="no-print flex lg:hidden items-center justify-between">
                    <button
                      onClick={() => setSelectedRecipeProductId('')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE8DC] hover:bg-[#E5DCCB] text-[#3F3A32] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver al Catálogo</span>
                    </button>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7164]">
                      Ficha de Cocina
                    </span>
                  </div>

                  {/* =============================================================== */}
                  {/* BLOQUE 1: ENCABEZADO HERO & PLATILLO PRINCIPAL                  */}
                  {/* =============================================================== */}
                  <section className="text-center space-y-4">
                    {/* Etiqueta superior tipo listón (Banner verde oliva/salvia) */}
                    <div className="flex justify-center">
                      <div className="relative inline-flex items-center gap-2 bg-[#4A6B3E] text-[#FAF6F0] px-6 py-1.5 rounded-full shadow-md text-xs font-extrabold uppercase tracking-[0.16em]">
                        <Clock className="w-3.5 h-3.5 text-[#D8E7D1]" />
                        <span>
                          {getCategoryDisplayLabel(selectedRecipe.category)} •{' '}
                          {selectedRecipe.prepTimeMinutes} min
                        </span>
                      </div>
                    </div>

                    {/* Título Principal Combinado (Script cálido + Bold Display) */}
                    {(() => {
                      const { scriptPart, boldPart } = splitEditorialTitle(
                        selectedRecipe.productName
                      );
                      return (
                        <div className="space-y-0.5 pt-1">
                          <p
                            style={{ fontFamily: "'Caveat', cursive" }}
                            className="text-4xl sm:text-5xl text-[#4A6B3E] font-bold leading-none"
                          >
                            {scriptPart}
                          </p>
                          <h3 className="font-sans text-2xl sm:text-4xl lg:text-[2.65rem] font-black uppercase tracking-tight text-[#1F241D] leading-tight">
                            {boldPart}
                          </h3>
                        </div>
                      );
                    })()}

                    {/* Subtítulo de atributos (3 palabras clave) */}
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-[#6E675C]">
                      {selectedRecipe.tagline}
                    </p>

                    {/* Imagen Principal (Hero Photo) + Insignia circular flotante */}
                    <div className="relative max-w-2xl mx-auto pt-2">
                      <div className="p-2.5 sm:p-3 bg-white rounded-[2rem] border border-[#E6DDD0] shadow-[0_18px_40px_-14px_rgba(43,42,39,0.22)]">
                        <div className="overflow-hidden rounded-[1.5rem] bg-[#F2ECE1]">
                          <EditorialImage
                            src={selectedRecipe.heroImageUrl}
                            alt={selectedRecipe.productName}
                            className="w-full h-60 sm:h-72 md:h-80 object-cover"
                          />
                        </div>
                      </div>

                      {/* Insignia circular flotante (Badge) */}
                      <div className="absolute -top-2 -right-1 sm:top-4 sm:-right-5 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#D96B43] text-[#FAF6F0] border-4 border-[#FAF6F0] shadow-xl rotate-6 flex flex-col items-center justify-center p-2.5 text-center">
                        <Sparkles className="w-4 h-4 text-[#FFE3D6] mb-0.5 shrink-0" />
                        <span
                          style={{ fontFamily: "'Caveat', cursive" }}
                          className="text-base sm:text-lg font-bold leading-tight"
                        >
                          {selectedRecipe.badgeText}
                        </span>
                      </div>
                    </div>

                    {/* Banda discreta de Macros & Estación para POS */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <span className="px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2D8C7] text-[11px] font-bold text-[#4B463E]">
                        {selectedRecipe.station}
                      </span>
                      {selectedRecipe.servingSizeGrams && (
                        <span className="px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2D8C7] text-[11px] font-bold text-[#4B463E]">
                          Porción ~{selectedRecipe.servingSizeGrams}g
                        </span>
                      )}
                      {selectedProductMeta?.baseMacros && (
                        <>
                          <span className="px-3 py-1 rounded-full bg-[#EBF1E8] border border-[#D4E2CE] text-[11px] font-extrabold text-[#3E5C33]">
                            {selectedProductMeta.baseMacros.calories} kcal
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#EBF1E8] border border-[#D4E2CE] text-[11px] font-extrabold text-[#3E5C33]">
                            {selectedProductMeta.baseMacros.protein}g Proteína
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#EFE9DF] border border-[#E2D8C7] text-[11px] font-bold text-[#5C5549]">
                            {selectedProductMeta.baseMacros.carbs}g Carbos •{' '}
                            {selectedProductMeta.baseMacros.fat}g Grasas
                          </span>
                        </>
                      )}
                    </div>
                  </section>

                  {/* =============================================================== */}
                  {/* BLOQUE 2: CUADRÍCULA VISUAL DE INGREDIENTES (INSUMOS BOM)       */}
                  {/* =============================================================== */}
                  <section className="space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="hidden sm:block sm:w-44" />

                      {/* Título de sección: Listón verde */}
                      <div className="inline-flex items-center gap-2 bg-[#4A6B3E] text-[#FAF6F0] px-7 py-2 rounded-full shadow-md">
                        <Boxes className="w-4 h-4 text-[#D8E7D1]" />
                        <h4 className="text-sm font-black uppercase tracking-[0.18em]">
                          Ingredientes
                        </h4>
                      </div>

                      {/* Nota decorativa lateral inclinada */}
                      <div className="sm:w-44 flex justify-center sm:justify-end">
                        <div className="-rotate-2 bg-[#F4EBD9] border border-dashed border-[#C7B89E] text-[#5B4F3E] px-3.5 py-1 rounded-xl shadow-sm">
                          <span
                            style={{ fontFamily: "'Caveat', cursive" }}
                            className="text-lg font-bold leading-none block"
                          >
                            Ingredientes frescos, gran sabor
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grid responsivo de tarjetas minimalistas (4 a 5 columnas) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
                      {(
                        selectedRecipe.ingredients ||
                        selectedRecipe.baseIngredients ||
                        []
                      ).map((ing) => {
                        const invItem = inventory.find(
                          (inv) => inv.id === ing.inventoryItemId
                        );
                        const status = invItem ? getItemStockStatus(invItem) : 'optimal';

                        const dotClass = !invItem
                          ? 'bg-stone-400'
                          : status === 'critical'
                            ? 'bg-rose-500 animate-pulse'
                            : status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500';

                        const statusLabel = !invItem
                          ? 'Sin vínculo'
                          : status === 'critical'
                            ? 'Crítico'
                            : status === 'warning'
                              ? 'Stock bajo'
                              : 'Disponible';

                        const stockText = invItem
                          ? invItem.unit === 'ml'
                            ? `${(invItem.currentStock / 1000).toFixed(2)} L`
                            : invItem.unit === 'g'
                              ? invItem.currentStock >= 1000
                                ? `${(invItem.currentStock / 1000).toFixed(2)} kg`
                                : `${invItem.currentStock} g`
                              : `${invItem.currentStock} ${invItem.unit}`
                          : 'N/D';

                        return (
                          <div
                            key={ing.ingredientId || ing.inventoryItemId}
                            className="bg-white rounded-2xl p-3.5 border border-[#EAE1D3] shadow-sm hover:shadow-md hover:border-[#D5C9B6] transition-all flex flex-col items-center text-center relative"
                          >
                            {/* Indicador operativo POS discreto */}
                            <div
                              title={`${statusLabel} • Almacén: ${stockText}`}
                              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FAF6F0] border border-[#EAE1D3]"
                            >
                              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                              <span className="text-[9px] font-bold text-[#6E675C] uppercase tracking-wider">
                                {status === 'critical'
                                  ? 'Bajo!'
                                  : status === 'warning'
                                    ? 'Bajo'
                                    : 'OK'}
                              </span>
                            </div>

                            {/* Fotografía en bowl/porción */}
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F5EFE6] border-2 border-[#EDE5D8] shadow-inner mt-2 mb-2.5 shrink-0">
                              <EditorialImage
                                src={
                                  ing.imageUrl ||
                                  INGREDIENT_IMAGE_MAP[ing.inventoryItemId] ||
                                  DEFAULT_INGREDIENT_IMAGE
                                }
                                alt={ing.name || ing.itemName}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Cantidad exacta + Unidad */}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EBF1E8] text-[#3E5D33] text-xs font-extrabold tracking-tight mb-1">
                              {ing.quantity} {ing.unit}
                            </span>

                            {/* Nombre del insumo */}
                            <p className="text-xs font-bold text-[#2B2A27] leading-snug line-clamp-2">
                              {ing.name || ing.itemName}
                            </p>

                            {/* Stock disponible en almacén (discreto) */}
                            <span className="mt-auto pt-1.5 text-[10px] font-mono text-[#8A8174]">
                              Stock: {stockText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* =============================================================== */}
                  {/* BLOQUE 3: PASO A PASO VISUAL (STEP-BY-STEP / PREPARACIÓN)       */}
                  {/* =============================================================== */}
                  <section className="space-y-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="hidden sm:block sm:w-40" />

                      {/* Título de sección: Listón verde */}
                      <div className="inline-flex items-center gap-2 bg-[#4A6B3E] text-[#FAF6F0] px-7 py-2 rounded-full shadow-md">
                        <ChefHat className="w-4 h-4 text-[#D8E7D1]" />
                        <h4 className="text-sm font-black uppercase tracking-[0.18em]">
                          Paso a Paso
                        </h4>
                      </div>

                      {/* Botón discreto para reiniciar checklist táctil */}
                      <div className="sm:w-40 flex justify-center sm:justify-end no-print">
                        <button
                          onClick={() => resetRecipeSteps(selectedRecipe.productId)}
                          className="px-3 py-1.5 rounded-xl bg-[#EFE9DF] hover:bg-[#E4DCCE] text-[#5B5449] text-[11px] font-bold flex items-center gap-1.5 border border-[#DDD3C3] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reiniciar pasos</span>
                        </button>
                      </div>
                    </div>

                    {/* Tarjetas horizontales numeradas (3 columnas en desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {selectedRecipe.preparationSteps.map((step, idx) => {
                        const isDone =
                          completedSteps[selectedRecipe.productId]?.[idx] || false;

                        return (
                          <div
                            key={step.stepNumber ?? idx}
                            onClick={() =>
                              toggleStepCompleted(selectedRecipe.productId, idx)
                            }
                            className={`bg-white rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition-all active:scale-[0.99] shadow-sm hover:shadow-md ${
                              isDone
                                ? 'border-[#4A6B3E] bg-[#F5F9F3] opacity-85'
                                : 'border-[#EAE1D3]'
                            }`}
                          >
                            {/* Fotografía del proceso + Badge circular numerado terracota */}
                            <div className="relative h-40 w-full bg-[#F2ECE1] overflow-hidden">
                              <EditorialImage
                                src={step.imageUrl || DEFAULT_STEP_IMAGE}
                                alt={`Paso ${step.stepNumber || idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              <div
                                className={`absolute top-3 left-3 w-9 h-9 rounded-full font-black text-sm flex items-center justify-center shadow-lg border-2 border-[#FAF6F0] transition-colors ${
                                  isDone
                                    ? 'bg-[#4A6B3E] text-[#FAF6F0]'
                                    : 'bg-[#D96B43] text-white'
                                }`}
                              >
                                {isDone ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  step.stepNumber || idx + 1
                                )}
                              </div>
                            </div>

                            {/* Descripción corta y directa */}
                            <div className="p-4 flex-1 flex items-start">
                              <p
                                className={`text-xs sm:text-[13px] leading-relaxed font-medium ${
                                  isDone
                                    ? 'line-through text-[#7B7468]'
                                    : 'text-[#3A3731]'
                                }`}
                              >
                                {step.instruction}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nota editorial del Chef & Alérgenos */}
                    {(selectedRecipe.chefNotes ||
                      (selectedRecipe.allergens &&
                        selectedRecipe.allergens.length > 0)) && (
                      <div className="bg-[#F3ECE0] border border-[#E2D5C1] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#9A4C2E] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
                            <span>Tip de Barra / Calidad</span>
                          </span>
                          <p className="text-xs text-[#4A4338] leading-relaxed font-medium">
                            {selectedRecipe.chefNotes || selectedRecipe.preparationNotes}
                          </p>
                        </div>

                        {selectedRecipe.allergens &&
                          selectedRecipe.allergens.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6F60] mr-1">
                                Alérgenos:
                              </span>
                              {selectedRecipe.allergens.map((alg) => (
                                <span
                                  key={alg}
                                  className="px-2.5 py-0.5 rounded-full bg-[#FBEAE3] text-[#A84824] border border-[#EBC6B6] text-[11px] font-bold"
                                >
                                  {alg}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </section>

                  {/* =============================================================== */}
                  {/* BLOQUE 4: PIE DE FICHA Y ACCIONES RÁPIDAS DE POS                */}
                  {/* =============================================================== */}
                  <footer className="border-t border-[#E4DAC9] pt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Barra inferior de metadatos / Hashtags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(selectedRecipe.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#EFE9DF] text-[#4A6B3E] border border-[#DDD3C3] text-xs font-bold"
                        >
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>

                    {/* Controles operativos integrados discretamente */}
                    <div className="no-print flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleOpenEditModal}
                        className="px-3.5 py-2 rounded-xl bg-[#4A6B3E] hover:bg-[#3D5A32] text-[#FAF6F0] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar BOM</span>
                      </button>

                      <button
                        onClick={handlePrintRecipe}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3ECE0] text-[#3A3731] border border-[#DDD3C3] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Ficha</span>
                      </button>

                      <button
                        onClick={() => setSelectedRecipeProductId('')}
                        className="px-3.5 py-2 rounded-xl bg-[#EFE9DF] hover:bg-[#E4DCCE] text-[#5B5449] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cerrar</span>
                      </button>
                    </div>
                  </footer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3 text-[#6E675C]">
                  <div className="w-16 h-16 rounded-full bg-[#EFE9DF] border border-[#DFD5C5] flex items-center justify-center text-[#4A6B3E]">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4
                    style={{ fontFamily: "'Caveat', cursive" }}
                    className="text-3xl font-bold text-[#4A6B3E]"
                  >
                    Selecciona una receta del catálogo
                  </h4>
                  <p className="text-xs max-w-md text-[#7A7164]">
                    Elige cualquier platillo, toast, ensalada, jugo o smoothie a la izquierda para
                    desplegar su ficha visual editorial y su desglose exacto de insumos BOM.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* MODAL DE EDICIÓN RÁPIDA DE RECETA / BOM (ESTADO LOCAL)                     */}
      {/* =========================================================================== */}
      {isEditModalOpen && editingRecipe && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Editar Ficha Técnica: {editingRecipe.productName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ajuste de gramajes BOM, atributos visuales y pasos estandarizados
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Ajuste de Tiempo, Tagline, Badge y Notas del Chef */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tiempo de Prep. (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editingRecipe.prepTimeMinutes}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        prepTimeMinutes: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subtítulo (Tagline)
                  </label>
                  <input
                    type="text"
                    value={editingRecipe.tagline || ''}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        tagline: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Insignia Flotante
                  </label>
                  <input
                    type="text"
                    value={editingRecipe.badgeText || ''}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        badgeText: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Notas de Presentación / Alérgenos
                  </label>
                  <input
                    type="text"
                    value={editingRecipe.chefNotes || ''}
                    onChange={(e) =>
                      setEditingRecipe({
                        ...editingRecipe,
                        chefNotes: e.target.value,
                      })
                    }
                    placeholder="Instrucciones especiales de servicio o alérgenos..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista de Insumos BOM Editables */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Insumos a Descontar por Orden Vendida (BOM)
                </label>

                <div className="space-y-2">
                  {(editingRecipe.ingredients || editingRecipe.baseIngredients).map((ing) => (
                    <div
                      key={ing.ingredientId}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-xs text-white block">
                          {ing.name || ing.itemName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {ing.inventoryItemId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Cantidad:</span>
                        <input
                          type="number"
                          step="1"
                          min="0.1"
                          value={ing.quantity}
                          onChange={(e) =>
                            handleUpdateIngredientQuantity(
                              ing.ingredientId,
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-20 h-8 px-2 rounded-lg bg-slate-900 border border-slate-750 text-cyan-400 font-mono font-bold text-xs text-center focus:border-cyan-500 focus:outline-none"
                        />
                        <span className="text-xs font-mono uppercase text-slate-400 w-8">
                          {ing.unit}
                        </span>

                        <button
                          onClick={() => handleRemoveIngredient(ing.ingredientId)}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar insumo de la receta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agregar Nuevo Insumo */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <select
                    value={selectedNewInventoryId}
                    onChange={(e) => setSelectedNewInventoryId(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={newIngredientQty}
                    onChange={(e) => setNewIngredientQty(parseFloat(e.target.value) || 1)}
                    placeholder="Cantidad"
                    className="w-20 h-9 px-2 rounded-lg bg-slate-900 border border-slate-750 text-cyan-400 font-mono font-bold text-xs text-center focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={handleAddIngredient}
                    className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Pasos de Preparación Editables */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Pasos de Preparación Estandarizados
                </label>

                <div className="space-y-2">
                  {editingRecipe.preparationSteps.map((step, idx) => (
                    <div
                      key={step.stepNumber ?? idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-2.5"
                    >
                      <span className="w-6 h-6 rounded bg-slate-900 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber || idx + 1}
                      </span>
                      <input
                        type="text"
                        value={step.instruction}
                        onChange={(e) => handleUpdateStepInstruction(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-200 font-sans focus:outline-none border-b border-transparent focus:border-cyan-500 pb-0.5"
                      />
                      <button
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Eliminar paso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Agregar Nuevo Paso */}
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                    placeholder="Escribe un nuevo paso de preparación y presiona enter..."
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleAddStep}
                    className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRecipeChanges}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
