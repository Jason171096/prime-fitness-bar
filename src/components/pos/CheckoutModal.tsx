import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  User,
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
  const orderCustomerName = usePOSStore((s) => s.orderCustomerName);
  const setOrderCustomerName = usePOSStore((s) => s.setOrderCustomerName);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        {/* Sticky Modal Top */}
        <header className="sticky top-0 z-10 min-h-16 px-4 md:px-6 py-3 bg-[#FAF6F0] border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/20 text-[#4A6B3E] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-black text-stone-900 tracking-tight truncate">
                Terminal de Cobro Rápido
              </h2>
              <p className="text-xs text-stone-500 truncate">
                Selecciona la forma de pago para cerrar la comanda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Cerrar terminal de cobro"
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Modal Body */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto overscroll-contain-y space-y-5 bg-white">
          {/* Total Amount Big Bar */}
          <div className="p-4 md:p-5 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500 block">
                Total a Pagar
              </span>
              <span className="text-xs text-[#4A6B3E] font-semibold">
                {cart.length} {cart.length === 1 ? 'ítem en orden' : 'ítems en orden'}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[#4A6B3E] font-sans font-bold text-lg">$</span>
              <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-stone-900">
                {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Tabs (Touch >= 64px height) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-md'
                  : 'bg-[#FAF6F0] text-stone-700 border-stone-200 hover:bg-stone-200/70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  paymentMethod === 'card'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#4A6B3E] border border-stone-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span
                  className={`font-black text-sm block leading-tight ${
                    paymentMethod === 'card' ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  Tarjeta / Contactless
                </span>
                <span
                  className={`text-[11px] block truncate ${
                    paymentMethod === 'card' ? 'text-white/85' : 'text-stone-500'
                  }`}
                >
                  Datáfono inalámbrico
                </span>
              </div>
            </button>

            {/* Cash */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('cash');
                if (cashAmount === 0) setCashAmount(Math.ceil(total));
              }}
              className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-md'
                  : 'bg-[#FAF6F0] text-stone-700 border-stone-200 hover:bg-stone-200/70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  paymentMethod === 'cash'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#4A6B3E] border border-stone-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span
                  className={`font-black text-sm block leading-tight ${
                    paymentMethod === 'cash' ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  Efectivo (Cash)
                </span>
                <span
                  className={`text-[11px] block truncate ${
                    paymentMethod === 'cash' ? 'text-white/85' : 'text-stone-500'
                  }`}
                >
                  Calculadora de cambio
                </span>
              </div>
            </button>

            {/* Member Account */}
            <button
              type="button"
              onClick={() => setPaymentMethod('gym_account')}
              className={`p-3.5 md:p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-3 min-h-[64px] cursor-pointer ${
                paymentMethod === 'gym_account'
                  ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-md'
                  : 'bg-[#FAF6F0] text-stone-700 border-stone-200 hover:bg-stone-200/70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  paymentMethod === 'gym_account'
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#4A6B3E] border border-stone-200'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span
                  className={`font-black text-sm block leading-tight ${
                    paymentMethod === 'gym_account' ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  Cuenta Socio Gym
                </span>
                <span
                  className={`text-[11px] block truncate ${
                    paymentMethod === 'gym_account' ? 'text-white/85' : 'text-stone-500'
                  }`}
                >
                  Descuento de saldo
                </span>
              </div>
            </button>
          </div>

          {/* DYNAMIC SUBPANEL DEPENDING ON SELECTED PAYMENT METHOD */}
          {paymentMethod === 'card' && (
            <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-stone-200 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#4A6B3E]/10 border border-[#4A6B3E]/25 text-[#4A6B3E] flex items-center justify-center animate-pulse">
                <CreditCard className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-stone-900">
                  Datáfono Listo para Cobro
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Acerca la tarjeta o teléfono móvil del cliente al lector NFC de la barra.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-700 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#4A6B3E]" />
                <span>Protocolo EMV Contactless Seguro · Terminal #01</span>
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="p-4 md:p-5 rounded-2xl bg-[#FAF6F0] border border-stone-200 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block mb-2.5">
                  Efectivo Recibido
                </label>

                {/* Cash Quick Presets (min 48px touch targets) */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {cashPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCashAmount(preset.value)}
                      className={`px-4 min-h-[48px] min-w-[48px] rounded-xl font-bold text-xs font-mono transition-all active:scale-95 border cursor-pointer ${
                        cashAmount === preset.value
                          ? 'bg-[#4A6B3E] text-white border-[#4A6B3E] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold font-mono text-base">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Monto entregado..."
                    className="w-full h-13 pl-9 pr-4 rounded-xl bg-white border border-stone-300 text-stone-900 font-mono font-black text-xl focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20"
                  />
                </div>
              </div>

              {/* Change / Vuelto Calculation Panel */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isCashSufficient
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {isCashSufficient ? 'Cambio / Vuelto a Devolver' : 'Monto Insuficiente'}
                  </span>
                  <span className="text-xs opacity-85">
                    {isCashSufficient
                      ? 'Entrega el cambio al cliente'
                      : `Faltan $${(total - cashAmount).toFixed(2)}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black font-mono">
                    ${cashChange.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'gym_account' && (
            <div className="p-4 md:p-5 rounded-2xl bg-[#FAF6F0] border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700">
                  Buscar Socio del Gimnasio
                </label>
                <span className="text-xs text-stone-500">
                  {members.length} socios registrados
                </span>
              </div>

              {/* Member Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o ID (ej: Carlos, PF-1042)..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20 font-medium"
                />
              </div>

              {/* Members Touch List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto overscroll-contain-y pr-1">
                {filteredMembers.map((member: GymMember) => {
                  const isSelected = selectedMember?.id === member.id;
                  const hasSufficientBalance = member.balance >= total;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between min-h-[64px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#4A6B3E]/10 border-2 border-[#4A6B3E] shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-stone-900 leading-tight block truncate">
                            {member.fullName}
                          </span>
                          <span className="text-[10px] text-stone-500 block font-mono truncate">
                            {member.memberNumber} · {member.tier}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={`text-xs font-black font-mono block ${
                            hasSufficientBalance ? 'text-emerald-700' : 'text-amber-800'
                          }`}
                        >
                          ${member.balance.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold">
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
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMember.balance >= total ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {selectedMember.balance >= total
                          ? `Saldo suficiente: $${selectedMember.balance.toFixed(2)} disponible`
                          : `Saldo insuficiente: Faltan $${(total - selectedMember.balance).toFixed(2)}`}
                      </span>
                      <span className="text-[11px] opacity-85">
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

        {/* Sticky Modal Bottom: Customer Name + Confirm Action */}
        <footer className="sticky bottom-0 z-10 px-4 md:px-6 py-3.5 bg-[#FAF6F0] border-t border-stone-200 shrink-0 space-y-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          {/* Customer Identifier Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-stone-700 font-bold flex items-center gap-1.5 shrink-0">
              <User className="w-4 h-4 text-[#4A6B3E]" />
              Cliente:
            </span>
            {selectedMember ? (
              <span className="font-extrabold text-stone-900 flex items-center gap-2 truncate">
                {selectedMember.fullName}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A6B3E]/10 text-[#4A6B3E] border border-[#4A6B3E]/20 font-bold shrink-0">
                  {selectedMember.memberNumber}
                </span>
              </span>
            ) : (
              <input
                type="text"
                value={orderCustomerName}
                onChange={(e) => setOrderCustomerName(e.target.value)}
                placeholder="Nombre del cliente (ej. Carlos, Valeria)..."
                className="flex-1 h-12 px-3.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#4A6B3E] focus:ring-2 focus:ring-[#4A6B3E]/20 font-semibold"
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeCheckout}
              className="px-4 md:px-5 min-h-[52px] rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-bold transition-all border border-stone-200 active:scale-95 shrink-0 cursor-pointer"
            >
              Regresar al Carrito
            </button>

            <button
              id="btn-confirm-payment"
              type="button"
              disabled={!canConfirmPayment}
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial px-6 md:px-8 min-h-[52px] rounded-2xl bg-[#4A6B3E] hover:bg-[#3d5933] disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
            >
              <Receipt className="w-5 h-5 shrink-0" />
              <span>CONFIRMAR PAGO (${total.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
