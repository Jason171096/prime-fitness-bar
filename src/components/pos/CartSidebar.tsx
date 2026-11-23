import React from 'react';
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
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import { useBillingStore } from '../../store/billingStore';
import type { CartItem } from '../../types/pos.types';

interface CartSidebarProps {
  onNavigateToBilling?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onNavigateToBilling }) => {
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

  return (
    <aside className="w-[420px] bg-white border-l border-stone-200 flex flex-col h-full shrink-0 select-none shadow-lg">
      {/* Cart Top Bar */}
      <div className="h-16 px-5 bg-[#FAF6F0] border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#4A6B3E]/15 border border-[#4A6B3E]/25 text-[#4A6B3E] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Comanda Activa
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-[#4A6B3E]/15 text-[#4A6B3E]">
                {totalItemsCount}
              </span>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-red-700 font-bold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Linked Gym Member Quick Box */}
      <div className="p-3 bg-[#FAF6F0]/70 border-b border-stone-200/80">
        {selectedMember ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#4A6B3E]/30 shadow-sm">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.fullName}
                className="w-9 h-9 rounded-full object-cover border border-[#4A6B3E]/40"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 leading-tight">
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
              onClick={() => setSelectedMember(null)}
              className="text-xs text-stone-500 hover:text-red-700 px-2 py-1 font-semibold cursor-pointer"
              title="Desvincular socio"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderCustomerName}
                onChange={(e) => setOrderCustomerName(e.target.value)}
                placeholder="Nombre del cliente..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20 font-semibold"
              />
            </div> */}

            {/* <button
              onClick={openCheckout}
              className="w-full py-1.5 px-3 rounded-lg bg-white border border-dashed border-stone-300 hover:border-[#4A6B3E] text-stone-600 hover:text-[#4A6B3E] flex items-center justify-between text-[11px] font-medium transition-all group cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#4A6B3E]" />
                Asignar Socio / Cuenta Gimnasio
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#4A6B3E]" />
            </button> */}
          </div>
        )}
      </div>

      {/* Cart Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF6F0]/40">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#FAF6F0]/50">
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
                className="p-3.5 rounded-xl bg-[#FAF6F0] border border-stone-200/90 hover:border-stone-300 transition-all flex flex-col gap-2.5 shadow-sm relative"
              >
                {/* Header item: Title & Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm text-stone-900 leading-snug">
                      {item.product.name}
                    </h4>

                    {/* Size, unit price and cup customer name */}
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Label preview button */}
                    <button
                      onClick={() => openLabelPreview(item)}
                      title="Previsualizar etiqueta adhesiva de vaso"
                      className="p-1.5 rounded-lg bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-600 hover:text-[#4A6B3E] transition-all cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                    </button>

                    {/* Edit button if customizable */}
                    {hasCustom && (
                      <button
                        onClick={() => openCustomizer(item.product, item)}
                        title="Modificar ingredientes"
                        className="p-1.5 rounded-lg bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-600 hover:text-[#4A6B3E] transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Quitar ítem"
                      className="p-1.5 rounded-lg bg-white border border-stone-300 hover:border-red-200 hover:bg-red-50 text-stone-500 hover:text-red-700 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Modifiers List (Clean readable breakdown) */}
                {hasCustom && item.customization && (
                  <div className="bg-white rounded-xl p-2.5 border border-stone-200/80 space-y-1 text-xs text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">• Base:</span>
                      <span className="font-semibold text-stone-800">
                        {item.customization.liquidBase.shortName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">• Proteína:</span>
                      <span className="font-bold text-[#4A6B3E] font-mono">
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
                        Nota: "{item.customization.specialNotes}"
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

                {/* Quantity Tactile Controller & Final Price */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      aria-label="Disminuir cantidad"
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-800 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-black text-sm text-stone-900 w-7 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      aria-label="Aumentar cantidad"
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:border-[#4A6B3E] text-stone-800 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-stone-900">
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
      <div className="p-4 bg-[#FAF6F0] border-t border-stone-200 shrink-0 space-y-3">
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
        <div className="space-y-2">
          <button
            id="btn-send-to-billing"
            disabled={cart.length === 0}
            onClick={() => {
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
              if (onNavigateToBilling) {
                onNavigateToBilling();
              }
            }}
            className="w-full min-h-[52px] rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] disabled:bg-stone-300 disabled:text-stone-500 disabled:pointer-events-none text-white font-semibold text-sm shadow-md flex items-center justify-between px-4 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="w-5 h-5 text-white/90" />
              <div className="text-left">
                <span className="tracking-wide uppercase text-xs font-bold block">
                  Enviar a Caja (Cobro)
                </span>
                <span className="text-[10px] text-white/85 font-normal">
                  Crea comanda en estado pendiente
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold">${subtotal.toFixed(2)}</span>
              <Send className="w-4 h-4 text-white/90" />
            </div>
          </button>

          <button
            id="btn-open-checkout"
            disabled={cart.length === 0}
            onClick={openCheckout}
            className="w-full h-11 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 disabled:opacity-40 disabled:pointer-events-none text-stone-700 hover:text-stone-900 font-bold text-xs border border-stone-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#4A6B3E]" />
            <span>Cobro Inmediato en este Terminal (${subtotal.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
