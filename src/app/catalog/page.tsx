'use client';

import { useState, useMemo } from 'react';
import { mockProducts, mockSupermarkets } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { AddProductDialog } from './components/add-product-dialog';

export default function CatalogPage() {
  const [view, setView] = useState('products');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const supermarkets = mockSupermarkets;

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    // In a real app, this would be an API call
    const newProductWithId = { ...newProduct, id: `p${Date.now()}` };
    setProducts((prev) => [newProductWithId, ...prev]);
  };
  
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category);
    return ['Tutte', ...Array.from(new Set(allCategories))];
  }, [products]);

  return (
    <>
      <main className="flex flex-col flex-1 bg-gray-50">
        <div className="bg-primary text-primary-foreground p-4 sm:p-6 lg:p-8 pt-12 text-center relative">
            <h1 className="text-2xl font-bold">Catalogo</h1>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 -mt-8">
            <div className="flex items-center justify-center p-1 rounded-full bg-primary/20 w-full max-w-xs mx-auto mb-6">
                <button onClick={() => setView('products')} className={`flex-1 text-center py-1.5 px-4 rounded-full text-sm font-medium transition-all ${view === 'products' ? 'bg-white shadow text-primary' : 'bg-transparent text-primary-foreground/80 hover:text-primary-foreground'}`}>
                    Prodotti
                </button>
                <button onClick={() => setView('supermarkets')} className={`flex-1 text-center py-1.5 px-4 rounded-full text-sm font-medium transition-all ${view === 'supermarkets' ? 'bg-white shadow text-primary' : 'bg-transparent text-primary-foreground/80 hover:text-primary-foreground'}`}>
                    Negozi
                </button>
            </div>

            {view === 'products' ? (
              <ProductList products={products} supermarkets={supermarkets} onAddProductClick={() => setIsAddProductDialogOpen(true)} />
            ) : (
              <SupermarketList supermarkets={supermarkets} />
            )}
        </div>
        
      </main>
      <AddProductDialog
        isOpen={isAddProductDialogOpen}
        setIsOpen={setIsAddProductDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddProduct}
        categories={useMemo(() => Array.from(new Set(products.map(p => p.category))), [products])}
      />
    </>
  );
}
