'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  mockProducts,
  mockSupermarkets,
  mockCategories,
  mockShoppingLists,
  mockReceipts,
} from '@/lib/data';
import type {
  Product,
  Supermarket,
  Category,
  ShoppingList,
  Receipt,
} from '@/lib/types';

interface DataContextType {
  products: Product[];
  supermarkets: Supermarket[];
  categories: Category[];
  shoppingLists: ShoppingList[];
  receipts: Receipt[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addSupermarket: (supermarket: Omit<Supermarket, 'id'>) => void;
  deleteSupermarket: (supermarketId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addShoppingList: (list: Omit<ShoppingList, 'id' | 'createdAt'>) => void;
  updateShoppingList: (list: ShoppingList) => void;
  deleteShoppingList: (listId: string) => void;
  archiveShoppingList: (receipt: Receipt) => void;
  unarchiveReceipt: (receiptId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(mockSupermarkets);
  const [categories, setCategories] = useState<Category[]>(
    mockCategories.sort((a, b) => a.order - b.order)
  );
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>(mockShoppingLists);
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);

  // Product mutations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = { ...productData, id: `p${Date.now()}` };
    setProducts((prev) => [newProduct, ...prev]);
  };
  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };
  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Supermarket mutations
  const addSupermarket = (supermarketData: Omit<Supermarket, 'id'>) => {
    const newSupermarket = { ...supermarketData, id: `s${Date.now()}` };
    setSupermarkets((prev) => [...prev, newSupermarket]);
  };
  const deleteSupermarket = (supermarketId: string) => {
    setSupermarkets((prev) => prev.filter((s) => s.id !== supermarketId));
    setProducts((prevProducts) =>
      prevProducts.map((p) => ({
        ...p,
        prices: p.prices.filter(
          (price) => price.supermarketId !== supermarketId
        ),
      }))
    );
  };

  // Category mutations
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...categoryData, id: `cat${Date.now()}` };
    setCategories((prev) =>
      [...prev, newCategory].sort((a, b) => a.order - b.order)
    );
  };
  const updateCategory = (updatedCategory: Category) => {
    const oldCategory = categories.find((c) => c.id === updatedCategory.id);
    setCategories((prev) =>
      prev
        .map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
        .sort((a, b) => a.order - b.order)
    );
    if (oldCategory && oldCategory.name !== updatedCategory.name) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === oldCategory.name
            ? { ...p, category: updatedCategory.name }
            : p
        )
      );
    }
  };
  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Shopping List mutations
  const addShoppingList = (listData: Omit<ShoppingList, 'id' | 'createdAt'>) => {
      const newList = { ...listData, id: `l${Date.now()}`, createdAt: new Date().toISOString() };
      setShoppingLists(prev => [newList, ...prev]);
  };
  const updateShoppingList = (updatedList: ShoppingList) => {
    setShoppingLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  };
  const deleteShoppingList = (listId: string) => {
    setShoppingLists(prev => prev.filter(l => l.id !== listId));
  };

  // Archive / Receipt mutations
  const archiveShoppingList = (receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
    deleteShoppingList(receipt.originalListId);
  };

  const unarchiveReceipt = (receiptId: string) => {
    const receiptToRestore = receipts.find(r => r.id === receiptId);
    if (receiptToRestore) {
        const originalList = shoppingLists.find(l => l.id === receiptToRestore.originalListId);
        // This assumes we stored the original list or can reconstruct it.
        // For now, let's just add it back. A better implementation might store the original list object.
        if (originalList) {
             setShoppingLists(prev => [originalList, ...prev]);
             setReceipts(prev => prev.filter(r => r.id !== receiptId));
        }
    }
  };


  const value = {
    products,
    supermarkets,
    categories,
    shoppingLists,
    receipts,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupermarket,
    deleteSupermarket,
    addCategory,
    updateCategory,
    deleteCategory,
    addShoppingList,
    updateShoppingList,
    deleteShoppingList,
    archiveShoppingList,
    unarchiveReceipt,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
