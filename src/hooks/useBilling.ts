/**
 * @file useBilling.ts
 * @description Hook de React para la gestión del flujo operativo de cobro en caja:
 * - Filtrado en tiempo real por número de orden, cliente y membresía.
 * - Monitoreo y formateo reactivo del tiempo transcurrido (Verde <3m, Ámbar 3-7m, Rojo >7m).
 * - Estadísticas en vivo de la bandeja de órdenes.
 * - Despacho de pagos a hardware (cajón portamonedas e impresora) y sincronización con KDS.
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useBillingStore } from '../store/billingStore';
import type {
  WaitTimeUrgency,
  PaymentSettlementPayload,
  OrderSource,
} from '../types/billing';

export function useBilling() {
  const orders = useBillingStore((s) => s.orders);
  const selectedOrderId = useBillingStore((s) => s.selectedOrderId);
  const isPaymentModalOpen = useBillingStore((s) => s.isPaymentModalOpen);
  const orderBeingPaid = useBillingStore((s) => s.orderBeingPaid);
  const searchQuery = useBillingStore((s) => s.searchQuery);
  const typeFilter = useBillingStore((s) => s.typeFilter);
  const urgencyFilter = useBillingStore((s) => s.urgencyFilter);
  const sourceFilter = useBillingStore((s) => s.sourceFilter);
  const currentTime = useBillingStore((s) => s.currentTime);

  const setSelectedOrderId = useBillingStore((s) => s.setSelectedOrderId);
  const setSearchQuery = useBillingStore((s) => s.setSearchQuery);
  const setTypeFilter = useBillingStore((s) => s.setTypeFilter);
  const setUrgencyFilter = useBillingStore((s) => s.setUrgencyFilter);
  const setSourceFilter = useBillingStore((s) => s.setSourceFilter);
  const resetFilters = useBillingStore((s) => s.resetFilters);
  const openPaymentModal = useBillingStore((s) => s.openPaymentModal);
  const closePaymentModal = useBillingStore((s) => s.closePaymentModal);
  const cancelOrder = useBillingStore((s) => s.cancelOrder);
  const createPendingOrder = useBillingStore((s) => s.createPendingOrder);
  const settlePayment = useBillingStore((s) => s.settlePayment);
  const tickCurrentTime = useBillingStore((s) => s.tickCurrentTime);
  const getOrderElapsedSeconds = useBillingStore((s) => s.getOrderElapsedSeconds);
  const getOrderUrgency = useBillingStore((s) => s.getOrderUrgency);

  // Intervalo de actualización de tiempos cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      tickCurrentTime();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickCurrentTime]);

  // Lista de todas las órdenes pendientes
  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'pending_payment');
  }, [orders]);

  // Historial de órdenes cobradas en el turno
  const paidOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'paid');
  }, [orders]);

  // Órdenes pendientes filtradas según búsqueda y selectores
  const filteredPendingOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return pendingOrders.filter((order) => {
      // 1. Filtro de búsqueda textual (#104, nombre, número de socio)
      if (query) {
        const matchesOrderNumber =
          order.orderNumber.toString().includes(query) ||
          `#${order.orderNumber}`.includes(query);
        const matchesCustomer = order.customerName.toLowerCase().includes(query);
        const matchesMember =
          order.member?.memberNumber.toLowerCase().includes(query) ||
          order.member?.fullName.toLowerCase().includes(query);

        if (!matchesOrderNumber && !matchesCustomer && !matchesMember) {
          return false;
        }
      }

      // 2. Filtro de tipo de servicio (takeaway vs dine_in)
      if (typeFilter !== 'all' && order.orderType !== typeFilter) {
        return false;
      }

      // 3. Filtro de origen (mostrador, quiosco, etc.)
      if (sourceFilter !== 'all' && order.source !== sourceFilter) {
        return false;
      }

      // 4. Filtro de urgencia
      if (urgencyFilter !== 'all') {
        const urgency = getOrderUrgency(order);
        if (urgencyFilter === 'urgent' && urgency !== 'urgent') return false;
        if (urgencyFilter === 'warning' && urgency !== 'warning') return false;
      }

      return true;
    });
  }, [pendingOrders, searchQuery, typeFilter, sourceFilter, urgencyFilter, getOrderUrgency]);

  // Orden actualmente seleccionada en el panel de detalle
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return filteredPendingOrders[0] || null;
    return orders.find((o) => o.id === selectedOrderId) || filteredPendingOrders[0] || null;
  }, [orders, selectedOrderId, filteredPendingOrders]);

  // Resumen cuantitativo del turno
  const stats = useMemo(() => {
    const totalAmount = pendingOrders.reduce((acc, o) => acc + o.total, 0);
    const urgentCount = pendingOrders.filter((o) => getOrderUrgency(o) === 'urgent').length;
    const warningCount = pendingOrders.filter((o) => getOrderUrgency(o) === 'warning').length;
    const takeawayCount = pendingOrders.filter((o) => o.orderType === 'takeaway').length;
    const dineInCount = pendingOrders.filter((o) => o.orderType === 'dine_in').length;
    const paidTotalAmount = paidOrders.reduce((acc, o) => acc + o.total, 0);

    return {
      pendingCount: pendingOrders.length,
      pendingTotalAmount: Math.round(totalAmount * 100) / 100,
      urgentCount,
      warningCount,
      takeawayCount,
      dineInCount,
      paidCount: paidOrders.length,
      paidTotalAmount: Math.round(paidTotalAmount * 100) / 100,
    };
  }, [pendingOrders, paidOrders, getOrderUrgency]);

  // Formateador de tiempo transcurrido (MM:SS)
  const formatElapsedTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Helpers de estilos visuales para la urgencia
  const getUrgencyConfig = useCallback((urgency: WaitTimeUrgency) => {
    switch (urgency) {
      case 'urgent':
        return {
          bg: 'bg-rose-500/15',
          text: 'text-rose-400',
          border: 'border-rose-500/40',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          dot: 'bg-rose-500 animate-ping',
          label: 'Urgente (>7 min)',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/15',
          text: 'text-amber-400',
          border: 'border-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-400',
          label: 'Alerta (3-7 min)',
        };
      case 'normal':
      default:
        return {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-400',
          label: 'A tiempo (<3 min)',
        };
    }
  }, []);

  // Helper de origen
  const getSourceLabel = useCallback((source: OrderSource) => {
    switch (source) {
      case 'kiosk':
        return { label: 'Quiosco #01', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
      case 'presale':
        return { label: 'Preventa Recepción', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
      case 'mobile_app':
        return { label: 'App PrimeBar', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'pos_counter':
      default:
        return { label: 'Mostrador Barra', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    }
  }, []);

  const handleSettle = useCallback(
    async (payload: PaymentSettlementPayload) => {
      return await settlePayment(payload);
    },
    [settlePayment]
  );

  return {
    orders,
    pendingOrders,
    paidOrders,
    filteredPendingOrders,
    selectedOrderId,
    selectedOrder,
    isPaymentModalOpen,
    orderBeingPaid,
    searchQuery,
    typeFilter,
    urgencyFilter,
    sourceFilter,
    currentTime,
    stats,
    setSelectedOrderId,
    setSearchQuery,
    setTypeFilter,
    setUrgencyFilter,
    setSourceFilter,
    resetFilters,
    openPaymentModal,
    closePaymentModal,
    cancelOrder,
    createPendingOrder,
    settlePayment: handleSettle,
    getOrderElapsedSeconds,
    getOrderUrgency,
    formatElapsedTime,
    getUrgencyConfig,
    getSourceLabel,
  };
}
