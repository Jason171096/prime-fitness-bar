/**
 * @file CashClosureView.tsx
 * @description Vista principal del Módulo de Cierre de Caja y Balance de Turno (Shift Closure & Daily Sales Summary)
 * de PrimeFitness Bar. Diseñado y optimizado para pantallas táctiles de 1080p en retail y gimnasios.
 *
 * Estructura en columna única operativa:
 * 1. Panel de Resumen Financiero del Turno (Fondo inicial, ventas por método, Balance Neto Teórico Recaudado,
 *    Efectivo en gaveta, Ticket Promedio y Total de Órdenes).
 * 2. Auditoría Detallada de Ventas Registradas en el Turno (Buscador, filtro por método de pago y feed interactivo).
 * 3. Acciones de Cierre y Hardware (Campo de observaciones, confirmación de corte Z y reimpresión de tickets térmicos).
 */

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Printer,
  CheckCircle2,
  Plus,
  DollarSign,
  CreditCard,
  Wallet,
  Building2,
  Clock,
  History,
  Receipt,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { useCashClosure } from '../../hooks/useCashClosure';
import { CashMovementModal } from './CashMovementModal';
import { ConfirmCloseModal } from './ConfirmCloseModal';
import { ClosureReceiptModal } from './ClosureReceiptModal';
import { OpenShiftModal } from './OpenShiftModal';

interface CashClosureViewProps {
  onNavigateToBilling?: () => void;
}

export const CashClosureView: React.FC<CashClosureViewProps> = () => {
  const {
    currentShift,
    closureNotes,
    closedReportsHistory,
    lastGeneratedReport,
    financialSummary,

    // Transacciones del turno
    filteredTransactions,
    transactionSearchQuery,
    setTransactionSearchQuery,
    paymentFilter,
    setPaymentFilter,

    // Modales y control de estado
    isMovementModalOpen,
    isReceiptModalOpen,
    isConfirmCloseModalOpen,
    isOpenShiftModalOpen,

    setClosureNotes,
    setMovementModalOpen,
    setReceiptModalOpen,
    setConfirmCloseModalOpen,
    setOpenShiftModalOpen,

    addCashMovement,

    // Acciones contables y de hardware
    openCashDrawer,
    executeShiftClosure,
    executeXReport,
    printReport,
    openNewShift,
  } = useCashClosure();

  // Historial de turnos
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  // Transacción expandida en el feed
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const isShiftOpen = currentShift?.status === 'open';

  const toggleExpandTx = (id: string) => {
    setExpandedTxId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6F0] text-stone-900 overflow-hidden select-none font-sans">
      {/* =========================================================================
          BARRA DE ESTADO SUPERIOR DEL TURNO ACTIVO (Touch-friendly 56px)
         ========================================================================= */}
      <section
        aria-label="Encabezado del Turno Activo"
        className="h-14 px-6 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-stone-900 tracking-tight">
              Cierre de Caja & Balance de Turno
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${isShiftOpen
                ? 'bg-[#4A6B3E]/15 text-[#4A6B3E] border-[#4A6B3E]/25'
                : 'bg-red-50 text-red-700 border-red-200'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isShiftOpen ? 'bg-[#4A6B3E] animate-pulse' : 'bg-red-500'
                  }`}
              />
              {isShiftOpen ? `Turno #${currentShift?.shiftNumber || 14} Activo` : 'Turno Cerrado'}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-200 hidden xl:block" />

          {/* Hora de Apertura y Cajero */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5 text-[#4A6B3E]" />
            <span>
              Apertura: <strong className="text-stone-900 font-mono">{currentShift?.openedAt || '--'}</strong>
              {' · '}
              Cajero: <strong className="text-stone-900">{currentShift?.cashierName || 'Marcos Vega'}</strong>
            </span>
          </div>
        </div>

        {/* Acciones Rápidas del Encabezado */}
        <div className="flex items-center gap-2">
          {/* Botón Registrar Movimiento Extraordinario */}
          {isShiftOpen && (
            <button
              id="btn-register-movement"
              type="button"
              onClick={() => setMovementModalOpen(true)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-800 text-xs font-bold border border-stone-300 active:scale-95 transition-all cursor-pointer"
              title="Registrar entrada o retiro manual de caja (gastos menores o retiro de seguridad)"
            >
              <Plus className="w-3.5 h-3.5 text-[#4A6B3E]" />
              <span>Movimiento de Caja</span>
            </button>
          )}

          {/* Botón Pulso Cajón de Dinero (ESC/POS) */}
          <button
            id="btn-open-drawer"
            type="button"
            onClick={openCashDrawer}
            className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-800 text-xs font-bold border border-stone-300 active:scale-95 transition-all cursor-pointer"
            title="Enviar pulso eléctrico para abrir el cajón portamonedas"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#D96B43]" />
            <span className="hidden sm:inline">Abrir Cajón</span>
          </button>

          {/* Pre-Arqueo (Corte X) */}
          <button
            id="btn-x-report"
            type="button"
            onClick={executeXReport}
            className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[#4A6B3E]/10 hover:bg-[#4A6B3E]/20 text-[#4A6B3E] text-xs font-bold border border-[#4A6B3E]/30 active:scale-95 transition-all cursor-pointer"
            title="Emitir reporte de auditoría X sin bloquear la sesión"
          >
            <Printer className="w-3.5 h-3.5 text-[#4A6B3E]" />
            <span>Auditoría (Corte X)</span>
          </button>

          {/* Historial de Cierres Previos */}
          {closedReportsHistory.length > 0 && (
            <button
              id="btn-closure-history"
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-700 text-xs font-semibold border border-stone-300 active:scale-95 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden lg:inline">Historial ({closedReportsHistory.length})</span>
            </button>
          )}

          {/* Si el turno está cerrado, botón para abrir siguiente turno */}
          {!isShiftOpen && (
            <button
              id="btn-open-next-shift"
              type="button"
              onClick={() => setOpenShiftModalOpen(true)}
              className="flex items-center gap-2 px-3.5 h-9 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Abrir Nuevo Turno</span>
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL: COLUMNA ÚNICA OPERATIVA (1080p TOUCH OPTIMIZED)
         ========================================================================= */}
      <main className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        {/* PANEL 1: RESUMEN FINANCIERO DEL TURNO */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm shrink-0">
          {/* Header del Panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#4A6B3E]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Panel de Resumen Financiero del Turno
              </h2>
            </div>
          </div>

          {/* Grid de KPIs de Ventas por Método de Pago */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Fondo Inicial */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider font-semibold">
                <span>Fondo Inicial</span>
                <Wallet className="w-4 h-4 text-[#D96B43]" />
              </div>
              <div className="mt-1.5">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  ${financialSummary.initialCashFloat.toFixed(2)}
                </span>
                <span className="block text-[11px] text-stone-500 font-medium">Fondo Apertura</span>
              </div>
            </div>

            {/* Total Cobrado en Efectivo */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider font-semibold">
                <span>Efectivo</span>
                <DollarSign className="w-4 h-4 text-[#4A6B3E]" />
              </div>
              <div className="mt-1.5">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  ${financialSummary.cashSales.toFixed(2)}
                </span>
                <span className="block text-[11px] text-stone-500">
                  {financialSummary.paymentBreakdown.cashOrdersCount} ventas cobradas
                </span>
              </div>
            </div>

            {/* Total Cobrado con Tarjeta Bancaria */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider font-semibold">
                <span>Tarjeta TPV</span>
                <CreditCard className="w-4 h-4 text-[#4A6B3E]" />
              </div>
              <div className="mt-1.5">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  ${financialSummary.cardSales.toFixed(2)}
                </span>
                <span className="block text-[11px] text-stone-500">
                  {financialSummary.paymentBreakdown.cardOrdersCount} transacciones
                </span>
              </div>
            </div>

            {/* Total Descontado de Cuentas de Socios */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-wider font-semibold">
                <span>Saldo Socios</span>
                <Building2 className="w-4 h-4 text-[#4A6B3E]" />
              </div>
              <div className="mt-1.5">
                <span className="text-xl font-bold text-stone-900 font-mono">
                  ${financialSummary.memberAccountSales.toFixed(2)}
                </span>
                <span className="block text-[11px] text-stone-500">
                  {financialSummary.paymentBreakdown.gymAccountOrdersCount} débitos gym
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Destacada de Balance Neto Teórico y Efectivo en Gaveta */}
          <div className="bg-[#4A6B3E]/10 border-2 border-[#4A6B3E] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4A6B3E]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#4A6B3E]">
                  Balance Neto Teórico Recaudado
                </span>
                <span className="text-[11px] text-stone-600 font-medium">
                  (Ventas Totales + Entradas - Retiros)
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-stone-900 font-mono tracking-tight">
                  ${financialSummary.netTheoreticalBalance.toFixed(2)}
                </span>
                <span className="text-xs text-stone-600 font-mono">
                  Ventas Brutas: <strong className="text-stone-900">${financialSummary.totalSales.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#D96B43] block tracking-wider">
                  Efectivo en Gaveta
                </span>
                <span className="text-lg font-extrabold text-stone-900 font-mono">
                  ${financialSummary.expectedCash.toFixed(2)}
                </span>
              </div>

              <div className="h-8 w-px bg-[#4A6B3E]/25" />

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-600 block tracking-wider">
                  Ticket Promedio
                </span>
                <span className="text-lg font-bold text-stone-900 font-mono">
                  ${financialSummary.averageTicket.toFixed(2)}
                </span>
              </div>

              <div className="h-8 w-px bg-[#4A6B3E]/25" />

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-600 block tracking-wider">
                  Órdenes
                </span>
                <span className="text-lg font-bold text-stone-900 font-mono">
                  {financialSummary.totalOrdersCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: AUDITORÍA DETALLADA DE VENTAS DEL TURNO (INTERACTIVE FEED) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex-1 flex flex-col gap-3 overflow-hidden shadow-sm">
          {/* Header y Filtros del Feed */}
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#4A6B3E]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-stone-800">
                Auditoría de Ventas del Turno ({filteredTransactions.length})
              </h2>
            </div>

            {/* Buscador Rápido por Folio o Cliente */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar folio (#104), cliente..."
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#FAF6F0]/60 border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20"
              />
            </div>
          </div>

          {/* Tabs de Filtro Rápido por Método de Pago */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${paymentFilter === 'all'
                ? 'bg-[#4A6B3E] text-white font-semibold shadow-sm'
                : 'bg-[#FAF6F0] text-stone-700 border border-stone-200 hover:bg-stone-200/70 font-medium'
                }`}
            >
              Todos ({financialSummary.totalOrdersCount})
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('cash')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${paymentFilter === 'cash'
                ? 'bg-[#4A6B3E] text-white font-semibold shadow-sm'
                : 'bg-[#FAF6F0] text-stone-700 border border-stone-200 hover:bg-stone-200/70 font-medium'
                }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>Efectivo ({financialSummary.paymentBreakdown.cashOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('card')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${paymentFilter === 'card'
                ? 'bg-[#4A6B3E] text-white font-semibold shadow-sm'
                : 'bg-[#FAF6F0] text-stone-700 border border-stone-200 hover:bg-stone-200/70 font-medium'
                }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>Tarjeta ({financialSummary.paymentBreakdown.cardOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('gym_account')}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${paymentFilter === 'gym_account'
                ? 'bg-[#4A6B3E] text-white font-semibold shadow-sm'
                : 'bg-[#FAF6F0] text-stone-700 border border-stone-200 hover:bg-stone-200/70 font-medium'
                }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Saldo Socio ({financialSummary.paymentBreakdown.gymAccountOrdersCount})</span>
            </button>
          </div>

          {/* Listado de Transacciones (Feed Táctil con Scroll Suave) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <Receipt className="w-10 h-10 mb-2 text-stone-300" />
                <p className="text-sm font-semibold text-stone-700">
                  No se encontraron ventas para este filtro
                </p>
                <p className="text-xs text-stone-500">
                  Prueba ajustando el buscador o cambiando el método de pago seleccionado.
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpanded = expandedTxId === tx.id;

                // Badges de Método de Pago
                let badgeClass = 'bg-stone-100 text-stone-700 border-stone-200';
                if (tx.paymentMethod === 'cash') {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                } else if (tx.paymentMethod === 'card') {
                  badgeClass = 'bg-stone-100 text-stone-800 border-stone-300';
                } else if (tx.paymentMethod === 'gym_account') {
                  badgeClass = 'bg-[#4A6B3E]/10 text-[#4A6B3E] border-[#4A6B3E]/25';
                } else if (tx.paymentMethod === 'split') {
                  badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                }

                return (
                  <div
                    key={tx.id}
                    onClick={() => toggleExpandTx(tx.id)}
                    className={`rounded-xl border transition-all cursor-pointer ${isExpanded
                      ? 'bg-[#FAF6F0]/70 border-[#4A6B3E] shadow-sm'
                      : 'bg-white hover:bg-[#FAF6F0]/50 border-stone-200'
                      }`}
                  >
                    {/* Fila Principal de la Transacción */}
                    <div className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Folio / Order Number */}
                        <div className="font-mono font-black text-sm text-[#4A6B3E] w-14 shrink-0">
                          #{tx.orderNumber}
                        </div>

                        {/* Hora y Cliente */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{tx.customerName}</span>
                            {tx.memberNumber && (
                              <span className="px-1.5 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] text-[10px] font-mono border border-[#4A6B3E]/20 font-semibold">
                                {tx.memberNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {tx.timestamp} · {tx.itemsCount} ítem(s)
                          </span>
                        </div>
                      </div>

                      {/* Método de Pago e Importe */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
                        >
                          {tx.paymentMethodLabel}
                        </span>

                        <div className="text-right w-20">
                          <span className="font-mono font-bold text-sm text-stone-900">
                            ${tx.totalAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="text-stone-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desglose Expandido de Productos de la Orden */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-2 border-t border-stone-200/80 bg-[#FAF6F0]/60 rounded-b-xl space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                          Productos en esta orden:
                        </span>
                        <div className="space-y-1">
                          {tx.items.map((item, idx) => (
                            <div
                              key={`${item.productId}-${idx}`}
                              className="flex justify-between items-center text-xs text-stone-700 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70"
                            >
                              <span>
                                <strong className="text-[#4A6B3E] font-mono">{item.quantity}x</strong>{' '}
                                {item.productName}
                              </span>
                              <span className="font-mono font-bold text-stone-900">
                                ${item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 3: ACCIONES DE CIERRE Y HARDWARE (ELECTRON IPC) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row items-end gap-3 shadow-sm shrink-0">
          {/* Campo de Observaciones / Incidencias del Turno */}
          <div className="flex-1 w-full">
            <label
              htmlFor="closure-notes"
              className="text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between"
            >
              <span>Observaciones e Incidencias del Turno:</span>
            </label>
            <textarea
              id="closure-notes"
              rows={2}
              disabled={!isShiftOpen}
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              placeholder={
                isShiftOpen
                  ? 'Ingresa cualquier incidencia operativa, notas de auditoría o comentarios del turno...'
                  : 'Turno cerrado. Las observaciones han quedado registradas en el Z-Report.'
              }
              className="w-full p-2.5 rounded-xl bg-[#FAF6F0]/70 border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botonera Táctil de Cierre e Impresión de Hardware */}
          <div className="w-full md:w-auto md:min-w-[340px] shrink-0 flex items-center gap-3">
            {isShiftOpen ? (
              <button
                id="btn-confirm-closure"
                type="button"
                onClick={() => setConfirmCloseModalOpen(true)}
                className="w-full min-h-[52px] px-5 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Confirmar Cierre de Turno (Corte Z)</span>
              </button>
            ) : (
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 min-h-[52px] rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/30 px-4 flex items-center justify-between text-xs text-[#4A6B3E] font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A6B3E]" />
                    <span>Turno #{currentShift?.shiftNumber} Finalizado</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-600">
                    Cierre: {currentShift?.closedAt || '--'}
                  </span>
                </div>

                <button
                  id="btn-reprint-z"
                  type="button"
                  onClick={() => {
                    if (lastGeneratedReport) printReport(lastGeneratedReport);
                    else setReceiptModalOpen(true);
                  }}
                  className="px-4 min-h-[50px] rounded-xl bg-[#FAF6F0] hover:bg-stone-200/80 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#4A6B3E]" />
                  <span>Reimprimir Z</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODALES OPERATIVOS (MOVIMIENTOS, CONFIRMACIÓN, TICKET TÉRMICO Y APERTURA)
         ========================================================================= */}

      {/* Modal 1: Registro de Entrada o Retiro Extraordinario de Caja */}
      <CashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        onSubmit={addCashMovement}
        currentExpectedCash={financialSummary.expectedCash}
      />

      {/* Modal 2: Confirmación Expresa de Cierre de Turno (Corte Z) */}
      <ConfirmCloseModal
        isOpen={isConfirmCloseModalOpen}
        onClose={() => setConfirmCloseModalOpen(false)}
        onConfirm={executeShiftClosure}
        summary={financialSummary}
        shiftNumber={currentShift?.shiftNumber || 14}
        cashierName={currentShift?.cashierName || 'Marcos Vega'}
        notes={closureNotes}
      />

      {/* Modal 3: Previsualizador e Impresión de Papel Térmico de 80mm */}
      <ClosureReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        report={lastGeneratedReport || null}
        onReprint={printReport}
      />

      {/* Modal 4: Apertura de Nuevo Turno de Trabajo */}
      <OpenShiftModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setOpenShiftModalOpen(false)}
        onOpenShift={openNewShift}
        suggestedShiftNumber={(currentShift?.shiftNumber || 14) + 1}
        defaultCashierName={currentShift?.cashierName || 'Marcos Vega'}
      />

      {/* Modal 5: Historial de Turnos Cerrados */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6F0] border border-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#4A6B3E]" />
                <h2 className="text-base font-black text-stone-900">Historial de Turnos Cerrados</h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {closedReportsHistory.length === 0 ? (
                <p className="text-center py-8 text-xs text-stone-500">
                  No hay turnos archivados aún.
                </p>
              ) : (
                closedReportsHistory.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 font-mono">
                          Turno #{rep.shiftNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] font-bold border border-[#4A6B3E]/20">
                          {rep.reportType}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {rep.closedAt} · Cajero: {rep.cashierName}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-sm font-black text-stone-900 font-mono block">
                          ${rep.summary.totalSales.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {rep.summary.totalOrdersCount} órdenes
                        </span>
                      </div>

                      <button
                        onClick={() => printReport(rep)}
                        className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-stone-200 text-stone-700 border border-stone-200 cursor-pointer"
                        title="Reimprimir ticket térmico"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#4A6B3E]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-stone-200 bg-white flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-stone-200 text-xs font-bold text-stone-700 border border-stone-300 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
