/**
 * @file mockRecipes.ts
 * @description Catálogo Completo de Recetas, Bill of Materials (BOM) y Fichas Técnicas de Preparación
 * para PrimeFitness Bar. Vinculado al 100% de los productos de mockProducts.ts.
 */

import type { RecipeBOM, BOMIngredient } from '../types/inventory.types';

// Helper para instanciar ingredientes garantizando sincronía entre ingredients y baseIngredients
const createIngredient = (
  ingredientId: string,
  inventoryItemId: string,
  name: string,
  quantity: number,
  unit: BOMIngredient['unit'],
  isOptional = false,
  costEstimate?: number
): BOMIngredient => ({
  ingredientId,
  inventoryItemId,
  name,
  itemName: name,
  quantity,
  unit,
  isOptional,
  costEstimate,
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
    allergens: ['Huevo', 'Lácteos'],
    chefNotes:
      '340 kcal | 36g Proteína. Verificar que el queso panela quede templado en el centro sin fundirse por completo. Hash brown dorado a 200°C en air-fryer.',
    preparationNotes:
      'Sartén antiadherente a fuego bajo (160°C). Cocinar claras con tapa 3 min hasta cuajar sin dorar. Rellenar con champiñones salteados, espinaca, pavo y panela; doblar en media luna.',
    ingredients: [
      createIngredient('ing_egg_whites', 'inv_egg_whites', 'Claras de huevo pasteurizadas', 200, 'ml'),
      createIngredient('ing_baby_spinach', 'inv_baby_spinach', 'Espinaca baby fresca', 40, 'g'),
      createIngredient('ing_portobello', 'inv_portobello', 'Champiñones portobello rebanados', 50, 'g'),
      createIngredient('ing_turkey_breast', 'inv_turkey_breast', 'Pechuga de pavo 98% magra en cubos', 60, 'g'),
      createIngredient('ing_panela_cheese', 'inv_panela_cheese', 'Queso panela artesanal asado', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown de papa para air-fryer', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Precalentar la sartén antiadherente de teflón a fuego medio (160°C) con ligero rocío de aceite de aguacate en aerosol.',
      'Saltear en sartén contigua los champiñones portobello fileteados y la espinaca baby durante 90 segundos hasta marchitar ligeramente; sazonar con sal marina y reservar.',
      'Verter las claras de huevo batidas homogéneamente; tapar y dejar cocer a fuego bajo por 3 minutos hasta que la superficie esté tierna y cuajada sin quemar la base.',
      'Colocar en la mitad del disco los dados de pechuga de pavo, las verduras salteadas y las tiras de queso panela; doblar con espátula de silicón en media luna perfecta.',
      'Simultáneamente colocar el hash brown en la air-fryer precalentada a 200°C durante 6 minutos hasta alcanzar un dorado crocante uniforme.',
      'Montar en plato térmico blanco precalentado: colocar el omelet centrado, el hash brown al costado y espolvorear pimienta negra recién quebrada.',
    ],
  },
  {
    productId: 'prod_omelet_fat',
    productName: 'Omelet Fat / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 9,
    servingSizeGrams: 460,
    allergens: ['Huevo', 'Lácteos', 'Cerdo'],
    chefNotes:
      '640 kcal | 34g Proteína | 44g Grasas saludables. Ideal para fase de volumen pesado o dieta Cetogénica (Keto).',
    preparationNotes:
      'Batir 3 huevos enteros con globo. Plancha a 180°C para dorar tocino crujiente. Fundir cheddar-gouda dentro del omelet y coronar con aguacate fresco y crema ácida.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos frescos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_smoked_bacon', 'inv_smoked_bacon', 'Tocino ahumado corte grueso', 50, 'g'),
      createIngredient('ing_cheddar_gouda', 'inv_cheddar_gouda', 'Mezcla quesos Cheddar & Gouda', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en rebanadas', 60, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ácida reducida en grasa', 30, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Dorar las tiras de tocino ahumado en plancha caliente a 180°C durante 4 minutos hasta textura extra crocante; escurrir grasa en papel y trocear.',
      'Batir enérgicamente los 3 huevos enteros con sal y pimienta con batidor de globo durante 30 segundos para incorporar microburbujas de aire.',
      'Fundir un toque de mantequilla clarificada en sartén a fuego medio; verter los huevos y mover con espátula formando ondas tiernas durante los primeros 45 segundos.',
      'Distribuir el tocino crujiente y la generosa mezcla de quesos cheddar y gouda; tapar 60 segundos para conseguir un gratinado untuoso y elástico.',
      'Plegar en tres partes (estilo francés) y deslizar suavemente sobre el plato caliente.',
      'Disponer el abanico de aguacate hass fresco encima, una quenelle de crema ácida fría al centro y acompañar con el hash brown dorado.',
    ],
  },
  {
    productId: 'prod_omelet_west',
    productName: 'Omelet West / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 8,
    servingSizeGrams: 440,
    allergens: ['Huevo', 'Lácteos', 'Cerdo'],
    chefNotes:
      '490 kcal | 35g Proteína. Corte fino en brunoise de pimientos y caramelizado rápido para mantener crocancia y dulzor natural.',
    preparationNotes:
      'Saltear pimientos morrones y cebolla morada con jamón de pierna. Rellenar 3 huevos batidos con queso Monterey Jack derretido. Acompañar con hash brown crujiente.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos de granja enteros', 3, 'pza'),
      createIngredient('ing_artisan_ham', 'inv_artisan_ham', 'Jamón artesanal de pierna magro', 60, 'g'),
      createIngredient('ing_bell_peppers', 'inv_bell_peppers', 'Pimientos morrones tricolor brunoise', 50, 'g'),
      createIngredient('ing_red_onion', 'inv_red_onion', 'Cebolla morada en julianas finas', 30, 'g'),
      createIngredient('ing_monterey_jack', 'inv_monterey_jack', 'Queso Monterey Jack rallado', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Saltear en plancha a 170°C los pimientos morrones y la cebolla morada con unas gotas de aceite de oliva por 2 minutos hasta dorar los bordes.',
      'Añadir los cubos de jamón artesanal para sellar e intensificar sabor durante 1 minuto adicional.',
      'Verter los 3 huevos previamente salpimentados en sartén caliente antiadherente; mover bordes hacia el centro permitiendo que el huevo crudo tome contacto con la sartén.',
      'Incorporar el salteado de verduras y jamón en la parte central junto con el queso Monterey Jack rallado.',
      'Doblar ambos extremos hacia el centro (plegado tríptico) sellando el queso fundido al interior.',
      'Servir caliente en plato amplio junto al hash brown recién salido del air-fryer.',
    ],
  },
  {
    productId: 'prod_huevos_al_gusto',
    productName: 'Huevos al Gusto / Hash Brown',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 7,
    servingSizeGrams: 390,
    allergens: ['Huevo', 'Gluten', 'Lácteos'],
    chefNotes:
      '410 kcal | 24g Proteína. Verificar siempre la especificación de la comanda: Estrellados tiernos, Revueltos cremosos, Divorciados o A la Mexicana.',
    preparationNotes:
      'Preparar 3 huevos al método solicitado manteniendo yemas intactas o textura cremosa. Acompañar de rebanada de masa madre dorada a la plancha y hash brown crujiente.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos frescos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
      createIngredient('ing_sourdough_bread', 'inv_sourdough_bread', 'Rebanada de pan de masa madre', 1, 'pza'),
      createIngredient('ing_mexican_veggies', 'inv_mexican_veggies', 'Verduras a la mexicana (jitomate, cebolla, serrano)', 45, 'g', true),
      createIngredient('ing_table_butter', 'inv_table_butter', 'Mantequilla artesanal para plancha', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Revisar la preferencia del cliente en la comanda KDS: Estrellados tiernos/volteados, Revueltos, Divorciados o A la Mexicana.',
      'Para Estrellados: Cocinar a 140°C en mantequilla derretida, bañando ligeramente la clara superior con cuchara sin romper yemas.',
      'Para Revueltos / A la Mexicana: Saltear la verdura fresca 1 min, integrar los huevos y trabajar a fuego lento con espátula para textura cremosa y sedosa.',
      'Tostar la rebanada gruesa de pan de masa madre en plancha hasta marcar líneas doradas y textura crujiente exterior.',
      'Dorar el hash brown en air-fryer a 200°C por 6 minutos.',
      'Emplatar: huevos en posición principal, rebanada de pan rústico en diagonal, hash brown dorado y ramekín de salsa casera al costado.',
    ],
  },
  {
    productId: 'prod_desayuno_americano',
    productName: 'Desayuno Americano Completo',
    category: 'omelets',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 10,
    servingSizeGrams: 520,
    allergens: ['Huevo', 'Gluten', 'Lácteos', 'Cerdo/Pavo'],
    chefNotes:
      '720 kcal | 42g Proteína. Máxima potencia matutina. Coordinar tiempos para que salchichas, tocino, huevos y hash brown salgan humeantes al mismo instante.',
    preparationNotes:
      'Asar salchichas de pavo con marcas de grill. Tiras de tocino crujientes. 3 huevos al gusto, hash brown y pan de masa madre tostado con mantequilla.',
    ingredients: [
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos frescos de libre pastoreo', 3, 'pza'),
      createIngredient('ing_turkey_sausage', 'inv_turkey_sausage', 'Salchichas de pavo premium grilladas', 2, 'pza'),
      createIngredient('ing_smoked_bacon', 'inv_smoked_bacon', 'Tocino ahumado crujiente', 40, 'g'),
      createIngredient('ing_hash_brown', 'inv_hash_brown', 'Hash brown dorado de papa', 1, 'pza'),
      createIngredient('ing_sourdough_bread', 'inv_sourdough_bread', 'Pan artesanal de masa madre tostado', 1, 'pza'),
      createIngredient('ing_table_butter', 'inv_table_butter', 'Mantequilla artesanal', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Marcar las salchichas de pavo en la plancha a 180°C girándolas cada 90 segundos para un dorado estriado uniforme.',
      'Colocar las tiras de tocino en la plancha hasta lograr punto crujiente desgrasado (3-4 minutos).',
      'Cocinar los 3 huevos en sartén individual manteniendo punto de yema suave según indicación del ticket.',
      'Tostar el pan de masa madre y untar una lámina delgada de mantequilla artesanal sobre la miga caliente.',
      'Retirar el hash brown crujiente del air-fryer.',
      'Armar plato festín: huevos al centro, cruzar el tocino sobre las salchichas doradas, hash brown a la derecha y pan tostado cortado en mitades.',
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
    allergens: ['Lácteos'],
    chefNotes:
      '540 kcal | 42g Proteína. Los totopos horneados deben envolverse en salsa hirviendo solo 30-40 seg para preservar textura crocante y evitar que se ablanden.',
    preparationNotes:
      'Reducir salsa verde de tomatillo con cilantro a 85°C. Sellar 160g de proteína (pollo o bistec). Bañar totopos horneados, montar con proteína, panela, crema light, cebolla y aguacate.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz nixtamalizado', 100, 'g'),
      createIngredient('ing_green_salsa', 'inv_green_salsa', 'Salsa verde tatemada de tomatillo y cilantro', 180, 'ml'),
      createIngredient('ing_protein_choice', 'inv_chicken_breast', 'Proteína a elegir (Pollo deshebrado o Bistec)', 160, 'g'),
      createIngredient('ing_panela_cheese', 'inv_panela_cheese', 'Queso panela artesanal desmoronado', 40, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ácida light reducida en grasa', 25, 'ml'),
      createIngredient('ing_red_onion', 'inv_red_onion', 'Aros finos de cebolla morada', 20, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en rebanadas', 40, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Calentar la salsa verde de tomatillo en sartén hondo hasta ebullición viva (85°C).',
      'En plancha a 200°C, regenerar o sellar los 160g de proteína seleccionada por el cliente (Pollo deshebrado sazonado o tiras de bistec magro).',
      'Incorporar los totopos horneados a la sartén con la salsa hirviendo; realizar salteo envolvente durante 35 segundos para impregnar sabor manteniendo textura crujiente.',
      'Verter inmediatamente los chilaquiles en plato hondo artesanal precalentado.',
      'Disponer los 160g de proteína caliente coronando el centro del platillo.',
      'Decorar con zigzag de crema light, espolvorear queso panela, acomodar los aros de cebolla morada, abanico de aguacate y hojas de cilantro.',
    ],
  },
  {
    productId: 'prod_chilaquiles_rojos',
    productName: 'Chilaquiles Rojos (Pollo o Bistec)',
    category: 'chilaquiles',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 7,
    servingSizeGrams: 485,
    allergens: ['Lácteos'],
    chefNotes:
      '550 kcal | 43g Proteína. Salsa roja tatemada con notas ahumadas de guajillo. Carga de glucógeno y aminoácidos óptima para recuperación post-workout.',
    preparationNotes:
      'Hervir salsa roja de jitomate y guajillo. Asar a fuego vivo 160g de bistec o pechuga de pollo. Envolver totopos 30 seg, servir con queso fresco, crema ligera y aguacate.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz nixtamalizado', 100, 'g'),
      createIngredient('ing_red_salsa', 'inv_red_salsa', 'Salsa roja tatemada de jitomate y guajillo', 180, 'ml'),
      createIngredient('ing_protein_choice_red', 'inv_beef_steak', 'Proteína a elegir (Pollo a la plancha o Bistec de res)', 160, 'g'),
      createIngredient('ing_fresh_cheese', 'inv_panela_cheese', 'Queso fresco de rancho desmoronado', 40, 'g'),
      createIngredient('ing_light_sour_cream', 'inv_light_sour_cream', 'Crema ligera baja en grasa', 25, 'ml'),
      createIngredient('ing_white_onion', 'inv_red_onion', 'Cebolla blanca en plumilla crujiente', 20, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en abanico', 40, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Poner a hervir la salsa roja tatemada en sartén de hierro o acero inoxidable a fuego alto.',
      'Sellar en la plancha a 200°C los 160g de proteína seleccionada con sal en grano y pimienta negra.',
      'Verter los totopos de maíz horneados en la salsa burbujeante agitando enérgicamente por 30 segundos.',
      'Servir la base de chilaquiles rojos en plato hondo cerámico.',
      'Colocar la proteína recién asada jugosa sobre la cúspide de los totopos.',
      'Finalizar con hilos de crema light, lluvia de queso fresco, plumilla de cebolla blanca y el abanico de aguacate fresco.',
    ],
  },
  {
    productId: 'prod_chilaquiles_suizos',
    productName: 'Chilaquiles Suizos (Pollo o Bistec)',
    category: 'chilaquiles',
    station: 'Cocina Caliente / Plancha',
    prepTimeMinutes: 9,
    servingSizeGrams: 510,
    allergens: ['Lácteos'],
    chefNotes:
      '650 kcal | 48g Proteína. Gratinado en salamandra a 230°C. Servir siempre en plato base protector térmico y alertar al personal de sala sobre plato caliente.',
    preparationNotes:
      'Totopos horneados en salsa verde cremosa suiza con 160g de proteína. Cubrir con 60g de mozzarella y manchego proteico y gratinar en salamandra 3 min hasta dorar.',
    ingredients: [
      createIngredient('ing_baked_totopos', 'inv_baked_totopos', 'Totopos horneados de maíz nixtamalizado', 100, 'g'),
      createIngredient('ing_swiss_salsa', 'inv_green_salsa', 'Salsa verde cremosa suiza con toque de crema', 200, 'ml'),
      createIngredient('ing_protein_choice_swiss', 'inv_chicken_breast', 'Proteína a elegir (Pollo o Bistec a la plancha)', 160, 'g'),
      createIngredient('ing_mozzarella_manchego', 'inv_mozzarella_cheese', 'Mezcla mozzarella y manchego proteico', 60, 'g'),
      createIngredient('ing_white_onion', 'inv_red_onion', 'Cebolla blanca en brunoise fino', 20, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'En plato o sartén de hierro apto para salamandra/horno, mezclar los totopos con la salsa suiza cremosa caliente durante 20 segundos.',
      'Integrar los 160g de proteína caliente (pollo deshebrado o tiras de bistec magro).',
      'Cubrir de manera homogénea toda la superficie con los 60g de mezcla de queso mozzarella y manchego rallados.',
      'Introducir a la salamandra a 230°C durante 3 minutos hasta que el queso burbujee y forme una costra dorada uniforme.',
      'Retirar con pinzas y guante térmico; colocar sobre plato base de servicio.',
      'Coronar con cebolla blanca picada y ramitas de cilantro fresco antes de entregar a comensal.',
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
    allergens: ['Huevo', 'Gluten', 'Sésamo'],
    chefNotes:
      '420 kcal | 22g Proteína | 23g Grasas saludables. El huevo pochado debe presentar yema líquida sedosa que napa el aguacate al primer corte. Control estricto de agua a 85°C.',
    preparationNotes:
      'Tostar pan de masa madre. Pochar 2 huevos orgánicos en agua a 85°C por 3:15 min. Untar aguacate machacado al limón, montar huevos y coronar con semillas de cáñamo, ajonjolí y chilli flakes.',
    ingredients: [
      createIngredient('ing_sourdough_slice', 'inv_sourdough_bread', 'Rebanada gruesa de pan de masa madre', 70, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass maduro machacado', 100, 'g'),
      createIngredient('ing_whole_eggs', 'inv_whole_eggs', 'Huevos orgánicos de libre pastoreo', 2, 'pza'),
      createIngredient('ing_hemp_seeds', 'inv_hemp_seeds', 'Semillas de cáñamo (hemp seeds)', 10, 'g'),
      createIngredient('ing_sesame_seeds', 'inv_sesame_seeds', 'Ajonjolí tostado blanco y negro', 5, 'g'),
      createIngredient('ing_chilli_flakes', 'inv_chilli_flakes', 'Hojuelas de chile quebrado (chilli flakes)', 2, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Tostar la rebanada de pan de masa madre en tostador comercial (nivel 4) hasta que la corteza esté crocante y la miga conserve elasticidad.',
      'En olla de agua a 85°C con 10ml de vinagre blanco, generar vórtice suave con batidor y pochar los 2 huevos durante exactamente 3 minutos y 15 segundos.',
      'Machacar en bowl el aguacate hass maduro con tenedor junto con 5ml de jugo de limón verde y sal de mar, manteniendo textura rústica.',
      'Extender el aguacate machacado de forma homogénea sobre toda la superficie del pan tostado tibio.',
      'Retirar los huevos pochados con espumadera, escurrir agua sobre papel absorbente y colocarlos con delicadeza en el centro.',
      'Espolvorear las semillas de cáñamo, el ajonjolí tostado, las hojuelas de chile y terminar con cristales de sal Maldon.',
    ],
  },
  {
    productId: 'prod_toast_requeson_platano',
    productName: 'Tost Fit de Requesón, Plátano & Miel',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 4,
    servingSizeGrams: 270,
    allergens: ['Gluten', 'Lácteos'],
    chefNotes:
      '380 kcal | 24g Proteína | 52g Carbohidratos limpios. Combinación ideal de caseína de lenta digestión y fructosa natural para recarga muscular pre-entreno.',
    preparationNotes:
      'Tostar pan Ezequiel germinado. Extender 100g de requesón magro batido con canela. Cubrir con rodajas de plátano en escama, hilo de miel cruda y semillas de chía.',
    ingredients: [
      createIngredient('ing_ezekiel_slice', 'inv_ezekiel_bread', 'Rebanadas de pan germinado Ezequiel 4:9', 2, 'pza'),
      createIngredient('ing_requeson_cheese', 'inv_requeson_cheese', 'Requesón magro artesanal alto en proteína', 100, 'g'),
      createIngredient('ing_fresh_banana', 'inv_fresh_banana', 'Plátano maduro en rodajas regulares', 80, 'g'),
      createIngredient('ing_raw_honey', 'inv_raw_honey', 'Miel pura de abeja cruda de azahar', 15, 'ml'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 8, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Tostar las 2 rebanadas de pan germinado Ezequiel en tostador comercial hasta punto dorado crujiente.',
      'Batir en bowl pequeño el requesón magro con una pizca de canela ceilán para conseguir una textura suave y untable.',
      'Untar 50g de requesón en cada rebanada de pan tibio cubriendo de borde a borde.',
      'Colocar las rodajas de plátano solapadas en patrón ordenado de escamas a lo largo de las tostadas.',
      'Rociar la miel de abeja cruda en hilo fino continuo zigzagueante sobre las rebanadas de fruta.',
      'Finalizar espolvoreando semillas de chía orgánica y un toque extra de canela molida.',
    ],
  },
  {
    productId: 'prod_toast_peanut_berries',
    productName: 'Tost Anabólico Peanut Butter & Berries',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 4,
    servingSizeGrams: 280,
    allergens: ['Cacahuate', 'Gluten', 'Lácteos'],
    chefNotes:
      '460 kcal | 28g Proteína | Alta densidad energética y polifenoles antioxidantes para recuperación muscular en fases de hipertrofia.',
    preparationNotes:
      'Tostar pan integral multigrano. Untar crema de cacahuate 100% natural templada. Tamizar Whey Isolate vainilla, acomodar fresas y arándanos frescos, y cacao nibs.',
    ingredients: [
      createIngredient('ing_multigrain_slice', 'inv_multigrain_bread', 'Pan integral multigrano artesanal', 2, 'pza'),
      createIngredient('ing_peanut_butter', 'inv_peanut_butter', 'Crema de cacahuate 100% natural sin azúcar', 50, 'g'),
      createIngredient('ing_fresh_strawberries', 'inv_fresh_strawberries', 'Fresas frescas fileteadas', 60, 'g'),
      createIngredient('ing_fresh_blueberries', 'inv_fresh_blueberries', 'Arándanos azules frescos', 30, 'g'),
      createIngredient('ing_cacao_nibs', 'inv_cacao_nibs', 'Nibs de cacao orgánico raw', 10, 'g'),
      createIngredient('ing_whey_vanilla_dust', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla Bourbon (tamizado)', 10, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Tostar las rebanadas de pan multigrano hasta que adquieran firmeza estructural crocante.',
      'Untar generosamente la crema de cacahuate natural sobre ambas rebanadas mientras el pan aún esté caliente.',
      'Tamizar los 10g de Whey Isolate de vainilla directamente sobre la crema de maní para fundir la proteína en la grasa saludable.',
      'Disponer las fresas fileteadas en líneas alternadas con los arándanos frescos enteros.',
      'Espolvorear con nibs de cacao orgánico para añadir textura crocante con toque amargo.',
      'Montar en plato rectangular oscuro o tabla de presentación con servilleta de tela.',
    ],
  },
  {
    productId: 'prod_toast_salmon_ricotta',
    productName: 'Tost Proteico de Salmón Ahumado & Ricotta',
    category: 'toasts',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 5,
    servingSizeGrams: 290,
    allergens: ['Pescado', 'Lácteos', 'Gluten'],
    chefNotes:
      '390 kcal | 31g Proteína | Ácidos grasos Omega-3 EPA y DHA de alto valor biológico. Mantener salmón ahumado a 3°C hasta el montaje.',
    preparationNotes:
      'Tostar pan de centeno oscuro. Batir queso ricotta light con eneldo y ralladura de limón amarillo. Colocar cintas de pepino persa, 100g de salmón noruego en rosas, alcaparras y pimienta rosa.',
    ingredients: [
      createIngredient('ing_rye_slice', 'inv_rye_bread', 'Rebanada grande de pan artesanal de centeno', 70, 'g'),
      createIngredient('ing_smoked_salmon', 'inv_smoked_salmon', 'Salmón noruego ahumado premium', 100, 'g'),
      createIngredient('ing_ricotta_light', 'inv_ricotta_light', 'Queso ricotta light batido al eneldo', 70, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Cintas de pepino persa a la mandolina', 40, 'g'),
      createIngredient('ing_capers', 'inv_capers', 'Alcaparras baby en salmuera escurridas', 10, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Tostar la rebanada de pan de centeno hasta que la corteza esté firme y crujiente.',
      'En un bowl mezclar el queso ricotta light con eneldo fresco picado, ralladura fina de limón amarillo y una pizca de sal.',
      'Untar la ricotta cítrica generosamente sobre toda la rebanada de centeno tostado.',
      'Colocar las láminas de pepino persa onduladas sobre la cama de queso.',
      'Formar pliegues o rosas elegantes con los 100g de salmón ahumado y distribuirlos armónicamente sobre el pepino.',
      'Salpicar con las alcaparras escurridas, ralladura extra de limón amarillo y granos de pimienta rosa triturada.',
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
    allergens: [],
    chefNotes:
      '490 kcal | 48g Proteína magra. Pechuga sellada al dente (74°C interna) cortada en fajitas calientes sobre la base fría de hojas orgánicas.',
    preparationNotes:
      'Sellar 200g de pechuga marinada a las hierbas en plancha (190°C). Laquear mix de lechugas y espinaca con mitad de vinagreta. Disponer quinoa, aguacate, pepino y pollo recién rebanado.',
    ingredients: [
      createIngredient('ing_chicken_breast', 'inv_chicken_breast', 'Pechuga de pollo marinada a las finas hierbas', 200, 'g'),
      createIngredient('ing_mix_greens', 'inv_mix_greens', 'Mix de espinaca baby y lechugas orgánicas', 120, 'g'),
      createIngredient('ing_quinoa_cooked', 'inv_quinoa_cooked', 'Quinoa tricolor cocida al dente', 60, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass fresco en cubos', 50, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Pepino persa en rodajas con cáscara', 50, 'g'),
      createIngredient('ing_cherry_tomatoes', 'inv_cherry_tomatoes', 'Tomates cherry partidos en mitades', 40, 'g'),
      createIngredient('ing_citrus_vinaigrette', 'inv_citrus_vinaigrette', 'Vinagreta cítrica de aceite de oliva virgen', 30, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Asar la pechuga de pollo marinada en plancha a 190°C durante 3 minutos por lado hasta dorar exterior y mantener jugosa por dentro; reposar 2 minutos y cortar en fajitas sesgadas.',
      'En bowl de acero mezclar el mix verde con 15ml de la vinagreta cítrica con movimientos envolventes para laquear sin quebrar hojas.',
      'Disponer la cama verde laqueada en bowl amplio de presentación.',
      'Colocar en cuadrantes ordenados: la quinoa tricolor templada, las mitades de tomate cherry, el pepino persa y los cubos de aguacate hass.',
      'Colocar las fajitas de pechuga de pollo recién cortadas humeantes en el centro del bowl.',
      'Acompañar con el resto de la vinagreta en ramekín individual al costado.',
    ],
  },
  {
    productId: 'prod_salad_tuna_protein',
    productName: 'Ensalada Verde Proteica con Atún Sellado',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 6,
    servingSizeGrams: 460,
    allergens: ['Pescado', 'Sésamo', 'Soya'],
    chefNotes:
      '460 kcal | 46g Proteína | Bajo en carbohidratos. Atún en término sellado tataki (costra crocante de sésamo y corazón rojo frío/tibio). Corte de 8mm con cuchillo afilado.',
    preparationNotes:
      'Rebozar contorno de 180g de atún aleta amarilla en ajonjolí; sellar a 220°C por 45 seg/lado. Mezclar arúgula y kale con edamames, aguacate, pepino y aderezo ponzu al jengibre.',
    ingredients: [
      createIngredient('ing_yellowfin_tuna', 'inv_yellowfin_tuna', 'Medallón de atún aleta amarilla grado sashimi', 180, 'g'),
      createIngredient('ing_sesame_crust', 'inv_sesame_seeds', 'Costra de ajonjolí blanco y negro tostado', 15, 'g'),
      createIngredient('ing_kale_arugula', 'inv_fresh_kale', 'Cama de arúgula silvestre y kale rizado masajeado', 100, 'g'),
      createIngredient('ing_edamames', 'inv_edamames', 'Edamames tiernos al vapor pelados', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en láminas', 50, 'g'),
      createIngredient('ing_persian_cucumber', 'inv_persian_cucumber', 'Pepino persa en medias lunas', 40, 'g'),
      createIngredient('ing_ponzu_dressing', 'inv_ponzu_dressing', 'Aderezo ponzu cítrico con jengibre fresco', 30, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Masajear las hojas de kale con gotas de aceite de oliva para suavizar su fibra y mezclarlas con la arúgula en el bowl base.',
      'Empanizar el borde del medallón de atún fresco con la mezcla de semillas de ajonjolí blanco y negro.',
      'Sellar en sartén de hierro muy caliente a 220°C con un hilo de aceite durante exactamente 45 segundos por lado (núcleo rojo intacto).',
      'Dejar reposar el atún 60 segundos sobre tabla y rebanar con cuchillo liso en rodajas parejas de 8mm.',
      'Montar sobre las hojas verdes los edamames, el pepino persa y el abanico de aguacate fresco.',
      'Desplegar las láminas de atún sellado en abanico sobre la ensalada y acompañar con el aderezo ponzu al jengibre.',
    ],
  },
  {
    productId: 'prod_salad_vegan_tofu',
    productName: 'Ensalada Verde Proteica con Tofu & Edamames',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 8,
    servingSizeGrams: 450,
    allergens: ['Soya', 'Sésamo'],
    chefNotes:
      '440 kcal | 29g Proteína 100% plant-based | Alta en fibra prebiótica. Tofu extra firme dorado con costra crujiente de levadura nutricional y tamari.',
    preparationNotes:
      'Dorar en plancha 180g de tofu en cubos con aceite de sésamo. Base de kale y espinaca con garbanzos crocantes horneados, edamames, pepitas de calabaza y aderezo tahini al limón.',
    ingredients: [
      createIngredient('ing_organic_tofu', 'inv_organic_tofu', 'Tofu orgánico firme marinado en tamari', 180, 'g'),
      createIngredient('ing_crispy_chickpeas', 'inv_crispy_chickpeas', 'Garbanzos especiados horneados crujientes', 50, 'g'),
      createIngredient('ing_edamames', 'inv_edamames', 'Edamames pelados al vapor', 40, 'g'),
      createIngredient('ing_kale_spinach', 'inv_fresh_kale', 'Mix de kale rizado y espinaca baby', 100, 'g'),
      createIngredient('ing_pumpkin_seeds', 'inv_pumpkin_seeds', 'Pepitas de calabaza tostadas', 15, 'g'),
      createIngredient('ing_tahini_dressing', 'inv_tahini_dressing', 'Aderezo cremoso de tahini, ajo y limón', 35, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Cortar el tofu prensado en cubos de 2x2 cm y dorar en plancha a 180°C con unas gotas de aceite de ajonjolí durante 5 minutos rotando hasta dorar todas sus caras.',
      'Disponer la base de hojas de kale rizado masajeado y espinaca baby lavada en el bowl.',
      'Incorporar los edamames al vapor templados y los garbanzos especiados horneados crocantes.',
      'Acomodar los dados dorados de tofu en la parte central superior de la ensalada.',
      'Rociar con el aderezo cremoso de tahini artesanal y espolvorear con las pepitas de calabaza tostadas.',
      'Servir de inmediato para contrastar el calor del tofu y garbanzos con la frescura de las hojas verdes.',
    ],
  },
  {
    productId: 'prod_salad_turkey_cobb',
    productName: 'Ensalada Cobb Atlética de Pavo & Huevo',
    category: 'salads',
    station: 'Barra Fría / Ensaladas',
    prepTimeMinutes: 6,
    servingSizeGrams: 470,
    allergens: ['Huevo', 'Lácteos'],
    chefNotes:
      '470 kcal | 44g Proteína | Estilo Cobb tradicional en franjas geométricas paralelas. Huevos duros cocidos a 9 minutos exactos para yema cremosa.',
    preparationNotes:
      'Disponer cama de lechuga romana. Montar en bandas paralelas: 160g de pavo ahumado salteado, 2 huevos duros en cuartos, dados de panela, tomates cherry y aguacate. Servir con ranch griego.',
    ingredients: [
      createIngredient('ing_smoked_turkey', 'inv_turkey_breast', 'Pechuga de pavo ahumada magra en dados', 160, 'g'),
      createIngredient('ing_hard_boiled_eggs', 'inv_whole_eggs', 'Huevos orgánicos cocidos duros al punto', 2, 'pza'),
      createIngredient('ing_panela_cubes', 'inv_panela_cheese', 'Queso panela artesanal en cubos', 50, 'g'),
      createIngredient('ing_avocado_hass', 'inv_avocado_hass', 'Aguacate Hass en dados medianos', 50, 'g'),
      createIngredient('ing_cherry_tomatoes', 'inv_cherry_tomatoes', 'Tomates cherry cortados a la mitad', 50, 'g'),
      createIngredient('ing_romaine_lettuce', 'inv_mix_greens', 'Mix de lechugas romanas crujientes', 110, 'g'),
      createIngredient('ing_greek_ranch', 'inv_ranch_greek', 'Aderezo ranch fit de yogur griego 0%', 35, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Saltear los cubos de pechuga de pavo ahumada en sartén seco caliente durante 60 segundos para activar aromas y templar la proteína.',
      'Pelar los huevos cocidos al punto y cortarlos con cuidado en cuartos longitudinales simétricos.',
      'Colocar la lechuga romana limpia, seca y picada en la base del plato hondo o bandeja rectangular.',
      'Montar los ingredientes en líneas rectas y uniformes de borde a borde: franja de pavo ahumado, franja de tomates cherry, franja de cuartos de huevo duro, franja de queso panela y franja de dados de aguacate.',
      'Revisar la presentación cuidando que los colores contrasten con precisión visual.',
      'Servir con el aderezo ranch de yogur griego en salsera individual para que el comensal lo agregue a su gusto.',
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
    allergens: ['Apio'],
    chefNotes:
      '95 kcal | Cero azúcar agregada. Prensado en frío a 45 RPM para preservar enzimas y clorofila viva. Servir en vaso de 16oz con hielo roca.',
    preparationNotes:
      'Introducir espinaca y perejil prensados entre trozos de manzana verde y pepino en el extractor cold-pressed. Agregar limón y jengibre fresco. Emulsionar sin hacer espuma.',
    ingredients: [
      createIngredient('ing_spinach_juice', 'inv_baby_spinach', 'Espinaca fresca orgánica para jugo', 50, 'g'),
      createIngredient('ing_cucumber_juice', 'inv_persian_cucumber', 'Pepino europeo con piel desinfectada', 100, 'g'),
      createIngredient('ing_celery_stalks', 'inv_celery', 'Apio verde fresco en ramas crujientes', 80, 'g'),
      createIngredient('ing_green_apple', 'inv_green_apple', 'Manzana verde Granny Smith troceada', 100, 'g'),
      createIngredient('ing_fresh_ginger', 'inv_fresh_ginger', 'Raíz de jengibre fresco pelado', 8, 'g'),
      createIngredient('ing_fresh_lime', 'inv_fresh_limes', 'Limón real recién exprimido', 20, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Lavar y desinfectar todos los vegetales y frutas en solución antiséptica por 3 minutos.',
      'Introducir en el extractor de prensa lenta las hojas de espinaca compactadas entre trozos de manzana verde para exprimir toda la clorofila.',
      'Pasar la raíz de jengibre y el apio crujiente.',
      'Finalizar con el pepino con cáscara para limpiar el conducto del extractor con su abundante agua estructurada.',
      'Integrar el jugo de limón real recién exprimido y mezclar con cuchara mezcladora de barra de vidrio sin batir para no incorporar oxígeno.',
      'Verter en vaso frío de 16oz sobre 3 cubos grandes de hielo purificado y servir de inmediato.',
    ],
  },
  {
    productId: 'prod_juice_beet_citrus',
    productName: 'Jugo Antioxidante de Cítricos y Betabel',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 4,
    servingSizeGrams: 460,
    allergens: [],
    chefNotes:
      '130 kcal | Nitratos naturales precursores de Óxido Nítrico para vasodilatación y bombeo muscular intenso pre-workout.',
    preparationNotes:
      'Prensar betabel crudo, zanahoria, toronja rosa y cúrcuma fresca. Mezclar con 150ml de jugo recién exprimido de naranja Valencia y micro pizca de pimienta para activar curcumina.',
    ingredients: [
      createIngredient('ing_raw_beet', 'inv_raw_beet', 'Betabel fresco crudo pelado', 120, 'g'),
      createIngredient('ing_valencia_oranges', 'inv_valencia_oranges', 'Zumo de naranja Valencia recién exprimido', 150, 'ml'),
      createIngredient('ing_pink_grapefruit', 'inv_pink_grapefruit', 'Toronja rosa fresca pelada en gajos', 80, 'g'),
      createIngredient('ing_fresh_carrots', 'inv_fresh_carrots', 'Zanahoria fresca orgánica', 90, 'g'),
      createIngredient('ing_fresh_turmeric', 'inv_fresh_turmeric', 'Raíz de cúrcuma orgánica fresca', 5, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Exprimir las naranjas Valencia en exprimidor de cítricos reservando el zumo sin semillas.',
      'Alimentar el extractor de prensado en frío con los cubos de betabel crudo, la cúrcuma de raíz y las zanahorias.',
      'Pasar los gajos de toronja rosa por la prensa extrayendo sus aceites esenciales y bioflavonoides.',
      'Combinar en jarra graduada el concentrado de betabel y raíces con el zumo fresco de naranja.',
      'Remover con agitador durante 10 segundos para integrar los matices rubí intenso con los cítricos dorados.',
      'Servir en vaso de 16oz con hielo, decorando con una media luna de toronja en el borde.',
    ],
  },
  {
    productId: 'prod_juice_pineapple_ginger',
    productName: 'Jugo Inmune Gold: Piña, Jengibre & Cúrcuma',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 440,
    allergens: [],
    chefNotes:
      '120 kcal | Altísima concentración de bromelina de piña madura y gingerol para desinflamación articular y recuperación.',
    preparationNotes:
      'Prensar piña miel incluyendo núcleo fibroso con jengibre fresco y cúrcuma. Mezclar con 100ml de jugo de naranja, limón verde y toque milimétrico de pimienta de cayena.',
    ingredients: [
      createIngredient('ing_honey_pineapple', 'inv_honey_pineapple', 'Piña miel madura fresca con corazón fibroso', 160, 'g'),
      createIngredient('ing_orange_juice', 'inv_valencia_oranges', 'Zumo de naranja recién exprimido', 100, 'ml'),
      createIngredient('ing_fresh_ginger', 'inv_fresh_ginger', 'Raíz de jengibre fresca lavada', 12, 'g'),
      createIngredient('ing_fresh_turmeric', 'inv_fresh_turmeric', 'Cúrcuma fresca de raíz', 6, 'g'),
      createIngredient('ing_fresh_lime', 'inv_fresh_limes', 'Jugo de limón verde fresco', 15, 'ml'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Cortar la piña miel conservando el corazón central fibroso (donde reside la máxima densidad de bromelina).',
      'Pasar por el extractor de prensado lento la piña alternando con los trozos de jengibre y cúrcuma.',
      'Unir en jarra mezcladora el jugo prensado con el zumo de naranja y el jugo de limón verde.',
      'Añadir una micro pizca de pimienta de cayena para estimular la circulación sanguínea.',
      'Mezclar suavemente hasta lograr un color amarillo oro intenso y brillante.',
      'Servir sobre abundante hielo en vaso largo con un triángulo decorativo de piña miel fresca.',
    ],
  },
  {
    productId: 'prod_juice_watermelon_hydrate',
    productName: 'Jugo Hidratante Sandía, Fresa & Electrolitos',
    category: 'juices',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 470,
    allergens: [],
    chefNotes:
      '110 kcal | L-Citrulina natural procedente de la pulpa y corteza blanca de la sandía, con agua de coco y sal rosa para reposición electrolítica perfecta.',
    preparationNotes:
      'Prensar sandía fresca y fresas silvestres. Integrar con 120ml de agua de coco fría, sal rosa del Himalaya y hojas de menta activadas.',
    ingredients: [
      createIngredient('ing_fresh_watermelon', 'inv_fresh_watermelon', 'Sandía fresca madura descorazonada', 220, 'g'),
      createIngredient('ing_fresh_strawberries', 'inv_fresh_strawberries', 'Fresas frescas desinfectadas', 60, 'g'),
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco 100% pura y prensada', 120, 'ml'),
      createIngredient('ing_fresh_mint', 'inv_fresh_mint', 'Hojas de menta fresca aromatizadas', 5, 'g'),
      createIngredient('ing_himalayan_salt', 'inv_himalayan_salt', 'Sal rosa del Himalaya (electrolitos)', 1, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Extraer el jugo de sandía fresca en la prensa fría aprovechando la pulpa roja y blanca adyacente a la cáscara.',
      'Prensar las fresas frescas enteras en el mismo ciclo de extracción.',
      'Verter en jarra mezcladora junto con el agua de coco fría.',
      'Disolver el gramo de sal rosa del Himalaya para aportar sodio y potasio bioasimilables.',
      'Dar una palmada a las hojas de menta para despertar sus aceites aromáticos y colocarlas al fondo del vaso.',
      'Llenar el vaso con hielo picado, verter el jugo rojo rubí y decorar con ramillete de menta fresca.',
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
    allergens: ['Lácteos', 'Cacahuate', 'Frutos secos (Almendra)'],
    chefNotes:
      '460 kcal | 38g Proteína. Top ventas #1. Textura cremosa ultra densa tipo milkshake. Licuar proteína al final a baja velocidad para no espumar.',
    preparationNotes:
      'Licuar leche de almendras, plátano congelado, avena y crema de cacahuate 20 seg a velocidad media. Añadir Whey Isolate Chocolate y hielo 12 seg a velocidad baja.',
    ingredients: [
      createIngredient('ing_almond_milk', 'inv_almond_milk', 'Leche de Almendras Sin Azúcar', 250, 'ml'),
      createIngredient('ing_whey_iso_choco', 'inv_whey_iso_choco', 'Whey Isolate Chocolate Suizo (1 scoop)', 30, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano maduro pelado congelado IQF', 80, 'g'),
      createIngredient('ing_peanut_butter', 'inv_peanut_butter', 'Crema de cacahuate 100% natural', 25, 'g'),
      createIngredient('ing_oats', 'inv_oats', 'Avena en hojuelas integral', 20, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 100, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Verter en la jarra de la licuadora industrial primero la base líquida: 250ml de leche de almendras fría.',
      'Añadir el plátano congelado troceado, la avena en hojuelas y los 25g de crema de cacahuate natural.',
      'Encender la licuadora en velocidad progresiva 1 a 7 durante 20 segundos para triturar los sólidos.',
      'Detener motor, añadir el scoop de 30g de Whey Isolate Chocolate y los 100g de cubos de hielo.',
      'Licuar en velocidad baja (velocidad 4) por únicamente 12 segundos para lograr textura sedosa sin generar aire.',
      'Servir inmediatamente en vaso térmico con tapa domo y pajita ancha.',
    ],
  },
  {
    productId: 'prod_green_hulk_nitro',
    productName: 'Smoothie Verde Energizante con Espinaca y Matcha',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 3,
    servingSizeGrams: 470,
    allergens: ['Lácteos', 'Frutos secos (Almendra)'],
    chefNotes:
      '290 kcal | 30g Proteína. Té Matcha grado ceremonial aporta L-teanina y cafeína limpia sostenida sin picos de ansiedad ni caídas bruscas.',
    preparationNotes:
      'Licuar leche de almendras con espinaca, matcha ceremonial, plátano y piña a velocidad alta 25 seg hasta pulverizar hojas. Agregar Whey Isolate Vainilla y hielo 10 seg.',
    ingredients: [
      createIngredient('ing_almond_milk', 'inv_almond_milk', 'Leche de Almendras Sin Azúcar', 250, 'ml'),
      createIngredient('ing_whey_iso_vanilla', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla Bourbon (1 scoop)', 30, 'g'),
      createIngredient('ing_ceremonial_matcha', 'inv_ceremonial_matcha', 'Té Matcha japonés grado ceremonial', 4, 'g'),
      createIngredient('ing_baby_spinach', 'inv_baby_spinach', 'Espinaca baby fresca compactada', 40, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano congelado IQF', 50, 'g'),
      createIngredient('ing_honey_pineapple', 'inv_honey_pineapple', 'Piña fresca en cubos', 40, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 100, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Verter los 250ml de leche de almendras fría en el vaso de la licuadora.',
      'Incorporar la espinaca baby desinfectada, los 4g de matcha ceremonial, el plátano congelado y la piña fresca.',
      'Licuar a velocidad máxima durante 25 segundos hasta que el líquido presente un tono verde esmeralda brillante sin fragmentos visibles de hojas.',
      'Añadir el scoop de Whey Isolate Vainilla y el hielo purificado.',
      'Pulsar a velocidad 4 durante 10 segundos para emulsionar la proteína de manera homogénea.',
      'Verter en vaso transparente permitiendo apreciar el color esmeralda característico.',
    ],
  },
  {
    productId: 'prod_wild_berry_isolate',
    productName: 'Batido Post-Entreno con Creatina & Frutos Rojos',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 470,
    allergens: ['Lácteos'],
    chefNotes:
      '285 kcal | 32g Proteína | 5g Creatina Creapure®. La combinación de frutos rojos ricos en antocianinas y creatina acelera la resíntesis de fosfocreatina muscular.',
    preparationNotes:
      'Licuar agua de coco y frutos rojos con semillas de chía 20 seg a velocidad alta. Añadir Whey Isolate Vainilla, 5g de Creatina Creapure y hielo; pulsar 8 seg.',
    ingredients: [
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco 100% natural isotónica', 250, 'ml'),
      createIngredient('ing_whey_iso_vanilla', 'inv_whey_iso_vanilla', 'Whey Isolate Vainilla Bourbon (1 scoop)', 30, 'g'),
      createIngredient('ing_frozen_berries', 'inv_frozen_berries', 'Mix de frutos rojos silvestres IQF (fresa, arándano, zarzamora)', 90, 'g'),
      createIngredient('ing_creatine', 'inv_creatine', 'Creatina Creapure® Monohidrato', 5, 'g'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 10, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 80, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Verter los 250ml de agua de coco natural en la jarra de la licuadora.',
      'Añadir los frutos rojos congelados y las semillas de chía.',
      'Procesar a velocidad alta durante 20 segundos hasta obtener una base frutal morada espesa.',
      'Agregar la dosis exacta de 5g de Creatina Creapure, el scoop de Whey Isolate Vainilla y el hielo.',
      'Licuar a velocidad baja durante 8 segundos para evitar romper las propiedades de la creatina.',
      'Servir inmediatamente para consumo post-entreno en vaso frío de 16oz.',
    ],
  },
  {
    productId: 'prod_pre_workout_rush',
    productName: 'Smoothie Pre-Workout Shockwave Nitro',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 450,
    allergens: ['Lácteos'],
    chefNotes:
      '225 kcal | 28g Proteína | 10g C4 Nitro + 5g BCAA. Advertir al atleta sobre la sensación de hormigueo (parestesia inofensiva) generada por la beta-alanina.',
    preparationNotes:
      'Granizar agua de coco con fresas congeladas y hielo triturado 12 seg. Añadir Whey Fresa, BCAA y pre-workout C4; pulsar 3 veces por 2 seg para no sobregasificar.',
    ingredients: [
      createIngredient('ing_coconut_water', 'inv_coconut_water', 'Agua de coco pura prensada fría', 250, 'ml'),
      createIngredient('ing_whey_strawberry', 'inv_whey_strawberry', 'Whey Concentrado Fresa Silvestre (1 scoop)', 30, 'g'),
      createIngredient('ing_preworkout', 'inv_preworkout', 'Pre-Workout Pump Nitro C4 Extreme', 10, 'g'),
      createIngredient('ing_bcaa', 'inv_bcaa', 'BCAA Micronizados 2:1:1 Neutros', 5, 'g'),
      createIngredient('ing_frozen_strawberries', 'inv_fresh_strawberries', 'Fresas congeladas IQF', 60, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Hielo purificado triturado', 90, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Colocar el agua de coco fría, las fresas congeladas y el hielo triturado en la jarra.',
      'Licuar a velocidad media por 12 segundos creando una textura tipo granizado ligero (slushie).',
      'Incorporar el scoop de Whey de Fresa Silvestre, la porción de 10g de Pre-Workout C4 y los 5g de BCAA.',
      'Dar solo 3 pulsos cortos de 2 segundos cada uno para disolver los suplementos activos sin crear exceso de espuma efervescente.',
      'Verter directamente en vaso termo y entregar al atleta recomendando ingerir 20-30 min antes de la rutina.',
    ],
  },
  {
    productId: 'prod_vegan_caramel_oats',
    productName: 'Smoothie Vegano Salted Caramel, Avena & Chía',
    category: 'smoothies',
    station: 'Barra de Smoothies y Jugos',
    prepTimeMinutes: 2,
    servingSizeGrams: 480,
    allergens: ['Gluten (Avena si no certificada)'],
    chefNotes:
      '390 kcal | 31g Proteína 100% Plant-Based | Aislado de proteína vegetal de guisante y arroz fermentado sabor caramelo salado. Cero lactosa.',
    preparationNotes:
      'Licuar leche de avena con plátano congelado, avena y chía 20 seg a velocidad alta. Agregar proteína vegana de caramelo salado y hielo 12 seg. Decorar con cacao nibs.',
    ingredients: [
      createIngredient('ing_oat_milk', 'inv_oat_milk', 'Leche de Avena Barista Pro', 250, 'ml'),
      createIngredient('ing_vegan_protein', 'inv_vegan_protein', 'Proteína Vegana Raw Caramelo Salado (1 scoop)', 30, 'g'),
      createIngredient('ing_banana_frozen', 'inv_banana_frozen', 'Plátano maduro pelado congelado IQF', 50, 'g'),
      createIngredient('ing_oats', 'inv_oats', 'Avena en hojuelas integral', 25, 'g'),
      createIngredient('ing_chia_seeds', 'inv_chia_seeds', 'Semillas de chía orgánica', 10, 'g'),
      createIngredient('ing_cacao_nibs', 'inv_cacao_nibs', 'Cacao nibs orgánicos (toppings crujientes)', 10, 'g'),
      createIngredient('ing_ice_cubes', 'inv_ice_cubes', 'Cubos de hielo purificado', 90, 'g'),
    ],
    get baseIngredients() {
      return this.ingredients;
    },
    preparationSteps: [
      'Verter en la licuadora la leche de avena barista, el plátano congelado, la avena en hojuelas y la chía.',
      'Licuar a velocidad alta por 20 segundos para romper los granos de avena y lograr una textura cremosa aterciopelada.',
      'Añadir el scoop de proteína vegana sabor caramelo salado y los cubos de hielo.',
      'Licuar en velocidad media por 12 segundos hasta textura homogénea y densa.',
      'Servir en vaso alto transparente y espolvorear los cacao nibs en la superficie para dar un contraste crujiente de chocolate amargo.',
    ],
  },
];

export const mockRecipes: RecipeBOM[] = MOCK_RECIPES;
export default MOCK_RECIPES;

