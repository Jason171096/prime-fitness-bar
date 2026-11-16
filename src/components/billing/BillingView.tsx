/**
 * @file BillingView.tsx
 * @description Vista principal dedicada al Cobro de Pedidos Realizados (Caja / Facturación y Pago).
 * Diseñada para pantallas táctiles de 1080p en entornos de retail y gimnasio:
 * - Panel Izquierdo: Bandeja de órdenes pendientes con buscador en tiempo real, filtros táctiles
 *   e indicadores cronológicos de urgencia (Verde <3m, Ámbar 3-7m, Rojo >7m).
 * - Panel Derecho: Detalle exhaustivo de la orden seleccionada, desglose de ingredientes y macros,
 *   resumen de totales y botón primario de liquidación.
 */

import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Flame,
  CreditCard,
  Receipt,
  Printer,
  XCircle,
  RefreshCw,
  X,
  Scale,
  Clock,
  Inbox,
} from 'lucide-react';
import { useBilling } from '../../hooks/useBilling';
import { PaymentModal } from './PaymentModal';
import { usePOSStore } from '../../store/posStore';
import type { BillingOrder } from '../../types/billing';
import type { ReceiptDataPayload } from '../../types/electron';

interface BillingViewProps {
  onNavigateToClosure?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateToClosure }) => {
  const {
    filteredPendingOrders,
    selectedOrderId,
    selectedOrder,
    searchQuery,
    typeFilter,
    urgencyFilter,
    stats,
    setSelectedOrderId,
    setSearchQuery,
    setTypeFilter,
    resetFilters,
    openPaymentModal,
    cancelOrder,
    getOrderElapsedSeconds,
    getOrderUrgency,
    formatElapsedTime,
  } = useBilling();

  const showToast = usePOSStore((s) => s.showToast);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Cliente se retiró antes del cobro');

  // Imprimir pre-cuenta / ticket informativo antes del cobro
  const handlePrintPreReceipt = async (order: BillingOrder) => {
    const prePayload: ReceiptDataPayload = {
      orderNumber: `PRE-${order.orderNumber}`,
      date: new Date().toLocaleString(),
      cashierName: order.cashierName,
      customerName: order.customerName,
      storeName: 'PRIME FITNESS BAR (PRE-CUENTA)',
      storeAddress: 'Área Fitness Center · Nivel 1',
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.finalPrice,
        customizationSummary: i.customization?.protein?.name
          ? `${i.customization.protein.flavor} (${i.customization.size.label})`
          : undefined,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paymentMethod: 'PENDIENTE DE COBRO',
    };

    if (typeof window !== 'undefined' && window.posHardware?.printReceipt) {
      try {
        await window.posHardware.printReceipt(prePayload);
        showToast(`Pre-cuenta de comanda #${order.orderNumber} enviada a impresora`, 'info');
      } catch (err) {
        console.error('[BillingView] Error imprimiendo pre-cuenta:', err);
      }
    } else {
      console.info('[SIMULATOR] Pre-cuenta emitida:', prePayload);
      showToast(`Pre-cuenta #${order.orderNumber} simulada con éxito`, 'info');
    }
  };

  // Apertura manual del cajón portamonedas vía Electron IPC
  const handleOpenCashDrawer = async () => {
    if (typeof window !== 'undefined' && window.posHardware?.openCashDrawer) {
      try {
        await window.posHardware.openCashDrawer();
        showToast('Cajón de efectivo abierto', 'info');
      } catch (err) {
        console.error('[BillingView] Error abriendo cajón:', err);
        showToast('No se pudo abrir el cajón de efectivo', 'error');
      }
    } else {
      showToast('Apertura de cajón simulada (modo web)', 'info');
    }
  };

  // Confirmar cancelación de comanda
  const handleConfirmCancel = () => {
    if (cancelModalOrderId) {
      cancelOrder(cancelModalOrderId, cancelReason);
      setCancelModalOrderId(null);
    }
  };

  // Calcular macros totales de la comanda seleccionada
  const orderTotalMacros = selectedOrder
    ? selectedOrder.items.reduce(
        (acc, item) => {
          if (item.customization?.calculatedMacros) {
            acc.calories += item.customization.calculatedMacros.calories * item.quantity;
            acc.protein += item.customization.calculatedMacros.protein * item.quantity;
            acc.carbs += item.customization.calculatedMacros.carbs * item.quantity;
            acc.fat += item.customization.calculatedMacros.fat * item.quantity;
          } else {
            acc.calories += item.product.baseMacros.calories * item.quantity;
            acc.protein += item.product.baseMacros.protein * item.quantity;
            acc.carbs += item.product.baseMacros.carbs * item.quantity;
            acc.fat += item.product.baseMacros.fat * item.quantity;
          }
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6F0] text-stone-900 overflow-hidden select-none">
      {/* Encabezado del Módulo de Caja y Métricas Rápidas */}
      <section
        aria-label="Resumen de Cobro y Métricas"
        className="px-6 py-3 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/20 text-[#4A6B3E] flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Módulo de Caja & Facturación
            </h2>
            <p className="text-xs text-stone-600">
              Liquidación rápida de comandas pendientes y control de tickets
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* KPI 1: Pedidos pendientes */}
          <div className="bg-white border border-stone-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-xs text-stone-600 font-medium">Pendientes:</span>
            <span className="text-sm font-black font-mono text-[#4A6B3E]">
              {stats.pendingCount}
            </span>
          </div>

          {/* KPI 2: Total por cobrar */}
          <div className="bg-white border border-stone-200 rounded-xl px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-xs text-stone-600 font-medium">Total por cobrar:</span>
            <span className="text-sm font-black font-mono text-[#4A6B3E]">
              ${stats.pendingTotalAmount.toFixed(2)}
            </span>
          </div>

          {onNavigateToClosure && (
            <button
              onClick={onNavigateToClosure}
              className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-800 border border-stone-300 text-xs font-bold active:scale-95 transition-all cursor-pointer"
              title="Ir al Arqueo y Cierre de Turno"
            >
              <Scale className="w-4 h-4 text-[#4A6B3E]" />
              <span>Arqueo de Turno</span>
            </button>
          )}
        </div>
      </section>

      {/* Grid Principal de Doble Panel Táctil */}
      <div className="flex-1 flex overflow-hidden">
        {/* =========================================================================
            PANEL IZQUIERDO: BANDEJA DE PEDIDOS PENDIENTES
           ========================================================================= */}
        <aside
          aria-label="Bandeja de pedidos pendientes"
          className="w-full lg:w-[460px] xl:w-[520px] border-r border-stone-200 flex flex-col h-full bg-[#FAF6F0] shrink-0"
        >
          {/* Buscador Táctil y Filtros por Tipo de Servicio */}
          <div className="p-4 bg-[#FAF6F0] border-b border-stone-200 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-pending-orders"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por #ID, cliente o socio (ej. 104, Carlos, PF-1042)..."
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20 font-medium shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros táctiles por tipo de servicio */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all' as const, label: `Todos (${stats.pendingCount})` },
                { id: 'takeaway' as const, label: `Para llevar (${stats.takeawayCount})` },
                { id: 'dine_in' as const, label: `En barra (${stats.dineInCount})` },
              ].map((tab) => {
                const isActive = typeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id)}
                    className={`h-10 px-2.5 rounded-xl text-xs transition-all cursor-pointer truncate ${
                      isActive
                        ? 'bg-[#4A6B3E] text-white font-semibold shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Tarjetas de Órdenes Pendientes (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredPendingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-500">
                <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mb-3 text-stone-400 shadow-sm">
                  <Receipt className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-stone-800">
                  No hay órdenes pendientes
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-[260px]">
                  {searchQuery || typeFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'No se encontraron pedidos con los filtros aplicados.'
                    : 'Todas las comandas de mostrador y quiosco han sido cobradas.'}
                </p>
                {(searchQuery || typeFilter !== 'all' || urgencyFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restablecer filtros
                  </button>
                )}
              </div>
            ) : (
              filteredPendingOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const urgency = getOrderUrgency(order);
                const elapsedText = formatElapsedTime(getOrderElapsedSeconds(order));

                const urgencyBadgeClass =
                  urgency === 'urgent'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : urgency === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`rounded-2xl p-4 transition-all cursor-pointer flex flex-col gap-3 ${
                      isSelected
                        ? 'bg-white border-2 border-[#4A6B3E] ring-4 ring-[#4A6B3E]/10 shadow-md'
                        : 'bg-white border border-stone-200 hover:border-[#4A6B3E]/60 shadow-sm'
                    }`}
                  >
                    {/* Cabecera de la Tarjeta: #ID, Tipo y Semáforo de Tiempo */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-stone-900 tracking-tight">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-[#FAF6F0] text-stone-700 border border-stone-200">
                          {order.orderType === 'takeaway' ? '🛍️ Para llevar' : '🥤 En barra'}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold border flex items-center gap-1 ${urgencyBadgeClass}`}
                      >
                        <Clock className="w-3 h-3" />
                        {elapsedText}
                      </span>
                    </div>

                    {/* Cliente e Información de Membresía */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5 truncate">
                          <span className="truncate">{order.customerName}</span>
                          {order.member && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] font-bold border border-[#4A6B3E]/20 shrink-0">
                              {order.member.tier}
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-stone-500">
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'producto' : 'productos'} · {order.createdAt}
                        </span>
                      </div>

                      {/* Monto Total */}
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold font-mono text-[#4A6B3E] tracking-tight">
                          ${order.total.toFixed(2)}
                        </span>
                        {order.discount > 0 && (
                          <span className="block text-[10px] text-[#D96B43] font-mono font-semibold">
                            Desc. -${order.discount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Previsualización rápida de productos */}
                    <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs text-stone-500">
                      <span className="truncate">
                        {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(' · ')}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaymentModal(order.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Cobrar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================================================================
            PANEL DERECHO: DETALLE DE LA ORDEN SELECCIONADA Y ACCIONES DE CAJA
           ========================================================================= */}
        <section
          aria-label="Detalle de la orden seleccionada"
          className="flex-1 p-4 lg:p-6 flex flex-col h-full bg-[#FAF6F0] overflow-hidden"
        >
          {selectedOrder ? (
            <div className="flex-1 flex flex-col h-full bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Cabecera Superior del Detalle */}
              <div className="p-5 bg-[#FAF6F0]/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/25 text-[#4A6B3E] flex items-center justify-center font-mono font-black text-2xl shrink-0">
                    #{selectedOrder.orderNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-extrabold text-stone-900">
                        {selectedOrder.customerName}
                      </h3>
                      {selectedOrder.member && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4A6B3E]/10 text-[#4A6B3E] border border-[#4A6B3E]/20">
                          {selectedOrder.member.memberNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 mt-1 flex items-center gap-2">
                      <span>Creada a las {selectedOrder.createdAt}</span>
                      <span>·</span>
                      <span>Cajero: {selectedOrder.cashierName}</span>
                    </p>
                  </div>
                </div>

                {/* Acciones Secundarias de la Comanda */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePrintPreReceipt(selectedOrder)}
                    className="px-3.5 h-11 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-800 text-xs font-bold transition-all border border-stone-300 flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Reimprimir pre-cuenta o ticket informativo"
                  >
                    <Printer className="w-4 h-4 text-[#4A6B3E]" />
                    <span>Reimprimir Ticket</span>
                  </button>

                  <button
                    onClick={handleOpenCashDrawer}
                    className="px-3.5 h-11 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-800 text-xs font-bold transition-all border border-stone-300 flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Abrir cajón de efectivo"
                  >
                    <Inbox className="w-4 h-4 text-[#4A6B3E]" />
                    <span>Abrir Cajón</span>
                  </button>

                  <button
                    onClick={() => setCancelModalOrderId(selectedOrder.id)}
                    className="px-3.5 h-11 rounded-xl bg-[#FAF6F0] hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-bold transition-all border border-stone-300 hover:border-red-200 flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Cancelar y descartar este pedido"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar Orden</span>
                  </button>
                </div>
              </div>

              {/* Contenido Central: Desglose de Productos y Resumen de Macros */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Desglose de Productos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#4A6B3E]" />
                    Desglose de Productos y Personalización ({selectedOrder.items.length})
                  </h4>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl bg-white overflow-hidden">
                    {selectedOrder.items.map((item) => {
                      const c = item.customization;
                      const itemMacros = c?.calculatedMacros || item.product.baseMacros;

                      return (
                        <div key={item.cartItemId} className="p-4 flex flex-col gap-2">
                          {/* Fila Principal de Producto */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-stone-200 text-[#4A6B3E] font-mono font-black text-sm flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="font-bold text-base text-stone-900 leading-tight">
                                    {item.product.name}
                                  </h5>
                                  {c?.customerName && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#4A6B3E]/10 text-[#4A6B3E]">
                                      🏷️ Vaso: {c.customerName}
                                    </span>
                                  )}
                                </div>

                                {c && (
                                  <div className="mt-1 space-y-0.5 text-xs text-stone-600">
                                    <p>
                                      <span className="font-semibold text-[#4A6B3E]">
                                        {c.size.label} ({c.size.volumeLabel})
                                      </span>{' '}
                                      · Base: {c.liquidBase.shortName} ·{' '}
                                      {c.proteinScoops}x {c.protein.flavor}
                                    </p>
                                    {c.extras.length > 0 && (
                                      <p className="text-stone-600">
                                        Extras: {c.extras.map((ex) => `+${ex.name}`).join(', ')}
                                      </p>
                                    )}
                                    {c.specialNotes && (
                                      <p className="text-[#D96B43] italic font-medium">
                                        Nota: "{c.specialNotes}"
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Pill discreta de macros por ítem */}
                                <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-stone-700 text-[11px] font-mono border border-stone-200/80">
                                  <span>{itemMacros.calories * item.quantity} kcal</span>
                                  <span>·</span>
                                  <span className="font-bold text-[#4A6B3E]">
                                    {itemMacros.protein * item.quantity}g P
                                  </span>
                                  <span>·</span>
                                  <span>{itemMacros.carbs * item.quantity}g C</span>
                                  <span>·</span>
                                  <span>{itemMacros.fat * item.quantity}g G</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-lg font-black font-mono text-stone-900">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[11px] text-stone-500 font-mono">
                                  ${(item.finalPrice / item.quantity).toFixed(2)} c/u
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tarjeta de Resumen Nutricional Global */}
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#4A6B3E]/10 text-[#4A6B3E] flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-stone-900">
                        Perfil Nutricional del Pedido
                      </h5>
                      <span className="text-[11px] text-stone-500">
                        Cálculo en tiempo real según formulación exacta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-right font-mono">
                    <div>
                      <span className="text-sm font-black text-stone-900 block">
                        {orderTotalMacros.calories} kcal
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">
                        Calorías
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-[#4A6B3E] block">
                        {orderTotalMacros.protein}g
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">
                        Proteína
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-[#D96B43] block">
                        {orderTotalMacros.carbs}g
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">
                        Carbs
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-stone-700 block">
                        {orderTotalMacros.fat}g
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold">
                        Grasas
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra Inferior: Caja de Totales y Gran Botón de Cobro Táctil */}
              <div className="p-5 bg-white border-t border-stone-200 shrink-0 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                {/* Bloque de Totales */}
                <div className="bg-[#FAF6F0] border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between xl:justify-start gap-6">
                  <div>
                    <span className="text-xs text-stone-500 block">Subtotal</span>
                    <span className="text-sm font-bold font-mono text-stone-800">
                      ${selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {selectedOrder.discount > 0 && (
                    <div>
                      <span className="text-xs text-[#D96B43] block">Descuento</span>
                      <span className="text-sm font-bold font-mono text-[#D96B43]">
                        -${selectedOrder.discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-stone-500 block">IVA (Incluido)</span>
                    <span className="text-sm font-mono text-stone-600">$0.00</span>
                  </div>

                  <div className="h-10 w-px bg-stone-300 hidden sm:block" />

                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600 block">
                      TOTAL A COBRAR
                    </span>
                    <span className="text-2xl font-extrabold font-mono tracking-tight text-stone-900">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Gran Botón Primario de Cobro (Touch min 52px) */}
                <button
                  id="btn-trigger-payment-modal"
                  onClick={() => openPaymentModal(selectedOrder.id)}
                  className="min-h-[52px] px-7 py-3.5 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-semibold text-base tracking-wide shadow-md flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CreditCard className="w-5 h-5 text-emerald-100" />
                  <span>Liquidar Orden (${selectedOrder.total.toFixed(2)})</span>
                  <span className="hidden 2xl:inline text-xs opacity-80 font-mono px-2 py-0.5 rounded bg-black/15">
                    F12 / Táctil
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-stone-500">
              <div className="w-20 h-20 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex items-center justify-center mb-4 text-stone-400">
                <Receipt className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-extrabold text-stone-800">
                Ninguna orden seleccionada
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Selecciona una comanda de la bandeja izquierda para ver su desglose, macros
                nutricionales y procesar la liquidación.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Liquidación y Procesamiento de Pago */}
      <PaymentModal />

      {/* Modal de Confirmación para Cancelar Comanda */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF6F0] border border-stone-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Anular Comanda</h3>
                <span className="text-xs text-stone-600">
                  Esta acción cancelará el pedido de forma definitiva
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-stone-700 block mb-1.5">
                Motivo de la cancelación:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#4A6B3E] font-medium"
              >
                <option value="Cliente se retiró antes del cobro">
                  Cliente se retiró antes del cobro
                </option>
                <option value="Error en la toma de comanda / ingredientes">
                  Error en la toma de comanda / ingredientes
                </option>
                <option value="Falta de ingrediente / Stock no disponible">
                  Falta de ingrediente / Stock no disponible
                </option>
                <option value="Comanda duplicada por error">Comanda duplicada por error</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
