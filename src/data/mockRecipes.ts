/**
 * @file mockRecipes.ts
 * @description Catálogo Completo de Recetas, Bill of Materials (BOM) y Fichas Editoriales Visuales
 * para PrimeFitness Bar. Vinculado al 100% de los productos de mockProducts.ts.
 */

import type {
  RecipeBOM,
  BOMIngredient,
  PreparationStep,
} from '../types/inventory.types';

export type { RecipeBOM, BOMIngredient, PreparationStep };

export const DEFAULT_INGREDIENT_IMAGE =
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80';

export const DEFAULT_STEP_IMAGE =
  'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=600&q=80';

/**
 * Mapa curado de fotografías por insumo de inventario (Unsplash high-res).
 * Se utiliza tanto en la carga inicial como al añadir nuevos insumos desde el modal BOM.
 */
export const INGREDIENT_IMAGE_MAP: Record<string, string> = {
  inv_egg_whites:
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80',
  inv_whole_eggs:
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80',
  inv_baby_spinach:
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
  inv_portobello:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  inv_turkey_breast:
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80',
  inv_panela_cheese:
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80',
  inv_hash_brown:
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=400&q=80',
  inv_smoked_bacon:
    'https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=400&q=80',
  inv_cheddar_gouda:
    'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=400&q=80',
  inv_avocado_hass:
    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
  inv_light_sour_cream:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
  inv_artisan_ham:
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=400&q=80',
  inv_bell_peppers:
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80',
  inv_red_onion:
    'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=400&q=80',
  inv_monterey_jack:
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80',
  inv_sourdough_bread:
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80',
  inv_mexican_veggies:
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
  inv_table_butter:
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80',
  inv_turkey_sausage:
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
  inv_baked_totopos:
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
  inv_green_salsa:
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80',
  inv_chicken_breast:
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80',
  inv_red_salsa:
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80',
  inv_beef_steak:
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=400&q=80',
  inv_mozzarella_cheese:
    'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=400&q=80',
  inv_hemp_seeds:
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80',
  inv_sesame_seeds:
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  inv_chilli_flakes:
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  inv_ezekiel_bread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  inv_requeson_cheese:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
  inv_fresh_banana:
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
  inv_raw_honey:
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  inv_chia_seeds:
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80',
  inv_multigrain_bread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  inv_peanut_butter:
    'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&q=80',
  inv_fresh_strawberries:
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
  inv_fresh_blueberries:
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80',
  inv_cacao_nibs:
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80',
  inv_whey_iso_vanilla:
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
  inv_rye_bread:
    'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80',
  inv_smoked_salmon:
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
  inv_ricotta_light:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
  inv_persian_cucumber:
    'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80',
  inv_capers:
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  inv_mix_greens:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
  inv_quinoa_cooked:
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
  inv_cherry_tomatoes:
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80',
  inv_citrus_vinaigrette:
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
  inv_yellowfin_tuna:
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80',
  inv_fresh_kale:
    'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=400&q=80',
  inv_edamames:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  inv_ponzu_dressing:
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
  inv_organic_tofu:
    'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=400&q=80',
  inv_crispy_chickpeas:
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80',
  inv_pumpkin_seeds:
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=400&q=80',
  inv_tahini_dressing:
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
  inv_ranch_greek:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
  inv_celery:
    'https://images.unsplash.com/photo-1580391564590-aeca65c5e2d3?auto=format&fit=crop&w=400&q=80',
  inv_green_apple:
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
  inv_fresh_ginger:
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  inv_fresh_limes:
    'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=400&q=80',
  inv_raw_beet:
    'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=400&q=80',
  inv_valencia_oranges:
    'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80',
  inv_pink_grapefruit:
    'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=400&q=80',
  inv_fresh_carrots:
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
  inv_fresh_turmeric:
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
  inv_honey_pineapple:
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80',
  inv_fresh_watermelon:
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
  inv_coconut_water:
    'https://images.unsplash.com/photo-1544252890-c3e95a35197e?auto=format&fit=crop&w=400&q=80',
  inv_fresh_mint:
    'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80',
  inv_himalayan_salt:
    'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=400&q=80',
  inv_almond_milk:
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
  inv_whey_iso_choco:
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
  inv_banana_frozen:
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
  inv_oats:
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80',
  inv_ice_cubes:
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
  inv_ceremonial_matcha:
    'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=400&q=80',
  inv_frozen_berries:
    'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80',
  inv_creatine:
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
  inv_whey_strawberry:
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
  inv_preworkout:
    'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80',
  inv_bcaa:
    'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80',
  inv_oat_milk:
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
  inv_vegan_protein:
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
};

// Fotografías editoriales reutilizables por tipo de paso culinario
const STEP_PHOTOS = {
  panSear:
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
  chopping:
    'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=600&q=80',
  whiskingEggs:
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  omeletFold:
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
  airFryerCrispy:
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=600&q=80',
  platingBreakfast:
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
  grillingMeat:
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  salsaSimmer:
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  chilaquilesPlate:
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80',
  ovenGratin:
    'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
  toastingBread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  avocadoMash:
    'https://images.unsplash.com/photo-1761027101409-fa96d88349c7?auto=format&fit=crop&w=600&q=80',
  spreadingToast:
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
  salmonPlating:
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80',
  saladToss:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
  saladBowlAssembly:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  tunaSear:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  coldPressJuice:
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80',
  citrusPress:
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
  pouringJuice:
    'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
  blenderBase:
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
  matchaBlend:
    'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?auto=format&fit=crop&w=600&q=80',
  berryBlend:
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=600&q=80',
  servingSmoothie:
    'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80',
};

// Helper para instanciar ingredientes garantizando sincronía entre ingredients, baseIngredients e imagen
const createIngredient = (
  ingredientId: string,
  inventoryItemId: string,
  name: string,
  quantity: number,
  unit: BOMIngredient['unit'],
  isOptional = false,
  imageUrl?: string,
  costEstimate?: number
): BOMIngredient => ({
  ingredientId,
  inventoryItemId,
  name,
  itemName: name,
  quantity,
  unit,
  imageUrl: imageUrl || INGREDIENT_IMAGE_MAP[inventoryItemId] || DEFAULT_INGREDIENT_IMAGE,
  isOptional,
  costEstimate,
});

const createStep = (
  stepNumber: number,
  imageUrl: string,
  instruction: string
): PreparationStep => ({
  stepNumber,
  imageUrl,
  instruction,
});

export const MOCK_RECIPES: RecipeBOM[] = [
  // ===========================================================================
  // 1. OMELETS & HUEVOS AL GUSTO (COCINA CALIENTE / PLANCHA)
  // ===========================================================================
  {
    productId: 'prod_omelet_fit',
    productName: 'Omelet Fit / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 8,
    servingSizeGrams: 420,
    heroImageUrl:
      'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Esponjoso • Proteico • Ligero',
    badgeText: '¡Ideal para definición!',
    tags: ['#DesayunoFit', '#36gProteína', '#CocinaCaliente', '#340Kcal'],
    allergens: ['Huevo', 'Lácteos'],
    chefNotes:
      '340 kcal | 36g Proteína. Verificar que el queso panela quede templado en el centro sin fundirse por completo. Hash brown dorado a 200°C en air-fryer.',
    preparationNotes:
      'Sartén antiadherente a fuego bajo (160°C). Cocinar claras con tapa 3 min hasta cuajar sin dorar. Rellenar con champiñones salteados, espinaca, pavo y panela; doblar en media luna.',
    ingredients: [
      createIngredient('ing_egg_whites', 'inv_egg_whites', 'Claras de huevo pasteurizadas', 200, 'ml'),
      createIngredient('ing_baby_spinach', 'inv_baby_spinach', 'Espinaca baby fresca', 40, 'g'),
      createIngredient('ing_portobello', 'inv_portobello', 'Champiñones portobello rebanados', 50, 'g'),
      createIngredient('ing_turkey_breast', 'inv_turkey_breast', 'Pechuga de pavo 98% magra', 60, 'g'),
      createIngredient('ing_panela_cheese', 'inv_panela_cheese', 'Queso panela artesanal', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown air-fryer', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.panSear,
        'Saltea portobello y espinaca baby 90 seg con rocío de aguacate y sal marina; reserva.'
      ),
      createStep(
        2,
        STEP_PHOTOS.whiskingEggs,
        'Vierte las claras batidas en sartén a 160°C y cuece tapado 3 min hasta cuajar sin dorar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.omeletFold,
        'Rellena la mitad con pavo, vegetales y queso panela; dobla en media luna con espátula.'
      ),
      createStep(
        4,
        STEP_PHOTOS.airFryerCrispy,
        'Dora el hash brown en air-fryer a 200°C durante 6 minutos hasta lograr corteza crocante.'
      ),
      createStep(
        5,
        STEP_PHOTOS.platingBreakfast,
        'Monta en plato térmico precalentado junto al hash brown y termina con pimienta quebrada.'
      ),
    ],
  },
  {
    productId: 'prod_omelet_fat',
    productName: 'Omelet Fat / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 9,
    servingSizeGrams: 460,
    heroImageUrl:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Cremoso • Keto • Energético',
    badgeText: '¡Favorito Bulk & Keto!',
    tags: ['#KetoFriendly', '#VolumenLimpio', '#CocinaCaliente', '#640Kcal'],
    allergens: ['Huevo', 'Lácteos', 'Cerdo'],
    chefNotes:
      '640 kcal | 34g Proteína | 44g Grasas saludables. Ideal para fase de volumen pesado o dieta Cetogénica (Keto).',
    preparationNotes:
      'Batir 3 huevos enteros con globo. Plancha a 180°C para dorar tocino crujiente. Fundir cheddar-gouda dentro del omelet y coronar con aguacate fresco y crema ácida.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_smoked_bacon', 'inv_smoked_bacon', 'Tocino ahumado corte grueso', 50, 'g'),
      createIngredient('ing_cheddar_gouda', 'inv_cheddar_gouda', 'Mezcla Cheddar & Gouda', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en láminas', 60, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ácida reducida en grasa', 30, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.grillingMeat,
        'Dora el tocino en plancha a 180°C por 4 min hasta punto extra crocante; escurre y trocea.'
      ),
      createStep(
        2,
        STEP_PHOTOS.whiskingEggs,
        'Bate 3 huevos enteros con globo 30 seg y cuaja en mantequilla formando ondas tiernas.'
      ),
      createStep(
        3,
        STEP_PHOTOS.omeletFold,
        'Distribuye tocino y mezcla Cheddar-Gouda; tapa 60 seg para fundir y pliega estilo francés.'
      ),
      createStep(
        4,
        STEP_PHOTOS.airFryerCrispy,
        'Hornea el hash brown en air-fryer a 200°C por 6 min hasta obtener un dorado uniforme.'
      ),
      createStep(
        5,
        STEP_PHOTOS.platingBreakfast,
        'Corona el omelet con abanico de aguacate, crema ácida fría y acompaña con el hash brown.'
      ),
    ],
  },
  {
    productId: 'prod_omelet_west',
    productName: 'Omelet West / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 8,
    servingSizeGrams: 440,
    heroImageUrl:
      'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Colorido • Balanceado • Jugoso',
    badgeText: '¡Clásico de fuerza!',
    tags: ['#DesayunoBalanceado', '#35gProteína', '#CocinaCaliente', '#490Kcal'],
    allergens: ['Huevo', 'Lácteos', 'Cerdo'],
    chefNotes:
      '490 kcal | 35g Proteína. Corte fino en brunoise de pimientos y caramelizado rápido para mantener crocancia y dulzor natural.',
    preparationNotes:
      'Saltear pimientos morrones y cebolla morada con jamón de pierna. Rellenar 3 huevos batidos con queso Monterey Jack derretido. Acompañar con hash brown crujiente.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos de granja enteros', 3, 'pza'),
      createIngredient('ing_artisan_ham', 'inv_artisan_ham', 'Jamón artesanal de pierna', 60, 'g'),
      createIngredient('ing_bell_peppers', 'inv_bell_peppers', 'Pimientos morrones tricolor', 50, 'g'),
      createIngredient('ing_red_onion', 'inv_red_onion', 'Cebolla morada en julianas', 30, 'g'),
      createIngredient('ing_monterey_jack', 'inv_monterey_jack', 'Queso Monterey Jack rallado', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.chopping,
        'Saltea pimientos tricolor y cebolla morada a 170°C por 2 min; añade el jamón 1 min más.'
      ),
      createStep(
        2,
        STEP_PHOTOS.whiskingEggs,
        'Vierte los 3 huevos salpimentados en sartén caliente moviendo bordes hacia el centro.'
      ),
      createStep(
        3,
        STEP_PHOTOS.omeletFold,
        'Coloca el salteado Western y queso Monterey Jack al centro; realiza plegado tríptico.'
      ),
      createStep(
        4,
        STEP_PHOTOS.platingBreakfast,
        'Sirve caliente en plato amplio junto al hash brown crujiente recién salido del air-fryer.'
      ),
    ],
  },
  {
    productId: 'prod_huevos_al_gusto',
    productName: 'Huevos al Gusto / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 7,
    servingSizeGrams: 390,
    heroImageUrl:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Versátil • Artesanal • Reconfortante',
    badgeText: '¡A tu elección!',
    tags: ['#DesayunoClásico', '#PreWorkout', '#MasaMadre', '#410Kcal'],
    allergens: ['Huevo', 'Gluten', 'Lácteos'],
    chefNotes:
      '410 kcal | 24g Proteína. Verificar siempre la especificación de la comanda: Estrellados tiernos, Revueltos cremosos, Divorciados o A la Mexicana.',
    preparationNotes:
      'Preparar 3 huevos al método solicitado manteniendo yemas intactas o textura cremosa. Acompañar de rebanada de masa madre dorada a la plancha y hash brown crujiente.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
      createIngredient('ing_sourdough_bread', 'inv_sourdough_bread', 'Pan de masa madre artesanal', 1, 'pza'),
      createIngredient('ing_mexican_veggies', 'inv_mexican_veggies', 'Verduras a la mexicana', 45, 'g', true),
      createIngredient('ing_table_butter', 'inv_table_butter', 'Mantequilla artesanal', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.whiskingEggs,
        'Prepara los 3 huevos a 140°C en mantequilla según comanda: estrellados, revueltos o mexicana.'
      ),
      createStep(
        2,
        STEP_PHOTOS.toastingBread,
        'Tuesta la rebanada de masa madre en plancha hasta lograr líneas doradas y miga crujiente.'
      ),
      createStep(
        3,
        STEP_PHOTOS.platingBreakfast,
        'Emplata los huevos con el pan rústico en diagonal, el hash brown a 200°C y salsa casera.'
      ),
    ],
  },
  {
    productId: 'prod_desayuno_americano',
    productName: 'Desayuno Americano Completo',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 10,
    servingSizeGrams: 520,
    heroImageUrl:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Potente • Completo • Proteico',
    badgeText: '¡Full Power Matutino!',
    tags: ['#FullPower', '#42gProteína', '#Hipertrofia', '#720Kcal'],
    allergens: ['Huevo', 'Gluten', 'Lácteos', 'Cerdo/Pavo'],
    chefNotes:
      '720 kcal | 42g Proteína. Máxima potencia matutina. Coordinar tiempos para que salchichas, tocino, huevos y hash brown salgan humeantes al mismo instante.',
    preparationNotes:
      'Asar salchichas de pavo con marcas de grill. Tiras de tocino crujientes. 3 huevos al gusto, hash brown y pan de masa madre tostado con mantequilla.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_turkey_sausage', 'inv_turkey_sausage', 'Salchichas de pavo grilladas', 2, 'pza'),
      createIngredient('ing_smoked_bacon', 'inv_smoked_bacon', 'Tocino ahumado crujiente', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
      createIngredient('ing_sourdough_bread', 'inv_sourdough_bread', 'Pan masa madre tostado', 1, 'pza'),
      createIngredient('ing_table_butter', 'inv_table_butter', 'Mantequilla artesanal', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.grillingMeat,
        'Marca las salchichas de pavo a 180°C y dora el tocino 3-4 min hasta punto crujiente.'
      ),
      createStep(
        2,
        STEP_PHOTOS.whiskingEggs,
        'Cocina los 3 huevos al punto de ticket y unta mantequilla sobre el pan masa madre tibio.'
      ),
      createStep(
        3,
        STEP_PHOTOS.platingBreakfast,
        'Arma plato festín con huevos al centro, salchichas, tocino cruzado, hash brown y pan.'
      ),
    ],
  },

  // ===========================================================================
  // 2. CHILAQUILES FIT (COCINA CALIENTE / PLANCHA)
  // ===========================================================================
  {
    productId: 'prod_chilaquiles_verdes',
    productName: 'Chilaquiles Verdes (Pollo o Bistec)',
    category: 'chilaquiles',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 7,
    servingSizeGrams: 480,
    heroImageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Crocante • Tatemado • Proteico',
    badgeText: '¡Top Post-Entreno!',
    tags: ['#ChilaquilesFit', '#42gProteína', '#Horneados', '#540Kcal'],
    allergens: ['Lácteos'],
    chefNotes:
      '540 kcal | 42g Proteína. Los totopos horneados deben envolverse en salsa hirviendo solo 30-40 seg para preservar textura crocante y evitar que se ablanden.',
    preparationNotes:
      'Reducir salsa verde de tomatillo con cilantro a 85°C. Sellar 160g de proteína (pollo o bistec). Bañar totopos horneados, montar con proteína, panela, crema light, cebolla y aguacate.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz', 100, 'g'),
      createIngredient('ing_green_salsa', 'inv_green_salsa', 'Salsa verde de tomatillo', 180, 'ml'),
      createIngredient('ing_protein_choice', 'inv_chicken_breast', 'Pollo o Bistec magro', 160, 'g'),
      createIngredient('ing_panela_cheese', 'inv_panela_cheese', 'Queso panela desmoronado', 40, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ácida light', 25, 'ml'),
      createIngredient('ing_red_onion', 'inv_red_onion', 'Aros de cebolla morada', 20, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass fresco', 40, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.grillingMeat,
        'Sella 160g de pollo o bistec en plancha a 200°C y hierve la salsa verde a 85°C en sartén.'
      ),
      createStep(
        2,
        STEP_PHOTOS.salsaSimmer,
        'Saltea los totopos horneados en la salsa hirviendo por 35 seg para impregnar sin ablandar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.chilaquilesPlate,
        'Sirve en plato hondo, corona con la proteína, crema light, panela, cebolla y aguacate.'
      ),
    ],
  },
  {
    productId: 'prod_chilaquiles_rojos',
    productName: 'Chilaquiles Rojos (Pollo o Bistec)',
    category: 'chilaquiles',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 7,
    servingSizeGrams: 485,
    heroImageUrl:
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Ahumado • Crujiente • Recuperador',
    badgeText: '¡Recarga de glucógeno!',
    tags: ['#GuajilloFit', '#43gProteína', '#PostWorkout', '#550Kcal'],
    allergens: ['Lácteos'],
    chefNotes:
      '550 kcal | 43g Proteína. Salsa roja tatemada con notas ahumadas de guajillo. Carga de glucógeno y aminoácidos óptima para recuperación post-workout.',
    preparationNotes:
      'Hervir salsa roja de jitomate y guajillo. Asar a fuego vivo 160g de bistec o pechuga de pollo. Envolver totopos 30 seg, servir con queso fresco, crema ligera y aguacate.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz', 100, 'g'),
      createIngredient('ing_red_salsa', 'inv_red_salsa', 'Salsa roja de guajillo', 180, 'ml'),
      createIngredient('ing_protein_choice_red', 'inv_beef_steak', 'Bistec de res o Pollo', 160, 'g'),
      createIngredient('ing_fresh_cheese', 'inv_panela_cheese', 'Queso fresco desmoronado', 40, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ligera baja en grasa', 25, 'ml'),
      createIngredient('ing_white_onion', 'inv_red_onion', 'Cebolla en plumilla fina', 20, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en abanico', 40, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.grillingMeat,
        'Asa 160g de bistec o pollo en plancha a 200°C con sal en grano y pimienta negra.'
      ),
      createStep(
        2,
        STEP_PHOTOS.salsaSimmer,
        'Hierve la salsa roja tatemada y envuelve los totopos horneados durante 30 seg exactos.'
      ),
      createStep(
        3,
        STEP_PHOTOS.chilaquilesPlate,
        'Monta en bowl cerámico con la proteína encima, hilos de crema, queso, cebolla y aguacate.'
      ),
    ],
  },
  {
    productId: 'prod_chilaquiles_suizos',
    productName: 'Chilaquiles Suizos (Pollo o Bistec)',
    category: 'chilaquiles',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 9,
    servingSizeGrams: 510,
    heroImageUrl:
      'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Gratinado • Cremoso • Intenso',
    badgeText: '¡Favorito de Atletas!',
    tags: ['#SuizosFit', '#48gProteína', '#Gratinado', '#650Kcal'],
    allergens: ['Lácteos'],
    chefNotes:
      '650 kcal | 48g Proteína. Gratinado en salamandra a 230°C. Servir siempre en plato base protector térmico y alertar al personal de sala sobre plato caliente.',
    preparationNotes:
      'Totopos horneados en salsa verde cremosa suiza con 160g de proteína. Cubrir con 60g de mozzarella y manchego proteico y gratinar en salamandra 3 min hasta dorar.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz', 100, 'g'),
      createIngredient('ing_swiss_salsa', 'inv_green_salsa', 'Salsa verde cremosa suiza', 200, 'ml'),
      createIngredient('ing_protein_choice_swiss', 'inv_chicken_breast', 'Pollo o Bistec a la plancha', 160, 'g'),
      createIngredient('ing_mozzarella_manchego', 'inv_mozzarella_cheese', 'Mozzarella & manchego fit', 60, 'g'),
      createIngredient('ing_white_onion', 'inv_red_onion', 'Cebolla blanca brunoise', 20, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.salsaSimmer,
        'Mezcla totopos con la salsa suiza cremosa en plato refractario e integra los 160g de proteína.'
      ),
      createStep(
        2,
        STEP_PHOTOS.ovenGratin,
        'Cubre con 60g de mozzarella-manchego y gratina en salamandra a 230°C por 3 min hasta dorar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.chilaquilesPlate,
        'Retira con guante térmico sobre plato base y corona con cebolla picada y cilantro fresco.'
      ),
    ],
  },

  // ===========================================================================
  // 3. TOST VARIEDAD (BARRA FRÍA / ENSALADAS)
  // ===========================================================================
  {
    productId: 'prod_toast_avocado_poached',
    productName: 'Tost de Aguacate & Huevo Pochado',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 5,
    servingSizeGrams: 280,
    heroImageUrl:
      'https://images.unsplash.com/photo-1761027101409-fa96d88349c7?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Crujiente • Cremoso • Fresco',
    badgeText: '¡Top Ventas Mañanas!',
    tags: ['#AvocadoToast', '#MasaMadre', '#Omega3', '#420Kcal'],
    allergens: ['Huevo', 'Gluten', 'Sésamo'],
    chefNotes:
      '420 kcal | 22g Proteína | 23g Grasas saludables. El huevo pochado debe presentar yema líquida sedosa que napa el aguacate al primer corte. Control estricto de agua a 85°C.',
    preparationNotes:
      'Tostar pan de masa madre. Pochar 2 huevos orgánicos en agua a 85°C por 3:15 min. Untar aguacate machacado al limón, montar huevos y coronar con semillas de cáñamo, ajonjolí y chilli flakes.',
    ingredients: [
      createIngredient('ing_sourdough_slice', 'inv_sourdough_bread', 'Pan de masa madre grueso', 70, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass machacado', 100, 'g'),
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos orgánicos pochados', 2, 'pza'),
      createIngredient('ing_hemp_seeds', 'inv_hemp_seeds', 'Semillas de cáñamo (hemp)', 10, 'g'),
      createIngredient('ing_sesame_seeds', 'inv_sesame_seeds', 'Ajonjolí tostado mixto', 5, 'g'),
      createIngredient('ing_chilli_flakes', 'inv_chilli_flakes', 'Hojuelas de chile quebrado', 2, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.toastingBread,
        'Tuesta la rebanada de masa madre en nivel 4 hasta lograr corteza crocante y miga tibia.'
      ),
      createStep(
        2,
        STEP_PHOTOS.avocadoMash,
        'Pocha 2 huevos en agua a 85°C por 3:15 min; machaca el aguacate con limón y sal de mar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.spreadingToast,
        'Unta el aguacate, coloca los huevos escurridos y corona con hemp, ajonjolí y chilli flakes.'
      ),
    ],
  },
  {
    productId: 'prod_toast_requeson_platano',
    productName: 'Tost Fit de Requesón, Plátano & Miel',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 4,
    servingSizeGrams: 270,
    heroImageUrl:
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Dulce • Ligero • Energético',
    badgeText: '¡Ideal Pre-Entreno!',
    tags: ['#PreWorkout', '#PanEzequiel', '#EnergíaLimpia', '#380Kcal'],
    allergens: ['Gluten', 'Lácteos'],
    chefNotes:
      '380 kcal | 24g Proteína | 52g Carbohidratos limpios. Combinación ideal de caseína de lenta digestión y fructosa natural para recarga muscular pre-entreno.',
    preparationNotes:
      'Tostar pan Ezequiel germinado. Extender 100g de requesón magro batido con canela. Cubrir con rodajas de plátano en escama, hilo de miel cruda y semillas de chía.',
    ingredients: [
      createIngredient('ing_ezekiel_slice', 'inv_ezekiel_bread', 'Pan germinado Ezequiel', 2, 'pza'),
      createIngredient('ing_requeson_cheese', 'inv_requeson_cheese', 'Requesón magro artesanal', 100, 'g'),
      createIngredient('ing_fresh_banana', 'inv_fresh_banana', 'Plátano maduro en rodajas', 80, 'g'),
      createIngredient('ing_raw_honey', 'inv_raw_honey', 'Miel pura de abeja cruda', 15, 'ml'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 8, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.toastingBread,
        'Tuesta las 2 rebanadas de pan germinado Ezequiel y bate el requesón con canela ceilán.'
      ),
      createStep(
        2,
        STEP_PHOTOS.spreadingToast,
        'Unta 50g de requesón en cada pan y acomoda las rodajas de plátano solapadas en escamas.'
      ),
      createStep(
        3,
        STEP_PHOTOS.platingBreakfast,
        'Rocía hilo continuo de miel cruda de azahar y termina con lluvia de semillas de chía.'
      ),
    ],
  },
  {
    productId: 'prod_toast_peanut_berries',
    productName: 'Tost Anabólico Peanut Butter & Berries',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 4,
    servingSizeGrams: 280,
    heroImageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Antioxidante • Proteico • Crocante',
    badgeText: '¡Boost Hipertrofia!',
    tags: ['#PeanutButter', '#Berries', '#28gProteína', '#460Kcal'],
    allergens: ['Cacahuate', 'Gluten', 'Lácteos'],
    chefNotes:
      '460 kcal | 28g Proteína | Alta densidad energética y polifenoles antioxidantes para recuperación muscular en fases de hipertrofia.',
    preparationNotes:
      'Tostar pan integral multigrano. Untar crema de cacahuate 100% natural templada. Tamizar Whey Isolate vainilla, acomodar fresas y arándanos frescos, y cacao nibs.',
    ingredients: [
      createIngredient('ing_multigrain_slice', 'inv_multigrain_bread', 'Pan integral multigrano', 2, 'pza'),
      createIngredient('ing_peanut_butter', 'inv_peanut_butter', 'Crema de cacahuate natural', 50, 'g'),
      createIngredient('ing_fresh_strawberries', 'inv_fresh_strawberries', 'Fresas frescas fileteadas', 60, 'g'),
      createIngredient('ing_fresh_blueberries', 'inv_fresh_blueberries', 'Arándanos azules frescos', 30, 'g'),
      createIngredient('ing_cacao_nibs', 'inv_cacao_nibs', 'Nibs de cacao orgánico', 10, 'g'),
      createIngredient('ing_whey_vanilla_dust', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla', 10, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.toastingBread,
        'Tuesta el pan multigrano hasta lograr firmeza crocante y unta la crema de cacahuate tibia.'
      ),
      createStep(
        2,
        STEP_PHOTOS.spreadingToast,
        'Tamiza 10g de Whey Isolate vainilla sobre la crema de maní para integrarla suavemente.'
      ),
      createStep(
        3,
        STEP_PHOTOS.platingBreakfast,
        'Decora en líneas alternadas de fresas y arándanos frescos; espolvorea cacao nibs.'
      ),
    ],
  },
  {
    productId: 'prod_toast_salmon_ricotta',
    productName: 'Tost Proteico de Salmón Ahumado & Ricotta',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 5,
    servingSizeGrams: 290,
    heroImageUrl:
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Delicado • Cítrico • Omega-3',
    badgeText: '¡Rico en Omega-3!',
    tags: ['#SalmónNoruego', '#Omega3', '#31gProteína', '#390Kcal'],
    allergens: ['Pescado', 'Lácteos', 'Gluten'],
    chefNotes:
      '390 kcal | 31g Proteína | Ácidos grasos Omega-3 EPA y DHA de alto valor biológico. Mantener salmón ahumado a 3°C hasta el montaje.',
    preparationNotes:
      'Tostar pan de centeno oscuro. Batir queso ricotta light con eneldo y ralladura de limón amarillo. Colocar cintas de pepino persa, 100g de salmón noruego en rosas, alcaparras y pimienta rosa.',
    ingredients: [
      createIngredient('ing_rye_slice', 'inv_rye_bread', 'Pan artesanal de centeno', 70, 'g'),
      createIngredient('ing_smoked_salmon', 'inv_smoked_salmon', 'Salmón noruego ahumado', 100, 'g'),
      createIngredient('ing_ricotta_light', 'inv_ricotta_light', 'Ricotta light al eneldo', 70, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Cintas de pepino persa', 40, 'g'),
      createIngredient('ing_capers', 'inv_capers', 'Alcaparras baby escurridas', 10, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.toastingBread,
        'Tuesta el pan de centeno y bate la ricotta light con eneldo fresco y ralladura de limón.'
      ),
      createStep(
        2,
        STEP_PHOTOS.spreadingToast,
        'Unta la ricotta cítrica sobre el pan tibio y acomoda las láminas onduladas de pepino persa.'
      ),
      createStep(
        3,
        STEP_PHOTOS.salmonPlating,
        'Forma rosas con los 100g de salmón frío y salpica con alcaparras y pimienta rosa.'
      ),
    ],
  },

  // ===========================================================================
  // 4. ENSALADAS VARIEDAD (BARRA FRÍA / ENSALADAS)
  // ===========================================================================
  {
    productId: 'prod_salad_chicken_herbs',
    productName: 'Ensalada de Pollo a las Finas Hierbas',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 7,
    servingSizeGrams: 490,
    heroImageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Fresco • Magro • Aromático',
    badgeText: '¡Clean Bulk 48g Prot!',
    tags: ['#CleanBulk', '#48gProteína', '#QuinoaFit', '#490Kcal'],
    allergens: [],
    chefNotes:
      '490 kcal | 48g Proteína magra. Pechuga sellada al dente (74°C interna) cortada en fajitas calientes sobre la base fría de hojas orgánicas.',
    preparationNotes:
      'Sellar 200g de pechuga marinada a las hierbas en plancha (190°C). Laquear mix de lechugas y espinaca con mitad de vinagreta. Disponer quinoa, aguacate, pepino y pollo recién rebanado.',
    ingredients: [
      createIngredient('ing_chicken_breast', 'inv_chicken_breast', 'Pechuga de pollo a las hierbas', 200, 'g'),
      createIngredient('ing_mix_greens', 'inv_mix_greens', 'Mix espinaca y lechugas', 120, 'g'),
      createIngredient('ing_quinoa_cooked', 'inv_quinoa_cooked', 'Quinoa tricolor cocida', 60, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en cubos', 50, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Pepino persa en rodajas', 50, 'g'),
      createIngredient('ing_cherry_tomatoes', 'inv_cherry_tomatoes', 'Tomates cherry en mitades', 40, 'g'),
      createIngredient('ing_citrus_vinaigrette', 'inv_citrus_vinaigrette', 'Vinagreta cítrica de oliva', 30, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.grillingMeat,
        'Asa la pechuga a 190°C por 3 min por lado (74°C interna); reposa 2 min y corta en fajitas.'
      ),
      createStep(
        2,
        STEP_PHOTOS.saladToss,
        'Laquea las hojas verdes con 15ml de vinagreta cítrica y acomoda quinoa, cherry y pepino.'
      ),
      createStep(
        3,
        STEP_PHOTOS.saladBowlAssembly,
        'Corona el bowl con el aguacate y las fajitas tibias de pollo; sirve vinagreta restante aparte.'
      ),
    ],
  },
  {
    productId: 'prod_salad_tuna_protein',
    productName: 'Ensalada Verde Proteica con Atún Sellado',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 6,
    servingSizeGrams: 460,
    heroImageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Sellado • Ligero • Low-Carb',
    badgeText: '¡46g Proteína Pura!',
    tags: ['#AtúnTataki', '#LowCarb', '#Definición', '#460Kcal'],
    allergens: ['Pescado', 'Sésamo', 'Soya'],
    chefNotes:
      '460 kcal | 46g Proteína | Bajo en carbohidratos. Atún en término sellado tataki (costra crocante de sésamo y corazón rojo frío/tibio). Corte de 8mm con cuchillo afilado.',
    preparationNotes:
      'Rebozar contorno de 180g de atún aleta amarilla en ajonjolí; sellar a 220°C por 45 seg/lado. Mezclar arúgula y kale con edamames, aguacate, pepino y aderezo ponzu al jengibre.',
    ingredients: [
      createIngredient('ing_yellowfin_tuna', 'inv_yellowfin_tuna', 'Atún aleta amarilla sashimi', 180, 'g'),
      createIngredient('ing_sesame_crust', 'inv_sesame_seeds', 'Costra de ajonjolí tostado', 15, 'g'),
      createIngredient('ing_kale_arugula', 'inv_fresh_kale', 'Arúgula y kale masajeado', 100, 'g'),
      createIngredient('ing_edamames', 'inv_edamames', 'Edamames tiernos pelados', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en láminas', 50, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Pepino persa medias lunas', 40, 'g'),
      createIngredient('ing_ponzu_dressing', 'inv_ponzu_dressing', 'Aderezo ponzu al jengibre', 30, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.tunaSear,
        'Empaniza el borde del atún en sésamo y sella en hierro a 220°C por 45 seg por lado.'
      ),
      createStep(
        2,
        STEP_PHOTOS.saladToss,
        'Masajea el kale con gotas de oliva, mezcla con arúgula y distribuye edamames y pepino.'
      ),
      createStep(
        3,
        STEP_PHOTOS.saladBowlAssembly,
        'Rebana el atún en láminas de 8mm, despliega en abanico sobre aguacate y sirve con ponzu.'
      ),
    ],
  },
  {
    productId: 'prod_salad_vegan_tofu',
    productName: 'Ensalada Verde Proteica con Tofu & Edamames',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 8,
    servingSizeGrams: 450,
    heroImageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Vegano • Crocante • Prebiótico',
    badgeText: '¡100% Plant-Based!',
    tags: ['#PlantBased', '#VeganoFit', '#FibraPrebiótica', '#440Kcal'],
    allergens: ['Soya', 'Sésamo'],
    chefNotes:
      '440 kcal | 29g Proteína 100% plant-based | Alta en fibra prebiótica. Tofu extra firme dorado con costra crujiente de levadura nutricional y tamari.',
    preparationNotes:
      'Dorar en plancha 180g de tofu en cubos con aceite de sésamo. Base de kale y espinaca con garbanzos crocantes horneados, edamames, pepitas de calabaza y aderezo tahini al limón.',
    ingredients: [
      createIngredient('ing_organic_tofu', 'inv_organic_tofu', 'Tofu orgánico en tamari', 180, 'g'),
      createIngredient('ing_crispy_chickpeas', 'inv_crispy_chickpeas', 'Garbanzos especiados crocantes', 50, 'g'),
      createIngredient('ing_edamames', 'inv_edamames', 'Edamames pelados al vapor', 40, 'g'),
      createIngredient('ing_kale_spinach', 'inv_fresh_kale', 'Kale rizado y espinaca baby', 100, 'g'),
      createIngredient('ing_pumpkin_seeds', 'inv_pumpkin_seeds', 'Pepitas de calabaza tostadas', 15, 'g'),
      createIngredient('ing_tahini_dressing', 'inv_tahini_dressing', 'Aderezo cremoso de tahini', 35, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.panSear,
        'Dora los cubos de tofu a 180°C con aceite de sésamo 5 min rotando todas sus caras.'
      ),
      createStep(
        2,
        STEP_PHOTOS.saladToss,
        'Prepara la cama de kale y espinaca; integra los edamames templados y garbanzos horneados.'
      ),
      createStep(
        3,
        STEP_PHOTOS.saladBowlAssembly,
        'Coloca el tofu dorado al centro, baña con aderezo tahini al limón y pepitas tostadas.'
      ),
    ],
  },
  {
    productId: 'prod_salad_turkey_cobb',
    productName: 'Ensalada Cobb Atlética de Pavo & Huevo',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 6,
    servingSizeGrams: 470,
    heroImageUrl:
      'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Estructurado • Keto • Proteico',
    badgeText: '¡44g Proteína Cobb!',
    tags: ['#CobbAtlética', '#44gProteína', '#KetoFriendly', '#470Kcal'],
    allergens: ['Huevo', 'Lácteos'],
    chefNotes:
      '470 kcal | 44g Proteína | Estilo Cobb tradicional en franjas geométricas paralelas. Huevos duros cocidos a 9 minutos exactos para yema cremosa.',
    preparationNotes:
      'Disponer cama de lechuga romana. Montar en bandas paralelas: 160g de pavo ahumado salteado, 2 huevos duros en cuartos, dados de panela, tomates cherry y aguacate. Servir con ranch griego.',
    ingredients: [
      createIngredient('ing_smoked_turkey', 'inv_turkey_breast', 'Pechuga de pavo en dados', 160, 'g'),
      createIngredient('ing_hard_boiled_eggs', 'inv_whole_eggs', 'Huevos cocidos al punto', 2, 'pza'),
      createIngredient('ing_panela_cubes', 'inv_panela_cheese', 'Queso panela en cubos', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en dados', 50, 'g'),
      createIngredient('ing_cherry_tomatoes', 'inv_cherry_tomatoes', 'Tomates cherry en mitades', 50, 'g'),
      createIngredient('ing_romaine_lettuce', 'inv_mix_greens', 'Lechuga romana crujiente', 110, 'g'),
      createIngredient('ing_greek_ranch', 'inv_ranch_greek', 'Ranch fit yogur griego 0%', 35, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.panSear,
        'Saltea el pavo en sartén seco 60 seg para templar y corta los huevos cocidos en cuartos.'
      ),
      createStep(
        2,
        STEP_PHOTOS.chopping,
        'Dispón cama de lechuga romana y arma franjas paralelas de pavo, cherry, huevo, panela y aguacate.'
      ),
      createStep(
        3,
        STEP_PHOTOS.saladBowlAssembly,
        'Verifica el contraste geométrico de colores y entrega con salsera individual de ranch griego.'
      ),
    ],
  },

  // ===========================================================================
  // 5. JUGOS NATURALES COLD-PRESSED (BARRA DE SMOOTHIES Y JUGOS)
  // ===========================================================================
  {
    productId: 'prod_juice_green_detox',
    productName: 'Jugo Verde Detox & Clorofila',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 450,
    heroImageUrl:
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Alcalino • Fresco • Depurativo',
    badgeText: '¡Prensado en Frío 45 RPM!',
    tags: ['#ColdPressed', '#DetoxVerde', '#CeroAzúcar', '#95Kcal'],
    allergens: ['Apio'],
    chefNotes:
      '95 kcal | Cero azúcar agregada. Prensado en frío a 45 RPM para preservar enzimas y clorofila viva. Servir en vaso de 16oz con hielo roca.',
    preparationNotes:
      'Introducir espinaca y perejil prensados entre trozos de manzana verde y pepino en el extractor cold-pressed. Agregar limón y jengibre fresco. Emulsionar sin hacer espuma.',
    ingredients: [
      createIngredient('ing_spinach_juice', 'inv_baby_spinach', 'Espinaca fresca orgánica', 50, 'g'),
      createIngredient('ing_cucumber_juice', 'inv_persian_cucumber', 'Pepino europeo con piel', 100, 'g'),
      createIngredient('ing_celery_stalks', 'inv_celery', 'Apio verde crujiente', 80, 'g'),
      createIngredient('ing_green_apple', 'inv_green_apple', 'Manzana verde Granny Smith', 100, 'g'),
      createIngredient('ing_fresh_ginger', 'inv_fresh_ginger', 'Raíz de jengibre fresco', 8, 'g'),
      createIngredient('ing_fresh_lime', 'inv_fresh_limes', 'Limón real recién exprimido', 20, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.chopping,
        'Desinfecta vegetales 3 min; compacta hojas de espinaca entre trozos de manzana verde.'
      ),
      createStep(
        2,
        STEP_PHOTOS.coldPressJuice,
        'Prensa en frío a 45 RPM alternando espinaca, jengibre, apio y pepino para extraer clorofila.'
      ),
      createStep(
        3,
        STEP_PHOTOS.pouringJuice,
        'Integra jugo de limón con cuchara sin espumar y sirve en vaso frío de 16oz con 3 hielos roca.'
      ),
    ],
  },
  {
    productId: 'prod_juice_beet_citrus',
    productName: 'Jugo Antioxidante de Cítricos y Betabel',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 4,
    servingSizeGrams: 460,
    heroImageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Vasodilatador • Vibrante • Pre-Entreno',
    badgeText: '¡Nitric Pump Natural!',
    tags: ['#ÓxidoNítrico', '#PreWorkoutNatural', '#Antioxidante', '#130Kcal'],
    allergens: [],
    chefNotes:
      '130 kcal | Nitratos naturales precursores de Óxido Nítrico para vasodilatación y bombeo muscular intenso pre-workout.',
    preparationNotes:
      'Prensar betabel crudo, zanahoria, toronja rosa y cúrcuma fresca. Mezclar con 150ml de jugo recién exprimido de naranja Valencia y micro pizca de pimienta para activar curcumina.',
    ingredients: [
      createIngredient('ing_raw_beet', 'inv_raw_beet', 'Betabel fresco crudo pelado', 120, 'g'),
      createIngredient('ing_valencia_oranges', 'inv_valencia_oranges', 'Zumo de naranja Valencia', 150, 'ml'),
      createIngredient('ing_pink_grapefruit', 'inv_pink_grapefruit', 'Toronja rosa en gajos', 80, 'g'),
      createIngredient('ing_fresh_carrots', 'inv_fresh_carrots', 'Zanahoria orgánica fresca', 90, 'g'),
      createIngredient('ing_fresh_turmeric', 'inv_fresh_turmeric', 'Raíz de cúrcuma fresca', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.citrusPress,
        'Exprime las naranjas Valencia reservando 150ml de zumo fresco sin semillas.'
      ),
      createStep(
        2,
        STEP_PHOTOS.coldPressJuice,
        'Prensa en frío el betabel crudo, la raíz de cúrcuma, zanahorias y gajos de toronja rosa.'
      ),
      createStep(
        3,
        STEP_PHOTOS.pouringJuice,
        'Combina ambos jugos en jarra 10 seg y sirve en vaso de 16oz con media luna de toronja.'
      ),
    ],
  },
  {
    productId: 'prod_juice_pineapple_ginger',
    productName: 'Jugo Inmune Gold: Piña, Jengibre & Cúrcuma',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 440,
    heroImageUrl:
      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Dorado • Antiinflamatorio • Tropical',
    badgeText: '¡Recuperación Articular!',
    tags: ['#InmuneGold', '#Bromelina', '#Antiinflamatorio', '#120Kcal'],
    allergens: [],
    chefNotes:
      '120 kcal | Altísima concentración de bromelina de piña madura y gingerol para desinflamación articular y recuperación.',
    preparationNotes:
      'Prensar piña miel incluyendo núcleo fibroso con jengibre fresco y cúrcuma. Mezclar con 100ml de jugo de naranja, limón verde y toque milimétrico de pimienta de cayena.',
    ingredients: [
      createIngredient('ing_honey_pineapple', 'inv_honey_pineapple', 'Piña miel fresca con corazón', 160, 'g'),
      createIngredient('ing_orange_juice', 'inv_valencia_oranges', 'Zumo de naranja recién exprimido', 100, 'ml'),
      createIngredient('ing_fresh_ginger', 'inv_fresh_ginger', 'Raíz de jengibre fresco', 12, 'g'),
      createIngredient('ing_fresh_turmeric', 'inv_fresh_turmeric', 'Cúrcuma fresca de raíz', 6, 'g'),
      createIngredient('ing_fresh_lime', 'inv_fresh_limes', 'Jugo de limón verde fresco', 15, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.coldPressJuice,
        'Prensa la piña miel con su corazón rico en bromelina alternando con jengibre y cúrcuma.'
      ),
      createStep(
        2,
        STEP_PHOTOS.citrusPress,
        'Une con el zumo de naranja, limón verde y micro pizca de cayena para activar absorción.'
      ),
      createStep(
        3,
        STEP_PHOTOS.pouringJuice,
        'Mezcla hasta tono amarillo oro intenso y sirve en vaso largo con hielo y triángulo de piña.'
      ),
    ],
  },
  {
    productId: 'prod_juice_watermelon_hydrate',
    productName: 'Jugo Hidratante Sandía, Fresa & Electrolitos',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 470,
    heroImageUrl:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Isotónico • Refrescante • Mineral',
    badgeText: '¡Hidratación Intra-Entreno!',
    tags: ['#LCitrulina', '#Electrolitos', '#IntraWorkout', '#110Kcal'],
    allergens: [],
    chefNotes:
      '110 kcal | L-Citrulina natural procedente de la pulpa y corteza blanca de la sandía, con agua de coco y sal rosa para reposición electrolítica perfecta.',
    preparationNotes:
      'Prensar sandía fresca y fresas silvestres. Integrar con 120ml de agua de coco fría, sal rosa del Himalaya y hojas de menta activadas.',
    ingredients: [
      createIngredient('ing_fresh_watermelon', 'inv_fresh_watermelon', 'Sandía fresca madura', 220, 'g'),
      createIngredient('ing_fresh_strawberries', 'inv_fresh_strawberries', 'Fresas frescas desinfectadas', 60, 'g'),
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco 100% pura', 120, 'ml'),
      createIngredient('ing_fresh_mint', 'inv_fresh_mint', 'Hojas de menta fresca', 5, 'g'),
      createIngredient('ing_himalayan_salt', 'inv_himalayan_salt', 'Sal rosa del Himalaya', 1, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.coldPressJuice,
        'Extrae en prensa fría la sandía (con parte blanca) y las fresas frescas en el mismo ciclo.'
      ),
      createStep(
        2,
        STEP_PHOTOS.citrusPress,
        'Integra 120ml de agua de coco fría y disuelve 1g de sal rosa del Himalaya para electrolitos.'
      ),
      createStep(
        3,
        STEP_PHOTOS.pouringJuice,
        'Palmea la menta al fondo del vaso con hielo picado, vierte el jugo rubí y decora con menta.'
      ),
    ],
  },

  // ===========================================================================
  // 6. SMOOTHIES PROTEICOS & SUPERFOODS (BARRA DE SMOOTHIES Y JUGOS)
  // ===========================================================================
  {
    productId: 'prod_titan_chocolate',
    productName: 'Smoothie de Proteína Whey & Plátano Anabolic',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 480,
    heroImageUrl:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Cremoso • Anabólico • Intenso',
    badgeText: '¡Top Ventas #1!',
    tags: ['#TopVentas', '#38gProteína', '#PostWorkout', '#460Kcal'],
    allergens: ['Lácteos', 'Cacahuate', 'Frutos secos (Almendra)'],
    chefNotes:
      '460 kcal | 38g Proteína. Top ventas #1. Textura cremosa ultra densa tipo milkshake. Licuar proteína al final a baja velocidad para no espumar.',
    preparationNotes:
      'Licuar leche de almendras, plátano congelado, avena y crema de cacahuate 20 seg a velocidad media. Añadir Whey Isolate Chocolate y hielo 12 seg a velocidad baja.',
    ingredients: [
      createIngredient('ing_almond_milk', 'inv_almond_milk', 'Leche de Almendras Sin Azúcar', 250, 'ml'),
      createIngredient('ing_whey_iso_choco', 'inv_whey_iso_choco', 'Whey Isolate Chocolate', 30, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano congelado IQF', 80, 'g'),
      createIngredient('ing_peanut_butter', 'inv_peanut_butter', 'Crema de cacahuate natural', 25, 'g'),
      createIngredient('ing_oats', 'inv_oats', 'Avena en hojuelas integral', 20, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 100, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.blenderBase,
        'Vierte leche de almendras, plátano IQF, avena y crema de cacahuate; licúa 20 seg a vel. 7.'
      ),
      createStep(
        2,
        STEP_PHOTOS.matchaBlend,
        'Añade el scoop de Whey Chocolate y el hielo; emulsiona 12 seg a vel. baja (4) sin espumar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.servingSmoothie,
        'Sirve textura milkshake densa en vaso térmico con tapa domo y pajita ancha.'
      ),
    ],
  },
  {
    productId: 'prod_green_hulk_nitro',
    productName: 'Smoothie Verde Energizante con Espinaca y Matcha',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 470,
    heroImageUrl:
      'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Esmeralda • Energético • Limpio',
    badgeText: '¡Energía Matcha Uji!',
    tags: ['#MatchaCeremonial', '#30gProteína', '#EnergíaLimpia', '#290Kcal'],
    allergens: ['Lácteos', 'Frutos secos (Almendra)'],
    chefNotes:
      '290 kcal | 30g Proteína. Té Matcha grado ceremonial aporta L-teanina y cafeína limpia sostenida sin picos de ansiedad ni caídas bruscas.',
    preparationNotes:
      'Licuar leche de almendras con espinaca, matcha ceremonial, plátano y piña a velocidad alta 25 seg hasta pulverizar hojas. Agregar Whey Isolate Vainilla y hielo 10 seg.',
    ingredients: [
      createIngredient('ing_almond_milk', 'inv_almond_milk', 'Leche de Almendras Sin Azúcar', 250, 'ml'),
      createIngredient('ing_whey_iso_vanilla', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla', 30, 'g'),
      createIngredient('ing_ceremonial_matcha', 'inv_ceremonial_matcha', 'Matcha japonés ceremonial', 4, 'g'),
      createIngredient('ing_baby_spinach', 'inv_baby_spinach', 'Espinaca baby compactada', 40, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano congelado IQF', 50, 'g'),
      createIngredient('ing_honey_pineapple', 'inv_honey_pineapple', 'Piña fresca en cubos', 40, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 100, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.blenderBase,
        'Licúa leche de almendras, espinaca, matcha, plátano y piña 25 seg a vel. máxima sin grumos.'
      ),
      createStep(
        2,
        STEP_PHOTOS.matchaBlend,
        'Incorpora el scoop de Whey Vainilla y hielo; pulsa a velocidad 4 durante 10 segundos.'
      ),
      createStep(
        3,
        STEP_PHOTOS.servingSmoothie,
        'Vierte en vaso transparente destacando su vibrante tono verde esmeralda ceremonial.'
      ),
    ],
  },
  {
    productId: 'prod_wild_berry_isolate',
    productName: 'Batido Post-Entreno con Creatina & Frutos Rojos',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 470,
    heroImageUrl:
      'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Antioxidante • Recuperador • Puro',
    badgeText: '¡+5g Creatina Creapure®!',
    tags: ['#Creatina5g', '#32gProteína', '#PostEntreno', '#285Kcal'],
    allergens: ['Lácteos'],
    chefNotes:
      '285 kcal | 32g Proteína | 5g Creatina Creapure®. La combinación de frutos rojos ricos en antocianinas y creatina acelera la resíntesis de fosfocreatina muscular.',
    preparationNotes:
      'Licuar agua de coco y frutos rojos con semillas de chía 20 seg a velocidad alta. Añadir Whey Isolate Vainilla, 5g de Creatina Creapure y hielo; pulsar 8 seg.',
    ingredients: [
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco isotónica', 250, 'ml'),
      createIngredient('ing_whey_iso_vanilla', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla', 30, 'g'),
      createIngredient('ing_frozen_berries', 'inv_frozen_berries', 'Mix frutos rojos IQF', 90, 'g'),
      createIngredient('ing_creatine', 'inv_creatine', 'Creatina Creapure®', 5, 'g'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 10, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 80, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.berryBlend,
        'Procesa agua de coco, frutos rojos IQF y chía a velocidad alta 20 seg hasta base morada.'
      ),
      createStep(
        2,
        STEP_PHOTOS.blenderBase,
        'Agrega 5g de Creatina Creapure, Whey Vainilla y hielo; mezcla a velocidad baja solo 8 seg.'
      ),
      createStep(
        3,
        STEP_PHOTOS.servingSmoothie,
        'Sirve de inmediato en vaso frío de 16oz para máxima biodisponibilidad post-entreno.'
      ),
    ],
  },
  {
    productId: 'prod_pre_workout_rush',
    productName: 'Smoothie Pre-Workout Shockwave Nitro',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 450,
    heroImageUrl:
      'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Explosivo • Granizado • Enfocado',
    badgeText: '¡Tomar 25 min pre-rutina!',
    tags: ['#PreWorkout', '#BCAA5g', '#PumpVascular', '#225Kcal'],
    allergens: ['Lácteos'],
    chefNotes:
      '225 kcal | 28g Proteína | 10g C4 Nitro + 5g BCAA. Advertir al atleta sobre la sensación de hormigueo (parestesia inofensiva) generada por la beta-alanina.',
    preparationNotes:
      'Granizar agua de coco con fresas congeladas y hielo triturado 12 seg. Añadir Whey Fresa, BCAA y pre-workout C4; pulsar 3 veces por 2 seg para no sobregasificar.',
    ingredients: [
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco prensada fría', 250, 'ml'),
      createIngredient('ing_whey_strawberry', 'inv_whey_strawberry', 'Whey Fresa Silvestre', 30, 'g'),
      createIngredient('ing_preworkout', 'inv_preworkout', 'Pre-Workout Nitro C4', 10, 'g'),
      createIngredient('ing_bcaa', 'inv_bcaa', 'BCAA Micronizados 2:1:1', 5, 'g'),
      createIngredient('ing_frozen_strawberries', 'inv_fresh_strawberries', 'Fresas congeladas IQF', 60, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Hielo purificado triturado', 90, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.berryBlend,
        'Graniza el agua de coco con fresas congeladas y hielo triturado 12 seg a velocidad media.'
      ),
      createStep(
        2,
        STEP_PHOTOS.blenderBase,
        'Agrega Whey Fresa, 10g C4 y 5g BCAA; da 3 pulsos cortos de 2 seg para no sobregasificar.'
      ),
      createStep(
        3,
        STEP_PHOTOS.servingSmoothie,
        'Sirve en vaso termo indicando al atleta ingerirlo 20-30 minutos antes de entrenar.'
      ),
    ],
  },
  {
    productId: 'prod_vegan_caramel_oats',
    productName: 'Smoothie Vegano Salted Caramel, Avena & Chía',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 480,
    heroImageUrl:
      'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1000&q=85',
    tagline: 'Aterciopelado • Vegano • Saciedad',
    badgeText: '¡Cero Lactosa • 31g Prot!',
    tags: ['#VeganoFit', '#SaltedCaramel', '#CeroLactosa', '#390Kcal'],
    allergens: ['Gluten (Avena si no certificada)'],
    chefNotes:
      '390 kcal | 31g Proteína 100% Plant-Based | Aislado de proteína vegetal de guisante y arroz fermentado sabor caramelo salado. Cero lactosa.',
    preparationNotes:
      'Licuar leche de avena con plátano congelado, avena y chía 20 seg a velocidad alta. Agregar proteína vegana de caramelo salado y hielo 12 seg. Decorar con cacao nibs.',
    ingredients: [
      createIngredient('ing_oat_milk', 'inv_oat_milk', 'Leche de Avena Barista Pro', 250, 'ml'),
      createIngredient('ing_vegan_protein', 'inv_vegan_protein', 'Proteína Vegana Caramelo', 30, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano congelado IQF', 50, 'g'),
      createIngredient('ing_oats', 'inv_oats', 'Avena en hojuelas integral', 25, 'g'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 10, 'g'),
      createIngredient('ing_cacao_nibs', 'inv_cacao_nibs', 'Cacao nibs orgánicos', 10, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 90, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      createStep(
        1,
        STEP_PHOTOS.blenderBase,
        'Licúa leche de avena, plátano congelado, avena y chía 20 seg a vel. alta hasta textura sedosa.'
      ),
      createStep(
        2,
        STEP_PHOTOS.matchaBlend,
        'Añade el scoop de proteína vegana Salted Caramel y hielo; licúa 12 seg a vel. media.'
      ),
      createStep(
        3,
        STEP_PHOTOS.servingSmoothie,
        'Vierte en vaso alto transparente y corona con cacao nibs para un toque crujiente.'
      ),
    ],
  },
];

export const mockRecipes: RecipeBOM[] = MOCK_RECIPES;
export default MOCK_RECIPES;
