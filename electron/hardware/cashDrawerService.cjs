/**
 * @file cashDrawerService.cjs
 * @description Servicio especializado para la apertura del cajón portamonedas (Cash Drawer)
 * conectado a través del puerto RJ11/RJ12 de una impresora térmica de tickets.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const { exec } = require('node:child_process');

/**
 * Pulsos ESC/POS estándares según el pin del conector RJ11:
 * - Pin 2 (estándar en la mayoría de impresoras Epson, Bixolon, Star, POS-80):
 *   ESC p 0 25 250 -> 0x1B, 0x70, 0x00, 0x19, 0xFA
 * - Pin 5 (segundo cajón o pin alterno):
 *   ESC p 1 25 250 -> 0x1B, 0x70, 0x01, 0x19, 0xFA
 */
const DRAWER_PULSES = {
  PIN_2: Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]),
  PIN_5: Buffer.from([0x1b, 0x70, 0x01, 0x19, 0xfa]),
};

/**
 * Envía el pulso de apertura a una impresora de tickets mediante red (Ethernet / WiFi RAW TCP port 9100).
 * @param {string} ip - Dirección IP de la impresora (ej. 192.168.1.200)
 * @param {number} [port=9100] - Puerto RAW de la impresora (9100 por defecto)
 * @param {'PIN_2' | 'PIN_5'} [pin='PIN_2'] - Pin RJ11 a activar
 * @returns {Promise<{ success: boolean; message: string }>}
 */
function openDrawerViaNetwork(ip, port = 9100, pin = 'PIN_2') {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const pulseBuffer = DRAWER_PULSES[pin] || DRAWER_PULSES.PIN_2;

    client.setTimeout(3000);

    client.connect(port, ip, () => {
      client.write(pulseBuffer, () => {
        client.end();
        resolve({
          success: true,
          message: `Pulso de apertura enviado exitosamente a impresora en ${ip}:${port}`,
        });
      });
    });

    client.on('error', (err) => {
      client.destroy();
      reject(new Error(`Fallo de conexión con impresora en ${ip}:${port}: ${err.message}`));
    });

    client.on('timeout', () => {
      client.destroy();
      reject(new Error(`Tiempo de espera agotado al conectar con impresora en ${ip}:${port}`));
    });
  });
}

/**
 * Envía el pulso crudo de apertura al spooler de Windows hacia una impresora local (USB / Compartida).
 * Utiliza un script de PowerShell que inyecta los bytes directamente en el spooler del sistema sin
 * necesidad de compilar dependencias C++ nativas (node-gyp).
 * 
 * @param {string} printerName - Nombre de la impresora tal como aparece en Windows (ej. "EPSON TM-T20III")
 * @param {'PIN_2' | 'PIN_5'} [pin='PIN_2'] - Pin RJ11 a activar
 * @returns {Promise<{ success: boolean; message: string }>}
 */
function openDrawerViaWindowsSpooler(printerName, pin = 'PIN_2') {
  return new Promise((resolve, reject) => {
    if (!printerName) {
      return reject(new Error('Debe especificarse el nombre de la impresora de tickets.'));
    }

    const pulseBuffer = DRAWER_PULSES[pin] || DRAWER_PULSES.PIN_2;
    const tempFilePath = path.join(os.tmpdir(), `drawer_kick_${Date.now()}.bin`);

    try {
      // Escribir los bytes binarios a un archivo temporal
      fs.writeFileSync(tempFilePath, pulseBuffer);

      // Comando de PowerShell para enviar el archivo binario directamente al Spooler de la impresora
      // En Windows, Out-Printer o copy /b hacia recurso compartido envía el byte stream crudo.
      const sanitizedPrinterName = printerName.replace(/'/g, "''");
      const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Path '${tempFilePath}' -AsByteStream -Raw | Out-Printer -Name '${sanitizedPrinterName}'"`;

      exec(psCommand, { windowsHide: true }, (error) => {
        // Limpiar archivo temporal inmediatamente
        try {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        } catch (_) {
          // Ignorar error de limpieza
        }

        if (error) {
          // Fallback con comando tradicional Windows Raw Copy si PowerShell fallase por versión de OS
          const fallbackCommand = `cmd /c copy /b "${tempFilePath}" "\\\\localhost\\${sanitizedPrinterName}"`;
          exec(fallbackCommand, { windowsHide: true }, (fallbackErr) => {
            if (fallbackErr) {
              return reject(
                new Error(
                  `No se pudo enviar el pulso al spooler de '${printerName}'. Verifique el nombre del dispositivo.`
                )
              );
            }
            resolve({
              success: true,
              message: `Cajón portamonedas abierto vía impresora '${printerName}' (Fallback Spool)`,
            });
          });
          return;
        }

        resolve({
          success: true,
          message: `Cajón portamonedas abierto vía impresora '${printerName}'`,
        });
      });
    } catch (err) {
      reject(new Error(`Error al generar secuencia de apertura: ${err.message}`));
    }
  });
}

/**
 * Método maestro para abrir el cajón de dinero.
 * Detecta si el destino es una IP de red o una impresora local de Windows.
 * 
 * @param {object} options
 * @param {string} [options.printerName] - Nombre de la impresora de tickets de caja
 * @param {string} [options.ip] - IP de la impresora si es de red
 * @param {number} [options.port=9100] - Puerto de la impresora de red
 * @param {'PIN_2' | 'PIN_5'} [options.pin='PIN_2']
 */
async function openCashDrawer(options = {}) {
  const { printerName, ip, port = 9100, pin = 'PIN_2' } = options;

  if (ip) {
    return await openDrawerViaNetwork(ip, port, pin);
  }

  if (printerName) {
    return await openDrawerViaWindowsSpooler(printerName, pin);
  }

  throw new Error('Debe proporcionar un "printerName" de Windows o una "ip" para activar el cajón.');
}

module.exports = {
  openCashDrawer,
  openDrawerViaNetwork,
  openDrawerViaWindowsSpooler,
  DRAWER_PULSES,
};
