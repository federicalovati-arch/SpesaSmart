'use client';

import { useState } from 'react';
import { mockProducts, mockSupermarkets } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus } from 'lucide-react';
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

  return (
    <>
      <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Catalogo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestisci prodotti, negozi e prezzi.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" className="bg-white rounded-full">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Categorie
          </Button>
          <Button className="rounded-full" onClick={() => setIsAddProductDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Prodotto
          </Button>
        </div>

        <div className="flex items-center justify-center p-1 rounded-full bg-gray-200/60 w-full max-w-xs mx-auto mb-6">
            <button onClick={() => setView('products')} className={`flex-1 text-center py-1.5 px-4 rounded-full text-sm font-medium transition-all ${view === 'products' ? 'bg-white shadow text-primary' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}>
                Prodotti
            </button>
            <button onClick={() => setView('supermarkets')} className={`flex-1 text-center py-1.5 px-4 rounded-full text-sm font-medium transition-all ${view === 'supermarkets' ? 'bg-white shadow text-primary' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}>
                Negozi
            </button>
        </div>

        {view === 'products' ? (
          <ProductList products={products} supermarkets={supermarkets} />
        ) : (
          <SupermarketList supermarkets={supermarkets} />
        )}
      </main>
      <AddProductDialog
        isOpen={isAddProductDialogOpen}
        setIsOpen={setIsAddProductDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
