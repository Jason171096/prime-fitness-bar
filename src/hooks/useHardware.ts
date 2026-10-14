/**
 * @file useHardware.ts
 * @description Hook de React para la orquestación de periféricos de Punto de Venta:
 * - Detección automática del entorno nativo (Electron vs Navegador Web)
 * - Gestión y persistencia de impresoras (Tickets y Etiquetas)
 * - Apertura automática de cajón de dinero al cobrar en efectivo
 * - Emisión de tickets de venta térmicos (80mm) y etiquetas de vaso para cocina/barra
 */

import { useState, useEffect, useCallback } from 'react';
import type { Order, CartItem } from '../types/pos.types';
import type {
  PrinterDevice,
  ReceiptDataPayload,
  LabelDataPayload,
  HardwareResponse,
} from '../types/electron';

const STORAGE_KEY_RECEIPT_PRINTER = 'pos_printer_receipt';
const STORAGE_KEY_LABEL_PRINTER = 'pos_printer_label';

export function useHardware() {
  const isElectron = typeof window !== 'undefined' && Boolean(window.posHardware?.isElectron);

  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [selectedReceiptPrinter, setSelectedReceiptPrinterState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_RECEIPT_PRINTER) || '';
  });
  const [selectedLabelPrinter, setSelectedLabelPrinterState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LABEL_PRINTER) || '';
  });

  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [isPrintingLabel, setIsPrintingLabel] = useState(false);
  const [isOpeningDrawer, setIsOpeningDrawer] = useState(false);

  /**
   * Guarda y actualiza la impresora de tickets seleccionada
   */
  const setReceiptPrinter = useCallback((printerName: string) => {
    setSelectedReceiptPrinterState(printerName);
    localStorage.setItem(STORAGE_KEY_RECEIPT_PRINTER, printerName);
  }, []);

  /**
   * Guarda y actualiza la impresora de etiquetas seleccionada
   */
  const setLabelPrinter = useCallback((printerName: string) => {
    setSelectedLabelPrinterState(printerName);
    localStorage.setItem(STORAGE_KEY_LABEL_PRINTER, printerName);
  }, []);

  /**
   * Carga la lista de impresoras físicas desde el sistema operativo a través de Electron
   */
  const refreshPrinters = useCallback(async () => {
    if (!isElectron || !window.posHardware) {
      console.info('[Hardware Hook] Ejecutando en navegador web (modo simulador activo).');
      setPrinters([
        { name: 'EPSON TM-T20III (Simulada)', displayName: 'EPSON TM-T20III', isDefault: true, status: 0 },
        { name: 'Zebra ZD410 (Simulada)', displayName: 'Zebra ZD410', isDefault: false, status: 0 },
      ]);
      return;
    }

    try {
      setIsLoadingPrinters(true);
      const list = await window.posHardware.getPrinters();
      setPrinters(list);

      // Auto-seleccionar impresora por defecto si no hay ninguna guardada
      const defaultPrinter = list.find((p) => p.isDefault)?.name || list[0]?.name || '';
      if (!localStorage.getItem(STORAGE_KEY_RECEIPT_PRINTER) && defaultPrinter) {
        setReceiptPrinter(defaultPrinter);
      }
    } catch (err) {
      console.error('[Hardware Hook] Error al obtener impresoras:', err);
    } finally {
      setIsLoadingPrinters(false);
    }
  }, [isElectron, setReceiptPrinter]);

  useEffect(() => {
    refreshPrinters();
  }, [refreshPrinters]);

  /**
   * Envía el pulso para abrir el cajón de dinero portamonedas (RJ11).
   */
  const triggerCashDrawer = useCallback(async (): Promise<HardwareResponse> => {
    if (!isElectron || !window.posHardware) {
      console.info('[Hardware SIMULATOR] Cajón de dinero abierto (Pulso simulado).');
      return { success: true, message: 'Cajón abierto (Simulación en navegador)' };
    }

    try {
      setIsOpeningDrawer(true);
      const res = await window.posHardware.openCashDrawer({
        printerName: selectedReceiptPrinter || undefined,
      });
      return res;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[Hardware Hook] Error abriendo cajón:', errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsOpeningDrawer(false);
    }
  }, [isElectron, selectedReceiptPrinter]);

  /**
   * Imprime el ticket de venta térmico formal de una Orden de PrimeFitness.
   */
  const printOrderReceipt = useCallback(
    async (order: Order, paperWidth: 80 | 58 = 80): Promise<HardwareResponse> => {
      const payload: ReceiptDataPayload = {
        orderNumber: order.orderNumber,
        date: order.createdAt || new Date().toLocaleString(),
        cashierName: order.cashierName || 'Caja Principal',
        customerName: order.customerName || (order.member ? order.member.fullName : 'Consumidor Final'),
        items: order.items.map((cartItem) => {
          let customNotes = '';
          if (cartItem.customization) {
            const parts = [
              cartItem.customization.size?.label,
              cartItem.customization.protein?.name
                ? `${cartItem.customization.protein.name} (${cartItem.customization.proteinScoops}sc)`
                : null,
              cartItem.customization.liquidBase?.name,
              cartItem.customization.extras?.map((e) => e.name).join(', '),
            ].filter(Boolean);
            customNotes = parts.join(' · ');
          }

          return {
            name: cartItem.product.name,
            quantity: cartItem.quantity,
            price: cartItem.finalPrice,
            customizationSummary: customNotes || undefined,
          };
        }),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentMethod:
          order.paymentMethod === 'cash'
            ? 'Efectivo'
            : order.paymentMethod === 'card'
            ? 'Tarjeta / TPV'
            : 'Cuenta Socio',
        cashReceived: order.cashReceived,
        cashChange: order.cashChange,
      };

      if (!isElectron || !window.posHardware) {
        console.info('[Hardware SIMULATOR] Impresión de Ticket enviada:', payload);
        return { success: true, message: 'Ticket impreso (Simulación en navegador)' };
      }

      try {
        setIsPrintingReceipt(true);
        const res = await window.posHardware.printReceipt(
          payload,
          selectedReceiptPrinter || undefined,
          paperWidth
        );
        return res;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[Hardware Hook] Error imprimiendo ticket:', errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsPrintingReceipt(false);
      }
    },
    [isElectron, selectedReceiptPrinter]
  );

  /**
   * Imprime la etiqueta adhesiva (sticker) para el vaso de smoothie o shake.
   */
  const printCupLabel = useCallback(
    async (
      cartItem: CartItem,
      orderNumber: number | string,
      customerName?: string
    ): Promise<HardwareResponse> => {
      const payload: LabelDataPayload = {
        orderNumber,
        customerName: cartItem.customization?.customerName || customerName || 'CLIENTE',
        productName: cartItem.product.name,
        size: cartItem.customization?.size?.label,
        protein: cartItem.customization?.protein?.name,
        scoops: cartItem.customization?.proteinScoops,
        liquidBase: cartItem.customization?.liquidBase?.name,
        extras: cartItem.customization?.extras?.map((e) => e.name),
        specialNotes: cartItem.customization?.specialNotes,
        calories: cartItem.customization?.calculatedMacros?.calories || cartItem.product.baseMacros.calories,
        proteinGrams: cartItem.customization?.calculatedMacros?.protein || cartItem.product.baseMacros.protein,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (!isElectron || !window.posHardware) {
        console.info('[Hardware SIMULATOR] Impresión de Etiqueta enviada:', payload);
        return { success: true, message: 'Etiqueta emitida (Simulación en navegador)' };
      }

      try {
        setIsPrintingLabel(true);
        const res = await window.posHardware.printLabel(payload, selectedLabelPrinter || undefined);
        return res;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[Hardware Hook] Error imprimiendo etiqueta:', errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsPrintingLabel(false);
      }
    },
    [isElectron, selectedLabelPrinter]
  );

  /**
   * Orquestador de Cobro Completo (Checkout Hardware Workflow):
   * 1. Si el pago es en efectivo, expulsa el cajón portamonedas automáticamente.
   * 2. Emite el ticket de compra.
   * 3. Emite etiquetas individuales para cada vaso/alimento que requiera preparación en barra.
   */
  const processCheckoutHardware = useCallback(
    async (order: Order, options: { printReceipt?: boolean; printLabels?: boolean } = {}) => {
      const { printReceipt = true, printLabels = true } = options;

      // 1. Apertura automática del cajón si es efectivo
      if (order.paymentMethod === 'cash') {
        await triggerCashDrawer();
      }

      // 2. Impresión del ticket de venta
      if (printReceipt) {
        await printOrderReceipt(order);
      }

      // 3. Impresión de etiquetas para bebidas y preparación en cocina/barra
      if (printLabels) {
        for (const item of order.items) {
          // Imprimir etiqueta para cada unidad o artículo personalizable
          for (let i = 0; i < item.quantity; i++) {
            await printCupLabel(item, order.orderNumber, order.customerName);
          }
        }
      }
    },
    [triggerCashDrawer, printOrderReceipt, printCupLabel]
  );

  return {
    isElectron,
    printers,
    selectedReceiptPrinter,
    selectedLabelPrinter,
    setReceiptPrinter,
    setLabelPrinter,
    refreshPrinters,
    isLoadingPrinters,
    isPrintingReceipt,
    isPrintingLabel,
    isOpeningDrawer,
    triggerCashDrawer,
    printOrderReceipt,
    printCupLabel,
    processCheckoutHardware,
  };
}
