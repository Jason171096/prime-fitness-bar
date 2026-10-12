/**
 * @file preload.cjs
 * @description Script Preload de Electron que establece un puente seguro y tipado
 * entre el Proceso Principal (Node.js) y el Frontend (React / Renderer).
 * 
 * Sigue las recomendaciones de seguridad de Electron:
 * - No expone ipcRenderer directamente.
 * - Sanitiza y encapsula únicamente los métodos y parámetros requeridos.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Interfaz de Hardware expuesta de forma segura en `window.posHardware`
 */
contextBridge.exposeInMainWorld('posHardware', {
  /**
   * Indicador booleano para que el frontend detecte si está en el entorno de escritorio nativo.
   */
  isElectron: true,

  /**
   * Consulta las impresoras registradas en el sistema operativo.
   * @returns {Promise<Array<{ name: string; displayName: string; isDefault: boolean; status: number }>>}
   */
  getPrinters: () => {
    return ipcRenderer.invoke('pos:get-printers');
  },

  /**
   * Envía un ticket de venta para impresión silenciosa en papel térmico (80mm / 58mm).
   * @param {object} receiptData - Estructura de la venta (artículos, totales, cajero, etc.)
   * @param {string} [printerName] - Nombre de la impresora de tickets destino
   * @param {number} [paperWidth=80] - Ancho del rollo en milímetros (80 o 58)
   * @returns {Promise<{ success: boolean; message?: string; error?: string }>}
   */
  printReceipt: (receiptData, printerName, paperWidth = 80) => {
    if (!receiptData || typeof receiptData !== 'object') {
      return Promise.reject(new Error('Los datos del ticket (receiptData) son obligatorios.'));
    }
    return ipcRenderer.invoke('pos:print-receipt', {
      receiptData,
      printerName,
      paperWidth,
    });
  },

  /**
   * Envía una etiqueta adhesiva para vaso de barra o comanda de preparación a la impresora térmica.
   * @param {object} labelData - Datos del producto, vaso, personalizaciones y cliente
   * @param {string} [printerName] - Nombre de la impresora de etiquetas
   * @returns {Promise<{ success: boolean; message?: string; error?: string }>}
   */
  printLabel: (labelData, printerName) => {
    if (!labelData || typeof labelData !== 'object') {
      return Promise.reject(new Error('Los datos de la etiqueta (labelData) son obligatorios.'));
    }
    return ipcRenderer.invoke('pos:print-label', {
      labelData,
      printerName,
    });
  },

  /**
   * Envía el pulso eléctrico de apertura al cajón de dinero portamonedas (RJ11 vía ESC/POS).
   * @param {object} [options] - Parámetros de conexión
   * @param {string} [options.printerName] - Nombre de la impresora física a la que está conectado el cajón
   * @param {string} [options.ip] - IP de la impresora si es de red (puerto 9100)
   * @returns {Promise<{ success: boolean; message?: string; error?: string }>}
   */
  openCashDrawer: (options = {}) => {
    return ipcRenderer.invoke('pos:open-cash-drawer', options);
  },
});
