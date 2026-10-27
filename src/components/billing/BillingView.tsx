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
  Clock,
  ShoppingBag,
  Flame,
  CreditCard,
  AlertTriangle,
  Receipt,
  Printer,
  XCircle,
  RefreshCw,
  X,
  Plus,
  Scale,
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
    setUrgencyFilter,
    resetFilters,
    openPaymentModal,
    cancelOrder,
    getOrderElapsedSeconds,
    getOrderUrgency,
    formatElapsedTime,
    getUrgencyConfig,
    getSourceLabel,
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
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Barra de Estadísticas y KPI de Caja (Touch 56px) */}
      <section aria-label="Resumen de Cobro y Métricas" className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
              MÓDULO DE CAJA & FACTURACIÓN
            </h2>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* KPI 1: Pendientes */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Por Cobrar:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              {stats.pendingCount} órdenes (${stats.pendingTotalAmount.toFixed(2)})
            </span>
          </div>

        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">

          {onNavigateToClosure && (
            <button
              onClick={onNavigateToClosure}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold active:scale-95 transition-all shadow-sm"
              title="Ir al Arqueo y Cierre de Turno"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arqueo de Turno</span>
            </button>
          )}
        </div>
      </section>

      {/* Grid Principal de Doble Panel Táctil */}
      <div className="flex-1 flex overflow-hidden">
        {/* =========================================================================
            PANEL IZQUIERDO: BANDEJA DE PEDIDOS PENDIENTES (520px de ancho)
           ========================================================================= */}
        <aside aria-label="Bandeja de pedidos pendientes" className="w-full lg:w-[480px] xl:w-[540px] border-r border-slate-800 flex flex-col h-full bg-slate-900/60 shrink-0 shadow-lg">
          {/* Cabecera del Panel Izquierdo: Buscador Táctil en Tiempo Real */}
          <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search-pending-orders"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por #ID, cliente o socio (ej. 104, Carlos, PF-1042)..."
                className="w-full h-12 pl-10 pr-9 rounded-2xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Tarjetas de Órdenes Pendientes (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredPendingOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/40 border border-slate-800 flex items-center justify-center mb-3 text-slate-600">
                  <Receipt className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-slate-300">No hay órdenes pendientes</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                  {searchQuery || typeFilter !== 'all' || urgencyFilter !== 'all'
                    ? 'No se encontraron pedidos con los filtros aplicados.'
                    : 'Todas las comandas de mostrador y quiosco han sido cobradas.'}
                </p>
                {(searchQuery || typeFilter !== 'all' || urgencyFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restablecer filtros
                  </button>
                )}
              </div>
            ) : (
              filteredPendingOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const elapsed = getOrderElapsedSeconds(order);
                const urgency = getOrderUrgency(order);
                const urgencyConfig = getUrgencyConfig(urgency);
                const sourceConfig = getSourceLabel(order.source);

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-3 ${isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-950/40'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                  >


                    {/* Cabecera de la Tarjeta: #ID, Origen y Tiempo en Espera */}
                    <div className="flex items-start justify-between gap-2 pl-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-lg text-white tracking-tight">
                          #{order.orderNumber}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${sourceConfig.color}`}
                        >
                          {sourceConfig.label}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {order.orderType === 'takeaway' ? '🛍️ Llevar' : '🥤 Barra'}
                        </span>
                      </div>

                    </div>

                    {/* Cliente e Información de Membresía */}
                    <div className="pl-1.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                          {order.customerName}
                          {order.member && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {order.member.tier}
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} ·{' '}
                          {order.createdAt}
                        </span>
                      </div>

                      {/* Monto Total */}
                      <div className="text-right">
                        <span className="text-xl font-black font-mono text-emerald-400 tracking-tight">
                          ${order.total.toFixed(2)}
                        </span>
                        {order.discount > 0 && (
                          <span className="block text-[10px] text-amber-400 font-mono">
                            Desc. -${order.discount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Previsualización rápida de productos */}
                    <div className="pl-1.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[280px]">
                        {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(' · ')}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaymentModal(order.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-950"
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
            PANEL DERECHO: DETALLE DE LA ORDEN SELECCIONADA
           ========================================================================= */}
        <section aria-label="Detalle de la orden seleccionada" className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
          {selectedOrder ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Cabecera Superior del Detalle */}
              <div className="p-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-mono font-black text-2xl shadow-lg shadow-emerald-500/10">
                    #{selectedOrder.orderNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-extrabold text-white">
                        {selectedOrder.customerName}
                      </h3>
                      {selectedOrder.member && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {selectedOrder.member.memberNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Origen: {getSourceLabel(selectedOrder.source).label}</span>
                      <span>·</span>
                      <span>Creada a las {selectedOrder.createdAt}</span>
                      <span>·</span>
                      <span>Cajero: {selectedOrder.cashierName}</span>
                    </p>
                  </div>
                </div>

                {/* Acciones Secundarias de la Comanda */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintPreReceipt(selectedOrder)}
                    className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
                    title="Imprimir comprobante preliminar para el cliente"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Pre-cuenta</span>
                  </button>

                  <button
                    onClick={() => setCancelModalOrderId(selectedOrder.id)}
                    className="px-4 h-11 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all border border-slate-800 hover:border-rose-900/50 flex items-center gap-2 active:scale-95"
                    title="Cancelar y descartar este pedido"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Anular Comanda</span>
                  </button>
                </div>
              </div>

              {/* Banner de Urgencia si está demorado */}
              {/* {getOrderUrgency(selectedOrder) === 'urgent' && (
                <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-rose-300 text-xs shrink-0">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="font-bold">
                      ¡Atención en Caja! Este cliente lleva más de{' '}
                      {Math.floor(getOrderElapsedSeconds(selectedOrder) / 60)} minutos en espera de cobro.
                    </span>
                  </div>
                  <span className="font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700">
                    PRIORIDAD MÁXIMA
                  </span>
                </div>
              )} */}

              {/* Contenido Central: Desglose de Productos y Resumen de Macros */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Desglose de Productos */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    Desglose de Productos y Personalización ({selectedOrder.items.length})
                  </h4>

                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const c = item.customization;

                      return (
                        <div
                          key={item.cartItemId}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 shadow-md"
                        >
                          {/* Fila Principal de Producto */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-mono font-black text-sm flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <div>
                                <h5 className="font-black text-base text-white leading-tight">
                                  {item.product.name}
                                </h5>
                                {c && (
                                  <span className="text-xs font-bold text-emerald-400 font-mono">
                                    {c.size.label} ({c.size.volumeLabel})
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-lg font-black font-mono text-emerald-400">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[11px] text-slate-400 font-mono">
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

                {/* Tarjeta de Resumen Nutricional Global (Macros para Atletas) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-white">
                        Perfil Nutricional del Pedido
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        Cálculo en tiempo real según formulación exacta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-right font-mono">
                    <div>
                      <span className="text-sm font-black text-white block">
                        {orderTotalMacros.calories} kcal
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Calorías</span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-emerald-400 block">
                        {orderTotalMacros.protein}g
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Proteína</span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-amber-400 block">
                        {orderTotalMacros.carbs}g
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Carbs</span>
                    </div>

                    <div>
                      <span className="text-sm font-black text-sky-400 block">
                        {orderTotalMacros.fat}g
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Grasas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra Inferior: Resumen Financiero y Gran Botón de Cobro Táctil */}
              <div className="p-6 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Desglose de Totales */}
                <div className="w-full md:w-auto flex items-center gap-6">
                  <div>
                    <span className="text-xs text-slate-400 block">Subtotal</span>
                    <span className="text-sm font-bold font-mono text-slate-200">
                      ${selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {selectedOrder.discount > 0 && (
                    <div>
                      <span className="text-xs text-amber-400 block">Descuento</span>
                      <span className="text-sm font-bold font-mono text-amber-400">
                        -${selectedOrder.discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-slate-400 block">IVA (Incluido)</span>
                    <span className="text-sm font-mono text-slate-400">$0.00</span>
                  </div>

                  <div className="h-10 w-px bg-slate-800" />

                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                      TOTAL A PAGAR
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-emerald-400 font-bold text-lg">$</span>
                      <span className="text-3xl font-black font-mono tracking-tight text-white">
                        {selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gran Botón Primario de Cobro (Touch min 64px) */}
                <button
                  id="btn-trigger-payment-modal"
                  onClick={() => openPaymentModal(selectedOrder.id)}
                  className="w-full md:w-auto px-8 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-black text-base tracking-wide shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] ring-2 ring-emerald-400/50"
                >
                  <CreditCard className="w-6 h-6 text-emerald-200" />
                  <span>PROCEDER AL PAGO (${selectedOrder.total.toFixed(2)})</span>
                  <span className="hidden xl:inline text-xs opacity-75 font-mono px-2 py-0.5 rounded bg-black/20">
                    F12 / Táctil
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <Receipt className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-300">Ninguna orden seleccionada</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Selecciona una comanda de la bandeja izquierda para ver su desglose, macros nutricionales y
                procesar la liquidación.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Liquidación y Procesamiento de Pago */}
      <PaymentModal />

      {/* Modal de Confirmación para Cancelar Comanda */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Anular Comanda</h3>
                <span className="text-xs text-slate-400">Esta acción cancelará el pedido de forma definitiva</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">
                Motivo de la cancelación:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="Cliente se retiró antes del cobro">Cliente se retiró antes del cobro</option>
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
                className="px-4 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950"
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
