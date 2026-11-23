/**
 * @file ClosureReceiptModal.tsx
 * @description Modal interactivo con previsualizador de papel térmico de 80mm para el Reporte de Corte
 * de Turno (Z-Report definitivo o X-Report de auditoría previa). Emula la salida física de impresora ESC/POS
 * con resumen financiero contable y la lista consolidada de productos vendidos en el día.
 */

import React from 'react';
import {
  X,
  Printer,
  FileCheck2,
  Lock,
} from 'lucide-react';
import type { CashClosureReport } from '../../types/closure';

interface ClosureReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CashClosureReport | null;
  onReprint?: (report: CashClosureReport) => void;
}

export const ClosureReceiptModal: React.FC<ClosureReceiptModalProps> = ({
  isOpen,
  onClose,
  report,
  onReprint,
}) => {
  if (!isOpen || !report) return null;

  const isZReport = report.reportType === 'Z_REPORT';
  const { summary, movements, storeInfo, soldProducts } = report;

  const handlePrint = () => {
    if (onReprint) {
      onReprint(report);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header de la Modal */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF6F0]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isZReport
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-[#4A6B3E]/10 text-[#4A6B3E] border-[#4A6B3E]/25'
              }`}
            >
              {isZReport ? <FileCheck2 className="w-6 h-6" /> : <Printer className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900 tracking-wide">
                  {isZReport ? 'Ticket de Corte Z (Cierre de Turno)' : 'Ticket de Auditoría X (Parcial)'}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase border ${
                    isZReport
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-[#4A6B3E]/10 text-[#4A6B3E] border-[#4A6B3E]/25'
                  }`}
                >
                  Turno #{report.shiftNumber}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {isZReport
                  ? 'Sesión finalizada y bloqueada en base de datos local (SQLite).'
                  : 'Auditoría en vivo de ventas sin bloqueo de sesión.'}
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

        {/* Contenido: Simulación de Papel Térmico de 80mm */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-[#FAF6F0]">
          <div className="w-full max-w-md bg-white text-stone-900 font-mono text-xs p-6 shadow-md rounded-sm border border-stone-200 border-t-4 border-b-4 border-t-[#4A6B3E] border-b-[#4A6B3E] animate-thermal-print relative selection:bg-stone-200">
            {/* Header del Ticket Térmico */}
            <div className="text-center pb-3 border-b border-dashed border-stone-400">
              <div className="text-base font-black tracking-wider text-black">{storeInfo.name}</div>
              <div className="text-[11px] text-stone-700">{storeInfo.address}</div>
              <div className="text-[11px] text-stone-700">Tel: {storeInfo.phone} · RFC: {storeInfo.taxId}</div>
              <div className="mt-2 text-xs font-black uppercase tracking-widest bg-stone-100 py-1 rounded">
                *** REPORTE DE {isZReport ? 'CORTE Z (CIERRE)' : 'AUDITORÍA X'} ***
              </div>
            </div>

            {/* Metadatos de la Sesión */}
            <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="font-bold">TURNO / SESIÓN:</span>
                <span className="font-bold font-sans">#{report.shiftNumber} ({report.terminalId})</span>
              </div>
              <div className="flex justify-between">
                <span>CAJERO(A):</span>
                <span className="font-semibold">{report.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>APERTURA:</span>
                <span>{report.openedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>{isZReport ? 'CIERRE:' : 'AUDITORÍA:'}</span>
                <span className="font-bold">{report.closedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>ÓRDENES COMPLETADAS:</span>
                <span className="font-bold">{summary.totalOrdersCount} transacciones</span>
              </div>
              <div className="flex justify-between">
                <span>TICKET PROMEDIO:</span>
                <span className="font-bold">${summary.averageTicket.toFixed(2)}</span>
              </div>
            </div>

            {/* Desglose de Ventas por Método de Pago */}
            <div className="py-2.5 border-b border-dashed border-stone-400">
              <div className="font-black text-[11px] mb-1.5 uppercase text-stone-900 tracking-wider">
                1. RESUMEN FINANCIERO POR MÉTODO DE PAGO
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Ventas Efectivo ({summary.paymentBreakdown.cashOrdersCount} ord):</span>
                  <span className="font-bold">${summary.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Tarjeta TPV ({summary.paymentBreakdown.cardOrdersCount} ord):</span>
                  <span className="font-bold">${summary.cardSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo Socio Gym ({summary.paymentBreakdown.gymAccountOrdersCount} ord):</span>
                  <span className="font-bold">${summary.memberAccountSales.toFixed(2)}</span>
                </div>
                <div className="pt-1 mt-1 border-t border-dotted border-stone-300 flex justify-between font-black text-sm">
                  <span>TOTAL VENTAS BRUTAS:</span>
                  <span>${summary.totalSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Conciliación de Efectivo y Balance Neto Teórico */}
            <div className="py-2.5 border-b border-dashed border-stone-400">
              <div className="font-black text-[11px] mb-1.5 uppercase text-stone-900 tracking-wider">
                2. CONCILIACIÓN & BALANCE DEL TURNO
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>(+) Fondo Inicial de Apertura:</span>
                  <span className="font-semibold">${summary.initialCashFloat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(+) Ventas Totales del Turno:</span>
                  <span className="font-semibold">${summary.totalSales.toFixed(2)}</span>
                </div>
                {summary.totalCashIn > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>(+) Entradas Extraordinarias:</span>
                    <span className="font-semibold">+${summary.totalCashIn.toFixed(2)}</span>
                  </div>
                )}
                {summary.totalCashDrop > 0 && (
                  <div className="flex justify-between text-red-700">
                    <span>(-) Retiros / Cash Drops:</span>
                    <span className="font-semibold">-${summary.totalCashDrop.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-1.5 mt-1 border-t border-stone-400 flex justify-between font-black text-xs bg-stone-100 p-1 rounded">
                  <span>(=) BALANCE NETO TEÓRICO:</span>
                  <span>${summary.netTheoreticalBalance.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-black text-xs bg-stone-200 p-1 rounded mt-1">
                  <span>(=) EFECTIVO TEÓRICO EN GAVETA:</span>
                  <span>${summary.expectedCash.toFixed(2)}</span>
                </div>
              </div>

              {report.observations && (
                <div className="mt-2 text-[10px] bg-stone-100 p-2 rounded border border-stone-300">
                  <span className="font-bold block">OBSERVACIONES:</span>
                  <p className="italic text-stone-800">{report.observations}</p>
                </div>
              )}
            </div>

            {/* Consolidado de Productos Vendidos en el Turno */}
            {soldProducts && soldProducts.length > 0 && (
              <div className="py-2.5 border-b border-dashed border-stone-400">
                <div className="font-black text-[11px] mb-1.5 uppercase text-stone-900 tracking-wider">
                  3. CONSOLIDADO DE PRODUCTOS VENDIDOS ({soldProducts.length} ítems)
                </div>
                <div className="space-y-1 text-[10px]">
                  {soldProducts.map((p) => (
                    <div key={p.productId} className="flex justify-between items-center py-0.5 border-b border-dotted border-stone-200">
                      <div className="truncate max-w-[200px]">
                        <span className="font-bold">{p.quantitySold}x</span> {p.productName}
                      </div>
                      <div className="font-semibold font-mono">${p.totalRevenue.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Movimientos Extraordinarios Registrados */}
            {movements.length > 0 && (
              <div className="py-2.5 border-b border-dashed border-stone-400">
                <div className="font-black text-[11px] mb-1.5 uppercase text-stone-900 tracking-wider">
                  4. MOVIMIENTOS EXTRAORDINARIOS ({movements.length})
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {movements.map((mov) => (
                    <div key={mov.id} className="border-b border-dotted border-stone-200 pb-1">
                      <div className="flex justify-between font-bold">
                        <span>
                          {mov.type === 'cash_drop' ? '[-] RETIRO' : '[+] ENTRADA'}: ${mov.amount.toFixed(2)}
                        </span>
                        <span className="text-stone-600">{mov.timestamp}</span>
                      </div>
                      <div className="text-stone-700 truncate">{mov.reason}</div>
                      <div className="text-stone-500 text-[9px]">Aut: {mov.authorizedBy}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Firmas de Conformidad */}
            <div className="pt-6 pb-2 grid grid-cols-2 gap-4 text-center text-[10px]">
              <div>
                <div className="border-t border-stone-500 pt-1 font-bold">Firma Cajero</div>
                <div className="text-stone-600 text-[9px]">{report.cashierName}</div>
              </div>
              <div>
                <div className="border-t border-stone-500 pt-1 font-bold">Firma Supervisor</div>
                <div className="text-stone-600 text-[9px]">Auditoría / Gerencia</div>
              </div>
            </div>

            {/* Pie de Ticket ESC/POS */}
            <div className="text-center pt-3 text-[9px] text-stone-500 border-t border-dashed border-stone-300">
              <div>SISTEMA PRIME FITNESS POS v2.0</div>
              <div>REGISTRO SQLITE ID: {report.sqliteRecordId || 'N/A'}</div>
              <div>*** FIN DEL REPORTE ***</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 bg-[#FAF6F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Lock className="w-4 h-4 text-[#4A6B3E]" />
            <span>Turno auditado y registrado en la base de datos local</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-5 rounded-xl bg-[#4A6B3E] hover:bg-[#3d5933] text-white font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket Térmico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
