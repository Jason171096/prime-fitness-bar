/**
 * @file closure.ts
 * @description Definición de tipos e interfaces para el Módulo de Cierre de Caja,
 * Arqueo de Turno y Consolidado de Ventas Diarias de PrimeFitness Bar.
 */

export type ShiftStatus = 'open' | 'closed';

export type DifferenceStatus = 'balanced' | 'surplus' | 'shortage';

export type ReportType = 'Z_REPORT' | 'X_REPORT';

export type ShiftPaymentMethod = 'cash' | 'card' | 'gym_account' | 'split';

/**
 * Claves normalizadas para denominaciones de billetes y monedas
 */
export type CashDenominationKey =
  | 'b500' // Billete $500
  | 'b200' // Billete $200
  | 'b100' // Billete $100
  | 'b50'  // Billete $50
  | 'b20'  // Billete $20
  | 'c20'  // Moneda $20
  | 'c10'  // Moneda $10
  | 'c5'   // Moneda $5
  | 'c2'   // Moneda $2
  | 'c1'   // Moneda $1
  | 'c05'; // Moneda $0.50

/**
 * Metadatos de cada denominación para la UI y cálculos
 */
export interface DenominationConfig {
  key: CashDenominationKey;
  value: number;
  type: 'bill' | 'coin';
  label: string;
  displayValue: string;
}

/**
 * Conteo de piezas por denominación
 */
export type CashDenominations = Record<CashDenominationKey, number>;

/**
 * Categorías de movimientos extraordinarios de efectivo en el turno
 */
export type CashMovementType = 'cash_drop' | 'cash_in';

export type CashMovementCategory =
  | 'supplier_payment'     // Pago a proveedor menor (ej. hielos, frutas frescas)
  | 'security_drop'        // Retiro de seguridad hacia caja fuerte / bóveda
  | 'petty_cash'           // Gastos menores de caja chica
  | 'cash_replenishment'   // Aporte extraordinario de fondo / cambio
  | 'change_fund'          // Reposición de monedas para cambio
  | 'other';               // Otros conceptos autorizados

/**
 * Registro de un movimiento de efectivo (Entrada o Retiro) durante el turno
 */
export interface CashMovement {
  id: string;
  shiftId: string;
  type: CashMovementType;
  category: CashMovementCategory;
  amount: number;
  reason: string;
  timestamp: string;
  authorizedBy: string;
  receiptNumber?: string;
}

/**
 * Desglose de ventas por método de pago
 */
export interface PaymentMethodBreakdown {
  cash: number;
  card: number;
  gymAccount: number;
  splitCashPortion: number;
  splitCardPortion: number;
  splitGymAccountPortion: number;
  totalOrdersCount: number;
  cashOrdersCount: number;
  cardOrdersCount: number;
  gymAccountOrdersCount: number;
}

/**
 * Resumen contable y financiero integral de la sesión
 */
export interface ShiftFinancialSummary {
  initialCashFloat: number;       // Fondo inicial de apertura
  cashSales: number;              // Total cobrado en Efectivo
  cardSales: number;              // Total cobrado con Tarjeta bancaria TPV
  memberAccountSales: number;     // Total descontado de Cuentas/Monederos de Socios
  totalSales: number;             // Total global de ventas brutas (cash + card + memberAccount)
  totalCashIn: number;            // Total entradas extraordinarias registradas
  totalCashDrop: number;          // Total retiros / cash drops registrados
  netTheoreticalBalance: number;  // Total recaudado neto en el turno (Ventas Totales + Entradas - Retiros)
  expectedCash: number;           // Efectivo teórico en gaveta (initialCashFloat + cashSales + totalCashIn - totalCashDrop)
  actualCash: number;             // Efectivo físico (en arqueo sin conteo manual = expectedCash)
  difference: number;             // actualCash - expectedCash (0 en modo sin conteo físico)
  differenceStatus: DifferenceStatus;
  averageTicket: number;          // Ticket promedio del turno (totalSales / totalOrdersCount)
  totalOrdersCount: number;       // Cantidad total de órdenes completadas
  paymentBreakdown: PaymentMethodBreakdown;
}

/**
 * Ítem individual dentro de una transacción registrada en el turno
 */
export interface ShiftTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  category: string;
}

/**
 * Detalle auditado de una transacción procesada durante el turno
 */
export interface ShiftTransactionSummary {
  id: string;
  orderNumber: number | string;
  timestamp: string;
  rawTimestamp: number;
  paymentMethod: ShiftPaymentMethod;
  paymentMethodLabel: string;
  customerName: string;
  memberNumber?: string;
  isMember: boolean;
  itemsCount: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  cashPortion?: number;
  cardPortion?: number;
  gymAccountPortion?: number;
  items: ShiftTransactionItem[];
}

/**
 * Consolidado de producto comercializado en el día (Daily Items Sold)
 */
export interface SoldProductSummary {
  productId: string;
  productName: string;
  category: 'smoothies' | 'bowls' | 'salads' | 'snacks' | string;
  categoryLabel: string;
  quantitySold: number;
  unitPrice: number;
  totalRevenue: number;
  percentageOfTotalSales: number;
  rank?: number; // 1, 2, 3 para el Top de ventas
  imageUrl?: string;
}

/**
 * Métrica agrupada por categoría de menú
 */
export interface CategorySalesSummary {
  categoryId: string;
  categoryLabel: string;
  totalQuantity: number;
  totalRevenue: number;
  percentage: number;
  itemsCount: number;
  color: string;
}

/**
 * Entidad principal de Sesión de Caja / Turno de Trabajo
 */
export interface CashShift {
  id: string;
  shiftNumber: number;
  cashierId: string;
  cashierName: string;
  terminalId: string;
  openedAt: string;
  closedAt?: string;
  status: ShiftStatus;
  initialCashFloat: number;
  notes?: string;
  closureNotes?: string;
  syncStatus: 'pending' | 'synced' | 'local_only';
  lastModified: number;
}

/**
 * Reporte formal de Cierre de Caja (Corte Z o Auditoría X)
 */
export interface CashClosureReport {
  id: string;
  reportType: ReportType;
  shiftId: string;
  shiftNumber: number;
  cashierName: string;
  terminalId: string;
  openedAt: string;
  closedAt: string;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    taxId?: string;
  };
  summary: ShiftFinancialSummary;
  transactions: ShiftTransactionSummary[];
  soldProducts: SoldProductSummary[];
  categorySummaries: CategorySalesSummary[];
  topProducts: SoldProductSummary[];
  movements: CashMovement[];
  denominations?: CashDenominations;
  observations?: string;
  sqliteRecordId?: string;
  isLockedInDatabase: boolean;
  syncTimestamp?: string;
}

/**
 * Payload optimizado para enviar al hardware de impresión térmica ESC/POS
 */
export interface CashClosureReceiptPayload {
  orderNumber: string;
  date: string;
  cashierName: string;
  customerName: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizationSummary?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  cashChange?: number;
}
