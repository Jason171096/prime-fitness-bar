export type Category = 'smoothies' | 'bowls' | 'salads' | 'snacks' | 'drinks';

export interface MacroNutrients {
  calories: number; // kcal
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
}

export interface SizeOption {
  id: '16oz' | '24oz' | '32oz';
  label: string;
  sublabel: string;
  volumeLabel: string;
  priceMultiplier: number;
  macroMultiplier: number;
}

export interface LiquidBase {
  id: string;
  name: string;
  shortName: string;
  price: number;
  macros: MacroNutrients;
  inventoryItemId: string;
  volumeMl: number;
}

export interface ProteinOption {
  id: string;
  name: string;
  flavor: string;
  type: 'whey' | 'isolate' | 'vegan' | 'collagen';
  pricePerScoop: number;
  macrosPerScoop: MacroNutrients;
  inventoryItemId: string;
  scoopGrams: number;
}

export interface ExtraOption {
  id: string;
  name: string;
  category: 'functional' | 'superfood' | 'topping' | 'energy';
  price: number;
  macros: MacroNutrients;
  inventoryItemId: string;
  servingSize: string;
  gramsDeducted: number;
  highlight?: string; // e.g. "Creapure® 100%"
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  basePrice: number;
  image: string;
  baseMacros: MacroNutrients;
  isCustomizable: boolean;
  popularBadge?: string;
  tags?: string[];
  defaultLiquidId?: string;
  defaultProteinId?: string;
  defaultProteinScoops?: number;
  defaultExtras?: string[];
}

export interface CartItemCustomization {
  customerName: string; // Nombre del cliente / vaso para la etiqueta térmica de 58mm
  size: SizeOption;
  liquidBase: LiquidBase;
  protein: ProteinOption;
  proteinScoops: number;
  extras: ExtraOption[];
  specialNotes?: string;
  calculatedMacros: MacroNutrients;
  unitPrice: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  customization?: CartItemCustomization;
  finalPrice: number;
}

export type PaymentMethod = 'cash' | 'card' | 'gym_account';

export interface GymMember {
  id: string;
  memberNumber: string;
  fullName: string;
  avatar: string;
  balance: number;
  tier: 'VIP Athlete' | 'CrossFit Pro' | 'Elite Member' | 'Basic Pass';
  lockerNumber?: string;
  lastVisit?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string;
  customerName: string;
  member?: GymMember;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  status: 'pending' | 'blending' | 'ready' | 'delivered';
  cashierName: string;
  labelPrinted: boolean;
  startTimeStamp: number;
}
