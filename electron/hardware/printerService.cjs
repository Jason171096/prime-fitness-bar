/**
 * @file printerService.cjs
 * @description Servicio de impresión de grado comercial para POS.
 * Maneja impresión silenciosa (Silent Printing) para tickets térmicos (80mm/58mm)
 * y etiquetas adhesivas para barra/cocina, así como envío de ZPL crudo.
 */

const { BrowserWindow } = require('electron');
const net = require('node:net');

/**
 * Obtiene la lista de impresoras instaladas en el sistema operativo.
 * @param {Electron.WebContents} webContents - Contexto web activo para consultar dispositivos
 * @returns {Promise<Array<{ name: string; displayName: string; isDefault: boolean; status: number }>>}
 */
async function getAvailablePrinters(webContents) {
  if (!webContents) {
    throw new Error('WebContents no disponible para consultar impresoras.');
  }
  const printers = await webContents.getPrintersAsync();
  return printers.map((p) => ({
    name: p.name,
    displayName: p.displayName || p.name,
    isDefault: p.isDefault,
    status: p.status,
  }));
}

/**
 * Genera el template HTML estándar para un ticket de venta en papel térmico de 80mm o 58mm.
 * @param {object} data - Datos de la orden
 * @param {number} [paperWidth=80] - Ancho del papel en milímetros (80 o 58)
 * @returns {string} Código HTML listo para renderizado
 */
function generateReceiptHtml(data, paperWidth = 80) {
  const widthMm = paperWidth === 58 ? '58mm' : '80mm';
  const fontSize = paperWidth === 58 ? '10px' : '12px';

  const itemsHtml = (data.items || [])
    .map((item) => {
      const customNotes = item.customizationSummary
        ? `<div style="font-size: 0.85em; color: #444; padding-left: 6px;">${item.customizationSummary}</div>`
        : '';
      return `
        <div style="margin-bottom: 5px;">
          <div style="display: flex; justify-content: space-between; font-weight: 600;">
            <span>${item.quantity}x ${item.name}</span>
            <span>$${Number(item.price * item.quantity).toFixed(2)}</span>
          </div>
          ${customNotes}
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: ${widthMm} auto;
          margin: 0mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          width: ${widthMm};
          font-family: 'Courier New', Courier, monospace;
          font-size: ${fontSize};
          line-height: 1.25;
          color: #000;
          background: #fff;
          padding: 8px 6px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .header-title {
          font-size: 1.4em;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .grand-total {
          font-size: 1.3em;
          font-weight: 900;
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="header-title">${data.storeName || 'PRIME FITNESS BAR'}</div>
        <div>${data.storeAddress || 'Av. Principal #100 - Club House'}</div>
        <div>Tel: ${data.storePhone || '(555) 019-2834'}</div>
      </div>

      <div class="divider"></div>

      <div>
        <div><span class="bold">Orden:</span> #${data.orderNumber || '0000'}</div>
        <div><span class="bold">Fecha:</span> ${data.date || new Date().toLocaleString()}</div>
        <div><span class="bold">Cajero:</span> ${data.cashierName || 'Terminal 01'}</div>
        <div><span class="bold">Cliente:</span> ${data.customerName || 'Consumidor Final'}</div>
      </div>

      <div class="divider"></div>

      <div>${itemsHtml}</div>

      <div class="divider"></div>

      <div class="totals-row">
        <span>Subtotal:</span>
        <span>$${Number(data.subtotal || 0).toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>IVA / Tax:</span>
        <span>$${Number(data.tax || 0).toFixed(2)}</span>
      </div>
      <div class="divider"></div>
      <div class="totals-row grand-total">
        <span>TOTAL:</span>
        <span>$${Number(data.total || 0).toFixed(2)}</span>
      </div>

      <div class="divider"></div>

      <div class="totals-row">
        <span>Método de Pago:</span>
        <span class="bold" style="text-transform: uppercase;">${data.paymentMethod || 'Efectivo'}</span>
      </div>
      ${
        data.cashReceived !== undefined
          ? `
        <div class="totals-row">
          <span>Efectivo Recibido:</span>
          <span>$${Number(data.cashReceived).toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Cambio / Vuelto:</span>
          <span>$${Number(data.cashChange || 0).toFixed(2)}</span>
        </div>
      `
          : ''
      }

      <div class="divider"></div>

      <div class="text-center" style="margin-top: 8px;">
        <div class="bold">¡GRACIAS POR TU VISITA!</div>
        <div style="font-size: 0.85em; margin-top: 3px;">Nutrición de alto rendimiento</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera el template HTML estándar para una etiqueta adhesiva de vaso / barra (58mm x 40mm).
 * @param {object} data - Datos del producto y vaso
 * @returns {string} Código HTML optimizado para rollo de etiquetas
 */
function generateLabelHtml(data) {
  const extrasList = (data.extras || []).map((e) => `+ ${e}`).join('<br/>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page {
          size: 58mm 40mm;
          margin: 0mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          width: 58mm;
          height: 40mm;
          padding: 3mm 4mm;
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
          background: #fff;
          font-size: 9px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 1.5px solid #000;
          padding-bottom: 2px;
        }
        .order-badge {
          font-size: 13px;
          font-weight: 900;
        }
        .customer {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 32mm;
        }
        .product-name {
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .size-tag {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 0 4px;
          border-radius: 2px;
          font-size: 9px;
          font-weight: bold;
        }
        .details {
          font-size: 8.5px;
          line-height: 1.2;
          margin-top: 2px;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          font-size: 7.5px;
          border-top: 0.5px solid #666;
          padding-top: 1px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="order-badge">#${data.orderNumber || '00'}</span>
        <span class="customer">${data.customerName || 'CLIENTE'}</span>
      </div>

      <div>
        <div class="product-name">
          <span class="size-tag">${data.size || '24oz'}</span> ${data.productName}
        </div>
        <div class="details">
          ${data.protein ? `<div><strong>Proteína:</strong> ${data.protein} (${data.scoops || 1} sc)</div>` : ''}
          ${data.liquidBase ? `<div><strong>Base:</strong> ${data.liquidBase}</div>` : ''}
          ${extrasList ? `<div style="margin-top: 1px;">${extrasList}</div>` : ''}
          ${data.specialNotes ? `<div style="font-weight: bold; color: #b00;">* ${data.specialNotes}</div>` : ''}
        </div>
      </div>

      <div class="footer">
        <span>${data.timestamp || new Date().toLocaleTimeString()}</span>
        <span>${data.calories ? `${data.calories} kcal | ${data.proteinGrams || 0}g Pro` : 'PRIME FITNESS'}</span>
      </div>
    </body>
    </html>
  `;
}

/**
 * Ejecuta la impresión silenciosa utilizando una ventana invisible de Electron.
 * @param {string} htmlContent - Contenido HTML a renderizar
 * @param {string} [printerName] - Impresora destino (si no se especifica, usa la predeterminada)
 * @param {object} [options] - Opciones de página
 * @returns {Promise<{ success: boolean; message: string }>}
 */
function printHtmlSilently(htmlContent, printerName, options = {}) {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({
      show: false,
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    printWindow.webContents.on('did-finish-load', () => {
      const printOptions = {
        silent: true,
        printBackground: true,
        deviceName: printerName || '',
        margins: { marginType: 'none' },
        ...options,
      };

      printWindow.webContents.print(printOptions, (success, failureReason) => {
        // Destruir ventana auxiliar de forma segura
        printWindow.destroy();

        if (success) {
          resolve({
            success: true,
            message: `Documento impreso correctamente en '${printerName || 'Impresora Predeterminada'}'`,
          });
        } else {
          reject(new Error(`Error en la impresión silenciosa: ${failureReason || 'Fallo desconocido'}`));
        }
      });
    });

    printWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
      printWindow.destroy();
      reject(new Error(`Fallo al preparar el documento para impresión: ${errorDescription} (${errorCode})`));
    });
  });
}

/**
 * Imprime un ticket de venta completo.
 * @param {object} receiptData - Datos de la orden
 * @param {string} [printerName] - Nombre de la impresora de tickets
 * @param {number} [paperWidth=80] - Ancho de papel (80 o 58)
 */
async function printReceipt(receiptData, printerName, paperWidth = 80) {
  const html = generateReceiptHtml(receiptData, paperWidth);
  return await printHtmlSilently(html, printerName);
}

/**
 * Imprime una etiqueta adhesiva para producto / vaso de barra.
 * @param {object} labelData - Datos del ítem de la orden
 * @param {string} [printerName] - Nombre de la impresora de etiquetas
 */
async function printLabel(labelData, printerName) {
  const html = generateLabelHtml(labelData);
  return await printHtmlSilently(html, printerName);
}

/**
 * Envío opcional de código ZPL (Zebra Programming Language) crudo a través de socket de red (puerto 9100).
 * Ideal para impresoras de etiquetas industriales Zebra (GK420d, ZD410, etc.)
 * @param {string} zplCode - Cadena ZPL (ej. ^XA^FO50,50^A0N,36,36^FDPrimeFitness^FS^XZ)
 * @param {string} ip - Dirección IP de la impresora Zebra
 * @param {number} [port=9100]
 */
function sendRawZpl(zplCode, ip, port = 9100) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(4000);

    socket.connect(port, ip, () => {
      socket.write(zplCode, 'utf-8', () => {
        socket.end();
        resolve({ success: true, message: `Etiqueta ZPL enviada con éxito a ${ip}:${port}` });
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(new Error(`Error enviando ZPL a ${ip}:${port}: ${err.message}`));
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Tiempo agotado conectando con impresora ZPL en ${ip}:${port}`));
    });
  });
}

module.exports = {
  getAvailablePrinters,
  printReceipt,
  printLabel,
  printHtmlSilently,
  sendRawZpl,
};
