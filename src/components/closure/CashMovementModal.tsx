/**
 * @file CashMovementModal.tsx
 * @description Modal táctil para registrar Entradas y Retiros de Efectivo (Cash Drops & Cash In)
 * durante el turno activo (pagos a proveedores menores, retiro de seguridad a bóveda, reposición de fondo).
 */

import React, { useState } from 'react';
import {
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  FileText,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import type { CashMovementType, CashMovementCategory } from '../../types/closure';
import { CASH_MOVEMENT_CATEGORY_LABELS } from '../../data/closureConstants';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: CashMovementType;
    category: CashMovementCategory;
    amount: number;
    reason: string;
    authorizedBy: string;
    receiptNumber?: string;
  }) => void;
  currentExpectedCash: number;
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentExpectedCash,
}) => {
  const [movementType, setMovementType] = useState<CashMovementType>('cash_drop');
  const [category, setCategory] = useState<CashMovementCategory>('supplier_payment');
  const [amountStr, setAmountStr] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [authorizedBy, setAuthorizedBy] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amountStr) || 0;

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (numAmount <= 0) {
      setFormError('Por favor ingresa un monto válido mayor a $0.00');
      return;
    }

    if (movementType === 'cash_drop' && numAmount > currentExpectedCash) {
      setFormError(
        `El retiro ($${numAmount.toFixed(2)}) supera el efectivo actual en caja ($${currentExpectedCash.toFixed(2)}).`
      );
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setFormError('El motivo o justificación del movimiento es obligatorio (mínimo 5 caracteres).');
      return;
    }

    if (!authorizedBy.trim()) {
      setFormError('Debes especificar la persona o supervisor que autoriza este movimiento.');
      return;
    }

    onSubmit({
      type: movementType,
      category,
      amount: numAmount,
      reason: reason.trim(),
      authorizedBy: authorizedBy.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
    });

    // Reset fields
    setAmountStr('');
    setReason('');
    setReceiptNumber('');
    setFormError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                movementType === 'cash_drop'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {movementType === 'cash_drop' ? (
                <ArrowDownCircle className="w-6 h-6" />
              ) : (
                <ArrowUpCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                {movementType === 'cash_drop' ? 'Registrar Retiro de Efectivo' : 'Registrar Entrada de Efectivo'}
              </h2>
              <p className="text-xs text-stone-500">
                {movementType === 'cash_drop'
                  ? 'Salida extraordinaria de dinero (proveedor, traslado a bóveda)'
                  : 'Ingreso extraordinario de efectivo (reposición de cambio)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Selector de Tipo: Retiro vs Entrada */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMovementType('cash_drop');
                  setCategory('supplier_payment');
                }}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'cash_drop'
                    ? 'bg-red-50 border-red-300 text-red-700 ring-2 ring-red-200/60 shadow-sm'
                    : 'bg-[#FAF6F0] border-stone-200 text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-red-700" />
                <span>Retiro (Salida)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMovementType('cash_in');
                  setCategory('change_fund');
                }}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  movementType === 'cash_in'
                    ? 'bg-[#4A6B3E] border-[#4A6B3E] text-white shadow-sm'
                    : 'bg-[#FAF6F0] border-stone-200 text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <ArrowUpCircle className={`w-4 h-4 ${movementType === 'cash_in' ? 'text-white' : 'text-[#4A6B3E]'}`} />
                <span>Entrada (Ingreso)</span>
              </button>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Categoría del Movimiento
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CashMovementCategory)}
              className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl px-4 py-3 text-stone-900 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
            >
              {Object.entries(CASH_MOVEMENT_CATEGORY_LABELS).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>
                  {info.label} — {info.description}
                </option>
              ))}
            </select>
          </div>

          {/* Monto con presets rápidos */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Monto en Efectivo ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono text-stone-500">$</span>
              <input
                type="number"
                step="0.50"
                min="0.50"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl pl-9 pr-4 py-3.5 text-stone-900 font-mono text-xl font-bold focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
              />
            </div>
            {/* Presets rápidos */}
            <div className="flex gap-2 mt-2">
              {[20, 50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="flex-1 py-1.5 px-2 bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-700 text-xs font-mono font-bold rounded-lg border border-stone-200 active:scale-95 transition-all cursor-pointer"
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo / Justificación */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Motivo / Concepto Detallado *
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Pago de 3 bolsas de hielo frappé a distribuidor local..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 placeholder:text-stone-400 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none resize-none"
            />
          </div>

          {/* Autorizado por & Referencia de Ticket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Autorizado Por *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Supervisor / Gerente"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                N° Ticket / Factura
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Ej: FAC-8821"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 placeholder:text-stone-400 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FAF6F0] hover:bg-stone-200/70 border border-stone-200 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Guardar {movementType === 'cash_drop' ? 'Retiro' : 'Entrada'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
