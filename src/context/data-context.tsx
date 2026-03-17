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
  ShoppingListItem,
} from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// Helper to get initial state from localStorage or fallback
const getInitialState = <T>(key: string, fallback: T[]): T[] => {
  // This function should only be called on the client.
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    // Ensure we return an array, handle potential null from localStorage
    const parsedItem = item ? JSON.parse(item) : null;
    return Array.isArray(parsedItem) ? parsedItem : fallback;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return fallback;
  }
};


type AllData = {
  products: Product[];
  supermarkets: Supermarket[];
  categories: Category[];
  shoppingLists: ShoppingList[];
  receipts: Receipt[];
};

// Define the shape of our context
interface DataContextType extends AllData {
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductBasePrice: (productId: string, supermarketId: string, newPrice: number) => void;
  addSupermarket: (supermarket: Omit<Supermarket, 'id' | 'order'>) => void;
  updateSupermarket: (supermarket: Supermarket) => void;
  deleteSupermarket: (supermarketId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addShoppingList: (list: Omit<ShoppingList, 'id' | 'createdAt' | 'order'>) => void;
  updateShoppingList: (list: ShoppingList) => void;
  deleteShoppingList: (listId: string) => void;
  duplicateShoppingList: (listId: string) => string | undefined;
  archiveShoppingList: (receipt: Receipt) => void;
  unarchiveReceipt: (receiptId: string) => void;
  setCategories: (categories: Category[]) => void;
  setSupermarkets: (supermarkets: Supermarket[]) => void;
  setShoppingLists: (lists: ShoppingList[]) => void;
  importData: (data: Partial<AllData>) => Promise<void>;
  exportData: () => AllData;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  products: 'spesa-smart-products',
  supermarkets: 'spesa-smart-supermarkets',
  categories: 'spesa-smart-categories',
  shoppingLists: 'spesa-smart-shoppingLists',
  receipts: 'spesa-smart-receipts',
};


export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [localDataLoaded, setLocalDataLoaded] = useState(false);

  // Initialize with empty arrays to prevent hydration mismatch.
  // The server and initial client render will both have empty data.
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localSupermarkets, setLocalSupermarkets] = useState<Supermarket[]>([]);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localShoppingLists, setLocalShoppingLists] = useState<ShoppingList[]>([]);
  const [localReceipts, setLocalReceipts] = useState<Receipt[]>([]);
  
  // Load guest data from localStorage on the client after mount.
  useEffect(() => {
    // is triggered on mount, and when the user logs out.
    if (!user) {
      setLocalProducts(getInitialState(LOCAL_STORAGE_KEYS.products, mockProducts));
      setLocalSupermarkets(getInitialState(LOCAL_STORAGE_KEYS.supermarkets, mockSupermarkets).sort((a,b) => a.order - b.order));
      setLocalCategories(getInitialState(LOCAL_STORAGE_KEYS.categories, mockCategories).sort((a,b)=>a.order - b.order));
      setLocalShoppingLists(getInitialState(LOCAL_STORAGE_KEYS.shoppingLists, mockShoppingLists).sort((a,b) => a.order - b.order));
      setLocalReceipts(getInitialState(LOCAL_STORAGE_KEYS.receipts, mockReceipts));
      setLocalDataLoaded(true);
    }
  }, [user]);

  // Effects to save guest data to localStorage
  useEffect(() => { if (!user && localDataLoaded) localStorage.setItem(LOCAL_STORAGE_KEYS.products, JSON.stringify(localProducts)); }, [localProducts, user, localDataLoaded]);
  useEffect(() => { if (!user && localDataLoaded) localStorage.setItem(LOCAL_STORAGE_KEYS.supermarkets, JSON.stringify(localSupermarkets)); }, [localSupermarkets, user, localDataLoaded]);
  useEffect(() => { if (!user && localDataLoaded) localStorage.setItem(LOCAL_STORAGE_KEYS.categories, JSON.stringify(localCategories)); }, [localCategories, user, localDataLoaded]);
  useEffect(() => { if (!user && localDataLoaded) localStorage.setItem(LOCAL_STORAGE_KEYS.shoppingLists, JSON.stringify(localShoppingLists)); }, [localShoppingLists, user, localDataLoaded]);
  useEffect(() => { if (!user && localDataLoaded) localStorage.setItem(LOCAL_STORAGE_KEYS.receipts, JSON.stringify(localReceipts)); }, [localReceipts, user, localDataLoaded]);


  const [isSyncing, setIsSyncing] = useState(false);

  const productsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'products');
  }, [user, firestore]);
  const { data: firestoreProducts, loading: loadingProducts } = useCollection<Product>(productsCollection);

  const supermarketsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'supermarkets');
  }, [user, firestore]);
  const { data: firestoreSupermarkets, loading: loadingSupermarkets } = useCollection<Supermarket>(supermarketsCollection);

  const categoriesCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);
  const { data: firestoreCategories, loading: loadingCategories } = useCollection<Category>(categoriesCollection);

  const shoppingListsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'shoppingLists');
  }, [user, firestore]);
  const { data: firestoreShoppingLists, loading: loadingShoppingLists } = useCollection<ShoppingList>(shoppingListsCollection);

  const receiptsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'receipts');
  }, [user, firestore]);
  const { data: firestoreReceipts, loading: loadingReceipts } = useCollection<Receipt>(receiptsCollection);

  const firestoreDataLoading = user ? (loadingProducts || loadingSupermarkets || loadingCategories || loadingShoppingLists || loadingReceipts) : false;
  const guestDataLoading = !user && !localDataLoaded;

  const loading = firestoreDataLoading || guestDataLoading;

  // Sync local data to Firestore on first login
  useEffect(() => {
    const syncData = async () => {
      if (!user || !firestore || isSyncing) return;
      
      const productCol = collection(firestore, 'users', user.uid, 'products');
      
      const remoteSnapshot = await getDocs(productCol);
      if (!remoteSnapshot.empty) {
        // Remote data exists, no need to sync from local.
        return;
      }
      
      setIsSyncing(true);
      toast({ title: 'Sincronizzazione...', description: 'Sincronizzazione dei dati locali con il cloud.' });
      
      try {
        const batch = writeBatch(firestore);

        const dataToSync = {
          products: getInitialState(LOCAL_STORAGE_KEYS.products, mockProducts),
          supermarkets: getInitialState(LOCAL_STORAGE_KEYS.supermarkets, mockSupermarkets),
          categories: getInitialState(LOCAL_STORAGE_KEYS.categories, mockCategories),
          shoppingLists: getInitialState(LOCAL_STORAGE_KEYS.shoppingLists, mockShoppingLists),
          receipts: getInitialState(LOCAL_STORAGE_KEYS.receipts, mockReceipts),
        };

        Object.entries(dataToSync).forEach(([collectionName, data]) => {
          data.forEach(item => {
            // Ensure item has an ID before trying to sync
            if (item && item.id) {
              const docRef = doc(firestore, 'users', user.uid, collectionName, item.id);
              batch.set(docRef, item);
            }
          });
        });

        await batch.commit();
        toast({ title: 'Sincronizzazione Completata!', description: 'I tuoi dati sono ora salvati nel cloud.' });
      } catch (error) {
        console.error("Error syncing data to Firestore:", error);
        toast({ variant: 'destructive', title: 'Errore di Sincronizzazione', description: 'Impossibile salvare i dati nel cloud.' });
      } finally {
        setIsSyncing(false);
      }
    };

    // Trigger sync only when user logs in and all collections are loaded
    if (user && firestore && !loading) {
      syncData();
    }
  }, [user, firestore, loading, isSyncing, toast]);

  // Determine which data to use
  const products = user ? firestoreProducts || [] : localProducts;
  const supermarkets = user ? (firestoreSupermarkets || []).sort((a,b) => a.order - b.order) : [...localSupermarkets].sort((a,b) => a.order - b.order);
  const categories = user ? (firestoreCategories || []).sort((a,b)=>a.order - b.order) : [...localCategories].sort((a,b)=>a.order - b.order);
  const shoppingLists = user ? (firestoreShoppingLists || []).sort((a,b) => a.order - b.order) : [...localShoppingLists].sort((a,b) => a.order - b.order);
  const receipts = user ? firestoreReceipts || [] : [...localReceipts].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

  const writeToFirestore = useCallback(async (collectionName: string, item: any) => {
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, collectionName, item.id), item, { merge: true });
    }
  }, [user, firestore]);

  const deleteFromFirestore = useCallback(async (collectionName: string, itemId: string) => {
    if (user && firestore) {
      await deleteDoc(doc(firestore, 'users', user.uid, collectionName, itemId));
    }
  }, [user, firestore]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
      const newProduct = { ...productData, id: `p${Date.now()}` };
      if (user) { writeToFirestore('products', newProduct); } 
      else setLocalProducts((prev) => [newProduct, ...prev]);
  }, [user, writeToFirestore]);
  
  const updateProduct = useCallback((updatedProduct: Product) => {
      if (user) { writeToFirestore('products', updatedProduct); }
      else setLocalProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  }, [user, writeToFirestore]);

  const deleteProduct = useCallback((productId: string) => {
      if (user) { deleteFromFirestore('products', productId); }
      else setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
  }, [user, deleteFromFirestore]);

  const updateProductBasePrice = useCallback((productId: string, supermarketId: string, newPrice: number) => {
    const productToUpdate = (user ? firestoreProducts : products)?.find(p => p.id === productId);
    if (productToUpdate && supermarketId) {
        const priceExists = productToUpdate.prices.some(p => p.supermarketId === supermarketId);
        let newPrices;
        if(priceExists) {
             newPrices = productToUpdate.prices.map(p => 
                p.supermarketId === supermarketId ? { ...p, price: newPrice } : p
            );
        } else {
            newPrices = [...productToUpdate.prices, { supermarketId, price: newPrice }];
        }
       
        const updatedProduct = { ...productToUpdate, prices: newPrices };
        updateProduct(updatedProduct);
    }
  }, [user, products, firestoreProducts, updateProduct]);


  const addSupermarket = useCallback((supermarketData: Omit<Supermarket, 'id' | 'order'>) => {
      const currentSupermarkets = user ? firestoreSupermarkets || [] : localSupermarkets;
      const newOrder = currentSupermarkets.length > 0 ? Math.max(...currentSupermarkets.map(s => s.order)) + 1 : 1;
      const newSupermarket = { ...supermarketData, id: `s${Date.now()}`, order: newOrder };
      if (user) { writeToFirestore('supermarkets', newSupermarket); }
      else setLocalSupermarkets((prev) => [...prev, newSupermarket]);
  }, [user, writeToFirestore, firestoreSupermarkets, localSupermarkets]);
  
   const updateSupermarket = useCallback((updatedSupermarket: Supermarket) => {
    if (user) { writeToFirestore('supermarkets', updatedSupermarket); }
    else setLocalSupermarkets(prev => prev.map(s => s.id === updatedSupermarket.id ? updatedSupermarket : s).sort((a,b) => a.order - b.order));
  }, [user, writeToFirestore]);
  
  const deleteSupermarket = useCallback(async (supermarketId: string) => {
      if (user && firestore) {
          const batch = writeBatch(firestore);
          const supermarketRef = doc(firestore, 'users', user.uid, 'supermarkets', supermarketId);
          batch.delete(supermarketRef);
          // This is complex with Firestore, requires querying products. For now, we only delete the supermarket.
          await batch.commit();
      } else {
          setLocalSupermarkets((prev) => prev.filter((s) => s.id !== supermarketId));
          setLocalProducts((prevProducts) =>
            prevProducts.map((p) => ({
                ...p,
                prices: p.prices.filter((price) => price.supermarketId !== supermarketId),
                images: p.images.map(img => img.supermarketId === supermarketId ? {...img, supermarketId: undefined} : img)
            }))
          );
      }
  }, [user, firestore]);

  const addCategory = useCallback((categoryData: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...categoryData, id: `cat${Date.now()}` };
      if (user) { writeToFirestore('categories', newCategory); }
      else setLocalCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order));
  }, [user, writeToFirestore]);
  
  const updateCategory = useCallback(async (updatedCategory: Category) => {
    if (user && firestore) {
      const oldCategory = categories.find((c) => c.id === updatedCategory.id);
      const batch = writeBatch(firestore);
      const categoryRef = doc(firestore, 'users', user.uid, 'categories', updatedCategory.id);
      batch.update(categoryRef, updatedCategory);

      if (oldCategory && oldCategory.name !== updatedCategory.name) {
         // This is complex, would need a cloud function to update all products.
         // We will skip this for client-side only logic.
      }
      await batch.commit();
    } else {
        const oldCategory = categories.find((c) => c.id === updatedCategory.id);
        setLocalCategories((prev) =>
          prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)).sort((a, b) => a.order - b.order)
        );
        if (oldCategory && oldCategory.name !== updatedCategory.name) {
          setLocalProducts((prev) =>
            prev.map((p) =>
              p.category === oldCategory.name ? { ...p, category: updatedCategory.name } : p
            )
          );
        }
    }
  }, [user, firestore, categories]);
  
  const deleteCategory = useCallback((categoryId: string) => {
      if(user) { deleteFromFirestore('categories', categoryId); }
      else setLocalCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, [user, deleteFromFirestore]);

  const addShoppingList = useCallback((listData: Omit<ShoppingList, 'id' | 'createdAt' | 'order'>) => {
      const currentLists = user ? firestoreShoppingLists || [] : localShoppingLists;
      const maxOrder = currentLists.length > 0 ? Math.max(...currentLists.map(l => l.order)) : 0;
      const newList = { ...listData, id: `l${Date.now()}`, createdAt: new Date().toISOString(), order: maxOrder + 1 };
      if (user) { writeToFirestore('shoppingLists', newList); }
      else setLocalShoppingLists(prev => [...prev, newList]);
  }, [user, writeToFirestore, firestoreShoppingLists, localShoppingLists]);
  
  const updateShoppingList = useCallback((updatedList: ShoppingList) => {
      if (user) { writeToFirestore('shoppingLists', updatedList); }
      else setLocalShoppingLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  }, [user, writeToFirestore]);
  
  const deleteShoppingList = useCallback((listId: string) => {
      if (user) { deleteFromFirestore('shoppingLists', listId); }
      else setLocalShoppingLists(prev => prev.filter(l => l.id !== listId));
  }, [user, deleteFromFirestore]);

  const duplicateShoppingList = useCallback((listId: string): string | undefined => {
    const listToDuplicate = shoppingLists.find(l => l.id === listId);
    if (listToDuplicate) {
      const maxOrder = shoppingLists.length > 0 ? Math.max(...shoppingLists.map(l => l.order)) : 0;
      const newListId = `l${Date.now()}`;
      const newList = {
        ...listToDuplicate,
        id: newListId,
        name: `${listToDuplicate.name} (Copia)`,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
      };
      if (user) { writeToFirestore('shoppingLists', newList); }
      else {
        setLocalShoppingLists(prev => [...prev, newList]);
      }
      return newListId;
    }
    return undefined;
  }, [user, shoppingLists, writeToFirestore]);

  const archiveShoppingList = useCallback(async (receipt: Receipt) => {
      if (user) {
          await writeToFirestore('receipts', receipt);
          await deleteFromFirestore('shoppingLists', receipt.originalListId);
      } else {
          setLocalReceipts(prev => [receipt, ...prev].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
          setLocalShoppingLists(prev => prev.filter(l => l.id !== receipt.originalListId));
      }
  }, [user, writeToFirestore, deleteFromFirestore]);

  const unarchiveReceipt = useCallback(async (receiptId: string) => {
    const receiptToRestore = (user ? firestoreReceipts : receipts)?.find(
      (r) => r.id === receiptId
    );
    if (receiptToRestore) {
      const currentLists = user ? firestoreShoppingLists || [] : localShoppingLists;
      const maxOrder =
        currentLists.length > 0
          ? Math.max(...currentLists.map((l) => l.order))
          : 0;

      const restoredList: ShoppingList = {
        id: receiptToRestore.originalListId,
        name: receiptToRestore.listName,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
        items: receiptToRestore.items.map((item) => {
          const isQuickAdd = item.productId.startsWith('quick-');
          const shoppingListItem: ShoppingListItem = {
            productId: item.productId,
            quantity: item.quantity,
            purchased: false,
            assignedSupermarketId: item.supermarketId || null,
            overridePrice: isQuickAdd ? item.price : null,
            isQuickAdd: isQuickAdd,
            quickAddName: isQuickAdd ? item.productName : undefined,
          };
          return shoppingListItem;
        }),
      };
      if (user) {
        await writeToFirestore('shoppingLists', restoredList);
        await deleteFromFirestore('receipts', receiptId);
      } else {
        setLocalShoppingLists((prev) => [...prev, restoredList]);
        setLocalReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      }
    }
  }, [user, receipts, firestoreReceipts, localShoppingLists, firestoreShoppingLists, writeToFirestore, deleteFromFirestore]);

  const setBatch = useCallback(async (collectionName: string, items: any[]) => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);
    
    const collectionRef = collection(firestore, 'users', user.uid, collectionName);
    try {
      const snapshot = await getDocs(collectionRef);
      snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
      });

      if (items && Array.isArray(items)) {
          items.forEach(item => {
              if (item.id) {
                  const docRef = doc(firestore, 'users', user.uid, collectionName, item.id);
                  batch.set(docRef, item);
              }
          });
      }

      await batch.commit();
    } catch (error) {
      console.error(`Error during batch operation for ${collectionName}:`, error);
      toast({
        variant: 'destructive',
        title: `Errore durante l'importazione`,
        description: `Impossibile aggiornare la collezione ${collectionName}.`,
      });
    }
  }, [user, firestore, toast]);

  const setCategories = useCallback((newCategories: Category[]) => {
      if (user) { setBatch('categories', newCategories); }
      else setLocalCategories(newCategories.sort((a,b) => a.order - b.order));
  }, [user, setBatch]);

  const setSupermarkets = useCallback((newSupermarkets: Supermarket[]) => {
      if (user) { setBatch('supermarkets', newSupermarkets); }
      else setLocalSupermarkets(newSupermarkets.sort((a,b) => a.order - b.order));
  }, [user, setBatch]);

  const setShoppingLists = useCallback((newLists: ShoppingList[]) => {
      if (user) { setBatch('shoppingLists', newLists); }
      else setLocalShoppingLists(newLists.sort((a,b) => a.order - b.order));
  }, [user, setBatch]);

  const importData = useCallback(async (data: Partial<AllData>) => {
    const dataToImport: AllData = {
        products: Array.isArray(data.products) ? data.products : [],
        supermarkets: Array.isArray(data.supermarkets) ? data.supermarkets : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        shoppingLists: Array.isArray(data.shoppingLists) ? data.shoppingLists : [],
        receipts: Array.isArray(data.receipts) ? data.receipts : [],
    };

    if (user) {
      await Promise.all([
        setBatch('products', dataToImport.products),
        setBatch('supermarkets', dataToImport.supermarkets),
        setBatch('categories', dataToImport.categories),
        setBatch('shoppingLists', dataToImport.shoppingLists),
        setBatch('receipts', dataToImport.receipts),
      ]);
    } else {
      setLocalProducts(dataToImport.products);
      setLocalSupermarkets(dataToImport.supermarkets.sort((a,b) => a.order - b.order));
      setLocalCategories(dataToImport.categories.sort((a,b)=>a.order - b.order));
      setLocalShoppingLists(dataToImport.shoppingLists.sort((a,b) => a.order - b.order));
      setLocalReceipts(dataToImport.receipts.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
    }
  }, [user, setBatch]);

  const exportData = useCallback((): AllData => ({
    products,
    supermarkets,
    categories,
    shoppingLists,
    receipts,
  }), [products, supermarkets, categories, shoppingLists, receipts]);

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
    updateProductBasePrice,
    addSupermarket,
    updateSupermarket,
    deleteSupermarket,
    addCategory,
    updateCategory,
    deleteCategory,
    addShoppingList,
    updateShoppingList,
    deleteShoppingList,
    duplicateShoppingList,
    archiveShoppingList,
    unarchiveReceipt,
    setCategories,
    setSupermarkets,
    setShoppingLists,
    importData,
    exportData,
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
