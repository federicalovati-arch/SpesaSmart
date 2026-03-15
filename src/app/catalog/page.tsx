'use client';

import { useState } from 'react';
import { mockProducts, mockSupermarkets, mockCategories } from '@/lib/data';
import type { Product, Supermarket, Category } from '@/lib/types';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { AddProductDialog } from './components/add-product-dialog';
import { AddSupermarketDialog } from './components/add-supermarket-dialog';
import { CategoryManagerDialog } from './components/category-manager-dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CatalogPage() {
  const { toast } = useToast();
  const [view, setView] = useState('products');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(mockSupermarkets);

  const [categories, setCategories] = useState<Category[]>(
    mockCategories.sort((a, b) => a.order - b.order)
  );

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddSupermarketDialogOpen, setIsAddSupermarketDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const [productToEdit, setProductToEdit] = useState<Product | undefined>(
    undefined
  );

  const handleAddOrUpdateProduct = (productData: Omit<Product, 'id'>) => {
    if (productToEdit) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productToEdit.id ? { ...productToEdit, ...productData } : p
        )
      );
    } else {
      // Add new product
      const newProductWithId = { ...productData, id: `p${Date.now()}` };
      setProducts((prev) => [newProductWithId, ...prev]);
    }
  };

  const handleOpenAddDialog = () => {
    setProductToEdit(undefined);
    setIsAddProductDialogOpen(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setProductToEdit(product);
    setIsAddProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddSupermarket = (supermarketData: Omit<Supermarket, 'id'>) => {
    const newSupermarket = { ...supermarketData, id: `s${Date.now()}` };
    setSupermarkets((prev) => [...prev, newSupermarket]);
  };

  const handleDeleteSupermarket = (supermarketId: string) => {
    setSupermarkets((prev) => prev.filter((s) => s.id !== supermarketId));
    // Also remove prices associated with this supermarket from all products
    setProducts((prevProducts) =>
      prevProducts.map((p) => ({
        ...p,
        prices: p.prices.filter(
          (price) => price.supermarketId !== supermarketId
        ),
      }))
    );
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...categoryData, id: `cat${Date.now()}` };
    setCategories((prev) =>
      [...prev, newCategory].sort((a, b) => a.order - b.order)
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find((c) => c.id === categoryId);
    if (!categoryToDelete) return;
    
    const isCategoryInUse = products.some(p => p.category === categoryToDelete.name);
    if (isCategoryInUse) {
      toast({
        variant: 'destructive',
        title: 'Impossibile eliminare la categoria',
        description: `La categoria "${categoryToDelete.name}" è utilizzata da uno o più prodotti.`,
      });
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    const oldCategory = categories.find((c) => c.id === updatedCategory.id);
    if (!oldCategory) return;

    setCategories((prev) =>
      prev
        .map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
        .sort((a, b) => a.order - b.order)
    );

    // Update products if category name changed
    if (oldCategory.name !== updatedCategory.name) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === oldCategory.name
            ? { ...p, category: updatedCategory.name }
            : p
        )
      );
    }
  };

  return (
    <>
      <main className="flex flex-col flex-1 bg-gray-50">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <div className="pt-6">
            <h1 className="text-3xl font-bold">Catalogo</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci prodotti, negozi e prezzi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 my-6">
            <Button
              variant="outline"
              className="bg-white shadow rounded-lg h-12 w-full sm:w-auto"
              onClick={() => setIsCategoryManagerOpen(true)}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              CATEGORIE
            </Button>
            {view === 'products' ? (
              <Button
                className="shadow rounded-lg h-12 w-full sm:flex-1"
                onClick={handleOpenAddDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                NUOVO PRODOTTO
              </Button>
            ) : (
              <Button
                className="shadow rounded-lg h-12 w-full sm:flex-1"
                onClick={() => setIsAddSupermarketDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                NUOVO NEGOZIO
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center p-1 rounded-full bg-gray-200/60 w-full max-w-xs mx-auto mb-6">
            <button
              onClick={() => setView('products')}
              className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                view === 'products'
                  ? 'bg-white shadow text-primary'
                  : 'bg-transparent text-gray-500'
              }`}
            >
              PRODOTTI
            </button>
            <button
              onClick={() => setView('supermarkets')}
              className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                view === 'supermarkets'
                  ? 'bg-white shadow text-primary'
                  : 'bg-transparent text-gray-500'
              }`}
            >
              NEGOZI
            </button>
          </div>

          {view === 'products' ? (
            <ProductList
              products={products}
              supermarkets={supermarkets}
              allCategories={categories}
              onEditProductClick={handleOpenEditDialog}
              onDeleteProduct={handleDeleteProduct}
            />
          ) : (
            <SupermarketList
              supermarkets={supermarkets}
              onDeleteSupermarket={handleDeleteSupermarket}
            />
          )}
        </div>
      </main>
      <AddProductDialog
        isOpen={isAddProductDialogOpen}
        setIsOpen={setIsAddProductDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddOrUpdateProduct}
        categories={categories.map(c => c.name)}
        productToEdit={productToEdit}
      />
      <AddSupermarketDialog
        isOpen={isAddSupermarketDialogOpen}
        setIsOpen={setIsAddSupermarketDialogOpen}
        onAddSupermarket={handleAddSupermarket}
      />
      <CategoryManagerDialog
        isOpen={isCategoryManagerOpen}
        setIsOpen={setIsCategoryManagerOpen}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateCategory={handleUpdateCategory}
      />
    </>
  );
}
