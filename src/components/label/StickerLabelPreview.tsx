import React, { useState } from 'react';
import {
  Printer,
  Check,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import type { CartItem } from '../../types/pos.types';

interface StickerLabelPreviewProps {
  item: CartItem;
  orderNumber: number;
  customerName?: string;
  timestamp?: string;
  onPrintSuccess?: () => void;
  showPrintButton?: boolean;
}

export const StickerLabelPreview: React.FC<StickerLabelPreviewProps> = ({
  item,
  orderNumber,
  customerName = 'Carlos Mendoza (Socio #1042)',
  timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  onPrintSuccess,
  showPrintButton = true,
}) => {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [justPrinted, setJustPrinted] = useState<boolean>(false);

  const custom = item.customization;
  const effectiveCustomerName = custom?.customerName || customerName || 'CLIENTE';
  const macros = custom ? custom.calculatedMacros : item.product.baseMacros;

  const handleSimulatePrint = () => {
    setIsPrinting(true);
    // Simulate IPC / ESC/POS thermal printer hardware latency
    setTimeout(() => {
      setIsPrinting(false);
      setJustPrinted(true);
      if (onPrintSuccess) onPrintSuccess();
      setTimeout(() => setJustPrinted(false), 2800);
    }, 900);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Physical Thermal Printer Slot Simulation */}
      <div className="w-[340px] h-3 bg-slate-800 rounded-t-lg border-t-2 border-slate-700 shadow-inner flex items-center justify-center">
        <div className="w-48 h-1 bg-black rounded-full" />
      </div>

      {/* The 58mm Thermal Adhesive Sticker Paper (White/Off-white thermal paper aesthetic) */}
      <div
        className={`w-[320px] bg-[#fafafa] text-slate-900 p-4 rounded-b-xl shadow-2xl border-x border-b border-slate-300 font-mono text-xs flex flex-col justify-between transition-all duration-300 ${
          isPrinting ? 'animate-thermal-print' : ''
        }`}
        style={{
          minHeight: '380px',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0,0,0,0.02)',
        }}
      >
        {/* Paper Top Jagged Cut / Header */}
        <div className="border-b-2 border-dashed border-slate-400 pb-2.5 text-center">
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <span>PRIME FITNESS BAR</span>
            <span>58mm ESC/POS</span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-950">
              #ORD-{orderNumber}
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              {timestamp}
            </span>
          </div>

          <div className="text-left mt-1 text-[11px] font-bold text-slate-800 truncate">
            CLIENTE: <span className="uppercase">{effectiveCustomerName}</span>
          </div>
        </div>

        {/* Product Core Info */}
        <div className="py-2.5 border-b border-slate-300">
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-black uppercase tracking-tight text-slate-950">
              {item.product.name}
            </h4>
          </div>

          {custom && (
            <div className="text-[11px] font-black text-emerald-800 mt-0.5 uppercase flex items-center gap-1">
              <span>FORMATO: {custom.size.label}</span>
              <span>({custom.size.volumeLabel})</span>
            </div>
          )}
        </div>

        {/* Recipe Checkbox Items for Blender Bar Operator */}
        <div className="py-2.5 space-y-1.5 flex-1 text-[11px]">
          <div className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
            VERIFICACIÓN DE INGREDIENTES:
          </div>

          {custom ? (
            <>
              {/* Liquid Base */}
              <div className="flex items-start gap-1.5 text-slate-900 font-semibold">
                <span className="w-3.5 h-3.5 rounded border border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>BASE: {custom.liquidBase.shortName} (250ml)</span>
              </div>

              {/* Protein Scoops */}
              <div className="flex items-start gap-1.5 text-slate-950 font-bold">
                <span className="w-3.5 h-3.5 rounded border border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>
                  PROT: {custom.proteinScoops}x SCOOP {custom.protein.flavor} ({custom.protein.type.toUpperCase()})
                </span>
              </div>

              {/* Extras & Functional Supplements */}
              {custom.extras.map((ex) => (
                <div key={ex.id} className="flex items-start gap-1.5 text-slate-900 font-medium">
                  <span className="w-3.5 h-3.5 rounded border border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span>SUPP: {ex.name}</span>
                </div>
              ))}

              {/* Special Note */}
              {custom.specialNotes && (
                <div className="mt-1.5 p-1.5 bg-amber-100 rounded border border-amber-300 text-[10px] font-black text-amber-950">
                  ⚠ NOTA: {custom.specialNotes}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-800 font-bold">
              [✓] 1x Porción estándar (Listo para consumo)
            </div>
          )}
        </div>

        {/* Nutritional Sticker Badge */}
        <div className="pt-2 border-t border-slate-300">
          <div className="bg-slate-900 text-white p-2 rounded-lg text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              TABLA NUTRICIONAL CERTIFICADA
            </div>
            <div className="text-sm font-black font-mono tracking-wide text-emerald-400 mt-0.5">
              {macros.calories} KCAL · {macros.protein}g PROT
            </div>
            <div className="text-[10px] font-mono text-slate-300 mt-0.5">
              {macros.carbs}g CARBS · {macros.fat}g GRASAS
            </div>
          </div>
        </div>

        {/* Simulated Thermal Barcode & QR Stamp */}
        <div className="pt-2 mt-2 border-t-2 border-dashed border-slate-400 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex flex-col text-left">
            <span className="font-bold tracking-widest font-mono">
              *PF-{orderNumber}-{Date.now().toString().slice(-4)}*
            </span>
            <span className="text-[9px]">BARRA PRINCIPAL #01</span>
          </div>
          <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Action: Simulate Printing */}
      {showPrintButton && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={handleSimulatePrint}
            disabled={isPrinting}
            className={`px-6 h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all active:scale-95 shadow-lg ${
              justPrinted
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isPrinting ? (
              <>
                <Printer className="w-4 h-4 animate-bounce text-emerald-400" />
                <span>Enviando a TM-L90 (ESC/POS)...</span>
              </>
            ) : justPrinted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>¡Etiqueta Impresa!</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Imprimir Etiqueta Adhesiva (58mm)</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-400">
            Simula el servicio IPC de impresión de etiquetas para vaso
          </span>
        </div>
      )}
    </div>
  );
};
