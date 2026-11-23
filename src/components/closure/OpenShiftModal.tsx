/**
 * @file OpenShiftModal.tsx
 * @description Modal táctil para apertura de un nuevo turno de trabajo:
 * Registro del fondo inicial de caja (cash float), cajero asignado y observaciones de arranque.
 */

import React, { useState } from 'react';
import { X, Unlock, UserCheck, ShieldCheck } from 'lucide-react';

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShift: (initialFloat: number, cashierName?: string, notes?: string) => void;
  suggestedShiftNumber: number;
  defaultCashierName: string;
}

export const OpenShiftModal: React.FC<OpenShiftModalProps> = ({
  isOpen,
  onClose,
  onOpenShift,
  suggestedShiftNumber,
  defaultCashierName,
}) => {
  const [floatStr, setFloatStr] = useState<string>('350.00');
  const [cashierName, setCashierName] = useState<string>(defaultCashierName || 'Cajero de Turno');
  const [notes, setNotes] = useState<string>('Fondo de apertura entregado en billetes y monedas variadas.');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numFloat = parseFloat(floatStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numFloat < 0) {
      setError('El fondo inicial de caja no puede ser negativo.');
      return;
    }
    if (!cashierName.trim()) {
      setError('Por favor indica el nombre del cajero responsable.');
      return;
    }

    onOpenShift(numFloat, cashierName.trim(), notes.trim());
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#4A6B3E]/10 text-[#4A6B3E] border border-[#4A6B3E]/25">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">Apertura de Nuevo Turno</h2>
              <p className="text-xs text-stone-500">Turno #{suggestedShiftNumber} · Iniciar sesión de punto de venta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Fondo Inicial (Cash Float) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Fondo Inicial de Caja (Cash Float) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-mono text-stone-500">$</span>
              <input
                type="number"
                step="10"
                min="0"
                value={floatStr}
                onChange={(e) => setFloatStr(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl pl-9 pr-4 py-3.5 text-stone-900 font-mono text-2xl font-black focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
              />
            </div>
            {/* Presets rápidos */}
            <div className="flex gap-2 mt-2">
              {[200, 300, 350, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFloatStr(val.toFixed(2))}
                  className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold rounded-lg border active:scale-95 transition-all cursor-pointer ${
                    numFloat === val
                      ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-sm'
                      : 'bg-[#FAF6F0] hover:bg-stone-200/70 text-stone-700 border-stone-200'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del Cajero */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Cajero Responsable *
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl pl-10 pr-4 py-3 text-stone-900 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none"
              />
            </div>
          </div>

          {/* Notas de Apertura */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Observaciones de Apertura
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:bg-white focus:border-[#4A6B3E] focus:outline-none resize-none"
            />
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
              className="flex-1 py-3 px-4 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Abrir Turno #{suggestedShiftNumber}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
