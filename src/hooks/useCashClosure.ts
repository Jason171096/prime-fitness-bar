/**
 * @file useCashClosure.ts
 * @description Hook de lógica, cálculo financiero y agregación contable para el
 * Módulo de Cierre de Caja y Balance de Turno (Shift Closure & Daily Sales Summary) de PrimeFitness Bar:
 * - Agregación reactiva de ventas por método de pago (Efectivo, Tarjeta TPV y Saldo Socio).
 * - Conciliación de Movimientos Extraordinarios (Entradas y Retiros de caja).
 * - Balance Neto Teórico del Turno (Ventas Totales + Entradas - Retiros) y Efectivo en Gaveta.
 * - Consolidación de Productos Vendidos en el Día (Daily Items Sold), Top 3 y Métricas por Categoría.
 * - Auditoría y filtrado interactivo del feed de transacciones del turno.
 * - Generación de payload para SQLite local, encolado de sincronización central y formateador ESC/POS para hardware térmico.
 */

import { useState, useMemo, useCallback } from 'react';
import { useClosureStore } from '../store/closureStore';
import { useBillingStore } from '../store/billingStore';
import { usePOSStore } from '../store/posStore';
import { MOCK_SHIFT_SALES, CATEGORY_METADATA } from '../data/mockShiftSales';
import { STORE_RECEIPT_INFO, DENOMINATION_CONFIGS } from '../data/closureConstants';
import type {
  CashClosureReport,
  ShiftFinancialSummary,
  DifferenceStatus,
  ReportType,
  PaymentMethodBreakdown,
  ShiftTransactionSummary,
  ShiftTransactionItem,
  SoldProductSummary,
  CategorySalesSummary,
  ShiftPaymentMethod,
  CashDenominationKey,
} from '../types/closure';
import type { ReceiptDataPayload, ReceiptItemPayload } from '../types/electron';

export function useCashClosure() {
  // Estado desde el store persistente de cierre
  const currentShift = useClosureStore((s) => s.currentShift);
  const denominations = useClosureStore((s) => s.denominations);
  const movements = useClosureStore((s) => s.movements);
  const closureNotes = useClosureStore((s) => s.closureNotes);
  const closedReportsHistory = useClosureStore((s) => s.closedReportsHistory);
  const lastGeneratedReport = useClosureStore((s) => s.lastGeneratedReport);

  const isMovementModalOpen = useClosureStore((s) => s.isMovementModalOpen);
  const isReceiptModalOpen = useClosureStore((s) => s.isReceiptModalOpen);
  const isConfirmCloseModalOpen = useClosureStore((s) => s.isConfirmCloseModalOpen);
  const isOpenShiftModalOpen = useClosureStore((s) => s.isOpenShiftModalOpen);

  const setDenominationCount = useClosureStore((s) => s.setDenominationCount);
  const incrementDenomination = useClosureStore((s) => s.incrementDenomination);
  const resetDenominations = useClosureStore((s) => s.resetDenominations);
  const autoFillExactCount = useClosureStore((s) => s.autoFillExactCount);
  const setClosureNotes = useClosureStore((s) => s.setClosureNotes);
  const setMovementModalOpen = useClosureStore((s) => s.setMovementModalOpen);
  const setReceiptModalOpen = useClosureStore((s) => s.setReceiptModalOpen);
  const setConfirmCloseModalOpen = useClosureStore((s) => s.setConfirmCloseModalOpen);
  const setOpenShiftModalOpen = useClosureStore((s) => s.setOpenShiftModalOpen);
  const addCashMovement = useClosureStore((s) => s.addCashMovement);
  const removeCashMovement = useClosureStore((s) => s.removeCashMovement);
  const closeCurrentShift = useClosureStore((s) => s.closeCurrentShift);
  const openNewShift = useClosureStore((s) => s.openNewShift);

  const billingOrders = useBillingStore((s) => s.orders);
  const showToast = usePOSStore((s) => s.showToast);

  // Estados locales para filtros y navegación del feed
  const [transactionSearchQuery, setTransactionSearchQuery] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | ShiftPaymentMethod>('all');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Filtros para la tabla de productos vendidos
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // 1. Unificar transacciones base del turno con comandas pagadas en vivo desde BillingStore
  const allShiftTransactions = useMemo<ShiftTransactionSummary[]>(() => {
    const list: ShiftTransactionSummary[] = [...MOCK_SHIFT_SALES];

    // Integrar ventas pagadas dinámicamente desde BillingStore
    const paidBillingOrders = billingOrders.filter((o) => o.status === 'paid');

    for (const order of paidBillingOrders) {
      // Evitar duplicados si ya tuviera un ID en lista
      if (list.some((tx) => tx.id === order.id)) continue;

      const txInfo = order.transaction;
      let pMethod: ShiftPaymentMethod = 'cash';
      let pLabel = 'Efectivo';
      let cashPortion = 0;
      let cardPortion = 0;
      let gymAccountPortion = 0;

      if (txInfo) {
        if (txInfo.paymentMethod === 'card') {
          pMethod = 'card';
          pLabel = 'Tarjeta TPV';
          cardPortion = txInfo.totalAmount;
        } else if (txInfo.paymentMethod === 'gym_account') {
          pMethod = 'gym_account';
          pLabel = 'Saldo Socio';
          gymAccountPortion = txInfo.totalAmount;
        } else if (txInfo.paymentMethod === 'split' && txInfo.splits) {
          pMethod = 'split';
          pLabel = 'Pago Dividido';
          for (const s of txInfo.splits) {
            if (s.method === 'cash') cashPortion += s.amount;
            if (s.method === 'card') cardPortion += s.amount;
            if (s.method === 'gym_account') gymAccountPortion += s.amount;
          }
        } else {
          cashPortion = txInfo.totalAmount;
        }
      } else {
        cashPortion = order.total;
      }

      const itemsSummary: ShiftTransactionItem[] = order.items.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        unitPrice: it.finalPrice,
        subtotal: Math.round(it.quantity * it.finalPrice * 100) / 100,
        category: it.product.category,
      }));

      list.push({
        id: order.id,
        orderNumber: order.orderNumber,
        timestamp: order.createdAt,
        rawTimestamp: order.timestamp,
        paymentMethod: pMethod,
        paymentMethodLabel: pLabel,
        customerName: order.customerName,
        memberNumber: order.member?.membershipNumber,
        isMember: Boolean(order.member),
        itemsCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: order.subtotal,
        discount: order.discount || 0,
        totalAmount: order.total,
        cashPortion: cashPortion || undefined,
        cardPortion: cardPortion || undefined,
        gymAccountPortion: gymAccountPortion || undefined,
        items: itemsSummary,
      });
    }

    // Ordenar de más reciente a más antiguo para el feed
    return list.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  }, [billingOrders]);

  // 2. Transacciones filtradas según búsqueda y método de pago
  const filteredTransactions = useMemo<ShiftTransactionSummary[]>(() => {
    return allShiftTransactions.filter((tx) => {
      // Filtro de método de pago
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) {
        return false;
      }

      // Filtro de texto por folio de ticket o nombre de cliente
      if (transactionSearchQuery.trim()) {
        const query = transactionSearchQuery.toLowerCase().trim();
        const matchesNumber = tx.orderNumber.toString().includes(query);
        const matchesCustomer = tx.customerName.toLowerCase().includes(query);
        const matchesMember = tx.memberNumber ? tx.memberNumber.toLowerCase().includes(query) : false;
        return matchesNumber || matchesCustomer || matchesMember;
      }

      return true;
    });
  }, [allShiftTransactions, paymentFilter, transactionSearchQuery]);

  // 3. Cálculo de ventas totales y desglose por método de pago
  const paymentBreakdown = useMemo<PaymentMethodBreakdown>(() => {
    let cash = 0;
    let card = 0;
    let gymAccount = 0;
    let splitCashPortion = 0;
    let splitCardPortion = 0;
    let splitGymAccountPortion = 0;

    let cashOrdersCount = 0;
    let cardOrdersCount = 0;
    let gymAccountOrdersCount = 0;

    for (const tx of allShiftTransactions) {
      if (tx.paymentMethod === 'cash') {
        cash += tx.totalAmount;
        cashOrdersCount += 1;
      } else if (tx.paymentMethod === 'card') {
        card += tx.totalAmount;
        cardOrdersCount += 1;
      } else if (tx.paymentMethod === 'gym_account') {
        gymAccount += tx.totalAmount;
        gymAccountOrdersCount += 1;
      } else if (tx.paymentMethod === 'split') {
        if (tx.cashPortion) {
          cash += tx.cashPortion;
          splitCashPortion += tx.cashPortion;
        }
        if (tx.cardPortion) {
          card += tx.cardPortion;
          splitCardPortion += tx.cardPortion;
        }
        if (tx.gymAccountPortion) {
          gymAccount += tx.gymAccountPortion;
          splitGymAccountPortion += tx.gymAccountPortion;
        }
        cashOrdersCount += 1; // Contabilizar orden dividida
      }
    }

    return {
      cash: Math.round(cash * 100) / 100,
      card: Math.round(card * 100) / 100,
      gymAccount: Math.round(gymAccount * 100) / 100,
      splitCashPortion: Math.round(splitCashPortion * 100) / 100,
      splitCardPortion: Math.round(splitCardPortion * 100) / 100,
      splitGymAccountPortion: Math.round(splitGymAccountPortion * 100) / 100,
      totalOrdersCount: allShiftTransactions.length,
      cashOrdersCount,
      cardOrdersCount,
      gymAccountOrdersCount,
    };
  }, [allShiftTransactions]);

  // 4. Totales de Movimientos Extraordinarios (Entradas y Retiros de Efectivo)
  const cashMovementsTotals = useMemo(() => {
    let totalCashIn = 0;
    let totalCashDrop = 0;

    for (const mov of movements) {
      if (mov.type === 'cash_in') {
        totalCashIn += mov.amount;
      } else if (mov.type === 'cash_drop') {
        totalCashDrop += mov.amount;
      }
    }

    return {
      totalCashIn: Math.round(totalCashIn * 100) / 100,
      totalCashDrop: Math.round(totalCashDrop * 100) / 100,
    };
  }, [movements]);

  // 5. Consolidación de Productos Vendidos en el Día (Daily Items Sold)
  const { soldProducts, topProducts, categorySummaries } = useMemo(() => {
    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        category: string;
        quantitySold: number;
        totalRevenue: number;
        unitPrice: number;
      }
    >();

    let grandTotalProductRevenue = 0;

    // Recorrer transacciones e ítems
    for (const tx of allShiftTransactions) {
      for (const it of tx.items) {
        const existing = productMap.get(it.productId);
        const revenue = it.subtotal || it.quantity * it.unitPrice;
        grandTotalProductRevenue += revenue;

        if (existing) {
          existing.quantitySold += it.quantity;
          existing.totalRevenue = Math.round((existing.totalRevenue + revenue) * 100) / 100;
        } else {
          productMap.set(it.productId, {
            productId: it.productId,
            productName: it.productName,
            category: it.category || 'smoothies',
            quantitySold: it.quantity,
            totalRevenue: Math.round(revenue * 100) / 100,
            unitPrice: it.unitPrice,
          });
        }
      }
    }

    // Convertir a arreglo y ordenar por unidades vendidas de mayor a menor
    const allProductsArray: SoldProductSummary[] = Array.from(productMap.values()).map((p) => {
      const percentage =
        grandTotalProductRevenue > 0
          ? Math.round((p.totalRevenue / grandTotalProductRevenue) * 1000) / 10
          : 0;

      const catMeta = CATEGORY_METADATA[p.category];

      return {
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        categoryLabel: catMeta?.label || p.category,
        quantitySold: p.quantitySold,
        unitPrice: p.unitPrice,
        totalRevenue: p.totalRevenue,
        percentageOfTotalSales: percentage,
      };
    });

    allProductsArray.sort((a, b) => b.quantitySold - a.quantitySold);

    // Asignar Ranking a los Top 3 productos
    const top3: SoldProductSummary[] = allProductsArray.slice(0, 3).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    // Métricas por Categoría
    const catMap = new Map<
      string,
      { totalQuantity: number; totalRevenue: number; itemsCount: number }
    >();

    for (const p of allProductsArray) {
      const existing = catMap.get(p.category) || {
        totalQuantity: 0,
        totalRevenue: 0,
        itemsCount: 0,
      };
      existing.totalQuantity += p.quantitySold;
      existing.totalRevenue = Math.round((existing.totalRevenue + p.totalRevenue) * 100) / 100;
      existing.itemsCount += 1;
      catMap.set(p.category, existing);
    }

    const categoriesList: CategorySalesSummary[] = ['smoothies', 'bowls', 'salads', 'snacks'].map(
      (catKey) => {
        const data = catMap.get(catKey) || { totalQuantity: 0, totalRevenue: 0, itemsCount: 0 };
        const meta = CATEGORY_METADATA[catKey];
        const pct =
          grandTotalProductRevenue > 0
            ? Math.round((data.totalRevenue / grandTotalProductRevenue) * 1000) / 10
            : 0;

        return {
          categoryId: catKey,
          categoryLabel: meta?.label || catKey,
          totalQuantity: data.totalQuantity,
          totalRevenue: data.totalRevenue,
          percentage: pct,
          itemsCount: data.itemsCount,
          color: meta?.color || 'text-slate-400',
        };
      }
    );

    return {
      soldProducts: allProductsArray,
      topProducts: top3,
      categorySummaries: categoriesList,
    };
  }, [allShiftTransactions]);

  // 6. Filtrado de la tabla de productos consolidados
  const filteredSoldProducts = useMemo(() => {
    return soldProducts.filter((p) => {
      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) {
        return false;
      }
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase().trim();
        return p.productName.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [soldProducts, productCategoryFilter, productSearchQuery]);

  // 7. Resumen Financiero Completo del Turno
  const financialSummary = useMemo<ShiftFinancialSummary>(() => {
    const initialFloat = currentShift?.initialCashFloat || 0;
    const { cash: cashSales, card: cardSales, gymAccount: memberAccountSales } = paymentBreakdown;
    const { totalCashIn, totalCashDrop } = cashMovementsTotals;
    const totalSales = Math.round((cashSales + cardSales + memberAccountSales) * 100) / 100;

    // Cálculo automático: Balance Neto Teórico = Ventas Totales + Entradas - Retiros
    const netTheoreticalBalance = Math.round((totalSales + totalCashIn - totalCashDrop) * 100) / 100;

    // Efectivo Teórico en Gaveta: Fondo Inicial + Ventas Efectivo + Entradas - Retiros
    const expectedCash = Math.round((initialFloat + cashSales + totalCashIn - totalCashDrop) * 100) / 100;

    // En el modelo sin conteo manual, el efectivo auditado coincide con el esperado contable
    const actualCash = expectedCash;
    const difference = 0.00;
    const differenceStatus: DifferenceStatus = 'balanced';

    const totalOrdersCount = allShiftTransactions.length;
    const averageTicket =
      totalOrdersCount > 0 ? Math.round((totalSales / totalOrdersCount) * 100) / 100 : 0;

    return {
      initialCashFloat: initialFloat,
      cashSales,
      cardSales,
      memberAccountSales,
      totalSales,
      totalCashIn,
      totalCashDrop,
      netTheoreticalBalance,
      expectedCash,
      actualCash,
      difference,
      differenceStatus,
      averageTicket,
      totalOrdersCount,
      paymentBreakdown,
    };
  }, [currentShift, paymentBreakdown, cashMovementsTotals, allShiftTransactions.length]);

  // 8. Validación de Cierre
  const validation = useMemo(() => {
    const isShiftOpen = currentShift?.status === 'open';
    const canClose = Boolean(isShiftOpen);

    return {
      isShiftOpen,
      canClose,
      errorMessage: !isShiftOpen ? 'El turno actual ya se encuentra cerrado.' : null,
    };
  }, [currentShift]);

  // 9. Generación del Reporte Formal Estructurado (Corte Z o Auditoría X)
  const generateReport = useCallback(
    (reportType: ReportType = 'Z_REPORT'): CashClosureReport => {
      const now = new Date();
      const closedAtFormatted = now.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        id: `report-${reportType.toLowerCase()}-${Date.now()}`,
        reportType,
        shiftId: currentShift?.id || `shift-${Date.now()}`,
        shiftNumber: currentShift?.shiftNumber || 14,
        cashierName: currentShift?.cashierName || 'Marcos Vega',
        terminalId: currentShift?.terminalId || STORE_RECEIPT_INFO.terminalId,
        openedAt: currentShift?.openedAt || now.toLocaleString(),
        closedAt: closedAtFormatted,
        storeInfo: STORE_RECEIPT_INFO,
        summary: financialSummary,
        transactions: allShiftTransactions,
        soldProducts,
        categorySummaries,
        topProducts,
        movements: [...movements],
        denominations: { ...denominations },
        observations: closureNotes.trim() || undefined,
        sqliteRecordId: `sqlite-turn-${Date.now()}`,
        isLockedInDatabase: reportType === 'Z_REPORT',
        syncTimestamp: new Date().toISOString(),
      };
    },
    [
      currentShift,
      financialSummary,
      allShiftTransactions,
      soldProducts,
      categorySummaries,
      topProducts,
      movements,
      denominations,
      closureNotes,
    ]
  );

  // 10. Formateador de Reporte para Impresora Térmica ESC/POS (80mm)
  // Incluye el Resumen Financiero Y la lista consolidada de productos vendidos
  const formatClosureReceiptPayload = useCallback(
    (report: CashClosureReport): ReceiptDataPayload => {
      const isZ = report.reportType === 'Z_REPORT';
      const titlePrefix = isZ ? 'CORTE Z (CIERRE)' : 'CORTE X (AUDITORÍA)';

      // Líneas financieras clave
      const items: ReceiptItemPayload[] = [
        {
          name: '>>> FONDO INICIAL DE APERTURA',
          quantity: 1,
          price: report.summary.initialCashFloat,
        },
        {
          name: `(+) VENTAS EN EFECTIVO (${report.summary.paymentBreakdown.cashOrdersCount} ord)`,
          quantity: 1,
          price: report.summary.cashSales,
        },
        {
          name: `(+) VENTAS CON TARJETA (${report.summary.paymentBreakdown.cardOrdersCount} ord)`,
          quantity: 1,
          price: report.summary.cardSales,
        },
        {
          name: `(+) SALDO SOCIO GYM (${report.summary.paymentBreakdown.gymAccountOrdersCount} ord)`,
          quantity: 1,
          price: report.summary.memberAccountSales,
        },
      ];

      if (report.summary.totalCashIn > 0) {
        items.push({
          name: '(+) ENTRADAS EXTRAORDINARIAS',
          quantity: 1,
          price: report.summary.totalCashIn,
        });
      }

      if (report.summary.totalCashDrop > 0) {
        items.push({
          name: '(-) RETIROS / CASH DROPS',
          quantity: 1,
          price: -report.summary.totalCashDrop,
        });
      }

      items.push(
        {
          name: '(=) BALANCE NETO TEÓRICO RECAUDADO',
          quantity: 1,
          price: report.summary.netTheoreticalBalance,
        },
        {
          name: '(=) EFECTIVO TEÓRICO EN GAVETA',
          quantity: 1,
          price: report.summary.expectedCash,
        }
      );

      // Separador y Lista de Productos Vendidos en el Ticket Térmico
      items.push({
        name: '--- CONSOLIDADO DE PRODUCTOS VENDIDOS ---',
        quantity: 0,
        price: 0,
      });

      for (const prod of report.soldProducts) {
        items.push({
          name: `${prod.quantitySold}x ${prod.productName}`,
          quantity: prod.quantitySold,
          price: prod.totalRevenue,
          customizationSummary: `Unit: $${prod.unitPrice.toFixed(2)} · ${prod.categoryLabel}`,
        });
      }

      return {
        orderNumber: `${titlePrefix}-#${report.shiftNumber}`,
        date: report.closedAt,
        cashierName: report.cashierName,
        customerName: `${titlePrefix} · TURNO #${report.shiftNumber}`,
        storeName: STORE_RECEIPT_INFO.name,
        storeAddress: STORE_RECEIPT_INFO.address,
        storePhone: STORE_RECEIPT_INFO.phone,
        items,
        subtotal: report.summary.totalSales,
        tax: 0,
        total: report.summary.totalSales,
        paymentMethod: isZ ? 'CIERRE DEFINITIVO CORTE Z' : 'AUDITORÍA PREVIA CORTE X',
        cashReceived: report.summary.expectedCash,
        cashChange: 0,
      };
    },
    []
  );

  // 11. Invocación de Hardware: Impresión Silenciosa en Impresora Térmica
  const printReport = useCallback(
    async (report: CashClosureReport): Promise<{ success: boolean; message?: string }> => {
      const payload = formatClosureReceiptPayload(report);
      const isElectron = typeof window !== 'undefined' && Boolean(window.posHardware?.isElectron);

      if (!isElectron || !window.posHardware) {
        console.info('[Hardware SIMULATOR] Impresión de Corte Z enviada:', payload);
        showToast('Ticket de Corte Z enviado al simulador térmico (Navegador)', 'info');
        return { success: true, message: 'Ticket impreso (Simulación de hardware)' };
      }

      try {
        const res = await window.posHardware.printReceipt(payload);
        if (res.success) {
          showToast('Ticket de Corte Z impreso en impresora térmica', 'success');
        } else {
          showToast(`Error al imprimir ticket: ${res.error || 'Fallo de hardware'}`, 'error');
        }
        return res;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        showToast(`Error de impresión: ${msg}`, 'error');
        return { success: false, message: msg };
      }
    },
    [formatClosureReceiptPayload, showToast]
  );

  // 12. Invocación de Hardware: Apertura de Cajón Portamonedas
  const openCashDrawer = useCallback(async (): Promise<boolean> => {
    const isElectron = typeof window !== 'undefined' && Boolean(window.posHardware?.isElectron);

    if (!isElectron || !window.posHardware) {
      console.info('[Hardware SIMULATOR] Cajón de dinero abierto (Pulso simulado).');
      showToast('Cajón de dinero abierto (Simulador nativo)', 'info');
      return true;
    }

    try {
      const res = await window.posHardware.openCashDrawer();
      if (res.success) {
        showToast('Cajón de dinero abierto vía ESC/POS', 'success');
        return true;
      } else {
        showToast(`Fallo al abrir cajón: ${res.error || ''}`, 'warning');
        return false;
      }
    } catch (err) {
      console.error('[Cash Drawer] Error:', err);
      showToast('Error al enviar pulso al cajón', 'error');
      return false;
    }
  }, [showToast]);

  // 13. Confirmación Definitiva de Cierre de Turno (Corte Z)
  const executeShiftClosure = useCallback(async (): Promise<boolean> => {
    if (!validation.canClose) {
      if (validation.errorMessage) {
        showToast(validation.errorMessage, 'error');
      }
      return false;
    }

    const report = generateReport('Z_REPORT');

    // 1. Guardar y bloquear en almacenamiento local (SQLite)
    const success = await closeCurrentShift(report);
    if (!success) return false;

    // 2. Imprimir ticket térmico Z-Report silenciosamente
    await printReport(report);

    return true;
  }, [validation, generateReport, closeCurrentShift, printReport, showToast]);

  // 14. Emisión de Auditoría Parcial (Corte X sin bloquear turno)
  const executeXReport = useCallback(async () => {
    const xReport = generateReport('X_REPORT');
    useClosureStore.setState({ lastGeneratedReport: xReport, isReceiptModalOpen: true });
    await printReport(xReport);
  }, [generateReport, printReport]);

  return {
    // Datos del Turno y Resumen Financiero
    currentShift,
    denominations,
    movements,
    closureNotes,
    closedReportsHistory,
    lastGeneratedReport,
    financialSummary,
    cashMovementsTotals,
    validation,

    // Transacciones del Turno y Filtros
    allShiftTransactions,
    filteredTransactions,
    transactionSearchQuery,
    setTransactionSearchQuery,
    paymentFilter,
    setPaymentFilter,
    selectedTransactionId,
    setSelectedTransactionId,

    // Consolidado de Productos Vendidos y Categorías
    soldProducts,
    filteredSoldProducts,
    topProducts,
    categorySummaries,
    productCategoryFilter,
    setProductCategoryFilter,
    productSearchQuery,
    setProductSearchQuery,

    // Modales
    isMovementModalOpen,
    isReceiptModalOpen,
    isConfirmCloseModalOpen,
    isOpenShiftModalOpen,

    // Métodos para modales y notas
    setClosureNotes,
    setMovementModalOpen,
    setReceiptModalOpen,
    setConfirmCloseModalOpen,
    setOpenShiftModalOpen,

    // Movimientos extraordinarios
    addCashMovement,
    removeCashMovement,

    // Operaciones contables y hardware
    openCashDrawer,
    executeShiftClosure,
    executeXReport,
    printReport,
    openNewShift,

    // Compatibilidad adicional con denominaciones
    setDenominationCount,
    incrementDenomination,
    resetDenominations,
    autoFillExactCount,
  };
}
