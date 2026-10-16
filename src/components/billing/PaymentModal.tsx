/**
 * @file PaymentModal.tsx
 * @description Modal interactivo de Liquidación y Procesamiento de Pago para el personal de caja.
 * Soporta:
 * - Efectivo: Teclado numérico táctil en pantalla, denominaciones rápidas y cálculo automático de cambio.
 * - Tarjeta: Datáfono EMV/NFC con ingreso o autogeneración de código de autorización.
 * - Cuenta de Socio: Descuento directo del monedero del gimnasio con validación de saldo.
 * - Cobro Mixto / Dividido: Pago fraccionado entre saldo de socio, efectivo y tarjeta.
 * - Selector táctil de propinas sugeridas (0%, 10%, 15%, 20%, libre).
 * - Integración de hardware: Apertura de cajón portamonedas e impresión de ticket térmico.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  UserCheck,
  Split as SplitIcon,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Delete,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import { useBillingStore } from '../../store/billingStore';
import { usePOSStore } from '../../store/posStore';
import type {
  BillingPaymentMethod,
  SplitPaymentDetail,
} from '../../types/billing';
import type { GymMember } from '../../types/pos.types';

export const PaymentModal: React.FC = () => {
  const isPaymentModalOpen = useBillingStore((s) => s.isPaymentModalOpen);
  const orderBeingPaid = useBillingStore((s) => s.orderBeingPaid);
  const closePaymentModal = useBillingStore((s) => s.closePaymentModal);
  const settlePayment = useBillingStore((s) => s.settlePayment);

  const allMembers = usePOSStore((s) => s.members);

  // Estados locales del pago
  const [method, setMethod] = useState<BillingPaymentMethod>('card');
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [isCustomTipActive, setIsCustomTipActive] = useState<boolean>(false);

  // Estado de Efectivo
  const [cashInput, setCashInput] = useState<string>('');

  // Estado de Tarjeta
  const [authCode, setAuthCode] = useState<string>('');

  // Estado de Socio
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  // Estado de Pago Mixto / Dividido
  const [splitMemberAmount, setSplitMemberAmount] = useState<number>(0);
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);
  const [splitCardAmount, setSplitCardAmount] = useState<number>(0);

  // Opciones de Hardware
  const [autoOpenDrawer, setAutoOpenDrawer] = useState<boolean>(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Inicializar estados cuando se abre el modal para una orden
  useEffect(() => {
    if (orderBeingPaid) {
      setMethod('card');
      setTipPercent(0);
      setCustomTipInput('');
      setIsCustomTipActive(false);
      setCashInput('');
      setAuthCode(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
      setSelectedMember(orderBeingPaid.member || null);
      setMemberSearchQuery('');
      setSplitMemberAmount(0);
      setSplitCashAmount(0);
      setSplitCardAmount(0);
      setIsProcessing(false);
    }
  }, [orderBeingPaid]);

  const baseOrderTotal = orderBeingPaid?.total ?? 0;

  // Cálculo de la propina
  const tipAmount = useMemo(() => {
    if (isCustomTipActive) {
      const parsed = parseFloat(customTipInput);
      return isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
    }
    if (tipPercent > 0) {
      return Math.round(baseOrderTotal * (tipPercent / 100) * 100) / 100;
    }
    return 0;
  }, [baseOrderTotal, tipPercent, isCustomTipActive, customTipInput]);

  // Total Final con propina
  const grandTotal = Math.round((baseOrderTotal + tipAmount) * 100) / 100;

  // Manejo de Efectivo
  const cashGiven = parseFloat(cashInput) || 0;
  const cashChange = Math.max(0, Math.round((cashGiven - grandTotal) * 100) / 100);
  const isCashSufficient = cashGiven >= grandTotal;

  // Denominaciones rápidas de billetes
  const quickCashPresets = [
    { label: 'Exacto', value: grandTotal },
    { label: '$20', value: 20 },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
  ];

  // Teclado Numérico táctil
  const handleKeypadPress = (val: string) => {
    if (val === 'DEL') {
      setCashInput((prev) => prev.slice(0, -1));
    } else if (val === 'CLEAR') {
      setCashInput('');
    } else if (val === '.') {
      if (!cashInput.includes('.')) {
        setCashInput((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      // Si ya hay 2 decimales, no permitir más
      const parts = cashInput.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      setCashInput((prev) => prev + val);
    }
  };

  // Filtrado de socios para búsqueda
  const filteredMembers = allMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberNumber.toLowerCase().includes(q) ||
      m.tier.toLowerCase().includes(q)
    );
  });

  // Cálculos de Pago Dividido
  const totalSplitCovered = Math.round((splitMemberAmount + splitCashAmount + splitCardAmount) * 100) / 100;
  const remainingSplit = Math.round((grandTotal - totalSplitCovered) * 100) / 100;
  const isSplitFullyCovered = Math.abs(grandTotal - totalSplitCovered) < 0.01;

  // Asignar restante en pago dividido
  const handleAutoFillSplit = (target: 'member' | 'cash' | 'card') => {
    const currentCoveredWithoutTarget =
      (target === 'member' ? 0 : splitMemberAmount) +
      (target === 'cash' ? 0 : splitCashAmount) +
      (target === 'card' ? 0 : splitCardAmount);

    const needed = Math.max(0, Math.round((grandTotal - currentCoveredWithoutTarget) * 100) / 100);

    if (target === 'member') {
      const maxPossible = selectedMember ? Math.min(needed, selectedMember.balance) : 0;
      setSplitMemberAmount(maxPossible);
    } else if (target === 'cash') {
      setSplitCashAmount(needed);
    } else if (target === 'card') {
      setSplitCardAmount(needed);
    }
  };

  // Validación para habilitar el botón de confirmar
  const canConfirmPayment = useMemo(() => {
    if (isProcessing) return false;

    if (method === 'card') {
      return true;
    }
    if (method === 'cash') {
      return isCashSufficient;
    }
    if (method === 'gym_account') {
      return !!selectedMember && selectedMember.balance >= grandTotal;
    }
    if (method === 'split') {
      if (!isSplitFullyCovered) return false;
      if (splitMemberAmount > 0) {
        if (!selectedMember || selectedMember.balance < splitMemberAmount) return false;
      }
      return true;
    }
    return false;
  }, [
    method,
    isProcessing,
    isCashSufficient,
    selectedMember,
    grandTotal,
    isSplitFullyCovered,
    splitMemberAmount,
  ]);

  // Enviar liquidación
  const handleExecutePayment = async () => {
    if (!canConfirmPayment || !orderBeingPaid) return;

    try {
      setIsProcessing(true);

      const splitsPayload: SplitPaymentDetail[] = [];
      if (method === 'split') {
        if (splitMemberAmount > 0 && selectedMember) {
          splitsPayload.push({
            method: 'gym_account',
            amount: splitMemberAmount,
            memberId: selectedMember.id,
          });
        }
        if (splitCashAmount > 0) {
          splitsPayload.push({
            method: 'cash',
            amount: splitCashAmount,
          });
        }
        if (splitCardAmount > 0) {
          splitsPayload.push({
            method: 'card',
            amount: splitCardAmount,
            reference: authCode || undefined,
          });
        }
      }

      await settlePayment({
        orderId: orderBeingPaid.id,
        method,
        tipAmount,
        cashReceived: method === 'cash' ? cashGiven : undefined,
        referenceCode: method === 'card' || method === 'split' ? authCode : undefined,
        splits: method === 'split' ? splitsPayload : undefined,
        selectedMember: selectedMember || undefined,
        openDrawer: autoOpenDrawer,
        printReceipt: autoPrintReceipt,
      });

      // El store se encarga de cerrar el modal y disparar toast
    } catch (err) {
      console.error('[PaymentModal] Error liquidando:', err);
      setIsProcessing(false);
    }
  };

  if (!isPaymentModalOpen || !orderBeingPaid) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20 max-h-[95vh]">
        {/* Header Modal */}
        <div className="h-18 px-6 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">
                  LIQUIDAR PEDIDO #{orderBeingPaid.orderNumber}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {orderBeingPaid.orderType === 'takeaway' ? '🛍️ Para Llevar' : '🥤 Consumo en Barra'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cliente: <span className="text-slate-200 font-semibold">{orderBeingPaid.customerName}</span> ·{' '}
                {orderBeingPaid.items.length} {orderBeingPaid.items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>

          <button
            onClick={closePaymentModal}
            disabled={isProcessing}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cuerpo del Modal con Doble Columna Táctil */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Columna Izquierda: Selector de Métodos y Formularios Dinámicos (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Selector de Método de Pago Principal */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                1. Selecciona Método de Cobro
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Botón Efectivo */}
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-1.5 min-h-[72px] justify-center ${
                    method === 'cash'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Banknote className="w-5 h-5" />
                    {method === 'cash' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Efectivo</span>
                    <span className="text-[10px] opacity-75">Cajón automático</span>
                  </div>
                </button>

                {/* Botón Tarjeta */}
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-1.5 min-h-[72px] justify-center ${
                    method === 'card'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5" />
                    {method === 'card' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Tarjeta / TPV</span>
                    <span className="text-[10px] opacity-75">Contactless / Chip</span>
                  </div>
                </button>

                {/* Botón Saldo Socio */}
                <button
                  type="button"
                  onClick={() => setMethod('gym_account')}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-1.5 min-h-[72px] justify-center ${
                    method === 'gym_account'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-5 h-5" />
                    {method === 'gym_account' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Cuenta Socio</span>
                    <span className="text-[10px] opacity-75">Monedero Gym</span>
                  </div>
                </button>

                {/* Botón Pago Mixto / Dividido */}
                <button
                  type="button"
                  onClick={() => {
                    setMethod('split');
                    // Pre-configurar valores sugeridos
                    if (selectedMember && selectedMember.balance > 0) {
                      const memberPortion = Math.min(grandTotal, selectedMember.balance);
                      setSplitMemberAmount(memberPortion);
                      setSplitCardAmount(Math.max(0, Math.round((grandTotal - memberPortion) * 100) / 100));
                    } else {
                      setSplitCashAmount(Math.floor(grandTotal / 2));
                      setSplitCardAmount(Math.round((grandTotal - Math.floor(grandTotal / 2)) * 100) / 100);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-1.5 min-h-[72px] justify-center ${
                    method === 'split'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <SplitIcon className="w-5 h-5" />
                    {method === 'split' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold block">Cobro Mixto</span>
                    <span className="text-[10px] opacity-75">Dividir cuenta</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Subpanel Dinámico de Efectivo (Teclado Táctil + Denominaciones) */}
            {method === 'cash' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    Cálculo de Efectivo y Vuelto
                  </span>
                  <span className="text-xs text-slate-400">Total: ${grandTotal.toFixed(2)}</span>
                </div>

                {/* Billetes rápidos */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {quickCashPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCashInput(preset.value.toFixed(2))}
                      className={`h-11 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 flex items-center justify-center ${
                        parseFloat(cashInput) === preset.value
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Input y Display de Monto Recibido */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6 relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
                      $
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={cashInput}
                      placeholder="0.00"
                      className="w-full h-14 pl-8 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-2xl font-black font-mono text-white text-right focus:outline-none"
                    />
                  </div>

                  {/* Panel de Vuelto / Faltante */}
                  <div
                    className={`sm:col-span-6 h-14 px-4 rounded-xl border flex items-center justify-between ${
                      isCashSufficient
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block">
                        {isCashSufficient ? 'Cambio / Vuelto' : 'Faltante'}
                      </span>
                      <span className="text-xs font-semibold">
                        {isCashSufficient ? 'Entregar al cliente' : 'Monto insuficiente'}
                      </span>
                    </div>
                    <span className="text-2xl font-black font-mono">
                      ${isCashSufficient ? cashChange.toFixed(2) : (grandTotal - cashGiven).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Teclado Numérico en Pantalla */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {['1', '2', '3', 'DEL', '4', '5', '6', 'CLEAR', '7', '8', '9', '00', '.', '0', '$50', '$100'].map(
                    (key) => {
                      const isSpecial = key === 'DEL' || key === 'CLEAR';
                      const isPreset = key.startsWith('$');
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            if (isPreset) {
                              setCashInput(key.replace('$', ''));
                            } else {
                              handleKeypadPress(key);
                            }
                          }}
                          className={`h-11 rounded-xl font-mono text-sm font-black transition-all active:scale-95 flex items-center justify-center border ${
                            isSpecial
                              ? 'bg-rose-950/30 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                              : isPreset
                              ? 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-900 text-slate-100 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {key === 'DEL' ? <Delete className="w-4 h-4" /> : key}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Subpanel Dinámico de Tarjeta / TPV */}
            {method === 'card' && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Terminal Bancaria Conectada</h4>
                    <p className="text-xs text-slate-400">
                      Acerca tarjeta o dispositivo móvil (Apple Pay / Google Wallet) al datáfono.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Protocolo EMV Contactless Seguro</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    TPV #01 ONLINE
                  </span>
                </div>

                {/* Código de Autorización */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Código de Autorización / Voucher TPV
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthCode(`AUTH-${Math.floor(100000 + Math.random() * 900000)}`)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Regenerar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Ej. AUTH-849201"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Subpanel Dinámico de Monedero de Socio */}
            {method === 'gym_account' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    Monedero Electrónico de Socio
                  </span>
                  <span className="text-xs text-slate-400">Total a debitar: ${grandTotal.toFixed(2)}</span>
                </div>

                {/* Buscador de Socio */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Buscar socio por nombre, código o locker..."
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Lista de socios táctil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredMembers.map((m) => {
                    const isSelected = selectedMember?.id === m.id;
                    const canAfford = m.balance >= grandTotal;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/30'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={m.avatar}
                            alt={m.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block leading-tight">{m.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {m.memberNumber} · {m.tier}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-mono font-black block ${
                              canAfford ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            ${m.balance.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-semibold">Saldo</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Banner de Validación de Saldo */}
                {selectedMember ? (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      selectedMember.balance >= grandTotal
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {selectedMember.balance >= grandTotal ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-black block">
                          {selectedMember.fullName} ({selectedMember.memberNumber})
                        </span>
                        <span className="text-[11px] opacity-80">
                          {selectedMember.balance >= grandTotal
                            ? `Saldo suficiente ($${selectedMember.balance.toFixed(2)}). Restarán $${(
                                selectedMember.balance - grandTotal
                              ).toFixed(2)} tras el cobro.`
                            : `Saldo insuficiente ($${selectedMember.balance.toFixed(2)}). Faltan $${(
                                grandTotal - selectedMember.balance
                              ).toFixed(2)} (Utiliza cobro dividido).`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                    Selecciona un socio para debitar la comanda de su monedero.
                  </div>
                )}
              </div>
            )}

            {/* Subpanel Dinámico de Cobro Mixto / Dividido */}
            {method === 'split' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                    <SplitIcon className="w-4 h-4 text-emerald-400" />
                    Distribución de Pago Fraccionado
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">Total: ${grandTotal.toFixed(2)}</span>
                </div>

                {/* Estado de Cobertura */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isSplitFullyCovered
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black block">
                      {isSplitFullyCovered ? 'Monto 100% Cubierto' : 'Distribución Incompleta'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {isSplitFullyCovered
                        ? 'La suma de las partes coincide exactamente con el total.'
                        : remainingSplit > 0
                        ? `Faltan $${remainingSplit.toFixed(2)} por asignar.`
                        : `Exceso de $${Math.abs(remainingSplit).toFixed(2)} asignado.`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Asignado</span>
                    <span className="text-xl font-black font-mono">${totalSplitCovered.toFixed(2)}</span>
                  </div>
                </div>

                {/* Porción 1: Saldo de Socio (si hay socio) */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      1. Saldo Socio {selectedMember ? `(${selectedMember.fullName})` : '(No seleccionado)'}
                    </span>
                    {selectedMember && (
                      <button
                        type="button"
                        onClick={() => handleAutoFillSplit('member')}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                      >
                        Asignar máx. saldo (${Math.min(grandTotal, selectedMember.balance).toFixed(2)})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={splitMemberAmount || ''}
                      onChange={(e) => setSplitMemberAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Porción 2: Efectivo */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      2. Efectivo
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAutoFillSplit('cash')}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      Pagar restante en Efectivo
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={splitCashAmount || ''}
                      onChange={(e) => setSplitCashAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Porción 3: Tarjeta */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      3. Tarjeta / TPV
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAutoFillSplit('card')}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      Pagar restante en Tarjeta
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={splitCardAmount || ''}
                      onChange={(e) => setSplitCardAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Propinas, Hardware & Resumen Financiero Final (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Panel de Propinas Sugeridas */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Propina para el Personal de Barra
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">+${tipAmount.toFixed(2)}</span>
              </div>

              {/* Botones de Porcentaje Táctil */}
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setIsCustomTipActive(false);
                      setTipPercent(pct);
                    }}
                    className={`h-11 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border flex flex-col items-center justify-center ${
                      !isCustomTipActive && tipPercent === pct
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{pct === 0 ? '0%' : `${pct}%`}</span>
                    {pct > 0 && (
                      <span className="text-[9px] opacity-80 font-mono">
                        ${((baseOrderTotal * pct) / 100).toFixed(1)}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCustomTipActive(true)}
                  className={`h-11 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 border flex items-center justify-center ${
                    isCustomTipActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Libre
                </button>
              </div>

              {/* Input de Propina Libre */}
              {isCustomTipActive && (
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={customTipInput}
                    onChange={(e) => setCustomTipInput(e.target.value)}
                    placeholder="Ingresa monto de propina libre..."
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-slate-900 border border-amber-500 text-white font-mono text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Opciones de Integración Hardware */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
              <span className="text-xs font-black uppercase text-slate-400 block mb-1">
                Periféricos & Disparo Local
              </span>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  Abrir cajón portamonedas (RJ11)
                </span>
                <input
                  type="checkbox"
                  checked={autoOpenDrawer}
                  onChange={(e) => setAutoOpenDrawer(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Emitir ticket de venta térmico (80mm)
                </span>
                <input
                  type="checkbox"
                  checked={autoPrintReceipt}
                  onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Resumen Final de Cobro */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col gap-3 shadow-inner">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Resumen de la Transacción
              </span>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal comanda:</span>
                  <span className="font-mono">${orderBeingPaid.subtotal.toFixed(2)}</span>
                </div>
                {orderBeingPaid.discount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Descuento aplicado:</span>
                    <span className="font-mono">-${orderBeingPaid.discount.toFixed(2)}</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Propina voluntaria:</span>
                    <span className="font-mono">+${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Impuestos (IVA Incluido):</span>
                  <span className="font-mono">$0.00</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                    TOTAL A LIQUIDAR
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Método:{' '}
                    {method === 'cash'
                      ? 'Efectivo'
                      : method === 'card'
                      ? 'Tarjeta'
                      : method === 'gym_account'
                      ? 'Saldo Socio'
                      : 'Mixto'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-emerald-400 font-bold text-lg">$</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white">
                    {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal: Botón Primario de Confirmación */}
        <div className="h-22 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={closePaymentModal}
            disabled={isProcessing}
            className="px-5 h-13 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all border border-slate-800 active:scale-95 disabled:opacity-40"
          >
            Cancelar / Regresar a Bandeja
          </button>

          <button
            id="btn-confirm-billing-settle"
            type="button"
            disabled={!canConfirmPayment}
            onClick={handleExecutePayment}
            className="px-8 h-14 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center gap-3 transition-all active:scale-[0.98] ring-2 ring-emerald-400/40"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>PROCESANDO HARDWARE & KDS...</span>
              </>
            ) : (
              <>
                <Receipt className="w-5 h-5 text-emerald-200" />
                <span>CONFIRMAR COBRO & ENVIAR AL KDS (${grandTotal.toFixed(2)})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
