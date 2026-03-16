'use client';

import { useState } from 'react';
import type { Product, Supermarket, Category } from '@/lib/types';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import dynamic from 'next/dynamic';

const AddProductDialog = dynamic(() => import('./components/add-product-dialog').then(mod => mod.AddProductDialog), { ssr: false });
const AddSupermarketDialog = dynamic(() => import('./components/add-supermarket-dialog').then(mod => mod.AddSupermarketDialog), { ssr: false });
const CategoryManagerDialog = dynamic(() => import('./components/category-manager-dialog').then(mod => mod.CategoryManagerDialog), { ssr: false });
const SupermarketProductsSheet = dynamic(() => import('./components/supermarket-products-sheet').then(mod => mod.SupermarketProductsSheet), { ssr: false });

export default function CatalogPage() {
  const { toast } = useToast();
  const {
    products,
    supermarkets,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupermarket,
    updateSupermarket,
    deleteSupermarket,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    setSupermarkets
  } = useData();

  const [view, setView] = useState('products');

  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isUpsertSupermarketDialogOpen, setIsUpsertSupermarketDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isProductsSheetOpen, setIsProductsSheetOpen] = useState(false);

  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [supermarketToEdit, setSupermarketToEdit] = useState<Supermarket | undefined>(undefined);
  const [selectedSupermarketForSheet, setSelectedSupermarketForSheet] = useState<Supermarket | null>(null);


  const handleAddOrUpdateProduct = (productData: Omit<Product, 'id'>) => {
    if (productToEdit) {
      updateProduct({ ...productToEdit, ...productData });
      toast({ title: 'Prodotto aggiornato con successo!' });
    } else {
      addProduct(productData);
      toast({ title: 'Prodotto aggiunto con successo!' });
    }
  };

  const handleOpenAddProductDialog = () => {
    setProductToEdit(undefined);
    setIsAddProductDialogOpen(true);
  };

  const handleOpenEditProductDialog = (product: Product) => {
    setProductToEdit(product);
    setIsAddProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    toast({ title: 'Prodotto eliminato.' });
  };

  const handleSaveSupermarket = (supermarketData: Omit<Supermarket, 'id' | 'order'>, id?: string) => {
    if (id) {
      const existingSupermarket = supermarkets.find(s => s.id === id);
      if(existingSupermarket) {
        updateSupermarket({ ...existingSupermarket, ...supermarketData });
        toast({ title: 'Negozio aggiornato.' });
      }
    } else {
      addSupermarket(supermarketData);
      toast({ title: 'Negozio aggiunto.' });
    }
  };

  const handleOpenAddSupermarketDialog = () => {
    setSupermarketToEdit(undefined);
    setIsUpsertSupermarketDialogOpen(true);
  };

  const handleOpenEditSupermarketDialog = (supermarket: Supermarket) => {
    setSupermarketToEdit(supermarket);
    setIsUpsertSupermarketDialogOpen(true);
  }

  const handleDeleteSupermarket = (supermarketId: string) => {
    deleteSupermarket(supermarketId);
     toast({ title: 'Negozio eliminato.' });
  };
  
  const handleReorderSupermarkets = (reorderedSupermarkets: Supermarket[]) => {
    setSupermarkets(reorderedSupermarkets);
    toast({ title: 'Ordine negozi aggiornato' });
  };

  const handleShowSupermarketProducts = (supermarket: Supermarket) => {
    setSelectedSupermarketForSheet(supermarket);
    setIsProductsSheetOpen(true);
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    addCategory(categoryData);
    toast({ title: 'Categoria aggiunta.' });
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
    deleteCategory(categoryId);
    toast({ title: 'Categoria eliminata.' });
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory);
    toast({ title: 'Categoria aggiornata.' });
  };
  
  const handleReorderCategories = (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
    toast({ title: 'Ordine categorie aggiornato.' });
  };

  return (
    <>
      <div className="flex flex-col bg-gray-50 p-4 sm:p-6 lg:p-8 h-full">
        <div className="pt-6 md:pt-0">
          <h1 className="text-3xl font-bold">Catalogo</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci prodotti, negozi e prezzi.
          </p>
        </div>

        <div className="flex items-center gap-2 my-6">
          <Button
            variant="outline"
            className="bg-white shadow rounded-lg h-12 w-auto"
            onClick={() => setIsCategoryManagerOpen(true)}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            CATEGORIE
          </Button>
            <Button
              className="shadow rounded-lg h-12 flex-1"
              onClick={view === 'products' ? handleOpenAddProductDialog : handleOpenAddSupermarketDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              {view === 'products' ? 'NUOVO PRODOTTO' : 'NUOVO NEGOZIO'}
            </Button>
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

        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {view === 'products' ? (
            <ProductList
              products={products}
              supermarkets={supermarkets}
              allCategories={categories}
              onEditProductClick={handleOpenEditProductDialog}
              onDeleteProduct={handleDeleteProduct}
            />
          ) : (
            <SupermarketList
              supermarkets={supermarkets}
              onDeleteSupermarket={handleDeleteSupermarket}
              onReorder={handleReorderSupermarkets}
              onEditSupermarket={handleOpenEditSupermarketDialog}
              onShowProducts={handleShowSupermarketProducts}
            />
          )}
        </div>
      </div>
      <AddProductDialog
        isOpen={isAddProductDialogOpen}
        setIsOpen={setIsAddProductDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddOrUpdateProduct}
        categories={[...new Set(categories.map(c => c.name))]}
        productToEdit={productToEdit}
      />
      <AddSupermarketDialog
        isOpen={isUpsertSupermarketDialogOpen}
        setIsOpen={setIsUpsertSupermarketDialogOpen}
        onSave={handleSaveSupermarket}
        supermarketToEdit={supermarketToEdit}
      />
      <CategoryManagerDialog
        isOpen={isCategoryManagerOpen}
        setIsOpen={setIsCategoryManagerOpen}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateCategory={handleUpdateCategory}
        onReorder={handleReorderCategories}
      />
      <SupermarketProductsSheet
        isOpen={isProductsSheetOpen}
        setIsOpen={setIsProductsSheetOpen}
        supermarket={selectedSupermarketForSheet}
        allProducts={products}
      />
    </>
  );
}
