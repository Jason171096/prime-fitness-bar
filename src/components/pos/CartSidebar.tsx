import React from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Edit2,
  Tag,
  CreditCard,
  UserCheck,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import type { CartItem } from '../../types/pos.types';

export const CartSidebar: React.FC = () => {
  const cart = usePOSStore((s) => s.cart);
  const updateQuantity = usePOSStore((s) => s.updateQuantity);
  const removeFromCart = usePOSStore((s) => s.removeFromCart);
  const clearCart = usePOSStore((s) => s.clearCart);
  const openCustomizer = usePOSStore((s) => s.openCustomizer);
  const openLabelPreview = usePOSStore((s) => s.openLabelPreview);
  const openCheckout = usePOSStore((s) => s.openCheckout);
  const selectedMember = usePOSStore((s) => s.selectedMember);
  const setSelectedMember = usePOSStore((s) => s.setSelectedMember);

  const subtotal = cart.reduce((acc, item) => acc + item.finalPrice, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <aside className="w-[420px] bg-slate-900/95 border-l border-slate-800 flex flex-col h-full shrink-0 select-none shadow-2xl">
      {/* Cart Top Bar */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Comanda Activa
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Linked Gym Member Quick Box */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80">
        {selectedMember ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-600/30">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.fullName}
                className="w-9 h-9 rounded-full object-cover border border-emerald-400/40"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-100 leading-tight">
                    {selectedMember.fullName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {selectedMember.memberNumber}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono font-bold">
                  Saldo: ${selectedMember.balance.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 font-semibold"
              title="Desvincular socio"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            onClick={openCheckout}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 flex items-center justify-between text-xs font-semibold transition-all group"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Asignar Socio / Cuenta Gimnasio
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </button>
        )}
      </div>

      {/* Cart Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center mb-3 text-slate-600">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-slate-300">Carrito vacío</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
              Toca cualquier batido o producto del catálogo para iniciar el pedido.
            </p>
          </div>
        ) : (
          cart.map((item: CartItem) => {
            const hasCustom = !!item.customization;

            return (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2.5 shadow-md relative"
              >
                {/* Header item: Title & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm text-slate-100 leading-snug">
                      {item.product.name}
                    </h4>

                    {/* Size and base price */}
                    {hasCustom && (
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {item.customization?.size.label} ({item.customization?.size.volumeLabel})
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ${item.customization?.unitPrice.toFixed(2)} c/u
                        </span>
                        {item.customization?.customerName && (
                          <span className="text-[10px] font-bold text-slate-200 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            🏷️ Cliente: {item.customization.customerName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Label preview button */}
                    <button
                      onClick={() => openLabelPreview(item)}
                      title="Previsualizar etiqueta adhesiva de vaso"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all"
                    >
                      <Tag className="w-4 h-4" />
                    </button>

                    {/* Edit button if customizable */}
                    {hasCustom && (
                      <button
                        onClick={() => openCustomizer(item.product, item)}
                        title="Modificar ingredientes"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Quitar ítem"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Modifiers List (Clean readable breakdown) */}
                {hasCustom && item.customization && (
                  <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 space-y-1 text-xs">
                    <div className="text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">Base:</span>
                      <span className="font-medium text-slate-200">
                        {item.customization.liquidBase.shortName}
                      </span>
                    </div>

                    <div className="text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">Proteína:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {item.customization.proteinScoops}x {item.customization.protein.flavor}
                      </span>
                    </div>

                    {item.customization.extras.length > 0 && (
                      <div className="text-slate-300 pt-0.5">
                        <span className="text-slate-400 block mb-0.5 text-[11px]">
                          Suplementos / Extras:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.customization.extras.map((ex) => (
                            <span
                              key={ex.id}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700"
                            >
                              +{ex.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.customization.specialNotes && (
                      <div className="text-amber-400/90 text-[11px] font-semibold italic pt-1 border-t border-slate-800/60">
                        Nota: "{item.customization.specialNotes}"
                      </div>
                    )}

                    {/* Calculated Macro Summary Line */}
                    <div className="mt-1 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {item.customization.calculatedMacros.calories} kcal
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {item.customization.calculatedMacros.protein}g Prot
                      </span>
                      <span>
                        {item.customization.calculatedMacros.carbs}g C ·{' '}
                        {item.customization.calculatedMacros.fat}g F
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity Tactile Controller & Final Price */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-black text-sm text-slate-100 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-emerald-400">
                      ${item.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Huge Checkout Trigger */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal comanda</span>
            <span className="font-mono font-bold text-slate-200">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Impuestos (IVA Incluido)</span>
            <span className="font-mono text-slate-300">$0.00</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-slate-100">
            <span className="text-sm font-black uppercase tracking-wider">
              TOTAL A COBRAR
            </span>
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Huge Tactile Checkout Button (min 60px height) */}
        <button
          id="btn-open-checkout"
          disabled={cart.length === 0}
          onClick={openCheckout}
          className="w-full h-15 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-between px-6 transition-all active:scale-[0.98] ring-2 ring-emerald-400/40"
        >
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-200" />
            <span className="tracking-wide uppercase text-sm">Cobrar Pedido</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black">${subtotal.toFixed(2)}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>
    </aside>
  );
};
