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
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
  Save,
  X,
  ChefHat,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import type { InventoryItem, RecipeBOM, RecipeStation, BOMIngredient } from '../../types/inventory.types';
import { usePOSStore } from '../../store/posStore';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

export const InventoryScreen: React.FC = () => {
  const inventory = useInventoryStore((s) => s.inventory);
  const recipes = useInventoryStore((s) => s.recipes);
  const restockItem = useInventoryStore((s) => s.restockItem);
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
        (rec.ingredients || rec.baseIngredients || []).some((ing) =>
          ing.name.toLowerCase().includes(q)
        );

      return matchesStation && matchesCategory && matchesSearch;
    });
  }, [recipes, filterStation, filterCategory, searchRecipeQuery]);

  // Receta seleccionada actual
  const selectedRecipe = useMemo(() => {
    const found = recipes.find((r) => r.productId === selectedRecipeProductId);
    if (found) return found;
    return filteredRecipes[0] || recipes[0] || null;
  }, [recipes, selectedRecipeProductId, filteredRecipes]);

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

  const handleRestock = (item: InventoryItem) => {
    const restockAmount = Math.round(item.maxCapacity * 0.4);
    restockItem(item.id, restockAmount);
    showToast(`Reabastecido: +${restockAmount} ${item.unit} a ${item.name}`, 'success');
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

  // ===========================================================================
  // ACCIONES DEL MODAL DE EDICIÓN RÁPIDA
  // ===========================================================================
  const handleOpenEditModal = () => {
    if (!selectedRecipe) return;
    // Clonar para edición local aislada
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
    const updatedSteps = [...editingRecipe.preparationSteps, newStepText.trim()];
    setEditingRecipe({
      ...editingRecipe,
      preparationSteps: updatedSteps,
    });
    setNewStepText('');
  };

  const handleRemoveStep = (index: number) => {
    if (!editingRecipe) return;
    const updatedSteps = editingRecipe.preparationSteps.filter((_, i) => i !== index);
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
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 gap-4 overflow-hidden select-none">
      {/* =========================================================================== */}
      {/* TOP INVENTORY TOOLBAR */}
      {/* =========================================================================== */}
      <div className="h-16 px-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">
              Control de Inventario & BOM (Recetario / Fichas Técnicas)
            </h2>
            <p className="text-xs text-slate-400">
              Descuento automático en tiempo real por cada porción y gramo vendido
            </p>
          </div>
        </div>

        {/* View Switcher: Stock vs Recipe BOM */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Insumos ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'bom'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
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
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchStockQuery}
                onChange={(e) => setSearchStockQuery(e.target.value)}
                placeholder="Filtrar insumo, proveedor o materia prima..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            {/* Category Pills */}
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    filterStockCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
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

                let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                let badgeText = 'ÓPTIMO';
                let progressColor = 'bg-emerald-500';

                if (status === 'critical') {
                  badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
                  badgeText = 'CRÍTICO (<15%)';
                  progressColor = 'bg-rose-500';
                } else if (status === 'warning') {
                  badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  badgeText = 'REORDENAR (<30%)';
                  progressColor = 'bg-amber-500';
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                          {item.supplier}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${badgeColor}`}
                        >
                          {badgeText}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white mt-1 leading-snug line-clamp-2">
                        {item.name}
                      </h4>

                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {item.containerInfo}
                      </span>

                      {/* Stock Big Metric */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-850">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black font-mono text-cyan-400 tracking-tight">
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

                          <span className="text-xs font-bold text-slate-300 font-mono">
                            {item.portionsRemaining}{' '}
                            {item.unit === 'g'
                              ? 'porciones'
                              : item.unit === 'ml'
                              ? 'servicios'
                              : item.unit}
                          </span>
                        </div>

                        {/* Visual Capacity Bar */}
                        <div className="mt-2 w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                            style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[10px] font-mono text-slate-400">
                          <span>
                            Mín: {item.minThreshold} {item.unit}
                          </span>
                          <span className="font-bold">{percent}% Capacidad</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Tactile Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800">
                      <button
                        onClick={() => handleRestock(item)}
                        className="w-full h-10 rounded-xl bg-slate-800 hover:bg-cyan-700/80 text-slate-200 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reabastecer Lote (+Stock)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* TAB 2: RECIPE BILL OF MATERIALS (BOM) & FICHA TÉCNICA */}
      {/* =========================================================================== */}
      {activeTab === 'bom' && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3">
          {/* Subheader: Búsqueda y Filtros de Estación / Categoría */}
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            {/* Buscador de Receta o Insumo */}
            <div className="relative w-80 max-w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchRecipeQuery}
                onChange={(e) => setSearchRecipeQuery(e.target.value)}
                placeholder="Buscar platillo, jugo, smoothie o insumo..."
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              />
              {searchRecipeQuery && (
                <button
                  onClick={() => setSearchRecipeQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro por Estaciones de Preparación */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mr-1 flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Estación:
              </span>
              {[
                { id: 'all', label: 'Todas', icon: Layers },
                {
                  id: 'Cocina Caliente / Plancha',
                  label: 'Cocina Caliente',
                  icon: Flame,
                  activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                },
                {
                  id: 'Barra Fría / Ensaladas',
                  label: 'Barra Fría / Toasts',
                  icon: Salad,
                  activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                },
                {
                  id: 'Barra de Smoothies y Jugos',
                  label: 'Smoothies & Jugos',
                  icon: Zap,
                  activeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                },
              ].map((st) => {
                const Icon = st.icon;
                const isSelected = filterStation === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setFilterStation(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? st.activeColor || 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
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
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Maestro-Detalle */}
          <div className="flex-1 flex overflow-hidden gap-4">
            {/* =================================================================== */}
            {/* COLUMNA IZQUIERDA: LISTA MAESTRO DE RECETAS */}
            {/* =================================================================== */}
            <div className="w-96 bg-slate-900/90 rounded-2xl border border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto shrink-0 shadow-lg">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Fórmulas Registradas ({filteredRecipes.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">100% Menú POS</span>
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
                    className="text-cyan-400 underline mt-1 font-bold"
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
                      className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/40 shadow-md'
                          : 'bg-slate-950 border-slate-850 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${stationInfo.bg}`}
                        >
                          <StationIcon className="w-3 h-3" />
                          <span>{stationInfo.label}</span>
                        </span>

                        {/* Indicador de Stock de Insumos */}
                        {stockStatus === 'critical' ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stock Crítico</span>
                          </span>
                        ) : stockStatus === 'warning' ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            <span>Reordenar</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400/90">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Insumos OK</span>
                          </span>
                        )}
                      </div>

                      {/* Nombre del Producto */}
                      <span
                        className={`font-black text-sm leading-snug line-clamp-1 ${
                          isSelected ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {rec.productName}
                      </span>

                      {/* Metadatos inferiores */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-850/60 pt-1.5">
                        <span className="flex items-center gap-1">
                          <Boxes className="w-3 h-3 text-slate-500" />
                          <span>{ingredientsCount} insumos BOM</span>
                        </span>

                        <span className="flex items-center gap-1 text-slate-300 font-bold">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{rec.prepTimeMinutes} min</span>
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* =================================================================== */}
            {/* COLUMNA DERECHA: FICHA TÉCNICA Y OPERATIVA (BOM + PREPARACIÓN) */}
            {/* =================================================================== */}
            <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col overflow-y-auto shadow-xl">
              {selectedRecipe ? (
                <div className="space-y-6">
                  {/* Encabezado Principal del Producto */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-4">
                      {selectedProductMeta?.image ? (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-md">
                          <img
                            src={selectedProductMeta.image}
                            alt={selectedRecipe.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <ChefHat className="w-9 h-9" />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                              getStationBadge(selectedRecipe.station).bg
                            }`}
                          >
                            {React.createElement(getStationBadge(selectedRecipe.station).icon, {
                              className: 'w-3.5 h-3.5',
                            })}
                            <span>{selectedRecipe.station}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {selectedRecipe.category}
                          </span>

                          <span className="flex items-center gap-1 text-xs text-amber-300 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Prep: {selectedRecipe.prepTimeMinutes} min</span>
                          </span>

                          {selectedRecipe.servingSizeGrams && (
                            <span className="text-xs text-slate-400 font-mono">
                              Porción: ~{selectedRecipe.servingSizeGrams}g
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">
                          {selectedRecipe.productName}
                        </h3>

                        {selectedProductMeta?.baseMacros && (
                          <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                            <span className="text-cyan-400 font-bold">
                              {selectedProductMeta.baseMacros.calories} kcal
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-emerald-400 font-bold">
                              {selectedProductMeta.baseMacros.protein}g Proteína
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-400 font-bold">
                              {selectedProductMeta.baseMacros.carbs}g Carbos
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-purple-400 font-bold">
                              {selectedProductMeta.baseMacros.fat}g Grasas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <button
                        onClick={handleOpenEditModal}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-2 shadow-md hover:shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Ficha / BOM</span>
                      </button>
                    </div>
                  </div>

                  {/* =================================================================== */}
                  {/* BLOQUE 1: TABLA DE INSUMOS (BILL OF MATERIALS - BOM) */}
                  {/* =================================================================== */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">
                            Desglose de Insumos (BOM Oficial)
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Materia prima descontada en tiempo real por cada unidad cobrada en el POS
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {(selectedRecipe.ingredients || selectedRecipe.baseIngredients || []).length}{' '}
                        insumos vinculados
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Insumo / Materia Prima</th>
                            <th className="p-3 text-center">Descuento por Venta</th>
                            <th className="p-3">Unidad</th>
                            <th className="p-3">Stock Actual en Almacén</th>
                            <th className="p-3 text-center">Estado Stock</th>
                            <th className="p-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {(
                            selectedRecipe.ingredients ||
                            selectedRecipe.baseIngredients ||
                            []
                          ).map((ing) => {
                            const invItem = inventory.find(
                              (inv) => inv.id === ing.inventoryItemId
                            );
                            const status = invItem ? getItemStockStatus(invItem) : 'optimal';
                            const percent = invItem
                              ? Math.round((invItem.currentStock / invItem.maxCapacity) * 100)
                              : 100;

                            let statusBadge = (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                ÓPTIMO
                              </span>
                            );

                            if (!invItem) {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-900">
                                  NO VINCULADO
                                </span>
                              );
                            } else if (status === 'critical') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                                  CRÍTICO
                                </span>
                              );
                            } else if (status === 'warning') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  REORDENAR
                                </span>
                              );
                            }

                            return (
                              <tr
                                key={ing.ingredientId || ing.inventoryItemId}
                                className="hover:bg-slate-900/60 transition-colors"
                              >
                                <td className="p-3 font-sans font-bold text-slate-200">
                                  <div className="flex flex-col">
                                    <span>{ing.name || ing.itemName}</span>
                                    {invItem && (
                                      <span className="text-[10px] font-mono text-slate-500">
                                        Prov: {invItem.supplier}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <span className="font-mono font-black text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                                    -{ing.quantity} {ing.unit}
                                  </span>
                                </td>

                                <td className="p-3 text-slate-400 uppercase font-mono">
                                  {ing.unit}
                                </td>

                                <td className="p-3">
                                  {invItem ? (
                                    <div className="w-40">
                                      <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span className="font-bold text-slate-300">
                                          {invItem.unit === 'ml'
                                            ? `${(invItem.currentStock / 1000).toFixed(2)} L`
                                            : invItem.unit === 'g'
                                            ? `${
                                                invItem.currentStock >= 1000
                                                  ? (invItem.currentStock / 1000).toFixed(2) +
                                                    ' kg'
                                                  : invItem.currentStock + ' g'
                                              }`
                                            : `${invItem.currentStock} ${invItem.unit}`}
                                        </span>
                                        <span className="text-slate-500">{percent}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            status === 'critical'
                                              ? 'bg-rose-500'
                                              : status === 'warning'
                                              ? 'bg-amber-500'
                                              : 'bg-emerald-500'
                                          }`}
                                          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500">N/D</span>
                                  )}
                                </td>

                                <td className="p-3 text-center">{statusBadge}</td>

                                <td className="p-3 text-right">
                                  {invItem && (
                                    <button
                                      onClick={() => handleRestock(invItem)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-700/80 text-slate-300 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                                      title="Reabastecer stock de este insumo"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>+Stock</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* =================================================================== */}
                  {/* BLOQUE 2: MODO DE PREPARACIÓN PASO A PASO & PROTOCOLO */}
                  {/* =================================================================== */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">
                            Protocolo Estandarizado de Preparación (SOP)
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Guía operativa paso a paso para el personal de cocina y barra
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => resetRecipeSteps(selectedRecipe.productId)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reiniciar Checklist</span>
                      </button>
                    </div>

                    {/* Lista Interactiva de Pasos */}
                    <div className="space-y-2.5">
                      {selectedRecipe.preparationSteps.map((step, idx) => {
                        const isDone =
                          completedSteps[selectedRecipe.productId]?.[idx] || false;

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleStepCompleted(selectedRecipe.productId, idx)}
                            className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer select-none active:scale-[0.99] ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80'
                                : 'bg-slate-950 border-slate-850 hover:border-slate-700 hover:bg-slate-900/60'
                            }`}
                          >
                            {/* Checkbox táctil / Número */}
                            <div
                              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-black text-xs transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                  : 'bg-slate-850 text-cyan-400 border border-slate-700'
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>

                            <p
                              className={`text-xs font-sans leading-relaxed pt-0.5 ${
                                isDone
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-200 font-medium'
                              }`}
                            >
                              {step}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card de Notas del Chef & Calidad */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Notas de Calidad, Emplatado & Alérgenos:</span>
                        </span>

                        {selectedRecipe.allergens && selectedRecipe.allergens.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-200">
                            <span className="font-bold">Alérgenos:</span>
                            <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                              {selectedRecipe.allergens.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-slate-300 leading-relaxed font-sans">
                        {selectedRecipe.chefNotes || selectedRecipe.preparationNotes}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <BookOpen className="w-12 h-12 text-slate-700" />
                  <p className="text-sm font-bold">
                    Selecciona una receta a la izquierda para inspeccionar su ficha técnica y BOM
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================== */}
      {/* MODAL DE EDICIÓN RÁPIDA DE RECETA / BOM (ESTADO LOCAL) */}
      {/* =========================================================================== */}
      {isEditModalOpen && editingRecipe && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
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
                    Ajuste de gramajes de insumos y pasos estandarizados de cocina
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
              {/* Ajuste de Tiempo y Notas del Chef */}
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

                <div className="md:col-span-2">
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
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-2.5"
                    >
                      <span className="w-6 h-6 rounded bg-slate-900 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-xs text-slate-300 font-sans">{step}</p>
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
