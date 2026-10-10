import React from 'react';
import {
  X,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import {
  SIZE_OPTIONS,
  LIQUID_BASES,
  PROTEIN_OPTIONS,
  EXTRA_OPTIONS,
} from '../../data/mockModifiers';
import type { ExtraOption, LiquidBase, ProteinOption, SizeOption } from '../../types/pos.types';

export const CustomizerModal: React.FC = () => {
  const isCustomizerOpen = usePOSStore((s) => s.isCustomizerOpen);
  const selectedProduct = usePOSStore((s) => s.selectedProduct);
  const closeCustomizer = usePOSStore((s) => s.closeCustomizer);

  const customSize = usePOSStore((s) => s.customSize);
  const customLiquid = usePOSStore((s) => s.customLiquid);
  const customProtein = usePOSStore((s) => s.customProtein);
  const customProteinScoops = usePOSStore((s) => s.customProteinScoops);
  const customExtras = usePOSStore((s) => s.customExtras);
  const customSpecialNotes = usePOSStore((s) => s.customSpecialNotes);

  const setCustomSize = usePOSStore((s) => s.setCustomSize);
  const setCustomLiquid = usePOSStore((s) => s.setCustomLiquid);
  const setCustomProtein = usePOSStore((s) => s.setCustomProtein);
  const setCustomProteinScoops = usePOSStore((s) => s.setCustomProteinScoops);
  const toggleCustomExtra = usePOSStore((s) => s.toggleCustomExtra);
  const setCustomSpecialNotes = usePOSStore((s) => s.setCustomSpecialNotes);
  const saveCustomizationToCart = usePOSStore((s) => s.saveCustomizationToCart);

  const getCurrentCustomMacros = usePOSStore((s) => s.getCurrentCustomMacros);
  const getCurrentCustomPrice = usePOSStore((s) => s.getCurrentCustomPrice);

  if (!isCustomizerOpen || !selectedProduct) return null;

  const currentMacros = getCurrentCustomMacros();
  const currentPrice = getCurrentCustomPrice();

  // Calculate Caloric Distribution (% of calories from Protein, Carbs, Fat)
  const proteinKcal = currentMacros.protein * 4;
  const carbsKcal = currentMacros.carbs * 4;
  const fatKcal = currentMacros.fat * 9;
  const totalCalculatedKcal = Math.max(1, proteinKcal + carbsKcal + fatKcal);

  const proteinPct = Math.round((proteinKcal / totalCalculatedKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalCalculatedKcal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const quickNotesPresets = [
    'Extra frío con hielo frappé',
    'Sin hielo (temperatura ambiente)',
    'Licuar extra suave (30s+)',
    'Para llevar (tapa de domo)',
    'Servir en shaker de cliente',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20">
        {/* Header Modal */}
        <div className="h-18 px-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Constructor de Batido / Bowl
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Base: ${selectedProduct.basePrice.toFixed(2)}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {selectedProduct.name}
              </h2>
            </div>
          </div>

          <button
            onClick={closeCustomizer}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Main Content: Left Configuration Tabs & Right Dynamic Nutrition Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Modifiers Cascade (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-7 pr-4">
            {/* 1. SELECCIÓN DE TAMAÑO */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                    1
                  </span>
                  Selecciona el Tamaño
                </label>
                <span className="text-xs text-slate-400">Impacta volumen y concentración</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((size: SizeOption) => {
                  const isSelected = customSize.id === size.id;
                  const addedPrice =
                    size.priceMultiplier > 1
                      ? `+$${(selectedProduct.basePrice * (size.priceMultiplier - 1)).toFixed(2)}`
                      : 'Incluido';

                  return (
                    <button
                      key={size.id}
                      onClick={() => setCustomSize(size)}
                      className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-black text-sm tracking-tight ${
                            isSelected ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {size.label}
                        </span>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {addedPrice}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-bold text-slate-300 block">
                          {size.volumeLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {size.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. BASE LÍQUIDA */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                    2
                  </span>
                  Base Líquida (250 ml)
                </label>
                <span className="text-xs text-slate-400">
                  Calidad barista & leches vegetales
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {LIQUID_BASES.map((liq: LiquidBase) => {
                  const isSelected = customLiquid.id === liq.id;

                  return (
                    <button
                      key={liq.id}
                      onClick={() => setCustomLiquid(liq)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between min-h-[78px] ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`font-bold text-xs leading-tight line-clamp-1 ${
                            isSelected ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {liq.shortName}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-400 font-mono">
                          {liq.macros.calories} kcal · {liq.macros.protein}g P
                        </span>
                        <span
                          className={`font-bold ${
                            liq.price > 0 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {liq.price > 0 ? `+$${liq.price.toFixed(2)}` : 'Gratis'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. TIPO Y PORCIONES DE PROTEÍNA */}
            <section className="p-4.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                    3
                  </span>
                  Tipo de Proteína & Porciones
                </label>

                {/* Tactile Scoops Controller */}
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-300 mr-1">Scoops:</span>
                  <button
                    disabled={customProteinScoops <= 1}
                    onClick={() => setCustomProteinScoops(Math.max(1, customProteinScoops - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-sm font-black text-emerald-400 font-mono w-6 text-center">
                    {customProteinScoops}x
                  </span>

                  <button
                    disabled={customProteinScoops >= 3}
                    onClick={() => setCustomProteinScoops(Math.min(3, customProteinScoops + 1))}
                    className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {PROTEIN_OPTIONS.map((prot: ProteinOption) => {
                  const isSelected = customProtein.id === prot.id;

                  return (
                    <button
                      key={prot.id}
                      onClick={() => setCustomProtein(prot)}
                      className={`p-3.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`font-black text-xs uppercase tracking-wider block ${
                              isSelected ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {prot.name}
                          </span>
                          <span className="font-bold text-sm text-slate-100 block mt-0.5">
                            {prot.flavor}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-emerald-300 font-bold font-mono">
                          +{prot.macrosPerScoop.protein}g Proteína
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {prot.scoopGrams}g scoop · {prot.macrosPerScoop.calories} kcal
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. EXTRAS Y SUPLEMENTOS FUNCIONALES */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                    4
                  </span>
                  Extras & Suplementos Funcionales (BOM)
                </label>
                <span className="text-xs text-slate-400">
                  Selecciona uno o más potenciadores
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {EXTRA_OPTIONS.map((ext: ExtraOption) => {
                  const isChecked = customExtras.some((e) => e.id === ext.id);

                  return (
                    <button
                      key={ext.id}
                      onClick={() => toggleCustomExtra(ext)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between min-h-[88px] relative ${
                        isChecked
                          ? 'bg-emerald-950/50 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`font-bold text-xs leading-snug line-clamp-2 ${
                              isChecked ? 'text-emerald-300' : 'text-slate-200'
                            }`}
                          >
                            {ext.name}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {ext.highlight && (
                          <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                            ★ {ext.highlight}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-400 font-mono">
                          {ext.macros.protein > 0 ? `+${ext.macros.protein}g Prot` : ext.servingSize}
                        </span>
                        <span className="font-extrabold text-amber-400 font-mono">
                          +${ext.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. NOTAS ESPECIALES DE PREPARACIÓN */}
            <section className="pb-6">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                  5
                </span>
                Instrucciones Rápidas para Cocina / Licuadora
              </label>

              <div className="flex flex-wrap gap-2 mb-2.5">
                {quickNotesPresets.map((note) => {
                  const isIncluded = customSpecialNotes.includes(note);
                  return (
                    <button
                      key={note}
                      onClick={() => {
                        if (isIncluded) {
                          setCustomSpecialNotes(
                            customSpecialNotes.replace(note, '').trim()
                          );
                        } else {
                          const separator = customSpecialNotes.trim() ? ', ' : '';
                          setCustomSpecialNotes(customSpecialNotes.trim() + separator + note);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all active:scale-95 font-medium ${
                        isIncluded
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={customSpecialNotes}
                onChange={(e) => setCustomSpecialNotes(e.target.value)}
                placeholder="Escribe otra indicación especial para la barra..."
                className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </section>
          </div>

          {/* RIGHT: LIVE DYNAMIC NUTRITIONAL CALCULATION PANEL */}
          <div className="w-[380px] bg-slate-950 border-l border-slate-800 flex flex-col justify-between shrink-0 p-6 shadow-2xl">
            <div className="space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                      Cálculo Nutricional en Vivo
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Recálculo dinámico por ingrediente
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  EN VIVO
                </span>
              </div>

              {/* Total Calories Big Display */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 p-4.5 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Energía Total del Batido
                </span>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-5xl font-black font-mono tracking-tight text-white">
                    {currentMacros.calories}
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-sans">
                    KCAL
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Formato: <strong className="text-slate-200">{customSize.label}</strong> (
                    {customSize.volumeLabel})
                  </span>
                </div>
              </div>

              {/* Macronutrients Gauges & Bars */}
              <div className="space-y-3.5">
                {/* PROTEIN (Anabolic Hero) */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-emerald-400" />
                      PROTEÍNA TOTAL
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {currentMacros.protein} g
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-emerald-950">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentMacros.protein / 70) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>
                      {customProteinScoops}x scoop ({customProtein.flavor})
                    </span>
                    <span className="font-bold text-emerald-400">
                      {proteinPct}% de calorías
                    </span>
                  </div>
                </div>

                {/* CARBS */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Wheat className="w-4 h-4 text-amber-400" />
                      CARBOHIDRATOS
                    </span>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      {currentMacros.carbs} g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentMacros.carbs / 80) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Glucógeno & Fruta natural</span>
                    <span className="font-bold text-amber-400">{carbsPct}% de calorías</span>
                  </div>
                </div>

                {/* FATS */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-cyan-400" />
                      GRASAS SALUDABLES
                    </span>
                    <span className="font-mono font-black text-cyan-400 text-sm">
                      {currentMacros.fat} g
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentMacros.fat / 35) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>MCT & Semillas</span>
                    <span className="font-bold text-cyan-400">{fatPct}% de calorías</span>
                  </div>
                </div>
              </div>

              {/* Macro Caloric Ratio Visual Stack Bar */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ratio Calórico P / C / F
                </span>
                <div className="w-full h-3 rounded-lg overflow-hidden flex bg-slate-900 border border-slate-800">
                  <div
                    style={{ width: `${proteinPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-300"
                    title={`Proteína ${proteinPct}%`}
                  />
                  <div
                    style={{ width: `${carbsPct}%` }}
                    className="bg-amber-400 h-full transition-all duration-300"
                    title={`Carbs ${carbsPct}%`}
                  />
                  <div
                    style={{ width: `${fatPct}%` }}
                    className="bg-cyan-400 h-full transition-all duration-300"
                    title={`Grasas ${fatPct}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span className="text-emerald-400">P: {proteinPct}%</span>
                  <span className="text-amber-400">C: {carbsPct}%</span>
                  <span className="text-cyan-400">F: {fatPct}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Cancel & Big Save Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                id="btn-confirm-customization"
                onClick={saveCustomizationToCart}
                className="w-full h-15 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-black text-base shadow-xl shadow-emerald-500/30 flex items-center justify-between px-5 transition-all active:scale-95 ring-2 ring-emerald-400/50"
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                    Confirmar & Añadir
                  </span>
                  <span className="text-xs text-white/90 font-mono">
                    {currentMacros.protein}g Prot · {currentMacros.calories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-xl font-black">
                  <span>${currentPrice.toFixed(2)}</span>
                </div>
              </button>

              <button
                onClick={closeCustomizer}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all border border-slate-800"
              >
                Descartar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
