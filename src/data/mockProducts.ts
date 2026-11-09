/**
 * @file mockProducts.ts
 * @description Catálogo estructurado de productos y metadatos nutricionales para el sistema POS
 * de PrimeFitness Bar (Suplementos, Smoothies, Jugos Funcionales y Cocina Fit).
 */

import type {
  Category,
  MacroNutrients,
  Product,
  ProteinMeatOption,
} from '../types/pos.types';

export type { Category, MacroNutrients, Product, ProteinMeatOption };

export interface CategoryMetadata {
  id: Category;
  name: string;
  description: string;
}

export const PRODUCT_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'omelets',
    name: 'Omelets & Huevos',
    description: 'Desayunos proteicos acompañados de hash brown al air-fryer',
  },
  {
    id: 'chilaquiles',
    name: 'Chilaquiles Fit',
    description: 'Totopos horneados con proteína a elegir: Pollo o Bistec',
  },
  {
    id: 'toasts',
    name: 'Tost Variedad',
    description: 'Tostadas artesanales de masa madre y pan germinado Ezequiel',
  },
  {
    id: 'salads',
    name: 'Ensaladas Variedad',
    description: 'Bowls frescos de alta densidad nutricional y proteína magra',
  },
  {
    id: 'juices',
    name: 'Jugos Naturales',
    description: 'Prensados en frío (Cold-Pressed), detox y vasodilatadores naturales',
  },
  {
    id: 'smoothies',
    name: 'Smoothies Proteicos',
    description: 'Batidos funcionales con Whey Isolate, Matcha, Creatina y Superfoods',
  },
];

export const MOCK_PRODUCTS: Product[] = [
  // ===========================================================================
  // 1. OMELETS Y HUEVOS (Todos incluyen Hash Brown dorado)
  // ===========================================================================
  {
    id: 'prod_omelet_fit',
    name: 'Omelet Fit / Hash Brown',
    category: 'omelets',
    description:
      'Claras de huevo orgánicas rellenas de espinaca baby, champiñones portobello, pechuga de pavo 98% magra y queso panela asado. Acompañado de hash brown al air-fryer.',
    basePrice: 8.50,
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'DEFINICIÓN',
    tags: ['Definición', 'Alta Proteína', 'Bajo en Grasa', 'Hash Brown'],
    sideIncluded: 'Hash Brown',
    isCustomizable: false,
    baseMacros: {
      calories: 340,
      protein: 36,
      carbs: 24,
      fat: 9,
    },
  },
  {
    id: 'prod_omelet_fat',
    name: 'Omelet Fat / Hash Brown',
    category: 'omelets',
    description:
      '3 huevos enteros de granja rellenos de tocino ahumado crujiente, mezcla de quesos cheddar y gouda fundidos, aguacate hass y crema ácida. Acompañado de hash brown dorado.',
    basePrice: 9.20,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'BULK & KETO',
    tags: ['Hipertrofia', 'Keto Friendly', 'Energía Densa', 'Hash Brown'],
    sideIncluded: 'Hash Brown',
    isCustomizable: false,
    baseMacros: {
      calories: 640,
      protein: 34,
      carbs: 28,
      fat: 44,
    },
  },
  {
    id: 'prod_omelet_west',
    name: 'Omelet West / Hash Brown',
    category: 'omelets',
    description:
      'Omelet estilo Western de 3 huevos con jamón de pierna artesanal a la plancha, pimientos morrones tricolor, cebolla morada caramelizada y queso Monterey Jack. Incluye hash brown.',
    basePrice: 8.90,
    image: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=600&q=80',
    tags: ['Balanceado', 'Alta Proteína', 'Post-Workout', 'Hash Brown'],
    sideIncluded: 'Hash Brown',
    isCustomizable: false,
    baseMacros: {
      calories: 490,
      protein: 35,
      carbs: 27,
      fat: 26,
    },
  },
  {
    id: 'prod_huevos_al_gusto',
    name: 'Huevos al Gusto / Hash Brown',
    category: 'omelets',
    description:
      '3 huevos frescos de libre pastoreo preparados al gusto (estrellados, revueltos, divorciados o a la mexicana), servidos con hash brown crujiente y pan de masa madre.',
    basePrice: 7.50,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
    tags: ['Clásico', 'Pre-Workout', 'Hash Brown'],
    sideIncluded: 'Hash Brown',
    isCustomizable: false,
    baseMacros: {
      calories: 410,
      protein: 24,
      carbs: 30,
      fat: 21,
    },
  },
  {
    id: 'prod_desayuno_americano',
    name: 'Desayuno Americano Completo',
    category: 'omelets',
    description:
      'Plato completo de fuerza: Huevo al gusto (3 pzas), hash brown dorado, salchichas de pavo asadas a la plancha y tiras de tocino ahumado crujiente.',
    basePrice: 10.80,
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'FULL POWER',
    tags: ['Hipertrofia', 'Post-Workout', 'Alta Proteína', 'Hash Brown', 'Tocino', 'Salchichas'],
    sideIncluded: 'Hash Brown, Salchichas y Tocino',
    isCustomizable: false,
    baseMacros: {
      calories: 720,
      protein: 42,
      carbs: 32,
      fat: 46,
    },
  },

  // ===========================================================================
  // 2. CHILAQUILES (Con proteína a elegir: Pollo o Bistec)
  // ===========================================================================
  {
    id: 'prod_chilaquiles_verdes',
    name: 'Chilaquiles Verdes (Pollo o Bistec)',
    category: 'chilaquiles',
    description:
      'Totopos de maíz horneados bañados en salsa verde de tomatillo y cilantro. Con 160g de proteína a elegir (Pollo deshebrado magro o Bistec a la plancha), queso panela, cebolla morada y crema light.',
    basePrice: 9.50,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'POLLO O BISTEC',
    tags: ['Post-Workout', 'Alta Proteína', 'Pollo', 'Bistec'],
    proteinOptions: ['pollo', 'bistec'],
    isCustomizable: false,
    baseMacros: {
      calories: 540,
      protein: 42,
      carbs: 48,
      fat: 18,
    },
  },
  {
    id: 'prod_chilaquiles_rojos',
    name: 'Chilaquiles Rojos (Pollo o Bistec)',
    category: 'chilaquiles',
    description:
      'Totopos horneados en salsa roja tatemada de jitomate y guajillo suave. Coronados con 160g de proteína a elegir (Pollo a la plancha o Bistec de res), queso fresco, aguacate y crema ligera.',
    basePrice: 9.50,
    image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'POLLO O BISTEC',
    tags: ['Post-Workout', 'Carga de Glucógeno', 'Pollo', 'Bistec'],
    proteinOptions: ['pollo', 'bistec'],
    isCustomizable: false,
    baseMacros: {
      calories: 550,
      protein: 43,
      carbs: 49,
      fat: 19,
    },
  },
  {
    id: 'prod_chilaquiles_suizos',
    name: 'Chilaquiles Suizos (Pollo o Bistec)',
    category: 'chilaquiles',
    description:
      'Totopos crujientes en salsa verde cremosa gratinados al horno con queso mozzarella y manchego proteico. Con 160g de proteína a elegir (Pollo o Bistec a la plancha) y cebolla blanca.',
    basePrice: 10.40,
    image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'FAVORITO ATLETAS',
    tags: ['Hipertrofia', 'Alta Proteína', 'Gratinado', 'Pollo', 'Bistec'],
    proteinOptions: ['pollo', 'bistec'],
    isCustomizable: false,
    baseMacros: {
      calories: 650,
      protein: 48,
      carbs: 50,
      fat: 28,
    },
  },

  // ===========================================================================
  // 3. TOST VARIEDAD (Mínimo 3 opciones detalladas)
  // ===========================================================================
  {
    id: 'prod_toast_avocado_poached',
    name: 'Tost de Aguacate & Huevo Pochado',
    category: 'toasts',
    description:
      'Pan artesanal de masa madre tostado con cama de aguacate hass machacado al limón, 2 huevos orgánicos pochados, semillas de cáñamo (hemp), ajonjolí tostado y hojuelas de chile.',
    basePrice: 7.40,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'TOP TOST',
    tags: ['Grasas Saludables', 'Pre-Workout', 'Omega-3'],
    isCustomizable: false,
    baseMacros: {
      calories: 420,
      protein: 22,
      carbs: 32,
      fat: 23,
    },
  },
  {
    id: 'prod_toast_requeson_platano',
    name: 'Tost Fit de Requesón, Plátano & Miel',
    category: 'toasts',
    description:
      'Rebanada gruesa de pan Ezequiel de granos germinados con requesón alto en proteína, rodajas de plátano maduro, semillas de chía, canela ceilán y miel de abeja cruda.',
    basePrice: 6.80,
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    tags: ['Pre-Workout', 'Energía Rápida', 'Caseína'],
    isCustomizable: false,
    baseMacros: {
      calories: 380,
      protein: 24,
      carbs: 52,
      fat: 8,
    },
  },
  {
    id: 'prod_toast_peanut_berries',
    name: 'Tost Anabólico Peanut Butter & Berries',
    category: 'toasts',
    description:
      'Dúo de pan integral multigrano con crema de cacahuate 100% natural, fresas frescas, arándanos antioxidantes, nibs de cacao orgánico y espolvoreado de Whey Isolate vainilla.',
    basePrice: 7.20,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    tags: ['Hipertrofia', 'Antioxidante', 'Alta Proteína'],
    isCustomizable: false,
    baseMacros: {
      calories: 460,
      protein: 28,
      carbs: 44,
      fat: 19,
    },
  },
  {
    id: 'prod_toast_salmon_ricotta',
    name: 'Tost Proteico de Salmón Ahumado & Ricotta',
    category: 'toasts',
    description:
      'Pan de centeno tostado con queso ricotta light batido al eneldo, 100g de salmón noruego ahumado, cintas de pepino persa, alcaparras y ralladura de limón amarillo.',
    basePrice: 8.90,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'OMEGA-3',
    tags: ['Definición', 'Omega-3', 'Alta Proteína'],
    isCustomizable: false,
    baseMacros: {
      calories: 390,
      protein: 31,
      carbs: 28,
      fat: 16,
    },
  },

  // ===========================================================================
  // 4. ENSALADAS VARIEDAD (Mínimo 3 opciones detalladas)
  // ===========================================================================
  {
    id: 'prod_salad_chicken_herbs',
    name: 'Ensalada de Pollo a las Finas Hierbas',
    category: 'salads',
    description:
      '200g de pechuga de pollo grillada a las finas hierbas sobre mix de espinaca baby y lechugas orgánicas, quinoa tricolor, aguacate hass, pepino y vinagreta cítrica de oliva.',
    basePrice: 9.80,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'CLEAN BULK',
    tags: ['Definición', 'Alta Proteína', 'Post-Workout'],
    isCustomizable: false,
    baseMacros: {
      calories: 490,
      protein: 48,
      carbs: 34,
      fat: 16,
    },
  },
  {
    id: 'prod_salad_tuna_protein',
    name: 'Ensalada Verde Proteica con Atún Sellado',
    category: 'salads',
    description:
      'Medallón de atún aleta amarilla sellado en costra de ajonjolí (180g) sobre cama de arúgula, kale, edamames al vapor, aguacate, pepino persa y aderezo ponzu-jengibre.',
    basePrice: 10.90,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    popularBadge: '46g PROTEÍNA',
    tags: ['Definición', 'Omega-3', 'Bajo en Carbos'],
    isCustomizable: false,
    baseMacros: {
      calories: 460,
      protein: 46,
      carbs: 22,
      fat: 18,
    },
  },
  {
    id: 'prod_salad_vegan_tofu',
    name: 'Ensalada Verde Proteica con Tofu & Edamames',
    category: 'salads',
    description:
      '180g de tofu orgánico firme marinado a la plancha, garbanzos especiados crujientes, edamames, semillas de calabaza, kale, espinaca y aderezo cremoso de tahini al limón.',
    basePrice: 8.90,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegano', 'Plant-Based', 'Fibra Prebiótica'],
    isCustomizable: false,
    baseMacros: {
      calories: 440,
      protein: 29,
      carbs: 38,
      fat: 19,
    },
  },
  {
    id: 'prod_salad_turkey_cobb',
    name: 'Ensalada Cobb Atlética de Pavo & Huevo',
    category: 'salads',
    description:
      'Pechuga de pavo ahumada magra (160g), 2 huevos orgánicos cocidos, queso panela en cubos, aguacate hass, tomate cherry y aderezo ranch proteico de yogur griego 0%.',
    basePrice: 9.40,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
    tags: ['Definición', 'Keto Friendly', 'Alta Proteína'],
    isCustomizable: false,
    baseMacros: {
      calories: 470,
      protein: 44,
      carbs: 20,
      fat: 22,
    },
  },

  // ===========================================================================
  // 5. JUGOS VARIEDAD (Mínimo 3 opciones detalladas)
  // ===========================================================================
  {
    id: 'prod_juice_green_detox',
    name: 'Jugo Verde Detox & Clorofila',
    category: 'juices',
    description:
      'Prensado en frío con espinaca orgánica, apio, pepino, manzana verde, perejil, limón real y jengibre fresco. Alcalinizante, digestivo y libre de azúcares añadidos.',
    basePrice: 4.80,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'COLD-PRESSED',
    tags: ['Detox', 'Vegano', 'Definición', 'Alcalino'],
    isCustomizable: false,
    baseMacros: {
      calories: 95,
      protein: 3,
      carbs: 21,
      fat: 0.5,
    },
  },
  {
    id: 'prod_juice_beet_citrus',
    name: 'Jugo Antioxidante de Cítricos y Betabel',
    category: 'juices',
    description:
      'Pre-entreno natural rico en nitratos vasodilatadores: betabel fresco, naranja valencia, toronja rosa, zanahoria y cúrcuma para potenciar el flujo sanguíneo y bombeo muscular.',
    basePrice: 5.20,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'NITRIC PUMP',
    tags: ['Pre-Workout', 'Antioxidante', 'Óxido Nítrico', 'Vegano'],
    isCustomizable: false,
    baseMacros: {
      calories: 130,
      protein: 3,
      carbs: 30,
      fat: 0.4,
    },
  },
  {
    id: 'prod_juice_pineapple_ginger',
    name: 'Jugo Inmune Gold: Piña, Jengibre & Cúrcuma',
    category: 'juices',
    description:
      'Elixir antiinflamatorio articular con piña miel rica en bromelina, naranja fresca, raíz de jengibre, cúrcuma orgánica, limón y un toque de pimienta cayena.',
    basePrice: 4.90,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    tags: ['Anti-inflamatorio', 'Recuperación', 'Vitamina C', 'Vegano'],
    isCustomizable: false,
    baseMacros: {
      calories: 120,
      protein: 2,
      carbs: 28,
      fat: 0.3,
    },
  },
  {
    id: 'prod_juice_watermelon_hydrate',
    name: 'Jugo Hidratante Sandía, Fresa & Electrolitos',
    category: 'juices',
    description:
      'Jugo prensado rico en L-Citrulina natural de sandía fresca, fresas silvestres, agua de coco isotónica, hojas de menta y sal rosa del Himalaya para rehidratación celular.',
    basePrice: 5.00,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
    tags: ['Intra-Workout', 'Hidratación', 'L-Citrulina', 'Vegano'],
    isCustomizable: false,
    baseMacros: {
      calories: 110,
      protein: 2,
      carbs: 26,
      fat: 0.2,
    },
  },

  // ===========================================================================
  // 6. SMOOTHIES VARIEDAD (Mínimo 3 opciones detalladas - Personalizables en POS)
  // ===========================================================================
  {
    id: 'prod_titan_chocolate',
    name: 'Smoothie de Proteína Whey & Plátano Anabolic',
    category: 'smoothies',
    description:
      'Batido hiperproteico con Whey Isolate chocolate suizo, plátano maduro, crema de cacahuate 100% natural, avena integral y leche de almendras.',
    basePrice: 6.90,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'TOP VENTAS #1',
    tags: ['Hipertrofia', 'Post-Workout', 'Alta Proteína'],
    isCustomizable: true,
    baseMacros: {
      calories: 460,
      protein: 38,
      carbs: 48,
      fat: 14,
    },
    defaultLiquidId: 'liq_almond',
    defaultProteinId: 'prot_isolate_choco',
    defaultProteinScoops: 1,
    defaultExtras: ['ext_peanut_butter'],
  },
  {
    id: 'prod_green_hulk_nitro',
    name: 'Smoothie Verde Energizante con Espinaca y Matcha',
    category: 'smoothies',
    description:
      'Espinacas frescas orgánicas, té verde Matcha japonés grado ceremonial, plátano, piña y proteína aislada de vainilla en base de leche de almendras.',
    basePrice: 6.80,
    image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'ENERGY MATCHA',
    tags: ['Energía Limpia', 'Antioxidante', 'Definición'],
    isCustomizable: true,
    baseMacros: {
      calories: 290,
      protein: 30,
      carbs: 34,
      fat: 3.5,
    },
    defaultLiquidId: 'liq_almond',
    defaultProteinId: 'prot_isolate_vanilla',
    defaultProteinScoops: 1,
    defaultExtras: ['ext_spinach'],
  },
  {
    id: 'prod_wild_berry_isolate',
    name: 'Batido Post-Entreno con Creatina & Frutos Rojos',
    category: 'smoothies',
    description:
      'Fórmula de recuperación muscular con frutos rojos silvestres (arándanos, zarzamora, fresa), Whey Isolate, 5g de Creatina Creapure® y agua de coco.',
    basePrice: 7.20,
    image: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=600&q=80',
    popularBadge: '+5g CREATINA',
    tags: ['Post-Workout', 'Creatina', 'Recuperación', 'Definición'],
    isCustomizable: true,
    baseMacros: {
      calories: 285,
      protein: 32,
      carbs: 28,
      fat: 2.2,
    },
    defaultLiquidId: 'liq_coconut',
    defaultProteinId: 'prot_isolate_vanilla',
    defaultProteinScoops: 1,
    defaultExtras: ['ext_creatine', 'ext_chia_flax'],
  },
  {
    id: 'prod_pre_workout_rush',
    name: 'Smoothie Pre-Workout Shockwave Nitro',
    category: 'smoothies',
    description:
      'Impulso pre-entrenamiento con cafeína anhidra, beta-alanina, 5g de BCAA, fresas frescas, Whey de fresa salvaje y agua de coco isotónica.',
    basePrice: 7.40,
    image: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=600&q=80',
    popularBadge: 'PRE-WORKOUT',
    tags: ['Energía Extrema', 'Foco Mental', 'Pump Vascular'],
    isCustomizable: true,
    baseMacros: {
      calories: 225,
      protein: 28,
      carbs: 23,
      fat: 1.2,
    },
    defaultLiquidId: 'liq_coconut',
    defaultProteinId: 'prot_whey_strawberry',
    defaultProteinScoops: 1,
    defaultExtras: ['ext_preworkout', 'ext_bcaa'],
  },
  {
    id: 'prod_vegan_caramel_oats',
    name: 'Smoothie Vegano Salted Caramel, Avena & Chía',
    category: 'smoothies',
    description:
      'Batido 100% plant-based con proteína vegana de guisante y arroz sabor caramelo salado, avena integral, semillas de chía y leche de avena barista.',
    basePrice: 6.70,
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80',
    tags: ['Vegano', 'Hipertrofia', 'Carbohidratos Complejos'],
    isCustomizable: true,
    baseMacros: {
      calories: 390,
      protein: 31,
      carbs: 46,
      fat: 8.5,
    },
    defaultLiquidId: 'liq_oat',
    defaultProteinId: 'prot_vegan_salted_caramel',
    defaultProteinScoops: 1,
    defaultExtras: ['ext_oats', 'ext_chia_flax'],
  },
];

// Exportación compatible con ambos estándares de nomenclatura
export const mockProducts: Product[] = MOCK_PRODUCTS;
export default mockProducts;
