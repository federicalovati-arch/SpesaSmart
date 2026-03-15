'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
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
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

// Define the shape of our context
interface DataContextType {
  products: Product[];
  supermarkets: Supermarket[];
  categories: Category[];
  shoppingLists: ShoppingList[];
  receipts: Receipt[];
  loading: boolean;
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

// Define a mapping from collection names to their mock data
const MOCK_DATA_MAP: { [key: string]: any[] } = {
  products: mockProducts,
  supermarkets: mockSupermarkets,
  categories: mockCategories,
  shoppingLists: mockShoppingLists,
  receipts: mockReceipts,
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  // Local state for guest users
  const [localProducts, setLocalProducts] = useState<Product[]>(mockProducts);
  const [localSupermarkets, setLocalSupermarkets] = useState<Supermarket[]>(mockSupermarkets);
  const [localCategories, setLocalCategories] = useState<Category[]>(mockCategories.sort((a,b)=>a.order - b.order));
  const [localShoppingLists, setLocalShoppingLists] = useState<ShoppingList[]>(mockShoppingLists);
  const [localReceipts, setLocalReceipts] = useState<Receipt[]>(mockReceipts);
  
  const [isSyncing, setIsSyncing] = useState(false);

  // Firestore collections for authenticated users
  const { data: firestoreProducts, loading: loadingProducts } = useCollection<Product>(
    user && firestore ? collection(firestore, 'users', user.uid, 'products') : null
  );
  const { data: firestoreSupermarkets, loading: loadingSupermarkets } = useCollection<Supermarket>(
    user && firestore ? collection(firestore, 'users', user.uid, 'supermarkets') : null
  );
  const { data: firestoreCategories, loading: loadingCategories } = useCollection<Category>(
    user && firestore ? collection(firestore, 'users', user.uid, 'categories') : null
  );
  const { data: firestoreShoppingLists, loading: loadingShoppingLists } = useCollection<ShoppingList>(
    user && firestore ? collection(firestore, 'users', user.uid, 'shoppingLists') : null
  );
  const { data: firestoreReceipts, loading: loadingReceipts } = useCollection<Receipt>(
    user && firestore ? collection(firestore, 'users', user.uid, 'receipts') : null
  );

  const getCollectionRef = useCallback((name: string) => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, name);
  }, [user, firestore]);
  
  // Sync local data to Firestore on first login
  useEffect(() => {
    const syncData = async () => {
      if (user && firestore && !isSyncing) {
        setIsSyncing(true);
        try {
          const collections = ['products', 'supermarkets', 'categories', 'shoppingLists', 'receipts'];
          const batch = writeBatch(firestore);

          for (const collectionName of collections) {
             const localData = (MOCK_DATA_MAP as any)[collectionName];
             if (localData) {
               for (const item of localData) {
                 const docRef = doc(firestore, 'users', user.uid, collectionName, item.id);
                 batch.set(docRef, item);
               }
             }
          }
          await batch.commit();
        } catch (error) {
          console.error("Error syncing data to Firestore:", error);
        } finally {
          setIsSyncing(false); 
        }
      }
    };
  
    // Only sync if Firestore collections are empty, to avoid overwriting existing user data.
    if (user && firestoreProducts?.length === 0 && localProducts.length > 0) {
      syncData();
    }
  }, [user, firestore, firestoreProducts, localProducts, isSyncing]);

  const useFirestoreMutation = <T extends { id: string }>(collectionName: string) => {
    const collectionRef = getCollectionRef(collectionName);
    
    const addItem = (itemData: Omit<T, 'id'>) => {
      if (collectionRef) {
        const docRef = doc(collectionRef);
        // addDoc(collectionRef, { ...itemData, id: docRef.id });
      }
    };
    // ... other mutations ...
    return { addItem };
  };

  // Determine which data to use
  const products = user ? firestoreProducts || [] : localProducts;
  const supermarkets = user ? firestoreSupermarkets || [] : localSupermarkets;
  const categories = user ? (firestoreCategories || []).sort((a,b)=>a.order - b.order) : localCategories;
  const shoppingLists = user ? firestoreShoppingLists || [] : localShoppingLists;
  const receipts = user ? firestoreReceipts || [] : localReceipts;
  const loading = user ? (loadingProducts || loadingSupermarkets || loadingCategories || loadingShoppingLists || loadingReceipts) : false;

  // Generic mutation function
  const createMutation = <T extends { id: string }>(
    collectionName: string,
    localSetter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    const collectionRef = getCollectionRef(collectionName);

    const add = async (data: Omit<T, 'id'>) => {
      const newId = `id-${Date.now()}`;
      const newItem = { ...data, id: newId } as T;
      if (user && collectionRef) {
        // await setDoc(doc(collectionRef, newId), newItem);
      } else {
        localSetter((prev) => [newItem, ...prev]);
      }
    };

    const update = async (updatedItem: T) => {
       if (user && collectionRef) {
        // await setDoc(doc(collectionRef, updatedItem.id), updatedItem);
       } else {
         localSetter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
       }
    };
    
    const remove = async (id: string) => {
        if (user && collectionRef) {
            // await deleteDoc(doc(collectionRef, id));
        } else {
            localSetter(prev => prev.filter(item => item.id !== id));
        }
    };

    return { add, update, remove };
  };

    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct = { ...productData, id: `p${Date.now()}` };
        if (user) { /* Firestore logic here */ } 
        else setLocalProducts((prev) => [newProduct, ...prev]);
    };
    const updateProduct = (updatedProduct: Product) => {
        if (user) { /* ... */ }
        else setLocalProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    };
    const deleteProduct = (productId: string) => {
        if (user) { /* ... */ }
        else setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const addSupermarket = (supermarketData: Omit<Supermarket, 'id'>) => {
        const newSupermarket = { ...supermarketData, id: `s${Date.now()}` };
        if (user) { /* ... */ }
        else setLocalSupermarkets((prev) => [...prev, newSupermarket]);
    };
    const deleteSupermarket = (supermarketId: string) => {
        if (user) { /* ... */ }
        else {
            setLocalSupermarkets((prev) => prev.filter((s) => s.id !== supermarketId));
            setLocalProducts((prevProducts) =>
            prevProducts.map((p) => ({
                ...p,
                prices: p.prices.filter(
                (price) => price.supermarketId !== supermarketId
                ),
            }))
            );
        }
    };

    const addCategory = (categoryData: Omit<Category, 'id'>) => {
        const newCategory: Category = { ...categoryData, id: `cat${Date.now()}` };
        if (user) { /* ... */ }
        else setLocalCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order));
    };
    const updateCategory = (updatedCategory: Category) => {
        if (user) { /* ... */ }
        else {
            const oldCategory = categories.find((c) => c.id === updatedCategory.id);
            setLocalCategories((prev) =>
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
        }
    };
    const deleteCategory = (categoryId: string) => {
        if(user) {}
        else setLocalCategories((prev) => prev.filter((c) => c.id !== categoryId));
    };

    const addShoppingList = (listData: Omit<ShoppingList, 'id' | 'createdAt'>) => {
        const newList = { ...listData, id: `l${Date.now()}`, createdAt: new Date().toISOString() };
        if (user) {}
        else setLocalShoppingLists(prev => [newList, ...prev]);
    };
    const updateShoppingList = (updatedList: ShoppingList) => {
        if (user) {}
        else setLocalShoppingLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
    };
    const deleteShoppingList = (listId: string) => {
        if (user) {}
        else setLocalShoppingLists(prev => prev.filter(l => l.id !== listId));
    };

    const archiveShoppingList = (receipt: Receipt) => {
        if (user) {}
        else {
            setLocalReceipts(prev => [receipt, ...prev].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
            deleteShoppingList(receipt.originalListId);
        }
    };

    const unarchiveReceipt = (receiptId: string) => {
        const receiptToRestore = receipts.find(r => r.id === receiptId);
        if (receiptToRestore) {
            const originalList = mockShoppingLists.find(l => l.id === receiptToRestore.originalListId);
            if (originalList) { // This logic needs to be better
                if (user) {}
                else {
                    setLocalShoppingLists(prev => [originalList, ...prev]);
                    setLocalReceipts(prev => prev.filter(r => r.id !== receiptId));
                }
            }
        }
    };


  const value: DataContextType = {
    products,
    supermarkets,
    categories,
    shoppingLists,
    receipts,
    loading,
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
