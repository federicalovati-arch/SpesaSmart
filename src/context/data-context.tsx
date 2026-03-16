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
import { collection, doc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  addSupermarket: (supermarket: Omit<Supermarket, 'id' | 'order'>) => void;
  deleteSupermarket: (supermarketId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addShoppingList: (list: Omit<ShoppingList, 'id' | 'createdAt' | 'order'>) => void;
  updateShoppingList: (list: ShoppingList) => void;
  deleteShoppingList: (listId: string) => void;
  archiveShoppingList: (receipt: Receipt) => void;
  unarchiveReceipt: (receiptId: string) => void;
  setCategories: (categories: Category[]) => void;
  setSupermarkets: (supermarkets: Supermarket[]) => void;
  setShoppingLists: (lists: ShoppingList[]) => void;
  importData: (data: Partial<AllData>) => void;
  exportData: () => AllData;
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
  const { toast } = useToast();

  // Local state for guest users
  const [localProducts, setLocalProducts] = useState<Product[]>(mockProducts);
  const [localSupermarkets, setLocalSupermarkets] = useState<Supermarket[]>(mockSupermarkets.sort((a,b) => a.order - b.order));
  const [localCategories, setLocalCategories] = useState<Category[]>(mockCategories.sort((a,b)=>a.order - b.order));
  const [localShoppingLists, setLocalShoppingLists] = useState<ShoppingList[]>(mockShoppingLists.sort((a,b) => a.order - b.order));
  const [localReceipts, setLocalReceipts] = useState<Receipt[]>(mockReceipts);
  
  const [isSyncing, setIsSyncing] = useState(false);

  const getCollectionRef = useCallback((name: string) => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, name);
  }, [user, firestore]);

  // Firestore collections for authenticated users
  const { data: firestoreProducts, loading: loadingProducts } = useCollection<Product>(getCollectionRef('products'));
  const { data: firestoreSupermarkets, loading: loadingSupermarkets } = useCollection<Supermarket>(getCollectionRef('supermarkets'));
  const { data: firestoreCategories, loading: loadingCategories } = useCollection<Category>(getCollectionRef('categories'));
  const { data: firestoreShoppingLists, loading: loadingShoppingLists } = useCollection<ShoppingList>(getCollectionRef('shoppingLists'));
  const { data: firestoreReceipts, loading: loadingReceipts } = useCollection<Receipt>(getCollectionRef('receipts'));

  
  // Sync local data to Firestore on first login
  useEffect(() => {
    const syncData = async () => {
      if (user && firestore && !isSyncing) {
        setIsSyncing(true);
        toast({ title: 'Sincronizzazione...', description: 'Sincronizzazione dei dati locali con il cloud.' });
        try {
          const collectionsToSync = {
            products: localProducts,
            supermarkets: localSupermarkets,
            categories: localCategories,
            shoppingLists: localShoppingLists,
            receipts: localReceipts,
          };
          
          const batch = writeBatch(firestore);

          for (const [collectionName, localData] of Object.entries(collectionsToSync)) {
             if (localData && localData.length > 0) {
               for (const item of localData) {
                 const docRef = doc(firestore, 'users', user.uid, collectionName, item.id);
                 batch.set(docRef, item);
               }
             }
          }
          await batch.commit();
          toast({ title: 'Sincronizzazione Completata!', description: 'I tuoi dati sono ora salvati nel cloud.' });
        } catch (error) {
          console.error("Error syncing data to Firestore:", error);
          toast({ variant: 'destructive', title: 'Errore di Sincronizzazione', description: 'Impossibile salvare i dati nel cloud.' });
        } finally {
          setIsSyncing(false); 
        }
      }
    };
  
    if (user && firestoreProducts?.length === 0 && localProducts.length > 0) {
      syncData();
    }
  }, [user, firestore, firestoreProducts, localProducts, isSyncing, toast, localCategories, localReceipts, localShoppingLists, localSupermarkets]);

  // Determine which data to use
  const products = user ? firestoreProducts || [] : localProducts;
  const supermarkets = user ? (firestoreSupermarkets || []).sort((a,b) => a.order - b.order) : localSupermarkets;
  const categories = user ? (firestoreCategories || []).sort((a,b)=>a.order - b.order) : localCategories;
  const shoppingLists = user ? (firestoreShoppingLists || []).sort((a,b) => a.order - b.order) : localShoppingLists;
  const receipts = user ? firestoreReceipts || [] : localReceipts;
  const loading = user ? (loadingProducts || loadingSupermarkets || loadingCategories || loadingShoppingLists || loadingReceipts) : false;

  const writeToFirestore = async (collectionName: string, item: any) => {
    if (user && firestore) {
      await setDoc(doc(firestore, 'users', user.uid, collectionName, item.id), item, { merge: true });
    }
  };

  const deleteFromFirestore = async (collectionName: string, itemId: string) => {
    if (user && firestore) {
      await deleteDoc(doc(firestore, 'users', user.uid, collectionName, itemId));
    }
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
      const newProduct = { ...productData, id: `p${Date.now()}` };
      if (user) { writeToFirestore('products', newProduct); } 
      else setLocalProducts((prev) => [newProduct, ...prev]);
  };
  const updateProduct = (updatedProduct: Product) => {
      if (user) { writeToFirestore('products', updatedProduct); }
      else setLocalProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };
  const deleteProduct = (productId: string) => {
      if (user) { deleteFromFirestore('products', productId); }
      else setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addSupermarket = (supermarketData: Omit<Supermarket, 'id' | 'order'>) => {
      const currentSupermarkets = user ? firestoreSupermarkets || [] : localSupermarkets;
      const newOrder = currentSupermarkets.length > 0 ? Math.max(...currentSupermarkets.map(s => s.order)) + 1 : 1;
      const newSupermarket = { ...supermarketData, id: `s${Date.now()}`, order: newOrder };
      if (user) { writeToFirestore('supermarkets', newSupermarket); }
      else setLocalSupermarkets((prev) => [...prev, newSupermarket]);
  };
  const deleteSupermarket = async (supermarketId: string) => {
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
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...categoryData, id: `cat${Date.now()}` };
      if (user) { writeToFirestore('categories', newCategory); }
      else setLocalCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order));
  };
  const updateCategory = async (updatedCategory: Category) => {
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
  };
  const deleteCategory = (categoryId: string) => {
      if(user) { deleteFromFirestore('categories', categoryId); }
      else setLocalCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const addShoppingList = (listData: Omit<ShoppingList, 'id' | 'createdAt' | 'order'>) => {
      const currentLists = user ? firestoreShoppingLists || [] : localShoppingLists;
      const newOrder = currentLists.length > 0 ? Math.max(...currentLists.map(l => l.order)) + 1 : 1;
      const newList = { ...listData, id: `l${Date.now()}`, createdAt: new Date().toISOString(), order: newOrder };
      if (user) { writeToFirestore('shoppingLists', newList); }
      else setLocalShoppingLists(prev => [newList, ...prev]);
  };
  const updateShoppingList = (updatedList: ShoppingList) => {
      if (user) { writeToFirestore('shoppingLists', updatedList); }
      else setLocalShoppingLists(prev => prev.map(l => l.id === updatedList.id ? updatedList : l));
  };
  const deleteShoppingList = (listId: string) => {
      if (user) { deleteFromFirestore('shoppingLists', listId); }
      else setLocalShoppingLists(prev => prev.filter(l => l.id !== listId));
  };

  const archiveShoppingList = async (receipt: Receipt) => {
      if (user) {
          await writeToFirestore('receipts', receipt);
          await deleteFromFirestore('shoppingLists', receipt.originalListId);
      } else {
          setLocalReceipts(prev => [receipt, ...prev].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
          deleteShoppingList(receipt.originalListId);
      }
  };

  const unarchiveReceipt = async (receiptId: string) => {
      const receiptToRestore = (user ? firestoreReceipts : receipts)?.find(r => r.id === receiptId);
      if (receiptToRestore) {
        // This is simplified, assumes the list structure is stored in the receipt or can be recreated
        const restoredList: ShoppingList = {
            id: receiptToRestore.originalListId,
            name: receiptToRestore.listName,
            createdAt: new Date().toISOString(),
            order: 0,
            items: receiptToRestore.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                purchased: false,
            }))
        };
        if (user) {
            await writeToFirestore('shoppingLists', restoredList);
            await deleteFromFirestore('receipts', receiptId);
        } else {
            setLocalShoppingLists(prev => [restoredList, ...prev]);
            setLocalReceipts(prev => prev.filter(r => r.id !== receiptId));
        }
      }
  };

  const setBatch = async (collectionName: string, items: any[]) => {
    if (user && firestore && items?.length > 0) {
      const batch = writeBatch(firestore);
      items.forEach(item => {
        if (item.id) { // Ensure item has an id
          const docRef = doc(firestore, 'users', user.uid, collectionName, item.id);
          batch.set(docRef, item);
        }
      });
      await batch.commit();
    }
  };

  const setCategories = (newCategories: Category[]) => {
      if (user) { setBatch('categories', newCategories); }
      else setLocalCategories(newCategories.sort((a,b) => a.order - b.order));
  };
  const setSupermarkets = (newSupermarkets: Supermarket[]) => {
      if (user) { setBatch('supermarkets', newSupermarkets); }
      else setLocalSupermarkets(newSupermarkets.sort((a,b) => a.order - b.order));
  };
  const setShoppingLists = (newLists: ShoppingList[]) => {
      if (user) { setBatch('shoppingLists', newLists); }
      else setLocalShoppingLists(newLists.sort((a,b) => a.order - b.order));
  };

  const importData = (data: Partial<AllData>) => {
    const dataToImport: AllData = {
        products: Array.isArray(data.products) ? data.products : [],
        supermarkets: Array.isArray(data.supermarkets) ? data.supermarkets : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        shoppingLists: Array.isArray(data.shoppingLists) ? data.shoppingLists : [],
        receipts: Array.isArray(data.receipts) ? data.receipts : [],
    };

    if (user) {
      setBatch('products', dataToImport.products);
      setBatch('supermarkets', dataToImport.supermarkets);
      setBatch('categories', dataToImport.categories);
      setBatch('shoppingLists', dataToImport.shoppingLists);
      setBatch('receipts', dataToImport.receipts);
    } else {
      setLocalProducts(dataToImport.products);
      setLocalSupermarkets(dataToImport.supermarkets);
      setLocalCategories(dataToImport.categories);
      setLocalShoppingLists(dataToImport.shoppingLists);
      setLocalReceipts(dataToImport.receipts);
    }
  };

  const exportData = (): AllData => ({
    products,
    supermarkets,
    categories,
    shoppingLists,
    receipts,
  });

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
