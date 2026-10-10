import { create } from 'zustand';
import type { InventoryItem, RecipeBOM } from '../types/inventory.types';
import { INITIAL_INVENTORY, RECIPES_BOM } from '../data/mockInventory';
import type { Order } from '../types/pos.types';

interface DeductionLog {
  id: string;
  orderNumber: number;
  timestamp: string;
  deductions: Array<{
    itemName: string;
    amount: number;
    unit: string;
  }>;
}

interface InventoryState {
  inventory: InventoryItem[];
  recipes: RecipeBOM[];
  deductionLogs: DeductionLog[];
  deductStockForOrder: (order: Order) => void;
  restockItem: (itemId: string, addAmount: number) => void;
  resetStock: () => void;
  getItemStockStatus: (item: InventoryItem) => 'critical' | 'warning' | 'optimal';
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: INITIAL_INVENTORY,
  recipes: RECIPES_BOM,
  deductionLogs: [
    {
      id: 'log-prev-1',
      orderNumber: 105,
      timestamp: '11:42 AM',
      deductions: [
        { itemName: 'Leche de Almendras', amount: 250, unit: 'ml' },
        { itemName: 'Whey Isolate Choco', amount: 30, unit: 'g' },
        { itemName: 'Creatina Creapure', amount: 5, unit: 'g' },
      ],
    },
  ],

  getItemStockStatus: (item: InventoryItem) => {
    const ratio = item.currentStock / item.maxCapacity;
    if (item.currentStock <= item.minThreshold || ratio < 0.20) {
      return 'critical';
    }
    if (ratio <= 0.35) {
      return 'warning';
    }
    return 'optimal';
  },

  restockItem: (itemId: string, addAmount: number) => {
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.min(item.maxCapacity, item.currentStock + addAmount);
          const newPortions = Math.floor(newStock / item.portionSize);
          return {
            ...item,
            currentStock: newStock,
            portionsRemaining: newPortions,
          };
        }
        return item;
      }),
    }));
  },

  resetStock: () => {
    set({ inventory: INITIAL_INVENTORY });
  },

  deductStockForOrder: (order: Order) => {
    const currentInventory = [...get().inventory];
    const loggedDeductions: Array<{ itemName: string; amount: number; unit: string }> = [];

    order.items.forEach((item) => {
      // 1. Check if product has a base recipe
      const recipe = get().recipes.find((r) => r.productId === item.product.id);
      if (recipe) {
        recipe.baseIngredients.forEach((ing) => {
          const totalQty = ing.quantity * item.quantity;
          const target = currentInventory.find((inv) => inv.id === ing.inventoryItemId);
          if (target) {
            target.currentStock = Math.max(0, target.currentStock - totalQty);
            target.portionsRemaining = Math.floor(target.currentStock / target.portionSize);
            loggedDeductions.push({
              itemName: target.name,
              amount: totalQty,
              unit: target.unit,
            });
          }
        });
      }

      // 2. If item had custom modifiers, deduct them specifically
      if (item.customization) {
        const { liquidBase, protein, proteinScoops, extras } = item.customization;

        // Deduct liquid if not already deducted by base recipe
        if (!recipe) {
          const liqInv = currentInventory.find((inv) => inv.id === liquidBase.inventoryItemId);
          if (liqInv) {
            const qty = liquidBase.volumeMl * item.quantity;
            liqInv.currentStock = Math.max(0, liqInv.currentStock - qty);
            liqInv.portionsRemaining = Math.floor(liqInv.currentStock / liqInv.portionSize);
            loggedDeductions.push({ itemName: liqInv.name, amount: qty, unit: liqInv.unit });
          }
        }

        // Deduct extra scoops or custom protein
        const protInv = currentInventory.find((inv) => inv.id === protein.inventoryItemId);
        if (protInv) {
          const grams = protein.scoopGrams * proteinScoops * item.quantity;
          protInv.currentStock = Math.max(0, protInv.currentStock - grams);
          protInv.portionsRemaining = Math.floor(protInv.currentStock / protInv.portionSize);
          loggedDeductions.push({ itemName: `${protInv.name} (${proteinScoops} scoops)`, amount: grams, unit: 'g' });
        }

        // Deduct each extra
        extras.forEach((ext) => {
          const extInv = currentInventory.find((inv) => inv.id === ext.inventoryItemId);
          if (extInv) {
            const grams = ext.gramsDeducted * item.quantity;
            extInv.currentStock = Math.max(0, extInv.currentStock - grams);
            extInv.portionsRemaining = Math.floor(extInv.currentStock / extInv.portionSize);
            loggedDeductions.push({ itemName: extInv.name, amount: grams, unit: extInv.unit });
          }
        });
      }

      // 3. For ready-made snacks/drinks that match inventory items directly
      if (item.product.id === 'prod_grenade_bar_oreo') {
        const snackInv = currentInventory.find((inv) => inv.id === 'inv_grenade_bars');
        if (snackInv) {
          snackInv.currentStock = Math.max(0, snackInv.currentStock - item.quantity);
          snackInv.portionsRemaining = snackInv.currentStock;
          loggedDeductions.push({ itemName: snackInv.name, amount: item.quantity, unit: 'unidades' });
        }
      }
    });

    const newLog: DeductionLog = {
      id: `log-${Date.now()}`,
      orderNumber: order.orderNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deductions: loggedDeductions,
    };

    set({
      inventory: currentInventory,
      deductionLogs: [newLog, ...get().deductionLogs.slice(0, 15)],
    });
  },
}));
