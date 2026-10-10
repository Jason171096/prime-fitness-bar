import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { usePOSStore } from '../../store/posStore';
import type { GymMember, PaymentMethod } from '../../types/pos.types';

export const CheckoutModal: React.FC = () => {
  const isCheckoutOpen = usePOSStore((s) => s.isCheckoutOpen);
  const closeCheckout = usePOSStore((s) => s.closeCheckout);
  const cart = usePOSStore((s) => s.cart);
  const members = usePOSStore((s) => s.members);
  const selectedMember = usePOSStore((s) => s.selectedMember);
  const setSelectedMember = usePOSStore((s) => s.setSelectedMember);
  const completePayment = usePOSStore((s) => s.completePayment);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  if (!isCheckoutOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.finalPrice, 0);

  // Cash quick presets
  const cashPresets = [
    { label: 'Exacto', value: Math.ceil(total) },
    { label: '$10', value: 10 },
    { label: '$20', value: 20 },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
  ];

  const cashChange = Math.max(0, cashAmount - total);
  const isCashSufficient = cashAmount >= total;

  // Member search filter
  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.memberNumber.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const canConfirmPayment =
    paymentMethod === 'card' ||
    (paymentMethod === 'cash' && isCashSufficient) ||
    (paymentMethod === 'gym_account' &&
      selectedMember &&
      selectedMember.balance >= total);

  const handleConfirm = () => {
    if (!canConfirmPayment) return;
    completePayment(paymentMethod, paymentMethod === 'cash' ? cashAmount : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20 max-h-[92vh]">
        {/* Modal Top */}
        <div className="h-16 px-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Terminal de Cobro Rápido
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona la forma de pago para cerrar la comanda
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Total Amount Big Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                Total a Pagar
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {cart.length} ítems en orden
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-emerald-400 font-sans font-bold text-lg">$</span>
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs (Touch 54px height) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Card */}
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] ${
                paymentMethod === 'card'
                  ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'card'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`font-black text-sm block ${
                    paymentMethod === 'card' ? 'text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  Tarjeta / Contactless
                </span>
                <span className="text-[11px] text-slate-400">Datáfono inalámbrico</span>
              </div>
            </button>

            {/* Cash */}
            <button
              onClick={() => {
                setPaymentMethod('cash');
                if (cashAmount === 0) setCashAmount(Math.ceil(total));
              }}
              className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`font-black text-sm block ${
                    paymentMethod === 'cash' ? 'text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  Efectivo (Cash)
                </span>
                <span className="text-[11px] text-slate-400">Calculadora de cambio</span>
              </div>
            </button>

            {/* Member Account */}
            <button
              onClick={() => setPaymentMethod('gym_account')}
              className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] ${
                paymentMethod === 'gym_account'
                  ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  paymentMethod === 'gym_account'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`font-black text-sm block ${
                    paymentMethod === 'gym_account' ? 'text-emerald-300' : 'text-slate-200'
                  }`}
                >
                  Cuenta Socio Gym
                </span>
                <span className="text-[11px] text-slate-400">Descuento de saldo</span>
              </div>
            </button>
          </div>

          {/* DYNAMIC SUBPANEL DEPENDING ON SELECTED PAYMENT METHOD */}
          {paymentMethod === 'card' && (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
                <CreditCard className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">
                  Datáfono Listo para Cobro
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Acerca la tarjeta o teléfono móvil del cliente al lector NFC de la barra.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Protocolo EMV Contactless Seguro · Terminal #01</span>
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
                  Efectivo Recibido
                </label>

                {/* Cash Quick Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {cashPresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setCashAmount(preset.value)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs font-mono transition-all active:scale-95 border ${
                        cashAmount === preset.value
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Monto entregado..."
                    className="w-full h-13 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-black text-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Change / Vuelto Calculation Panel */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isCashSufficient
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    {isCashSufficient ? 'Cambio / Vuelto a Devolver' : 'Monto Insuficiente'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isCashSufficient
                      ? 'Entrega el cambio al cliente'
                      : `Faltan $${(total - cashAmount).toFixed(2)}`}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-2xl font-black font-mono ${
                      isCashSufficient ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${cashChange.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'gym_account' && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Buscar Socio del Gimnasio
                </label>
                <span className="text-xs text-slate-400">
                  {members.length} socios registrados en base de datos
                </span>
              </div>

              {/* Member Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o ID (ej: Carlos, PF-1042)..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Members Touch List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredMembers.map((member: GymMember) => {
                  const isSelected = selectedMember?.id === member.id;
                  const hasSufficientBalance = member.balance >= total;

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white leading-tight">
                              {member.fullName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {member.memberNumber} · {member.tier}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-black font-mono block ${
                            hasSufficientBalance ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          ${member.balance.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Saldo
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Member Selection Status Banner */}
              {selectedMember && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    selectedMember.balance >= total
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMember.balance >= total ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {selectedMember.balance >= total
                          ? `Saldo suficiente: $${selectedMember.balance.toFixed(2)} disponible`
                          : `Saldo insuficiente: Faltan $${(total - selectedMember.balance).toFixed(2)}`}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {selectedMember.balance >= total
                          ? `Se descontarán $${total.toFixed(2)} y restarán $${(selectedMember.balance - total).toFixed(2)}`
                          : 'El socio debe recargar saldo en recepción'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom: Confirm Action */}
        <div className="h-20 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={closeCheckout}
            className="px-5 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all border border-slate-800"
          >
            Regresar al Carrito
          </button>

          <button
            id="btn-confirm-payment"
            disabled={!canConfirmPayment}
            onClick={handleConfirm}
            className="px-8 h-13 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 hover:from-emerald-500 hover:to-lime-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-3 transition-all active:scale-95 ring-2 ring-emerald-400/40"
          >
            <Receipt className="w-5 h-5" />
            <span>CONFIRMAR PAGO & ENVIAR AL KDS (${total.toFixed(2)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
