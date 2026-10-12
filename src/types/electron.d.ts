/**
 * @file electron.d.ts
 * @description Definición global de tipos TypeScript para la API de hardware
 * expuesta en el proceso Renderer a través del script Preload (`window.posHardware`).
 */

export interface PrinterDevice {
  name: string;
  displayName: string;
  isDefault: boolean;
  status: number;
}

export interface ReceiptItemPayload {
  name: string;
  quantity: number;
  price: number;
  customizationSummary?: string;
}

export interface ReceiptDataPayload {
  orderNumber: number | string;
  date?: string;
  cashierName?: string;
  customerName?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  items: ReceiptItemPayload[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  cashChange?: number;
}

export interface LabelDataPayload {
  orderNumber: number | string;
  customerName?: string;
  productName: string;
  size?: string;
  protein?: string;
  scoops?: number;
  liquidBase?: string;
  extras?: string[];
  specialNotes?: string;
  calories?: number;
  proteinGrams?: number;
  timestamp?: string;
}

export interface HardwareResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface CashDrawerOptions {
  printerName?: string;
  ip?: string;
  port?: number;
}

export interface POSHardwareAPI {
  isElectron: boolean;
  getPrinters: () => Promise<PrinterDevice[]>;
  printReceipt: (
    receiptData: ReceiptDataPayload,
    printerName?: string,
    paperWidth?: 80 | 58
  ) => Promise<HardwareResponse>;
  printLabel: (
    labelData: LabelDataPayload,
    printerName?: string
  ) => Promise<HardwareResponse>;
  openCashDrawer: (options?: CashDrawerOptions) => Promise<HardwareResponse>;
}

declare global {
  interface Window {
    posHardware?: POSHardwareAPI;
  }
}
