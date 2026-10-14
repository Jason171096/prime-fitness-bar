import { create } from 'zustand';
import type {
  Category,
  Product,
  CartItem,
  CartItemCustomization,
  SizeOption,
  LiquidBase,
  ProteinOption,
  ExtraOption,
  MacroNutrients,
  GymMember,
  PaymentMethod,
  Order,
} from '../types/pos.types';
import { SIZE_OPTIONS, LIQUID_BASES, PROTEIN_OPTIONS, EXTRA_OPTIONS } from '../data/mockModifiers';
import { MOCK_MEMBERS } from '../data/mockMembers';
import { useInventoryStore } from './inventoryStore';
import { useKDSStore } from './kdsStore';

interface ToastInfo {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface POSState {
  // Navigation & Catalog
  activeCategory: Category;
  searchQuery: string;
  setActiveCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, custom?: CartItemCustomization) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;

  // Customization Modal
  isCustomizerOpen: boolean;
  selectedProduct: Product | null;
  customCustomerName: string;
  customSize: SizeOption;
  customLiquid: LiquidBase;
  customProtein: ProteinOption;
  customProteinScoops: number;
  customExtras: ExtraOption[];
  customSpecialNotes: string;
  editingCartItemId: string | null;

  openCustomizer: (product: Product, existingCartItem?: CartItem) => void;
  closeCustomizer: () => void;
  setCustomCustomerName: (name: string) => void;
  setCustomSize: (size: SizeOption) => void;
  setCustomLiquid: (liquid: LiquidBase) => void;
  setCustomProtein: (protein: ProteinOption) => void;
  setCustomProteinScoops: (scoops: number) => void;
  toggleCustomExtra: (extra: ExtraOption) => void;
  setCustomSpecialNotes: (notes: string) => void;
  saveCustomizationToCart: () => void;

  // Live Macros & Price Calculation
  getCurrentCustomMacros: () => MacroNutrients;
  getCurrentCustomPrice: () => number;

  // Member Management
  members: GymMember[];
  selectedMember: GymMember | null;
  memberSearchQuery: string;
  setSelectedMember: (member: GymMember | null) => void;
  setMemberSearchQuery: (q: string) => void;

  // Checkout
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  completePayment: (method: PaymentMethod, cashAmount?: number) => Order | null;

  // Label Modal
  isLabelModalOpen: boolean;
  previewLabelItem: CartItem | null;
  previewLabelOrderNumber: number;
  openLabelPreview: (item: CartItem, orderNumber?: number) => void;
  closeLabelPreview: () => void;

  // Order Success & Recent Order
  lastOrder: Order | null;
  isSuccessModalOpen: boolean;
  closeSuccessModal: () => void;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: ToastInfo['type']) => void;
  hideToast: () => void;

  // System
  currentOrderNumberCounter: number;
  cashierName: string;
}

export const usePOSStore = create<POSState>((set, get) => ({
  activeCategory: 'smoothies',
  searchQuery: '',
  cart: [],
  members: MOCK_MEMBERS,
  selectedMember: null,
  memberSearchQuery: '',

  isCustomizerOpen: false,
  selectedProduct: null,
  customCustomerName: '',
  customSize: SIZE_OPTIONS[0],
  customLiquid: LIQUID_BASES[1], // Leche de almendras default
  customProtein: PROTEIN_OPTIONS[0], // Isolate choco default
  customProteinScoops: 1,
  customExtras: [],
  customSpecialNotes: '',
  editingCartItemId: null,

  isCheckoutOpen: false,
  isLabelModalOpen: false,
  previewLabelItem: null,
  previewLabelOrderNumber: 104,

  lastOrder: null,
  isSuccessModalOpen: false,
  toast: null,

  currentOrderNumberCounter: 104,
  cashierName: 'Marcos Vega (Barra 1)',

  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 3200);
  },
  hideToast: () => set({ toast: null }),

  openCustomizer: (product: Product, existingCartItem?: CartItem) => {
    if (existingCartItem && existingCartItem.customization) {
      const c = existingCartItem.customization;
      set({
        isCustomizerOpen: true,
        selectedProduct: product,
        customCustomerName: c.customerName || '',
        customSize: c.size,
        customLiquid: c.liquidBase,
        customProtein: c.protein,
        customProteinScoops: c.proteinScoops,
        customExtras: c.extras,
        customSpecialNotes: c.specialNotes || '',
        editingCartItemId: existingCartItem.cartItemId,
      });
    } else {
      // Find defaults according to product
      const defaultLiquid =
        LIQUID_BASES.find((l) => l.id === product.defaultLiquidId) || LIQUID_BASES[1];
      const defaultProtein =
        PROTEIN_OPTIONS.find((p) => p.id === product.defaultProteinId) || PROTEIN_OPTIONS[0];
      const defaultExtras =
        EXTRA_OPTIONS.filter((e) => product.defaultExtras?.includes(e.id)) || [];

      // Default name: pre-fill with linked member if available
      const defaultMemberName = get().selectedMember?.fullName || '';

      set({
        isCustomizerOpen: true,
        selectedProduct: product,
        customCustomerName: defaultMemberName,
        customSize: SIZE_OPTIONS[0],
        customLiquid: defaultLiquid,
        customProtein: defaultProtein,
        customProteinScoops: product.defaultProteinScoops || 1,
        customExtras: defaultExtras,
        customSpecialNotes: '',
        editingCartItemId: null,
      });
    }
  },

  closeCustomizer: () => {
    set({ isCustomizerOpen: false, selectedProduct: null, customCustomerName: '', editingCartItemId: null });
  },

  setCustomCustomerName: (customCustomerName) => set({ customCustomerName }),
  setCustomSize: (customSize) => set({ customSize }),
  setCustomLiquid: (customLiquid) => set({ customLiquid }),
  setCustomProtein: (customProtein) => set({ customProtein }),
  setCustomProteinScoops: (customProteinScoops) => set({ customProteinScoops }),
  toggleCustomExtra: (extra) => {
    const current = get().customExtras;
    const exists = current.some((e) => e.id === extra.id);
    if (exists) {
      set({ customExtras: current.filter((e) => e.id !== extra.id) });
    } else {
      set({ customExtras: [...current, extra] });
    }
  },
  setCustomSpecialNotes: (customSpecialNotes) => set({ customSpecialNotes }),

  getCurrentCustomMacros: (): MacroNutrients => {
    const {
      selectedProduct,
      customSize,
      customLiquid,
      customProtein,
      customProteinScoops,
      customExtras,
    } = get();

    if (!selectedProduct) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const mult = customSize.macroMultiplier;

    // Base fruit & recipe components scaled by size
    const baseCals = Math.round(selectedProduct.baseMacros.calories * mult);
    const baseProt = Math.round(selectedProduct.baseMacros.protein * mult * 10) / 10;
    const baseCarbs = Math.round(selectedProduct.baseMacros.carbs * mult * 10) / 10;
    const baseFat = Math.round(selectedProduct.baseMacros.fat * mult * 10) / 10;

    // Liquid base macros
    const liqCals = customLiquid.macros.calories;
    const liqProt = customLiquid.macros.protein;
    const liqCarbs = customLiquid.macros.carbs;
    const liqFat = customLiquid.macros.fat;

    // Protein powder macros (per scoop)
    const protCals = customProtein.macrosPerScoop.calories * customProteinScoops;
    const protProt = customProtein.macrosPerScoop.protein * customProteinScoops;
    const protCarbs = customProtein.macrosPerScoop.carbs * customProteinScoops;
    const protFat = customProtein.macrosPerScoop.fat * customProteinScoops;

    // Extras sum
    const extrasCals = customExtras.reduce((acc, e) => acc + e.macros.calories, 0);
    const extrasProt = customExtras.reduce((acc, e) => acc + e.macros.protein, 0);
    const extrasCarbs = customExtras.reduce((acc, e) => acc + e.macros.carbs, 0);
    const extrasFat = customExtras.reduce((acc, e) => acc + e.macros.fat, 0);

    return {
      calories: Math.round(baseCals + liqCals + protCals + extrasCals),
      protein: Math.round((baseProt + liqProt + protProt + extrasProt) * 10) / 10,
      carbs: Math.round((baseCarbs + liqCarbs + protCarbs + extrasCarbs) * 10) / 10,
      fat: Math.round((baseFat + liqFat + protFat + extrasFat) * 10) / 10,
    };
  },

  getCurrentCustomPrice: (): number => {
    const {
      selectedProduct,
      customSize,
      customLiquid,
      customProtein,
      customProteinScoops,
      customExtras,
    } = get();

    if (!selectedProduct) return 0;

    // Base product multiplied by size
    let price = selectedProduct.basePrice * customSize.priceMultiplier;

    // Liquid cost
    price += customLiquid.price;

    // Protein: 1 scoop included in base smoothie; additional scoops charged
    if (customProteinScoops > 1) {
      price += (customProteinScoops - 1) * customProtein.pricePerScoop;
    }

    // Extras
    customExtras.forEach((ext) => {
      price += ext.price;
    });

    return Math.round(price * 100) / 100;
  },

  saveCustomizationToCart: () => {
    const {
      selectedProduct,
      customCustomerName,
      customSize,
      customLiquid,
      customProtein,
      customProteinScoops,
      customExtras,
      customSpecialNotes,
      editingCartItemId,
      getCurrentCustomMacros,
      getCurrentCustomPrice,
      selectedMember,
      cart,
    } = get();

    if (!selectedProduct) return;

    const finalMacros = getCurrentCustomMacros();
    const unitPrice = getCurrentCustomPrice();
    const resolvedCustomerName =
      customCustomerName.trim() ||
      (selectedMember ? selectedMember.fullName : 'Cliente');

    const customization: CartItemCustomization = {
      customerName: resolvedCustomerName,
      size: customSize,
      liquidBase: customLiquid,
      protein: customProtein,
      proteinScoops: customProteinScoops,
      extras: customExtras,
      specialNotes: customSpecialNotes.trim() || undefined,
      calculatedMacros: finalMacros,
      unitPrice,
    };

    if (editingCartItemId) {
      // Updating existing item
      const updated = cart.map((item) => {
        if (item.cartItemId === editingCartItemId) {
          return {
            ...item,
            customization,
            finalPrice: Math.round(unitPrice * item.quantity * 100) / 100,
          };
        }
        return item;
      });
      set({
        cart: updated,
        isCustomizerOpen: false,
        editingCartItemId: null,
        selectedProduct: null,
        customCustomerName: '',
      });
      get().showToast(`¡Vaso para ${resolvedCustomerName} actualizado!`, 'success');
    } else {
      // Adding new custom item
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product: selectedProduct,
        quantity: 1,
        customization,
        finalPrice: unitPrice,
      };
      set({
        cart: [...cart, newItem],
        isCustomizerOpen: false,
        editingCartItemId: null,
        selectedProduct: null,
        customCustomerName: '',
      });
      get().showToast(`${selectedProduct.name} (${resolvedCustomerName}) agregado al pedido`, 'success');
    }
  },

  addToCart: (product: Product, custom?: CartItemCustomization) => {
    // If customizable and no custom provided, open customizer directly
    if (product.isCustomizable && !custom) {
      get().openCustomizer(product);
      return;
    }

    const { cart } = get();

    // If it's a fixed product (e.g. snack or drink), group if duplicate
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && !item.customization && !custom
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].finalPrice =
        Math.round(updated[existingIndex].quantity * product.basePrice * 100) / 100;
      set({ cart: updated });
    } else {
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product,
        quantity: 1,
        customization: custom,
        finalPrice: custom ? custom.unitPrice : product.basePrice,
      };
      set({ cart: [...cart, newItem] });
    }

    get().showToast(`+1 ${product.name} añadido`, 'success');
  },

  removeFromCart: (cartItemId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId: string, delta: number) => {
    set((state) => {
      const updated = state.cart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.customization ? item.customization.unitPrice : item.product.basePrice;
            return {
              ...item,
              quantity: newQty,
              finalPrice: Math.round(newQty * unitPrice * 100) / 100,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { cart: updated };
    });
  },

  clearCart: () => {
    set({ cart: [], selectedMember: null });
  },

  setSelectedMember: (selectedMember) => set({ selectedMember }),
  setMemberSearchQuery: (memberSearchQuery) => set({ memberSearchQuery }),

  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),

  openLabelPreview: (item: CartItem, orderNumber = 104) => {
    set({
      isLabelModalOpen: true,
      previewLabelItem: item,
      previewLabelOrderNumber: orderNumber,
    });
  },
  closeLabelPreview: () => set({ isLabelModalOpen: false, previewLabelItem: null }),

  closeSuccessModal: () => set({ isSuccessModalOpen: false }),

  completePayment: (method: PaymentMethod, cashAmount?: number): Order | null => {
    const { cart, selectedMember, currentOrderNumberCounter, cashierName, members } = get();

    if (cart.length === 0) return null;

    const subtotal = cart.reduce((acc, i) => acc + i.finalPrice, 0);
    const tax = 0; // Gym Bar tax included
    const total = Math.round(subtotal * 100) / 100;

    // Check member balance if gym_account
    if (method === 'gym_account') {
      if (!selectedMember) {
        get().showToast('Debes seleccionar un socio para cobrar a su cuenta', 'error');
        return null;
      }
      if (selectedMember.balance < total) {
        get().showToast(`Saldo insuficiente (${selectedMember.balance.toFixed(2)}€ disponible)`, 'error');
        return null;
      }

      // Deduct member balance
      const updatedMembers = members.map((m) =>
        m.id === selectedMember.id ? { ...m, balance: Math.round((m.balance - total) * 100) / 100 } : m
      );
      set({
        members: updatedMembers,
        selectedMember: {
          ...selectedMember,
          balance: Math.round((selectedMember.balance - total) * 100) / 100,
        },
      });
    }

    const orderNumber = currentOrderNumberCounter;
    const now = new Date();
    const orderCreatedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let cashChange: number | undefined = undefined;
    if (method === 'cash' && cashAmount !== undefined) {
      cashChange = Math.max(0, Math.round((cashAmount - total) * 100) / 100);
    }

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: orderCreatedAt,
      customerName: selectedMember ? `${selectedMember.fullName} (#${selectedMember.memberNumber})` : 'Cliente Mostrador',
      member: selectedMember || undefined,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod: method,
      cashReceived: cashAmount,
      cashChange,
      status: 'pending',
      cashierName,
      labelPrinted: false,
      startTimeStamp: Date.now(),
    };

    // 1. Deduct Stock in inventory
    useInventoryStore.getState().deductStockForOrder(order);

    // 2. Dispatch to KDS Board
    useKDSStore.getState().addOrderToKDS(order);

    // 3. Update POS store state
    set({
      cart: [],
      currentOrderNumberCounter: orderNumber + 1,
      isCheckoutOpen: false,
      lastOrder: order,
      isSuccessModalOpen: true,
      selectedMember: null,
    });

    get().showToast(`¡Pedido #${orderNumber} cobrado y enviado al KDS!`, 'success');
    return order;
  },
}));
