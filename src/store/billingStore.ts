/**
 * @file billingStore.ts
 * @description Store de Zustand para la gestión reactiva de comandas pendientes de cobro,
 * filtros táctiles, modal de checkout y despacho hacia hardware nativo y KDS.
 */

import { create } from 'zustand';
import type {
  BillingOrder,
  BillingOrderStatus,
  OrderSource,
  OrderServiceType,
  PaymentSettlementPayload,
  PaymentTransaction,
  WaitTimeUrgency,
  BillingFilterState,
} from '../types/billing';
import type { CartItem, GymMember, Order } from '../types/pos.types';
import type { ReceiptDataPayload } from '../types/electron';
import { INITIAL_BILLING_ORDERS } from '../data/mockBillingOrders';
import { useKDSStore } from './kdsStore';
import { useInventoryStore } from './inventoryStore';
import { usePOSStore } from './posStore';

interface CreatePendingOrderParams {
  items: CartItem[];
  customerName: string;
  member?: GymMember;
  orderType: OrderServiceType;
  source?: OrderSource;
  notes?: string;
  discount?: number;
}

interface BillingStoreState extends BillingFilterState {
  orders: BillingOrder[];
  selectedOrderId: string | null;
  isPaymentModalOpen: boolean;
  orderBeingPaid: BillingOrder | null;
  currentTime: number; // Para cálculo en vivo del tiempo de espera

  // Setters de filtros y selección
  setSelectedOrderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: 'all' | 'takeaway' | 'dine_in') => void;
  setUrgencyFilter: (filter: 'all' | 'urgent' | 'warning') => void;
  setSourceFilter: (filter: 'all' | OrderSource) => void;
  resetFilters: () => void;

  // Modales
  openPaymentModal: (orderId?: string) => void;
  closePaymentModal: () => void;

  // Operaciones de Comandas
  cancelOrder: (orderId: string, reason?: string) => void;
  createPendingOrder: (params: CreatePendingOrderParams) => BillingOrder;
  settlePayment: (payload: PaymentSettlementPayload) => Promise<PaymentTransaction | null>;

  // Cálculo de tiempo y urgencia
  tickCurrentTime: () => void;
  getOrderElapsedSeconds: (order: BillingOrder) => number;
  getOrderUrgency: (order: BillingOrder) => WaitTimeUrgency;
  getSelectedOrder: () => BillingOrder | null;
  getPendingOrders: () => BillingOrder[];
}

export const useBillingStore = create<BillingStoreState>((set, get) => ({
  orders: INITIAL_BILLING_ORDERS,
  selectedOrderId: INITIAL_BILLING_ORDERS[0]?.id || null,
  isPaymentModalOpen: false,
  orderBeingPaid: null,
  currentTime: Date.now(),

  // Filtros
  searchQuery: '',
  typeFilter: 'all',
  urgencyFilter: 'all',
  sourceFilter: 'all',

  setSelectedOrderId: (id) => set({ selectedOrderId: id }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setTypeFilter: (typeFilter) => set({ typeFilter }),

  setUrgencyFilter: (urgencyFilter) => set({ urgencyFilter }),

  setSourceFilter: (sourceFilter) => set({ sourceFilter }),

  resetFilters: () =>
    set({
      searchQuery: '',
      typeFilter: 'all',
      urgencyFilter: 'all',
      sourceFilter: 'all',
    }),

  openPaymentModal: (orderId) => {
    const targetId = orderId || get().selectedOrderId;
    const targetOrder = get().orders.find((o) => o.id === targetId && o.status === 'pending_payment');
    if (targetOrder) {
      set({
        isPaymentModalOpen: true,
        orderBeingPaid: targetOrder,
        selectedOrderId: targetOrder.id,
      });
    }
  },

  closePaymentModal: () => {
    set({ isPaymentModalOpen: false, orderBeingPaid: null });
  },

  tickCurrentTime: () => {
    set({ currentTime: Date.now() });
  },

  getOrderElapsedSeconds: (order: BillingOrder) => {
    const now = get().currentTime;
    return Math.max(0, Math.floor((now - order.timestamp) / 1000));
  },

  getOrderUrgency: (order: BillingOrder): WaitTimeUrgency => {
    const elapsed = get().getOrderElapsedSeconds(order);
    if (elapsed >= 420) return 'urgent'; // > 7 min
    if (elapsed >= 180) return 'warning'; // 3 - 7 min
    return 'normal'; // < 3 min
  },

  getSelectedOrder: () => {
    const { orders, selectedOrderId } = get();
    return orders.find((o) => o.id === selectedOrderId) || null;
  },

  getPendingOrders: () => {
    return get().orders.filter((o) => o.status === 'pending_payment');
  },

  cancelOrder: (orderId: string, reason?: string) => {
    set((state) => {
      const updated = state.orders.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'cancelled' as BillingOrderStatus,
            notes: reason ? `${ord.notes ? ord.notes + ' · ' : ''}Cancelado: ${reason}` : ord.notes,
          };
        }
        return ord;
      });

      // Si la cancelada era la seleccionada, mover selección a la siguiente pendiente
      const remainingPending = updated.filter((o) => o.status === 'pending_payment');
      const nextSelected = remainingPending.length > 0 ? remainingPending[0].id : null;

      return {
        orders: updated,
        selectedOrderId: nextSelected,
        isPaymentModalOpen: false,
        orderBeingPaid: null,
      };
    });

    usePOSStore.getState().showToast(`Comanda cancelada`, 'info');
  },

  createPendingOrder: (params: CreatePendingOrderParams): BillingOrder => {
    const counter = usePOSStore.getState().currentOrderNumberCounter;
    const now = Date.now();
    const createdAtStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const subtotal = params.items.reduce((acc, item) => acc + item.finalPrice, 0);
    const discount = params.discount || 0;
    const tax = 0;
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    const newOrder: BillingOrder = {
      id: `bill-ord-${Date.now()}`,
      orderNumber: counter,
      source: params.source || 'pos_counter',
      orderType: params.orderType,
      customerName: params.customerName.trim() || (params.member ? params.member.fullName : 'Cliente Barra'),
      member: params.member,
      items: [...params.items],
      subtotal,
      discount,
      tax,
      tipAmount: 0,
      total,
      status: 'pending_payment',
      createdAt: createdAtStr,
      timestamp: now,
      notes: params.notes,
      cashierName: usePOSStore.getState().cashierName,
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      selectedOrderId: newOrder.id,
    }));

    // Incrementar contador de órdenes globales
    usePOSStore.setState((s) => ({
      currentOrderNumberCounter: s.currentOrderNumberCounter + 1,
    }));

    usePOSStore.getState().showToast(`Comanda #${counter} enviada a Caja para cobro`, 'success');
    return newOrder;
  },

  settlePayment: async (payload: PaymentSettlementPayload): Promise<PaymentTransaction | null> => {
    const { orders } = get();
    const targetOrder = orders.find((o) => o.id === payload.orderId);

    if (!targetOrder || targetOrder.status !== 'pending_payment') {
      usePOSStore.getState().showToast('Error: La comanda no se encuentra pendiente de cobro', 'error');
      return null;
    }

    const posStore = usePOSStore.getState();
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const totalWithTip = Math.round((targetOrder.total + payload.tipAmount) * 100) / 100;

    let cashChange: number | undefined = undefined;
    if (payload.method === 'cash' && payload.cashReceived !== undefined) {
      cashChange = Math.max(0, Math.round((payload.cashReceived - totalWithTip) * 100) / 100);
    }

    // Gestionar deducción de monedero de socio si aplica
    let memberBalanceBefore: number | undefined;
    let memberBalanceAfter: number | undefined;
    const linkedMember = payload.selectedMember || targetOrder.member;

    if (linkedMember) {
      const currentMember = posStore.members.find((m) => m.id === linkedMember.id) || linkedMember;
      memberBalanceBefore = currentMember.balance;

      let amountToDeductFromMember = 0;
      if (payload.method === 'gym_account') {
        amountToDeductFromMember = totalWithTip;
      } else if (payload.method === 'split' && payload.splits) {
        const memberSplit = payload.splits.find((s) => s.method === 'gym_account');
        if (memberSplit) {
          amountToDeductFromMember = memberSplit.amount;
        }
      }

      if (amountToDeductFromMember > 0) {
        if (currentMember.balance < amountToDeductFromMember) {
          posStore.showToast(
            `Saldo insuficiente del socio (${currentMember.balance.toFixed(2)}€ disponible)`,
            'error'
          );
          return null;
        }

        memberBalanceAfter = Math.round((currentMember.balance - amountToDeductFromMember) * 100) / 100;

        // Actualizar en la lista de socios
        usePOSStore.setState((state) => ({
          members: state.members.map((m) =>
            m.id === linkedMember.id ? { ...m, balance: memberBalanceAfter! } : m
          ),
        }));
      }
    }

    // Crear la transacción de cobro
    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      paymentMethod: payload.method,
      subtotal: targetOrder.subtotal,
      discount: targetOrder.discount,
      tipAmount: payload.tipAmount,
      totalAmount: totalWithTip,
      cashReceived: payload.cashReceived,
      cashChange,
      referenceCode: payload.referenceCode,
      splits: payload.splits,
      memberId: linkedMember?.id,
      memberBalanceBefore,
      memberBalanceAfter,
      timestamp: timestampStr,
      cashierName: targetOrder.cashierName || posStore.cashierName,
    };

    // Actualizar estado de comanda a 'paid'
    const updatedOrder: BillingOrder = {
      ...targetOrder,
      status: 'paid',
      tipAmount: payload.tipAmount,
      total: totalWithTip,
      member: linkedMember || targetOrder.member,
      transaction,
    };

    set((state) => {
      const updatedOrders = state.orders.map((o) => (o.id === targetOrder.id ? updatedOrder : o));
      const remainingPending = updatedOrders.filter((o) => o.status === 'pending_payment');
      const nextSelected = remainingPending.length > 0 ? remainingPending[0].id : null;

      return {
        orders: updatedOrders,
        selectedOrderId: nextSelected,
        isPaymentModalOpen: false,
        orderBeingPaid: null,
      };
    });

    // 1. Deducir stock en inventario de ingredientes
    const posOrderBridge: Order = {
      id: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      createdAt: targetOrder.createdAt,
      customerName: targetOrder.customerName,
      member: linkedMember || targetOrder.member,
      items: targetOrder.items,
      subtotal: targetOrder.subtotal,
      tax: targetOrder.tax,
      total: totalWithTip,
      paymentMethod: payload.method === 'split' ? 'card' : payload.method,
      cashReceived: payload.cashReceived,
      cashChange,
      status: 'pending',
      cashierName: targetOrder.cashierName,
      labelPrinted: false,
      startTimeStamp: Date.now(),
    };

    useInventoryStore.getState().deductStockForOrder(posOrderBridge);

    // 2. Despachar comanda liquidada al KDS de licuadoras / preparación
    useKDSStore.getState().addOrderToKDS(posOrderBridge);

    // 3. Integración con Hardware Físico Local (Electron IPC)
    const isCashInvolved =
      payload.method === 'cash' ||
      (payload.method === 'split' && payload.splits?.some((s) => s.method === 'cash'));

    const shouldOpenDrawer = payload.openDrawer !== false && isCashInvolved;
    const shouldPrintReceipt = payload.printReceipt !== false;

    // A) Apertura de Cajón portamonedas
    if (shouldOpenDrawer) {
      if (typeof window !== 'undefined' && window.posHardware?.openCashDrawer) {
        try {
          await window.posHardware.openCashDrawer();
          console.info('[Hardware IPC] Cajón de dinero abierto vía ESC/POS.');
        } catch (err) {
          console.error('[Hardware IPC] Error abriendo cajón:', err);
        }
      } else {
        console.info('[Hardware SIMULATOR] Cajón de dinero abierto (Navegador).');
      }
    }

    // B) Impresión silenciosa del ticket de venta térmico
    if (shouldPrintReceipt) {
      const receiptItems = targetOrder.items.map((item) => {
        let customizationNotes = '';
        if (item.customization) {
          const parts = [
            item.customization.size?.label,
            item.customization.protein?.name
              ? `${item.customization.protein.flavor} (${item.customization.proteinScoops}sc)`
              : null,
            item.customization.liquidBase?.name,
            item.customization.extras?.map((e) => e.name).join(', '),
          ].filter(Boolean);
          customizationNotes = parts.join(' · ');
        }
        return {
          name: item.product.name,
          quantity: item.quantity,
          price: item.finalPrice,
          customizationSummary: customizationNotes || undefined,
        };
      });

      const receiptPayload: ReceiptDataPayload = {
        orderNumber: targetOrder.orderNumber,
        date: `${now.toLocaleDateString()} ${timestampStr}`,
        cashierName: targetOrder.cashierName,
        customerName: targetOrder.customerName,
        storeName: 'PRIME FITNESS BAR',
        storeAddress: 'Área Fitness Center · Nivel 1',
        storePhone: '+34 912 345 678',
        items: receiptItems,
        subtotal: targetOrder.subtotal,
        tax: targetOrder.tax,
        total: totalWithTip,
        paymentMethod:
          payload.method === 'cash'
            ? 'Efectivo'
            : payload.method === 'card'
            ? 'Tarjeta Bancaria'
            : payload.method === 'gym_account'
            ? 'Saldo Socio Gym'
            : 'Cobro Mixto / Dividido',
        cashReceived: payload.cashReceived,
        cashChange,
      };

      if (typeof window !== 'undefined' && window.posHardware?.printReceipt) {
        try {
          await window.posHardware.printReceipt(receiptPayload);
          console.info('[Hardware IPC] Ticket impreso correctamente.');
        } catch (err) {
          console.error('[Hardware IPC] Error imprimiendo ticket:', err);
        }
      } else {
        console.info('[Hardware SIMULATOR] Ticket térmico emitido:', receiptPayload);
      }
    }

    // Notificación de éxito
    posStore.showToast(
      `¡Comanda #${targetOrder.orderNumber} liquidada con éxito y enviada al KDS!`,
      'success'
    );

    return transaction;
  },
}));
