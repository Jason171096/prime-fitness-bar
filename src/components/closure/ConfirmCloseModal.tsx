/**
 * @file ConfirmCloseModal.tsx
 * @description Modal de confirmación final para el Cierre de Caja (Corte Z).
 * Muestra el balance financiero del turno, métricas clave de recaudación,
 * y solicita confirmación antes de bloquear las ventas de la sesión en SQLite
 * y emitir el ticket térmico formal vía Electron IPC.
 */

import React from 'react';
import {
  X,
  AlertOctagon,
  Printer,
  Lock,
  Wallet,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import type { ShiftFinancialSummary } from '../../types/closure';

interface ConfirmCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: ShiftFinancialSummary;
  shiftNumber: number;
  cashierName: string;
  notes: string;
}

export const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  summary,
  shiftNumber,
  cashierName,
  notes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">¿Confirmar Cierre de Turno?</h2>
              <p className="text-xs text-slate-400">
                Turno #{shiftNumber} · Cajero: <strong className="text-slate-200">{cashierName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Fondo Inicial de Apertura:</span>
              <span className="font-bold text-white font-mono">${summary.initialCashFloat.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Ventas Totales Brutas ({summary.totalOrdersCount} órdenes):</span>
              <span className="font-bold text-white font-mono text-sm">${summary.totalSales.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 text-[11px] border-t border-b border-slate-900">
              <div className="bg-slate-900/60 p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Efectivo</span>
                <span className="font-bold text-emerald-400 font-mono">${summary.cashSales.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Tarjeta</span>
                <span className="font-bold text-cyan-400 font-mono">${summary.cardSales.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg text-center">
                <span className="text-slate-500 block">Socios Gym</span>
                <span className="font-bold text-violet-400 font-mono">${summary.memberAccountSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Movimientos Extraordinarios:</span>
              <span className="font-bold font-mono text-slate-300">
                +${summary.totalCashIn.toFixed(2)} / -${summary.totalCashDrop.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-slate-200">Balance Neto Teórico:</span>
              </div>
              <span className="font-mono text-base font-black text-emerald-400">
                ${summary.netTheoreticalBalance.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Efectivo Teórico en Gaveta:</span>
              </div>
              <span className="font-bold text-amber-300 font-mono text-sm">
                ${summary.expectedCash.toFixed(2)}
              </span>
            </div>
          </div>

          {notes && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300">
              <span className="font-bold text-slate-400 block mb-1">Observaciones del cajero:</span>
              <p className="italic text-slate-200">{notes}</p>
            </div>
          )}

          {/* Advertencia de Bloqueo en SQLite y Hardware */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
            <Lock className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <p>
              Al confirmar, la sesión de trabajo quedará <strong>bloqueada permanentemente en SQLite local</strong>,
              se encolará la sincronización hacia la base de datos central y se enviará la orden de impresión térmica del
              ticket de <strong>Corte Z</strong> mediante Electron IPC.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Volver a Revisar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Confirmar y Emitir Corte Z</span>
          </button>
        </div>
      </div>
    </div>
  );
};
