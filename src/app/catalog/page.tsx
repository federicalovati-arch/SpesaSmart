'use client';

import { useState, useMemo } from 'react';
import { mockProducts, mockSupermarkets } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { AddProductDialog } from './components/add-product-dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus } from 'lucide-react';

export default function CatalogPage() {
  const [view, setView] = useState('products');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);

  const supermarkets = mockSupermarkets;

  const handleAddOrUpdateProduct = (productData: Omit<Product, 'id'>) => {
    if (productToEdit) {
      // Update existing product
      setProducts(prev => prev.map(p => p.id === productToEdit.id ? { ...productToEdit, ...productData } : p));
    } else {
      // Add new product
      const newProductWithId = { ...productData, id: `p${Date.now()}` };
      setProducts((prev) => [newProductWithId, ...prev]);
    }
  };

  const handleOpenAddDialog = () => {
    setProductToEdit(undefined);
    setIsAddProductDialogOpen(true);
  }
  
  const handleOpenEditDialog = (product: Product) => {
      setProductToEdit(product);
      setIsAddProductDialogOpen(true);
  }
  
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category);
    return [...new Set(allCategories)];
  }, [products]);

  return (
    <>
      <main className="flex flex-col flex-1 bg-gray-50">
        <div className="bg-primary text-primary-foreground p-6 pt-12">
            <h1 className="text-3xl font-bold">Catalogo</h1>
            <p className="text-primary-foreground/80 mt-1">Gestisci prodotti, negozi e prezzi.</p>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <div className="flex items-center gap-2 mb-6 -mt-16">
                 <Button variant="outline" className="bg-white shadow rounded-lg h-12">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    CATEGORIE
                </Button>
                <Button className="shadow rounded-lg h-12 flex-1" onClick={handleOpenAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    NUOVO PRODOTTO
                </Button>
            </div>

            <div className="flex items-center justify-center p-1 rounded-full bg-gray-200/60 w-full max-w-xs mx-auto mb-6">
                <button onClick={() => setView('products')} className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${view === 'products' ? 'bg-white shadow text-primary' : 'bg-transparent text-gray-500'}`}>
                    PRODOTTI
                </button>
                <button onClick={() => setView('supermarkets')} className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${view === 'supermarkets' ? 'bg-white shadow text-primary' : 'bg-transparent text-gray-500'}`}>
                    NEGOZI
                </button>
            </div>

            {view === 'products' ? (
              <ProductList products={products} supermarkets={supermarkets} onEditProductClick={handleOpenEditDialog} />
            ) : (
              <SupermarketList supermarkets={supermarkets} />
            )}
        </div>
        
      </main>
      <AddProductDialog
        isOpen={isAddProductDialogOpen}
        setIsOpen={setIsAddProductDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddOrUpdateProduct}
        categories={categories}
        productToEdit={productToEdit}
      />
    </>
  );
}
