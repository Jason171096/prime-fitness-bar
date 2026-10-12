/**
 * @file main.cjs
 * @description Proceso Principal de Electron para Terminal de Punto de Venta (POS).
 * Configura la ventana principal con políticas de seguridad estrictas,
 * gestiona el ciclo de vida y expone los controladores IPC para periféricos de caja.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { getAvailablePrinters, printReceipt, printLabel } = require('./hardware/printerService.cjs');
const { openCashDrawer } = require('./hardware/cashDrawerService.cjs');

// Detección de entorno
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
const isKioskMode = process.env.POS_KIOSK === 'true';

let mainWindow = null;

/**
 * Crea la ventana principal optimizada para terminales táctiles de Punto de Venta.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'PrimeFitness POS',
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    kiosk: isKioskMode, // Modo kiosco para terminales desatendidas o exclusivas
    fullscreen: isKioskMode,
    autoHideMenuBar: true, // Ocultar barra de menú nativa para evitar distracciones en caja
    backgroundColor: '#0f172a', // Fondo idéntico al tema oscuro de la app
    show: false, // Se muestra solo cuando el contenido está listo (evita parpadeo blanco)
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, // Aislamiento de contexto estricto
      nodeIntegration: false, // Deshabilitar acceso a Node.js en el Renderer
      sandbox: true,          // Sandbox habilitado para máxima seguridad
      webSecurity: true,
      spellcheck: false,      // Desactivar corrector ortográfico innecesario en POS
    },
  });

  // Mostrar la ventana cuando haya terminado de renderizar la primera vista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Carga de contenido según el entorno
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.error(`[Electron] Error cargando URL de desarrollo (${devServerUrl}):`, err.message);
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error(`[Electron] Error cargando build de producción (${indexPath}):`, err.message);
    });
  }

  // --- POLÍTICAS DE SEGURIDAD ESTRICTAS DE NAVEGACIÓN ---
  // 1. Bloquear apertura de nuevas ventanas (target="_blank" o window.open)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`[Seguridad] Intento de apertura de ventana bloqueado: ${url}`);
    return { action: 'deny' };
  });

  // 2. Prevenir que el renderer navegue fuera de la aplicación
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (!isDev && parsedUrl.protocol !== 'file:') {
      event.preventDefault();
      console.warn(`[Seguridad] Navegación externa rechazada: ${navigationUrl}`);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// =========================================================================
// REGISTRO DE MANEJADORES IPC (Comunicaciones seguras con periféricos)
// =========================================================================

/**
 * Canal: Obtener lista de impresoras disponibles en el sistema operativo.
 */
ipcMain.handle('pos:get-printers', async () => {
  try {
    if (!mainWindow) throw new Error('Ventana principal no inicializada');
    return await getAvailablePrinters(mainWindow.webContents);
  } catch (error) {
    console.error('[IPC pos:get-printers] Error:', error.message);
    throw new Error(`Fallo al consultar impresoras: ${error.message}`);
  }
});

/**
 * Canal: Imprimir ticket de venta (Silent Printing térmico 80mm/58mm).
 */
ipcMain.handle('pos:print-receipt', async (_, payload) => {
  try {
    if (!payload || !payload.receiptData) {
      throw new Error('Faltan los datos del ticket (receiptData).');
    }
    const { receiptData, printerName, paperWidth } = payload;
    const result = await printReceipt(receiptData, printerName, paperWidth || 80);
    return result;
  } catch (error) {
    console.error('[IPC pos:print-receipt] Error:', error.message);
    return { success: false, error: error.message };
  }
});

/**
 * Canal: Imprimir etiqueta adhesiva de producto / vaso para barra/cocina.
 */
ipcMain.handle('pos:print-label', async (_, payload) => {
  try {
    if (!payload || !payload.labelData) {
      throw new Error('Faltan los datos de la etiqueta (labelData).');
    }
    const { labelData, printerName } = payload;
    const result = await printLabel(labelData, printerName);
    return result;
  } catch (error) {
    console.error('[IPC pos:print-label] Error:', error.message);
    return { success: false, error: error.message };
  }
});

/**
 * Canal: Abrir cajón de dinero portamonedas (pulso ESC/POS en puerto RJ11).
 */
ipcMain.handle('pos:open-cash-drawer', async (_, options = {}) => {
  try {
    const result = await openCashDrawer(options);
    return result;
  } catch (error) {
    console.error('[IPC pos:open-cash-drawer] Error:', error.message);
    return { success: false, error: error.message };
  }
});

// =========================================================================
// CICLO DE VIDA DE LA APLICACIÓN
// =========================================================================

// Garantizar instancia única de la aplicación en el terminal POS
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  console.warn('[Electron] Ya existe otra instancia de la aplicación ejecutándose. Cerrando...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
}

// Salir cuando todas las ventanas estén cerradas (comportamiento estándar Windows POS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
