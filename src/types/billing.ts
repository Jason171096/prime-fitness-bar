/**
 * @file billing.ts
 * @description Definición de tipos e interfaces para el Módulo de Facturación y Cobro (Caja POS)
 * de PrimeFitness Bar.
 */

import type { CartItem, GymMember } from './pos.types';

export type BillingOrderStatus = 'pending_payment' | 'paid' | 'cancelled';

export type OrderSource = 'pos_counter' | 'kiosk' | 'presale' | 'mobile_app';

export type OrderServiceType = 'takeaway' | 'dine_in';

export type BillingPaymentMethod = 'cash' | 'card' | 'gym_account' | 'split';

export type WaitTimeUrgency = 'normal' | 'warning' | 'urgent';

/**
 * Desglose de un pago parcial en modalidad dividida/mixta
 */
export interface SplitPaymentDetail {
  method: 'cash' | 'card' | 'gym_account';
  amount: number;
  reference?: string;
  memberId?: string;
  cashReceived?: number;
  cashChange?: number;
}

/**
 * Registro contable de la transacción de cobro
 */
export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: number;
  paymentMethod: BillingPaymentMethod;
  subtotal: number;
  discount: number;
  tipAmount: number;
  totalAmount: number; // subtotal - discount + tipAmount
  cashReceived?: number;
  cashChange?: number;
  referenceCode?: string; // Código de autorización / voucher del TPV bancario
  splits?: SplitPaymentDetail[];
  memberId?: string;
  memberBalanceBefore?: number;
  memberBalanceAfter?: number;
  timestamp: string;
  cashierName: string;
}

/**
 * Estructura de comanda pendiente o liquidada en el Módulo de Cobro
 */
export interface BillingOrder {
  id: string;
  orderNumber: number;
  source: OrderSource;
  orderType: OrderServiceType;
  customerName: string;
  member?: GymMember;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  tipAmount: number;
  total: number;
  status: BillingOrderStatus;
  createdAt: string;
  timestamp: number; // Timestamp en milisegundos para cálculo en tiempo real
  notes?: string;
  cashierName: string;
  transaction?: PaymentTransaction;
}

/**
 * Carga de datos requerida para procesar y liquidar un cobro
 */
export interface PaymentSettlementPayload {
  orderId: string;
  method: BillingPaymentMethod;
  tipAmount: number;
  cashReceived?: number;
  referenceCode?: string;
  splits?: SplitPaymentDetail[];
  selectedMember?: GymMember | null;
  openDrawer?: boolean;
  printReceipt?: boolean;
}

/**
 * Filtros de la bandeja de pedidos de cobro
 */
export interface BillingFilterState {
  searchQuery: string;
  typeFilter: 'all' | 'takeaway' | 'dine_in';
  urgencyFilter: 'all' | 'urgent' | 'warning';
  sourceFilter: 'all' | OrderSource;
}
