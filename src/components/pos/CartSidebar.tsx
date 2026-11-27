import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Edit2,
  Tag,
  CreditCard,
  Flame,
  Receipt,
  Send,
  X,
  ChevronUp,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import { useBillingStore } from '../../store/billingStore';
import type { CartItem } from '../../types/pos.types';

interface CartSidebarProps {
  onNavigateToBilling?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onNavigateToBilling }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cart = usePOSStore((s) => s.cart);
  const getOrderCustomerName = usePOSStore((s) => s.getOrderCustomerName);
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

  const handleSendToBilling = () => {
    if (cart.length === 0) return;
    const customerName = getOrderCustomerName();
    useBillingStore.getState().createPendingOrder({
      items: cart,
      customerName,
      member: selectedMember || undefined,
      orderType: 'takeaway',
      source: 'pos_counter',
      notes: 'Generado desde terminal mostrador',
    });
    clearCart();
    setIsDrawerOpen(false);
    if (onNavigateToBilling) {
      onNavigateToBilling();
    }
  };

  const handleOpenCheckout = () => {
    setIsDrawerOpen(false);
    openCheckout();
  };

  const renderCartPanel = (isPortraitDrawer: boolean) => (
    <>
      {/* Cart Top Bar */}
      <div className="min-h-16 px-4 py-2.5 bg-[#FAF6F0] border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#4A6B3E]/15 border border-[#4A6B3E]/25 text-[#4A6B3E] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 tracking-tight truncate">
                Comanda Activa
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#4A6B3E]/15 text-[#4A6B3E] shrink-0">
                {totalItemsCount}
              </span>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="min-h-[48px] min-w-[48px] px-3 rounded-xl text-xs text-stone-600 hover:text-red-700 font-bold hover:bg-red-50 border border-transparent hover:border-red-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}

          {isPortraitDrawer && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Cerrar panel de comanda"
              className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Linked Gym Member Quick Box */}
      {selectedMember && (
        <div className="p-3 bg-[#FAF6F0]/70 border-b border-stone-200/80 shrink-0">
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#4A6B3E]/30 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.fullName}
                className="w-10 h-10 rounded-full object-cover border border-[#4A6B3E]/40 shrink-0"
              />
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 leading-tight truncate">
                    {selectedMember.fullName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] font-bold">
                    {selectedMember.memberNumber}
                  </span>
                </div>
                <div className="text-[11px] text-[#4A6B3E] font-mono font-bold">
                  Saldo: ${selectedMember.balance.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="min-h-[48px] min-w-[48px] px-3 rounded-xl text-xs text-stone-600 hover:text-red-700 hover:bg-red-50 font-semibold transition-all active:scale-95 shrink-0 cursor-pointer"
              title="Desvincular socio"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Cart Items List (Independent Scroll) */}
      <div className="flex-1 overflow-y-auto overscroll-contain-y p-3.5 md:p-4 space-y-3 bg-[#FAF6F0]/40">
        {cart.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#FAF6F0]/50">
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-3 text-stone-400 shadow-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-stone-600">Carrito vacío</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-[220px]">
              Toca cualquier batido o producto del catálogo para iniciar el pedido.
            </p>
          </div>
        ) : (
          cart.map((item: CartItem) => {
            const hasCustom = !!item.customization;

            return (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col gap-3 shadow-sm relative"
              >
                {/* Header item: Title & Customization Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-stone-900 leading-snug">
                      {item.product.name}
                    </h4>

                    {hasCustom && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-xs font-bold text-[#4A6B3E] font-mono">
                          {item.customization?.size.label} ({item.customization?.size.volumeLabel})
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          · ${item.customization?.unitPrice.toFixed(2)} c/u
                        </span>
                        {item.customization?.customerName && (
                          <span className="text-[11px] font-medium text-[#4A6B3E] bg-[#4A6B3E]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            🏷️ Vaso: {item.customization.customerName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black font-mono text-stone-900">
                      ${item.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Modifiers List (Clean readable breakdown) */}
                {hasCustom && item.customization && (
                  <div className="bg-white rounded-xl p-2.5 border border-stone-200/80 space-y-1 text-xs text-stone-600">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-500">• Base:</span>
                      <span className="font-semibold text-stone-800 text-right">
                        {item.customization.liquidBase.shortName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-stone-500">• Proteína:</span>
                      <span className="font-bold text-[#4A6B3E] font-mono text-right">
                        {item.customization.proteinScoops}x {item.customization.protein.flavor}
                      </span>
                    </div>

                    {item.customization.extras.length > 0 && (
                      <div className="pt-0.5">
                        <span className="text-stone-500 block mb-1 text-[11px]">
                          • Suplementos / Extras:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.customization.extras.map((ex) => (
                            <span
                              key={ex.id}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF6F0] text-[#D96B43] border border-stone-200"
                            >
                              +{ex.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.customization.specialNotes && (
                      <div className="text-[#D96B43] text-[11px] font-semibold italic pt-1 border-t border-stone-100">
                        Nota: &ldquo;{item.customization.specialNotes}&rdquo;
                      </div>
                    )}

                    {/* Calculated Macro Summary Line */}
                    <div className="mt-1 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <span className="flex items-center gap-1 text-stone-700 font-semibold">
                        <Flame className="w-3 h-3 text-[#D96B43]" />
                        {item.customization.calculatedMacros.calories} kcal
                      </span>
                      <span className="text-[#4A6B3E] font-bold">
                        {item.customization.calculatedMacros.protein}g Prot
                      </span>
                    </div>
                  </div>
                )}

                {/* Tactile Controls Row: Quantity (48x48) + Item Actions (48x48) */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      aria-label="Disminuir cantidad"
                      className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-800 flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-black text-base text-stone-900 min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      aria-label="Aumentar cantidad"
                      className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-800 flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => openLabelPreview(item)}
                      title="Previsualizar etiqueta adhesiva de vaso"
                      aria-label="Previsualizar etiqueta"
                      className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-600 hover:text-[#4A6B3E] flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                    </button>

                    {hasCustom && (
                      <button
                        type="button"
                        onClick={() => openCustomizer(item.product, item)}
                        title="Modificar ingredientes"
                        aria-label="Editar ingredientes"
                        className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-600 hover:text-[#4A6B3E] flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Quitar ítem"
                      aria-label="Quitar ítem"
                      className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white border border-stone-300 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-700 flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Sticky Checkout Trigger */}
      <div className="p-4 bg-[#FAF6F0] border-t border-stone-200 shrink-0 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal comanda</span>
            <span className="font-mono font-semibold text-stone-800">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-stone-500">
            <span>Impuestos (IVA Incluido)</span>
            <span className="font-mono text-stone-600">$0.00</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-stone-900">
            <span className="text-sm font-bold uppercase tracking-wider">
              TOTAL A COBRAR
            </span>
            <span className="text-xl font-bold font-mono text-stone-900 tracking-tight">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Dual Actions: Immediate Checkout OR Send to Billing Queue */}
        <div className="space-y-2.5">
          <button
            id={isPortraitDrawer ? 'btn-send-to-billing-drawer' : 'btn-send-to-billing'}
            type="button"
            disabled={cart.length === 0}
            onClick={handleSendToBilling}
            className="w-full min-h-[54px] rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] disabled:bg-stone-300 disabled:text-stone-500 disabled:pointer-events-none text-white font-semibold text-sm shadow-md flex items-center justify-between px-4 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-white/90 shrink-0" />
              <div className="text-left">
                <span className="tracking-wide uppercase text-xs font-bold block">
                  Enviar a Caja (Cobro)
                </span>
                <span className="text-[10px] text-white/85 font-normal">
                  Crea comanda en estado pendiente
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-base font-bold">${subtotal.toFixed(2)}</span>
              <Send className="w-4 h-4 text-white/90" />
            </div>
          </button>

          <button
            id={isPortraitDrawer ? 'btn-open-checkout-drawer' : 'btn-open-checkout'}
            type="button"
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className="w-full min-h-[48px] rounded-xl bg-white hover:bg-stone-200/70 disabled:opacity-40 disabled:pointer-events-none text-stone-700 hover:text-stone-900 font-bold text-xs border border-stone-300 flex items-center justify-center gap-2 px-4 transition-all active:scale-[0.98] cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#4A6B3E] shrink-0" />
            <span>Cobro Inmediato en este Terminal (${subtotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* TABLET LANDSCAPE & DESKTOP (lg: 1024px+): Fixed Split-View Right Panel (30%-35% width) */}
      <aside className="hidden lg:flex lg:w-[34%] lg:min-w-[320px] lg:max-w-[420px] bg-white border-l border-stone-200 flex-col h-full shrink-0 select-none shadow-lg">
        {renderCartPanel(false)}
      </aside>

      {/* TABLET PORTRAIT (< 1024px): Fixed Floating Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-8px_24px_rgba(28,25,23,0.10)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-3 min-h-[52px] text-left active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-xl bg-[#4A6B3E]/15 border border-[#4A6B3E]/25 text-[#4A6B3E] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#D96B43] text-white text-[11px] font-black font-mono flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">
                {totalItemsCount} {totalItemsCount === 1 ? 'artículo en comanda' : 'artículos en comanda'}
              </span>
              <span className="text-xl font-black font-mono text-stone-900 tracking-tight">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </button>

          <button
            id="btn-portrait-open-cart"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="min-h-[52px] px-5 sm:px-6 rounded-2xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Receipt className="w-5 h-5 text-white/90" />
            <span>Ver Comanda / Enviar</span>
            <ChevronUp className="w-4 h-4 text-white/90" />
          </button>
        </div>
      </div>

      {/* TABLET PORTRAIT (< 1024px): Slide-Up Bottom Sheet Cart Drawer */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end select-none">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in"
          />

          {/* Bottom Sheet Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Comanda Activa"
            className="relative z-10 w-full max-h-[85dvh] bg-white rounded-t-3xl border-t border-stone-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Bottom Sheet Handle */}
            <div className="pt-2.5 pb-1 bg-[#FAF6F0] flex justify-center shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>

            {renderCartPanel(true)}
          </div>
        </div>
      )}
    </>
  );
};
