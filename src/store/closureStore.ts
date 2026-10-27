/**
 * @file closureStore.ts
 * @description Store de Zustand para la gestión del Cierre de Caja, Arqueo de Turno,
 * movimientos de efectivo (Cash Drops), auditoría de denominaciones e integración con hardware.
 */

import { create } from 'zustand';
import type {
  CashShift,
  CashDenominations,
  CashMovement,
  CashClosureReport,
  CashDenominationKey,
  CashMovementType,
  CashMovementCategory,
} from '../types/closure';
import {
  DENOMINATION_CONFIGS,
  EMPTY_DENOMINATIONS,
  INITIAL_MOCK_SHIFT,
  INITIAL_MOCK_MOVEMENTS,
  STORE_RECEIPT_INFO,
} from '../data/closureConstants';
import { usePOSStore } from './posStore';

const STORAGE_KEY_CURRENT_SHIFT = 'pf_active_cash_shift';
const STORAGE_KEY_CLOSURE_HISTORY = 'pf_cash_closures_history';
const STORAGE_KEY_DENOMINATIONS = 'pf_active_denominations';
const STORAGE_KEY_MOVEMENTS = 'pf_active_cash_movements';

// Simulación de almacenamiento local persistente (SQLite local fallback)
const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

interface ClosureStoreState {
  // Estado del Turno
  currentShift: CashShift | null;
  denominations: CashDenominations;
  movements: CashMovement[];
  closureNotes: string;
  closedReportsHistory: CashClosureReport[];
  lastGeneratedReport: CashClosureReport | null;

  // Estado de Modales
  isMovementModalOpen: boolean;
  isReceiptModalOpen: boolean;
  isConfirmCloseModalOpen: boolean;
  isOpenShiftModalOpen: boolean;

  // Acciones de Denominaciones
  setDenominationCount: (key: CashDenominationKey, count: number) => void;
  incrementDenomination: (key: CashDenominationKey, delta: number) => void;
  resetDenominations: () => void;
  autoFillExactCount: (targetExpectedCash: number) => void;

  // Acciones de Notas y Modales
  setClosureNotes: (notes: string) => void;
  setMovementModalOpen: (open: boolean) => void;
  setReceiptModalOpen: (open: boolean) => void;
  setConfirmCloseModalOpen: (open: boolean) => void;
  setOpenShiftModalOpen: (open: boolean) => void;

  // Acciones de Movimientos de Caja
  addCashMovement: (params: {
    type: CashMovementType;
    category: CashMovementCategory;
    amount: number;
    reason: string;
    authorizedBy: string;
    receiptNumber?: string;
  }) => CashMovement;
  removeCashMovement: (id: string) => void;

  // Acciones de Cierre y Apertura
  closeCurrentShift: (report: CashClosureReport) => Promise<boolean>;
  openNewShift: (initialFloat: number, cashierName?: string, notes?: string) => CashShift;
}

export const useClosureStore = create<ClosureStoreState>((set, get) => ({
  currentShift: getStoredData<CashShift | null>(STORAGE_KEY_CURRENT_SHIFT, INITIAL_MOCK_SHIFT),
  denominations: getStoredData<CashDenominations>(STORAGE_KEY_DENOMINATIONS, {
    ...EMPTY_DENOMINATIONS,
    // Valores precargados iniciales para demostración inmediata
    b500: 1,  // $500
    b200: 3,  // $600
    b100: 2,  // $200
    b50:  3,  // $150
    b20:  4,  // $80
    c10:  7,  // $70
    c5:   6,  // $30
    c2:   5,  // $10
    c1:   5,  // $5
    c05:  1,  // $0.50
  }),
  movements: getStoredData<CashMovement[]>(STORAGE_KEY_MOVEMENTS, INITIAL_MOCK_MOVEMENTS),
  closureNotes: '',
  closedReportsHistory: getStoredData<CashClosureReport[]>(STORAGE_KEY_CLOSURE_HISTORY, []),
  lastGeneratedReport: null,

  isMovementModalOpen: false,
  isReceiptModalOpen: false,
  isConfirmCloseModalOpen: false,
  isOpenShiftModalOpen: false,

  setDenominationCount: (key, count) => {
    set((state) => {
      const sanitizedCount = Math.max(0, Math.floor(count || 0));
      const updated = { ...state.denominations, [key]: sanitizedCount };
      localStorage.setItem(STORAGE_KEY_DENOMINATIONS, JSON.stringify(updated));
      return { denominations: updated };
    });
  },

  incrementDenomination: (key, delta) => {
    set((state) => {
      const current = state.denominations[key] || 0;
      const updatedCount = Math.max(0, current + delta);
      const updated = { ...state.denominations, [key]: updatedCount };
      localStorage.setItem(STORAGE_KEY_DENOMINATIONS, JSON.stringify(updated));
      return { denominations: updated };
    });
  },

  resetDenominations: () => {
    localStorage.setItem(STORAGE_KEY_DENOMINATIONS, JSON.stringify(EMPTY_DENOMINATIONS));
    set({ denominations: { ...EMPTY_DENOMINATIONS } });
    usePOSStore.getState().showToast('Conteo de efectivo reiniciado a cero', 'info');
  },

  autoFillExactCount: (targetExpectedCash: number) => {
    // Algoritmo voraz (greedy) para descomponer el efectivo esperado en denominaciones exactas
    let remaining = Math.round(targetExpectedCash * 100) / 100;
    const newCounts: CashDenominations = { ...EMPTY_DENOMINATIONS };

    for (const config of DENOMINATION_CONFIGS) {
      if (remaining >= config.value) {
        const count = Math.floor(remaining / config.value);
        newCounts[config.key] = count;
        remaining = Math.round((remaining - count * config.value) * 100) / 100;
      }
    }

    localStorage.setItem(STORAGE_KEY_DENOMINATIONS, JSON.stringify(newCounts));
    set({ denominations: newCounts });
    usePOSStore.getState().showToast('Efectivo cuadrado con exactitud para simulación', 'success');
  },

  setClosureNotes: (notes) => set({ closureNotes: notes }),

  setMovementModalOpen: (open) => set({ isMovementModalOpen: open }),
  setReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),
  setConfirmCloseModalOpen: (open) => set({ isConfirmCloseModalOpen: open }),
  setOpenShiftModalOpen: (open) => set({ isOpenShiftModalOpen: open }),

  addCashMovement: (params) => {
    const shift = get().currentShift;
    const shiftId = shift ? shift.id : 'shift-curr';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const newMovement: CashMovement = {
      id: `mov-${Date.now()}`,
      shiftId,
      type: params.type,
      category: params.category,
      amount: Math.round(params.amount * 100) / 100,
      reason: params.reason.trim(),
      timestamp: timeStr,
      authorizedBy: params.authorizedBy.trim() || 'Gerente en Turno',
      receiptNumber: params.receiptNumber?.trim() || undefined,
    };

    set((state) => {
      const updated = [newMovement, ...state.movements];
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(updated));
      return { movements: updated, isMovementModalOpen: false };
    });

    const actionText = params.type === 'cash_drop' ? 'Retiro de efectivo' : 'Entrada de efectivo';
    usePOSStore.getState().showToast(`${actionText} registrado exitosamente: $${params.amount.toFixed(2)}`, 'success');

    return newMovement;
  },

  removeCashMovement: (id) => {
    set((state) => {
      const updated = state.movements.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(updated));
      return { movements: updated };
    });
    usePOSStore.getState().showToast('Movimiento de caja eliminado', 'info');
  },

  closeCurrentShift: async (report: CashClosureReport): Promise<boolean> => {
    const current = get().currentShift;
    if (!current) {
      usePOSStore.getState().showToast('No hay ningún turno activo para cerrar', 'error');
      return false;
    }

    try {
      const closedAtFormatted = new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const updatedShift: CashShift = {
        ...current,
        status: 'closed',
        closedAt: closedAtFormatted,
        closureNotes: report.observations,
        syncStatus: 'synced',
        lastModified: Date.now(),
      };

      // 1. Simulación de bloqueo en SQLite local
      const sqlitePayload = {
        table: 'cash_shifts',
        action: 'CLOSE_AND_LOCK',
        shiftId: updatedShift.id,
        reportData: report,
        lockedAt: new Date().toISOString(),
      };
      console.info('[SQLite Local Storage] Turno cerrado y bloqueado permanentemente:', sqlitePayload);

      // 2. Encolado de sincronización con servidor central
      const syncQueueItem = {
        queueId: `sync-${Date.now()}`,
        resource: 'shift_closure',
        data: report,
        createdAt: new Date().toISOString(),
        status: 'pending_sync_ack',
      };
      console.info('[Central Sync Queue] Trabajo de sincronización encolado:', syncQueueItem);

      // 3. Persistir en el historial
      const updatedHistory = [report, ...get().closedReportsHistory];

      localStorage.setItem(STORAGE_KEY_CURRENT_SHIFT, JSON.stringify(updatedShift));
      localStorage.setItem(STORAGE_KEY_CLOSURE_HISTORY, JSON.stringify(updatedHistory));

      set({
        currentShift: updatedShift,
        closedReportsHistory: updatedHistory,
        lastGeneratedReport: report,
        isConfirmCloseModalOpen: false,
        isReceiptModalOpen: true, // Mostrar ticket final de cierre Z
      });

      usePOSStore.getState().showToast(`¡Turno #${current.shiftNumber} cerrado exitosamente!`, 'success');
      return true;
    } catch (err) {
      console.error('[Closure Store] Error cerrando turno:', err);
      usePOSStore.getState().showToast('Error al cerrar el turno en base de datos', 'error');
      return false;
    }
  },

  openNewShift: (initialFloat, cashierName, notes) => {
    const lastShiftNumber = get().currentShift?.shiftNumber || 14;
    const newShiftNumber = lastShiftNumber + 1;
    const nowStr = new Date().toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const activeCashier = cashierName || usePOSStore.getState().cashierName || 'Cajero de Turno';

    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      shiftNumber: newShiftNumber,
      cashierId: `cashier-${Date.now().toString().slice(-4)}`,
      cashierName: activeCashier,
      terminalId: STORE_RECEIPT_INFO.terminalId,
      openedAt: nowStr,
      status: 'open',
      initialCashFloat: Math.max(0, Math.round(initialFloat * 100) / 100),
      notes: notes || 'Turno iniciado en mostrador principal',
      syncStatus: 'synced',
      lastModified: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY_CURRENT_SHIFT, JSON.stringify(newShift));
    localStorage.setItem(STORAGE_KEY_DENOMINATIONS, JSON.stringify(EMPTY_DENOMINATIONS));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify([]));

    set({
      currentShift: newShift,
      denominations: { ...EMPTY_DENOMINATIONS },
      movements: [],
      closureNotes: '',
      lastGeneratedReport: null,
      isOpenShiftModalOpen: false,
      isReceiptModalOpen: false,
    });

    usePOSStore.getState().showToast(`Nuevo Turno #${newShiftNumber} abierto con fondo de $${newShift.initialCashFloat.toFixed(2)}`, 'success');
    return newShift;
  },
}));
