export type InventoryCategory =
  | 'protein_powder'
  | 'liquid_base'
  | 'supplement'
  | 'superfood'
  | 'fruit_puree'
  | 'snack'
  | 'dairy_egg'
  | 'poultry_meat'
  | 'bakery_grains'
  | 'produce_veggies'
  | 'condiments_sauces';

export type InventoryUnit = 'g' | 'ml' | 'scoops' | 'scoop' | 'unidades' | 'pza';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  containerInfo: string; // e.g. "Bote 2.27 kg (75 scoops de 30g)"
  portionSize: number; // e.g. 30g per scoop or 250ml per serving
  portionsRemaining: number;
  costPerPortion: number;
  barcode: string;
  supplier: string;
}

export type RecipeStation =
  | 'Barra de Smoothies y Jugos'
  | 'Cocina Caliente / Plancha'
  | 'Barra Fría / Ensaladas';

export interface BOMIngredient {
  ingredientId: string;
  inventoryItemId: string;
  name: string;
  itemName: string;
  quantity: number;
  unit: InventoryUnit;
  isOptional?: boolean;
  costEstimate?: number;
}

export interface RecipeBOM {
  productId: string;
  productName: string;
  category: string;
  station: RecipeStation;
  prepTimeMinutes: number;
  ingredients: BOMIngredient[];
  baseIngredients: BOMIngredient[]; // Retrocompatibilidad para useInventoryStore
  preparationSteps: string[];
  preparationNotes: string;
  chefNotes?: string;
  allergens?: string[];
  servingSizeGrams?: number;
}
