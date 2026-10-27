/**
 * @file closureConstants.ts
 * @description Constantes de configuración, catálogos de denominaciones y datos iniciales
 * para el módulo de Cierre de Caja / Arqueo de Turno de PrimeFitness Bar.
 */

import type {
  DenominationConfig,
  CashDenominations,
  CashMovementCategory,
  CashMovement,
  CashShift,
} from '../types/closure';

/**
 * Catálogo ordenado de denominaciones de billetes y monedas (MXN / USD adaptable)
 */
export const DENOMINATION_CONFIGS: DenominationConfig[] = [
  // Billetes
  { key: 'b500', value: 500, type: 'bill', label: 'Billete $500', displayValue: '$500' },
  { key: 'b200', value: 200, type: 'bill', label: 'Billete $200', displayValue: '$200' },
  { key: 'b100', value: 100, type: 'bill', label: 'Billete $100', displayValue: '$100' },
  { key: 'b50',  value: 50,  type: 'bill', label: 'Billete $50',  displayValue: '$50' },
  { key: 'b20',  value: 20,  type: 'bill', label: 'Billete $20',  displayValue: '$20' },

  // Monedas
  { key: 'c20',  value: 20,  type: 'coin', label: 'Moneda $20',  displayValue: '$20' },
  { key: 'c10',  value: 10,  type: 'coin', label: 'Moneda $10',  displayValue: '$10' },
  { key: 'c5',   value: 5,   type: 'coin', label: 'Moneda $5',   displayValue: '$5' },
  { key: 'c2',   value: 2,   type: 'coin', label: 'Moneda $2',   displayValue: '$2' },
  { key: 'c1',   value: 1,   type: 'coin', label: 'Moneda $1',   displayValue: '$1' },
  { key: 'c05',  value: 0.5, type: 'coin', label: 'Moneda $0.50', displayValue: '$0.50' },
];

/**
 * Objeto vacío de conteo de denominaciones
 */
export const EMPTY_DENOMINATIONS: CashDenominations = {
  b500: 0,
  b200: 0,
  b100: 0,
  b50: 0,
  b20: 0,
  c20: 0,
  c10: 0,
  c5: 0,
  c2: 0,
  c1: 0,
  c05: 0,
};

/**
 * Mapeo legible de categorías de movimientos de caja
 */
export const CASH_MOVEMENT_CATEGORY_LABELS: Record<CashMovementCategory, { label: string; description: string }> = {
  supplier_payment: {
    label: 'Pago a Proveedor',
    description: 'Compra de emergencia (hielos, fruta, insumos frescos)',
  },
  security_drop: {
    label: 'Retiro de Seguridad',
    description: 'Traslado de exceso de efectivo a bóveda / caja fuerte',
  },
  petty_cash: {
    label: 'Gasto Menor (Caja Chica)',
    description: 'Artículos de limpieza, papelería o consumibles de barra',
  },
  cash_replenishment: {
    label: 'Aporte de Efectivo',
    description: 'Ingreso extraordinario de capital a la gaveta',
  },
  change_fund: {
    label: 'Reposición de Cambio',
    description: 'Cambio de billetes por monedas con administración',
  },
  other: {
    label: 'Otro Concepto',
    description: 'Movimiento extraordinario con autorización gerencial',
  },
};

/**
 * Datos del establecimiento para el encabezado del Z-Report
 */
export const STORE_RECEIPT_INFO = {
  name: 'PRIME FITNESS BAR & SHAKES',
  address: 'Av. Paseo de los Atletas #450 · Club House Nivel 1',
  phone: '(55) 8900-4321',
  taxId: 'PFB-210904-XYZ',
  terminalId: 'POS-BARRA-01',
};

/**
 * Turno activo inicial con datos operativos realistas para demostración en vivo
 */
export const INITIAL_MOCK_SHIFT: CashShift = {
  id: 'shift-2026-001',
  shiftNumber: 14,
  cashierId: 'cashier-01',
  cashierName: 'Marcos Vega (Jefe de Barra)',
  terminalId: 'POS-BARRA-01',
  openedAt: new Date(Date.now() - 6.5 * 3600 * 1000).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  status: 'open',
  initialCashFloat: 350.0, // Fondo de apertura: $350.00
  notes: 'Fondo de apertura entregado en billetes de $50 y monedas variadas.',
  syncStatus: 'synced',
  lastModified: Date.now(),
};

/**
 * Movimientos extraordinarios de efectivo de prueba registrados durante el turno
 */
export const INITIAL_MOCK_MOVEMENTS: CashMovement[] = [
  {
    id: 'mov-001',
    shiftId: 'shift-2026-001',
    type: 'cash_drop',
    category: 'supplier_payment',
    amount: 65.0,
    reason: 'Compra de 3 bolsas de hielo frappé con proveedor local',
    timestamp: '11:45 AM',
    authorizedBy: 'Gerencia de Turno (R. Flores)',
    receiptNumber: 'FAC-HL-8821',
  },
  {
    id: 'mov-002',
    shiftId: 'shift-2026-001',
    type: 'cash_drop',
    category: 'security_drop',
    amount: 200.0,
    reason: 'Retiro parcial de seguridad hacia la caja fuerte por alta afluencia',
    timestamp: '02:30 PM',
    authorizedBy: 'Supervisor de Área (M. Salazar)',
    receiptNumber: 'RET-SEG-014',
  },
  {
    id: 'mov-003',
    shiftId: 'shift-2026-001',
    type: 'cash_in',
    category: 'change_fund',
    amount: 50.0,
    reason: 'Ingreso de rollo de monedas de $10 para cambio de tarde',
    timestamp: '03:15 PM',
    authorizedBy: 'Caja General (A. Gómez)',
    receiptNumber: 'ING-CAM-009',
  },
];
