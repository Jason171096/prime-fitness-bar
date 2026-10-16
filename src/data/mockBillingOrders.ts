/**
 * @file mockBillingOrders.ts
 * @description Comandas iniciales en estado 'pending_payment' para simular
 * el flujo de caja y mostrador de cobros en PrimeFitness Bar.
 */

import type { BillingOrder } from '../types/billing';
import { MOCK_PRODUCTS } from './mockProducts';
import { SIZE_OPTIONS, LIQUID_BASES, PROTEIN_OPTIONS, EXTRA_OPTIONS } from './mockModifiers';
import { MOCK_MEMBERS } from './mockMembers';

const NOW = Date.now();

export const INITIAL_BILLING_ORDERS: BillingOrder[] = [
  {
    id: 'bill-ord-104',
    orderNumber: 104,
    source: 'pos_counter',
    orderType: 'takeaway',
    customerName: 'Carlos Mendoza Ramos',
    member: MOCK_MEMBERS[0], // Carlos (#PF-1042, balance: 84.50)
    status: 'pending_payment',
    createdAt: new Date(NOW - 130 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: NOW - 130 * 1000, // 2m 10s wait -> VERDE (<3 min)
    subtotal: 12.80,
    discount: 1.00, // Descuento Socio VIP
    tax: 0.00,
    tipAmount: 0.00,
    total: 11.80,
    cashierName: 'Marcos Vega',
    notes: 'Prioridad comanda mostrador. Agregar servilletas adicionales.',
    items: [
      {
        cartItemId: 'item-104-a',
        product: MOCK_PRODUCTS[0], // Titan Choco Peanut
        quantity: 1,
        finalPrice: 10.60,
        customization: {
          customerName: 'Carlos M.',
          size: SIZE_OPTIONS[1], // 24oz
          liquidBase: LIQUID_BASES[1], // Leche de Almendras (+0.60)
          protein: PROTEIN_OPTIONS[0], // Isolate Choco (+2.00 por 2do scoop)
          proteinScoops: 2,
          extras: [
            EXTRA_OPTIONS[0], // Creatina Creapure (+1.20)
            EXTRA_OPTIONS[4], // Crema de cacahuate (+0.90)
          ],
          specialNotes: 'Extra frío con hielo frappé picado fino',
          calculatedMacros: {
            calories: 675,
            protein: 68,
            carbs: 54,
            fat: 20,
          },
          unitPrice: 10.60,
        },
      },
      {
        cartItemId: 'item-104-b',
        product: MOCK_PRODUCTS[8] || MOCK_PRODUCTS[0], // Barrita o snack
        quantity: 1,
        finalPrice: 2.20,
      },
    ],
  },
  {
    id: 'bill-ord-105',
    orderNumber: 105,
    source: 'kiosk',
    orderType: 'dine_in',
    customerName: 'Valeria Sotomayor',
    member: MOCK_MEMBERS[1], // Valeria (#PF-2089, balance: 142.00)
    status: 'pending_payment',
    createdAt: new Date(NOW - 290 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: NOW - 290 * 1000, // 4m 50s wait -> ÁMBAR (3-7 min)
    subtotal: 11.45,
    discount: 0.00,
    tax: 0.00,
    tipAmount: 0.00,
    total: 11.45,
    cashierName: 'Quiosco Táctil #01',
    notes: 'Consumo en barra. Servir en cuenco de cerámica y cuchara de bambú.',
    items: [
      {
        cartItemId: 'item-105-a',
        product: MOCK_PRODUCTS[5], // Açaí Power Bowl
        quantity: 1,
        finalPrice: 9.70,
        customization: {
          customerName: 'Valeria S.',
          size: SIZE_OPTIONS[0], // 16oz
          liquidBase: LIQUID_BASES[1], // Almendras
          protein: PROTEIN_OPTIONS[1], // Isolate Vainilla
          proteinScoops: 1,
          extras: [
            EXTRA_OPTIONS[6], // Semillas Chía
            EXTRA_OPTIONS[9], // Miel Cruda
          ],
          specialNotes: 'Decorar con rodajas de plátano en abanico',
          calculatedMacros: {
            calories: 490,
            protein: 34,
            carbs: 62,
            fat: 12,
          },
          unitPrice: 9.70,
        },
      },
      {
        cartItemId: 'item-105-b',
        product: MOCK_PRODUCTS[10] || MOCK_PRODUCTS[1], // Bebida isotónica
        quantity: 1,
        finalPrice: 1.75,
      },
    ],
  },
  {
    id: 'bill-ord-106',
    orderNumber: 106,
    source: 'presale',
    orderType: 'takeaway',
    customerName: 'Diego Alejandro Silva',
    member: MOCK_MEMBERS[2], // Diego (#PF-3155, balance: 18.25)
    status: 'pending_payment',
    createdAt: new Date(NOW - 490 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: NOW - 490 * 1000, // 8m 10s wait -> ROJO URGENTE (>7 min)
    subtotal: 19.90,
    discount: 0.00,
    tax: 0.00,
    tipAmount: 0.00,
    total: 19.90,
    cashierName: 'Preventa Recepción',
    notes: '¡URGENTE! Cliente está saliendo del Box de CrossFit rumbo al trabajo.',
    items: [
      {
        cartItemId: 'item-106-a',
        product: MOCK_PRODUCTS[3], // Pre-workout rush
        quantity: 1,
        finalPrice: 9.90,
        customization: {
          customerName: 'Diego Silva',
          size: SIZE_OPTIONS[1], // 24oz
          liquidBase: LIQUID_BASES[5] || LIQUID_BASES[0], // Agua de Coco
          protein: PROTEIN_OPTIONS[2], // Whey Fresa
          proteinScoops: 1,
          extras: [
            EXTRA_OPTIONS[0], // Creatina
            EXTRA_OPTIONS[1], // Pre-workout booster
          ],
          specialNotes: 'Bien agitado sin grumos',
          calculatedMacros: {
            calories: 240,
            protein: 28,
            carbs: 26,
            fat: 1.2,
          },
          unitPrice: 9.90,
        },
      },
      {
        cartItemId: 'item-106-b',
        product: MOCK_PRODUCTS[1], // Wild Berry Isolate
        quantity: 1,
        finalPrice: 10.00,
        customization: {
          customerName: 'Diego Silva',
          size: SIZE_OPTIONS[1], // 24oz
          liquidBase: LIQUID_BASES[1], // Leche almendras
          protein: PROTEIN_OPTIONS[1], // Isolate vainilla
          proteinScoops: 2,
          extras: [
            EXTRA_OPTIONS[6], // Chía
          ],
          calculatedMacros: {
            calories: 395,
            protein: 56,
            carbs: 32,
            fat: 4.5,
          },
          unitPrice: 10.00,
        },
      },
    ],
  },
  {
    id: 'bill-ord-107',
    orderNumber: 107,
    source: 'mobile_app',
    orderType: 'takeaway',
    customerName: 'Andrea Morales',
    member: undefined, // Consumidor final sin membresía vinculada
    status: 'pending_payment',
    createdAt: new Date(NOW - 65 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: NOW - 65 * 1000, // 1m 05s wait -> VERDE (<3 min)
    subtotal: 7.50,
    discount: 0.00,
    tax: 0.00,
    tipAmount: 0.00,
    total: 7.50,
    cashierName: 'App PrimeBar',
    notes: 'Retiro programado en barra rápida.',
    items: [
      {
        cartItemId: 'item-107-a',
        product: MOCK_PRODUCTS[2], // Green Hulk Nitro
        quantity: 1,
        finalPrice: 7.50,
        customization: {
          customerName: 'Andrea Morales',
          size: SIZE_OPTIONS[0], // 16oz
          liquidBase: LIQUID_BASES[1], // Almendras
          protein: PROTEIN_OPTIONS[3], // Vegan Proteína
          proteinScoops: 1,
          extras: [],
          specialNotes: 'Sin endulzantes artificiales',
          calculatedMacros: {
            calories: 290,
            protein: 29,
            carbs: 34,
            fat: 3.5,
          },
          unitPrice: 7.50,
        },
      },
    ],
  },
];
