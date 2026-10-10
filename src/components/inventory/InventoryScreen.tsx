import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  BookOpen,
  History,
} from 'lucide-react';
import { useInventoryStore } from '../../store/inventoryStore';
import type { InventoryItem } from '../../types/inventory.types';
import { usePOSStore } from '../../store/posStore';

export const InventoryScreen: React.FC = () => {
  const inventory = useInventoryStore((s) => s.inventory);
  const recipes = useInventoryStore((s) => s.recipes);
  const deductionLogs = useInventoryStore((s) => s.deductionLogs);
  const restockItem = useInventoryStore((s) => s.restockItem);
  const getItemStockStatus = useInventoryStore((s) => s.getItemStockStatus);
  const showToast = usePOSStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<'stock' | 'bom' | 'logs'>('stock');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipeProductId, setSelectedRecipeProductId] = useState<string>(
    recipes[0]?.productId || ''
  );

  const filteredItems = inventory.filter((item) => {
    const matchesCat =
      filterCategory === 'all' || item.category === filterCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const selectedRecipe = recipes.find(
    (r) => r.productId === selectedRecipeProductId
  );

  const handleRestock = (item: InventoryItem) => {
    // Restock roughly 1 full container/package
    const restockAmount = Math.round(item.maxCapacity * 0.4);
    restockItem(item.id, restockAmount);
    showToast(`Reabastecido: +${restockAmount}${item.unit} a ${item.name}`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 gap-4 overflow-hidden select-none">
      {/* Top Inventory Toolbar */}
      <div className="h-16 px-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">
              Control de Inventario & BOM (Bill of Materials)
            </h2>
            <p className="text-xs text-slate-400">
              Descuento automático en tiempo real por cada porción y gramo vendido
            </p>
          </div>
        </div>

        {/* View Switcher: Stock vs Recipe BOM vs Live Deductions */}
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
            <span>Recetario BOM ({recipes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Registro Deducciones ({deductionLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STOCK MONITOR (Grams, Scoops, Liters) */}
      {activeTab === 'stock' && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3">
          {/* Subheader Filters */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar insumo o suplemento..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'Todos los Insumos' },
                { id: 'protein_powder', label: 'Botes de Proteína (kg)' },
                { id: 'supplement', label: 'Suplementos (g)' },
                { id: 'liquid_base', label: 'Leches & Líquidos (ml)' },
                { id: 'superfood', label: 'Superfoods & Toppings' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
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
              {filteredItems.map((item) => {
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

                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {item.containerInfo}
                      </span>

                      {/* Stock Big Metric */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-850">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black font-mono text-cyan-400 tracking-tight">
                            {item.unit === 'ml'
                              ? `${(item.currentStock / 1000).toFixed(2)} L`
                              : item.unit === 'g'
                              ? `${item.currentStock >= 1000 ? (item.currentStock / 1000).toFixed(2) + ' kg' : item.currentStock + ' g'}`
                              : `${item.currentStock} uds`}
                          </span>

                          <span className="text-xs font-bold text-slate-300 font-mono">
                            {item.portionsRemaining} {item.unit === 'g' ? 'scoops' : 'servicios'}
                          </span>
                        </div>

                        {/* Visual Capacity Bar */}
                        <div className="mt-2 w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>

                        <div className="mt-1.5 flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Mín: {item.minThreshold}{item.unit}</span>
                          <span className="font-bold">{percent}% Capacidad</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Restock Tactile Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800">
                      <button
                        onClick={() => handleRestock(item)}
                        className="w-full h-10 rounded-xl bg-slate-800 hover:bg-cyan-700/80 text-slate-200 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700"
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

      {/* TAB 2: RECIPE BILL OF MATERIALS (BOM) */}
      {activeTab === 'bom' && (
        <div className="flex-1 flex overflow-hidden gap-4">
          {/* Left: Recipe List */}
          <div className="w-80 bg-slate-900/90 rounded-2xl border border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 py-1">
              Fórmulas de Receta
            </span>

            {recipes.map((rec) => {
              const isSelected = selectedRecipeProductId === rec.productId;
              return (
                <button
                  key={rec.productId}
                  onClick={() => setSelectedRecipeProductId(rec.productId)}
                  className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <span
                    className={`font-black text-xs block ${
                      isSelected ? 'text-cyan-300' : 'text-slate-200'
                    }`}
                  >
                    {rec.productName}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {rec.baseIngredients.length} insumos de inventario · {rec.prepTimeMinutes} min
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Recipe Breakdown Detail */}
          <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col overflow-y-auto">
            {selectedRecipe ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      BOM Oficial de Producción
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Tiempo estimado: {selectedRecipe.prepTimeMinutes} min
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedRecipe.productName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cada vez que este producto se cobra en el POS, el sistema descuenta automáticamente los siguientes insumos en el almacén de barra:
                  </p>
                </div>

                {/* Table of BOM Ingredients */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Insumo / Materia Prima</th>
                        <th className="p-3">Cantidad a Descontar</th>
                        <th className="p-3">Unidad de Medida</th>
                        <th className="p-3">Estado Almacén</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedRecipe.baseIngredients.map((ing) => {
                        const invItem = inventory.find(
                          (inv) => inv.id === ing.inventoryItemId
                        );

                        return (
                          <tr key={ing.inventoryItemId} className="hover:bg-slate-900/60">
                            <td className="p-3 font-sans font-bold text-slate-200">
                              {ing.itemName}
                            </td>
                            <td className="p-3 font-bold text-cyan-400 text-sm">
                              -{ing.quantity}
                            </td>
                            <td className="p-3 text-slate-400 uppercase">
                              {ing.unit}
                            </td>
                            <td className="p-3">
                              {invItem ? (
                                <span className="font-bold text-slate-300">
                                  {invItem.currentStock} {invItem.unit} disponibles
                                </span>
                              ) : (
                                <span className="text-slate-500">N/D</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Preparation Guide */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Instrucciones de Mezcla (Protocolo de Calidad):
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    {selectedRecipe.preparationNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Selecciona una receta a la izquierda para inspeccionar su BOM
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEDUCTION LOGS */}
      {activeTab === 'logs' && (
        <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Auditoría en Tiempo Real de Descuentos
              </h3>
              <p className="text-xs text-slate-400">
                Movimientos automáticos de inventario generados por ventas en caja
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-mono font-bold">
              {deductionLogs.length} transacciones
            </span>
          </div>

          {deductionLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                  #{log.orderNumber}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Comanda N° #{log.orderNumber} Cobrada
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Registrado a las {log.timestamp}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-w-lg justify-end">
                {log.deductions.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 font-bold"
                  >
                    -{d.amount}{d.unit} {d.itemName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
