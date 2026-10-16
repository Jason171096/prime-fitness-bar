import { useState } from 'react';
import { Header, type AppViewMode } from './components/common/Header';
import { ProductCatalog } from './components/pos/ProductCatalog';
import { CartSidebar } from './components/pos/CartSidebar';
import { CustomizerModal } from './components/pos/CustomizerModal';
import { CheckoutModal } from './components/pos/CheckoutModal';
import { PrintSimulatorModal } from './components/label/PrintSimulatorModal';
import { OrderSuccessModal } from './components/pos/OrderSuccessModal';
import { KDSScreen } from './components/kds/KDSScreen';
import { InventoryScreen } from './components/inventory/InventoryScreen';
import { BillingView } from './components/billing/BillingView';
import { Toast } from './components/common/Toast';
import { usePOSStore } from './store/posStore';
import { MOCK_PRODUCTS } from './data/mockProducts';

export function App() {
  const [activeView, setActiveView] = useState<AppViewMode>('pos');
  const openLabelPreview = usePOSStore((s) => s.openLabelPreview);

  const handleOpenQuickLabel = () => {
    // Open sticker label preview with a representative smoothie item
    const sampleItem = {
      cartItemId: 'sample-quick-label',
      product: MOCK_PRODUCTS[0],
      quantity: 1,
      finalPrice: 8.90,
      customization: {
        customerName: 'Carlos Mendoza (Socio #1042)',
        size: {
          id: '24oz' as const,
          label: 'Monster 24 oz',
          sublabel: 'Alto Rendimiento',
          volumeLabel: '24 oz (710 ml)',
          priceMultiplier: 1.25,
          macroMultiplier: 1.35,
        },
        liquidBase: {
          id: 'liq_almond',
          name: 'Leche de Almendras (Sin Azúcar)',
          shortName: 'Leche Almendras',
          price: 0.60,
          volumeMl: 250,
          inventoryItemId: 'inv_almond_milk',
          macros: { calories: 35, protein: 1.2, carbs: 1.0, fat: 2.8 },
        },
        protein: {
          id: 'prot_isolate_choco',
          name: 'Whey Isolate CFM (90%)',
          flavor: 'Chocolate Suizo Belga',
          type: 'isolate' as const,
          pricePerScoop: 2.0,
          scoopGrams: 30,
          inventoryItemId: 'inv_whey_iso_choco',
          macrosPerScoop: { calories: 112, protein: 27.0, carbs: 0.8, fat: 0.4 },
        },
        proteinScoops: 2,
        extras: [
          {
            id: 'ext_creatine',
            name: 'Creatina Creapure® (5g)',
            category: 'functional' as const,
            price: 1.20,
            servingSize: '5g (1 scoop)',
            gramsDeducted: 5,
            highlight: 'Creapure® 99.9%',
            inventoryItemId: 'inv_creatine',
            macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          },
          {
            id: 'ext_peanut_butter',
            name: 'Crema de Cacahuate 100%',
            category: 'topping' as const,
            price: 0.90,
            servingSize: '25g',
            gramsDeducted: 25,
            inventoryItemId: 'inv_peanut_butter',
            macros: { calories: 155, protein: 7.2, carbs: 3.8, fat: 12.5 },
          },
        ],
        specialNotes: 'Extra frío con hielo frappé',
        calculatedMacros: {
          calories: 660,
          protein: 67,
          carbs: 52,
          fat: 19,
        },
        unitPrice: 8.90,
      },
    };

    openLabelPreview(sampleItem, 104);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Universal POS Header */}
      <Header
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onOpenQuickLabel={handleOpenQuickLabel}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeView === 'pos' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Catalog Grid */}
            <ProductCatalog />
            {/* Active Cart & Checkout Trigger */}
            <CartSidebar onNavigateToBilling={() => setActiveView('billing')} />
          </div>
        )}

        {activeView === 'billing' && <BillingView />}

        {activeView === 'kds' && <KDSScreen />}

        {activeView === 'inventory' && <InventoryScreen />}
      </main>

      {/* Global Interactive Modals */}
      <CustomizerModal />
      <CheckoutModal />
      <PrintSimulatorModal />
      <OrderSuccessModal onNavigateToKDS={() => setActiveView('kds')} />
      <Toast />
    </div>
  );
}

export default App;
