import { create } from 'zustand';
import type { KDSOrder } from '../types/kds.types';
import type { Order } from '../types/pos.types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { SIZE_OPTIONS, LIQUID_BASES, PROTEIN_OPTIONS, EXTRA_OPTIONS } from '../data/mockModifiers';

interface KDSState {
  orders: KDSOrder[];
  filterStation: 'all' | 'blender' | 'prep_bar';
  setFilterStation: (st: 'all' | 'blender' | 'prep_bar') => void;
  addOrderToKDS: (order: Order) => void;
  advanceOrderStatus: (orderId: string) => void;
  regressOrderStatus: (orderId: string) => void;
  markLabelPrinted: (orderId: string) => void;
  tickTimers: () => void;
}

// Initial realistic active orders in KDS
const INITIAL_KDS_ORDERS: KDSOrder[] = [
  {
    id: 'kds-ord-101',
    orderNumber: 101,
    createdAt: '12:18 PM',
    customerName: 'Rodrigo Gómez (Socio #201)',
    startTimeStamp: Date.now() - 380 * 1000, // 6m 20s ago -> RED ALERT!
    elapsedSeconds: 380,
    status: 'blending',
    cashierName: 'Marcos V.',
    labelPrinted: true,
    blenderStation: 'Vitamix Pro #1 (Alta Potencia)',
    subtotal: 10.10,
    tax: 0.00,
    total: 10.10,
    paymentMethod: 'gym_account',
    items: [
      {
        cartItemId: 'item-101-a',
        product: MOCK_PRODUCTS[0], // Titan Choco Peanut
        quantity: 1,
        finalPrice: 10.10,
        customization: {
          customerName: 'Rodrigo Gómez (#1001)',
          size: SIZE_OPTIONS[1], // 24 oz
          liquidBase: LIQUID_BASES[1], // Leche de Almendras
          protein: PROTEIN_OPTIONS[0], // Isolate Choco
          proteinScoops: 2, // 2 Scoops!
          extras: [
            EXTRA_OPTIONS[0], // Creatina 5g
            EXTRA_OPTIONS[4], // Crema cacahuate
          ],
          specialNotes: '¡Extra frío con hielo triturado fino!',
          calculatedMacros: {
            calories: 640,
            protein: 65,
            carbs: 52,
            fat: 18,
          },
          unitPrice: 10.10,
        },
      },
    ],
  },
  {
    id: 'kds-ord-102',
    orderNumber: 102,
    createdAt: '12:21 PM',
    customerName: 'Valeria Sotomayor',
    startTimeStamp: Date.now() - 210 * 1000, // 3m 30s ago -> YELLOW WARNING
    elapsedSeconds: 210,
    status: 'pending',
    cashierName: 'Marcos V.',
    labelPrinted: true,
    blenderStation: 'Vitamix Pro #2',
    subtotal: 9.70,
    tax: 0.00,
    total: 9.70,
    paymentMethod: 'card',
    items: [
      {
        cartItemId: 'item-102-a',
        product: MOCK_PRODUCTS[5], // Açaí Power Bowl
        quantity: 1,
        finalPrice: 9.70,
        customization: {
          customerName: 'Valeria Sotomayor',
          size: SIZE_OPTIONS[0], // 16 oz bowl
          liquidBase: LIQUID_BASES[1], // Leche de Almendras
          protein: PROTEIN_OPTIONS[1], // Isolate Vainilla
          proteinScoops: 1,
          extras: [
            EXTRA_OPTIONS[6], // Semillas Chía
            EXTRA_OPTIONS[9], // Miel Cruda
          ],
          specialNotes: 'Montar fruta en abanico decorativo',
          calculatedMacros: {
            calories: 490,
            protein: 34,
            carbs: 62,
            fat: 12,
          },
          unitPrice: 9.70,
        },
      },
    ],
  },
  {
    id: 'kds-ord-103',
    orderNumber: 103,
    createdAt: '12:24 PM',
    customerName: 'Carlos Mendoza',
    startTimeStamp: Date.now() - 55 * 1000, // 55s ago -> GREEN NORMAL
    elapsedSeconds: 55,
    status: 'pending',
    cashierName: 'Marcos V.',
    labelPrinted: false,
    subtotal: 8.80,
    tax: 0.00,
    total: 8.80,
    paymentMethod: 'cash',
    items: [
      {
        cartItemId: 'item-103-a',
        product: MOCK_PRODUCTS[3], // Pre-workout rush
        quantity: 1,
        finalPrice: 8.80,
        customization: {
          customerName: 'Carlos Mendoza',
          size: SIZE_OPTIONS[1], // 24 oz
          liquidBase: LIQUID_BASES[5], // Agua de Coco
          protein: PROTEIN_OPTIONS[2], // Whey Fresa
          proteinScoops: 1,
          extras: [
            EXTRA_OPTIONS[0], // Creatina
            EXTRA_OPTIONS[1], // Pre-workout
          ],
          specialNotes: 'Tomar antes de entrar a sesión de Sentadillas',
          calculatedMacros: {
            calories: 225,
            protein: 26,
            carbs: 24,
            fat: 1.0,
          },
          unitPrice: 8.80,
        },
      },
    ],
  },
];

export const useKDSStore = create<KDSState>((set) => ({
  orders: INITIAL_KDS_ORDERS,
  filterStation: 'all',

  setFilterStation: (filterStation) => set({ filterStation }),

  addOrderToKDS: (order: Order) => {
    const kdsOrder: KDSOrder = {
      ...order,
      startTimeStamp: Date.now(),
      elapsedSeconds: 0,
      blenderStation: 'Licuadora Asignada',
    };
    set((state) => ({
      orders: [kdsOrder, ...state.orders],
    }));
  },

  advanceOrderStatus: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((ord) => {
        if (ord.id !== orderId) return ord;
        if (ord.status === 'pending') {
          return {
            ...ord,
            status: 'blending',
            blenderStation: 'Vitamix #1 (En Marcha)',
          };
        }
        if (ord.status === 'blending') {
          return {
            ...ord,
            status: 'ready',
          };
        }
        if (ord.status === 'ready') {
          return {
            ...ord,
            status: 'delivered',
          };
        }
        return ord;
      }),
    }));
  },

  regressOrderStatus: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((ord) => {
        if (ord.id !== orderId) return ord;
        if (ord.status === 'ready') {
          return { ...ord, status: 'blending' };
        }
        if (ord.status === 'blending') {
          return { ...ord, status: 'pending' };
        }
        return ord;
      }),
    }));
  },

  markLabelPrinted: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId ? { ...ord, labelPrinted: true } : ord
      ),
    }));
  },

  tickTimers: () => {
    set((state) => ({
      orders: state.orders.map((ord) => {
        if (ord.status === 'delivered') return ord;
        const currentElapsed = Math.floor((Date.now() - ord.startTimeStamp) / 1000);
        return {
          ...ord,
          elapsedSeconds: currentElapsed,
        };
      }),
    }));
  },
}));
