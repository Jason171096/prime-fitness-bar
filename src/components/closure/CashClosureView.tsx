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
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* =========================================================================
          BARRA DE ESTADO SUPERIOR DEL TURNO ACTIVO (Touch-friendly 56px)
         ========================================================================= */}
      <section
        aria-label="Encabezado del Turno Activo"
        className="h-14 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${isShiftOpen ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-rose-500'
                }`}
            />
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-200">
              CIERRE DE CAJA & BALANCE DE TURNO
            </h1>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Hora de Apertura */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Apertura: <strong className="text-slate-200 font-mono">{currentShift?.openedAt || '--'}</strong>
            </span>
          </div>
        </div>

        {/* Acciones Rápidas del Encabezado */}
        <div className="flex items-center gap-2.5">
          {/* Botón Registrar Movimiento Extraordinario */}
          {isShiftOpen && (
            <button
              id="btn-register-movement"
              type="button"
              onClick={() => setMovementModalOpen(true)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all shadow-sm"
              title="Registrar entrada o retiro manual de caja (gastos menores o retiro de seguridad)"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Movimiento de Caja</span>
            </button>
          )}

          {/* Botón Pulso Cajón de Dinero (ESC/POS) */}
          <button
            id="btn-open-drawer"
            type="button"
            onClick={openCashDrawer}
            className="flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all shadow-sm"
            title="Enviar pulso eléctrico para abrir el cajón portamonedas"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Abrir Cajón</span>
          </button>

          {/* Pre-Arqueo (Corte X) */}
          <button
            id="btn-x-report"
            type="button"
            onClick={executeXReport}
            className="flex items-center gap-2 px-3 h-9 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold border border-cyan-800/60 active:scale-95 transition-all shadow-sm"
            title="Emitir reporte de auditoría X sin bloquear la sesión"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auditoría (Corte X)</span>
          </button>

          {/* Historial de Cierres Previos */}
          {closedReportsHistory.length > 0 && (
            <button
              id="btn-closure-history"
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Historial ({closedReportsHistory.length})</span>
            </button>
          )}

          {/* Si el turno está cerrado, botón para abrir siguiente turno */}
          {!isShiftOpen && (
            <button
              id="btn-open-next-shift"
              type="button"
              onClick={() => setOpenShiftModalOpen(true)}
              className="flex items-center gap-2 px-3.5 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5 shadow-md shrink-0">
          {/* Header del Panel */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Panel de Resumen Financiero del Turno
              </h2>
            </div>
          </div>

          {/* Grid de KPIs de Ventas por Método de Pago */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Fondo Inicial */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Fondo Inicial</span>
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-black text-white font-mono">
                  ${financialSummary.initialCashFloat.toFixed(2)}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">Fondo Apertura</span>
              </div>
            </div>

            {/* Total Cobrado en Efectivo */}
            <div className="bg-slate-950/80 border border-emerald-950/60 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400 text-[11px] font-semibold">
                <span>Efectivo</span>
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-black text-emerald-300 font-mono">
                  ${financialSummary.cashSales.toFixed(2)}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {financialSummary.paymentBreakdown.cashOrdersCount} ventas cobradas
                </span>
              </div>
            </div>

            {/* Total Cobrado con Tarjeta Bancaria */}
            <div className="bg-slate-950/80 border border-cyan-950/60 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-cyan-400 text-[11px] font-semibold">
                <span>Tarjeta TPV</span>
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-black text-cyan-300 font-mono">
                  ${financialSummary.cardSales.toFixed(2)}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {financialSummary.paymentBreakdown.cardOrdersCount} transacciones
                </span>
              </div>
            </div>

            {/* Total Descontado de Cuentas de Socios */}
            <div className="bg-slate-950/80 border border-violet-950/60 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-violet-400 text-[11px] font-semibold">
                <span>Saldo Socios</span>
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="mt-1">
                <span className="text-lg font-black text-violet-300 font-mono">
                  ${financialSummary.memberAccountSales.toFixed(2)}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {financialSummary.paymentBreakdown.gymAccountOrdersCount} débitos gym
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Balance Neto Teórico y Efectivo en Gaveta */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Balance Neto Teórico Recaudado
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  (Ventas Totales + Entradas - Retiros)
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                  ${financialSummary.netTheoreticalBalance.toFixed(2)}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Ventas Brutas: <strong className="text-white">${financialSummary.totalSales.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Efectivo en Gaveta
                </span>
                <span className="text-base font-black text-amber-300 font-mono">
                  ${financialSummary.expectedCash.toFixed(2)}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800" />

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Ticket Promedio
                </span>
                <span className="text-base font-bold text-white font-mono">
                  ${financialSummary.averageTicket.toFixed(2)}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800" />

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Órdenes
                </span>
                <span className="text-base font-bold text-white font-mono">
                  {financialSummary.totalOrdersCount}
                </span>
              </div>
            </div>
          </div>
        </div>

          {/* PANEL 2: AUDITORÍA DETALLADA DE VENTAS DEL TURNO (INTERACTIVE FEED) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col gap-3 overflow-hidden shadow-md">
            {/* Header y Filtros del Feed */}
            <div className="flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Auditoría de Ventas del Turno ({filteredTransactions.length})
                </h2>
              </div>

              {/* Buscador Rápido por Folio o Cliente */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar folio (#104), cliente..."
                  value={transactionSearchQuery}
                  onChange={(e) => setTransactionSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Tabs de Filtro Rápido por Método de Pago */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paymentFilter === 'all'
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
              >
                Todos ({financialSummary.totalOrdersCount})
              </button>

              <button
                type="button"
                onClick={() => setPaymentFilter('cash')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${paymentFilter === 'cash'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-900/50'
                  : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
                  }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>Efectivo ({financialSummary.paymentBreakdown.cashOrdersCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentFilter('card')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${paymentFilter === 'card'
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-900/50'
                  : 'bg-slate-950 text-slate-400 hover:text-cyan-300 border border-slate-800'
                  }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>Tarjeta ({financialSummary.paymentBreakdown.cardOrdersCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentFilter('gym_account')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${paymentFilter === 'gym_account'
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/50'
                  : 'bg-slate-950 text-slate-400 hover:text-violet-300 border border-slate-800'
                  }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Saldo Socio ({financialSummary.paymentBreakdown.gymAccountOrdersCount})</span>
              </button>
            </div>

            {/* Listado de Transacciones (Feed Táctil con Scroll Suave) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Receipt className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No se encontraron ventas para este filtro</p>
                  <p className="text-xs">Prueba ajustando el buscador o cambiando el método de pago seleccionado.</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;

                  // Badges de Método de Pago
                  let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (tx.paymentMethod === 'cash') {
                    badgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
                  } else if (tx.paymentMethod === 'card') {
                    badgeClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
                  } else if (tx.paymentMethod === 'gym_account') {
                    badgeClass = 'bg-violet-950/80 text-violet-300 border-violet-500/40';
                  } else if (tx.paymentMethod === 'split') {
                    badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
                  }

                  return (
                    <div
                      key={tx.id}
                      onClick={() => toggleExpandTx(tx.id)}
                      className={`rounded-xl border transition-all cursor-pointer ${isExpanded
                        ? 'bg-slate-950 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                        : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                        }`}
                    >
                      {/* Fila Principal de la Transacción */}
                      <div className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          {/* Folio / Order Number */}
                          <div className="font-mono font-black text-sm text-cyan-400 w-14 shrink-0">
                            #{tx.orderNumber}
                          </div>

                          {/* Hora y Cliente */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{tx.customerName}</span>
                              {tx.memberNumber && (
                                <span className="px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-300 text-[10px] font-mono border border-violet-500/30">
                                  {tx.memberNumber}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {tx.timestamp} · {tx.itemsCount} ítem(s)
                            </span>
                          </div>
                        </div>

                        {/* Método de Pago e Importe */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}
                          >
                            {tx.paymentMethodLabel}
                          </span>

                          <div className="text-right w-20">
                            <span className="font-mono font-black text-sm text-white">
                              ${tx.totalAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-slate-500">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Desglose Expandido de Productos de la Orden */}
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-1 border-t border-slate-900 bg-slate-950/90 rounded-b-xl space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Productos en esta orden:
                          </span>
                          <div className="space-y-1">
                            {tx.items.map((item, idx) => (
                              <div
                                key={`${item.productId}-${idx}`}
                                className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg"
                              >
                                <span>
                                  <strong className="text-emerald-400 font-mono">{item.quantity}x</strong>{' '}
                                  {item.productName}
                                </span>
                                <span className="font-mono font-bold text-slate-200">
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-end gap-3 shadow-md shrink-0">
            {/* Campo de Observaciones / Incidencias del Turno */}
            <div className="flex-1 w-full">
              <label
                htmlFor="closure-notes"
                className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between"
              >
                <span>Observaciones e Incidencias del Turno:</span>
                <span className="text-[10px] text-slate-500 font-normal">Notas para el reporte contable</span>
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
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Botonera Táctil de Cierre e Impresión de Hardware */}
            <div className="w-full md:w-auto md:min-w-[340px] shrink-0 flex items-center gap-3">
              {/* Botón Primario: Confirmar Cierre de Turno */}
              {isShiftOpen ? (
                <button
                  id="btn-confirm-closure"
                  type="button"
                  onClick={() => setConfirmCloseModalOpen(true)}
                  className="w-full h-[58px] rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2.5 active:scale-95 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirmar Cierre de Turno (Corte Z)</span>
                </button>
              ) : (
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 h-[58px] rounded-xl bg-emerald-950/60 border border-emerald-500/40 px-4 flex items-center justify-between text-xs text-emerald-300 font-bold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Turno #{currentShift?.shiftNumber} Finalizado & Bloqueado</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
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
                    className="px-4 h-[58px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2 active:scale-95 transition-all shrink-0"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-black text-white">Historial de Turnos Cerrados</h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {closedReportsHistory.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500">No hay turnos archivados aún.</p>
              ) : (
                closedReportsHistory.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">Turno #{rep.shiftNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {rep.reportType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {rep.closedAt} · Cajero: {rep.cashierName}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-sm font-black text-white font-mono block">
                          ${rep.summary.totalSales.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {rep.summary.totalOrdersCount} órdenes
                        </span>
                      </div>

                      <button
                        onClick={() => printReport(rep)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Reimprimir ticket térmico"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
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
