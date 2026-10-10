export type InventoryCategory = 
  | 'protein_powder' 
  | 'liquid_base' 
  | 'supplement' 
  | 'superfood' 
  | 'fruit_puree' 
  | 'snack';

export type InventoryUnit = 'g' | 'ml' | 'scoops' | 'unidades';

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

export interface BOMIngredient {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unit: InventoryUnit;
  isOptional?: boolean;
}

export interface RecipeBOM {
  productId: string;
  productName: string;
  category: string;
  baseIngredients: BOMIngredient[];
  preparationNotes: string;
  prepTimeMinutes: number;
}
