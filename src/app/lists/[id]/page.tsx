'use client';

import { useRouter, useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { ShoppingListDetails } from './components/shopping-list-details';
import type { Receipt, ShoppingList, Product, ShoppingListItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { shoppingLists, products, supermarkets, categories, updateShoppingList, duplicateShoppingList, archiveShoppingList, addProduct, updateProductBasePrice } = useData();

  const list = shoppingLists.find((l) => l.id === params.id);
  
  if (!list) {
    // It might have been archived, so we don't show notFound() immediately.
    // A better approach would be to check if it exists in receipts.
    // For now, if it's not in active lists, we can assume it's gone.
    // A router.push('/lists') might be better after archiving.
  }

  const handleArchive = (receipt: Receipt) => {
    archiveShoppingList(receipt);
    toast({
      title: "Lista Archiviata!",
      description: "La tua spesa è stata spostata nello storico."
    })
    router.push('/history');
  }
  
  const handleUpdateList = (updatedList: ShoppingList) => {
    updateShoppingList(updatedList);
  }

  const handleDuplicateList = (listId: string) => {
    const newListId = duplicateShoppingList(listId);
    toast({ title: 'Lista duplicata!' });
    if(newListId) {
      router.push(`/lists/${newListId}`);
    }
  }

  const handleAddProductToList = (product: Product, quantity: number) => {
    if (!list) return;
    const itemExists = list.items.find(i => i.productId === product.id);

    let newItems: ShoppingList['items'];

    if(itemExists) {
        newItems = list.items.map(i => i.productId === product.id ? {...i, quantity: i.quantity + quantity} : i);
    } else {
        newItems = [...list.items, { productId: product.id, quantity, purchased: false }];
    }
    
    updateShoppingList({ ...list, items: newItems });
    toast({ title: `${product.name} aggiunto alla lista!` });
  }

  const handleQuickAddProduct = (item: { name: string; price: number; supermarketId: string }) => {
    if (!list) return;
    const newItem: ShoppingListItem = {
        productId: `quick-${Date.now()}`,
        quantity: 1,
        purchased: false,
        isQuickAdd: true,
        quickAddName: item.name,
        overridePrice: item.price,
        assignedSupermarketId: item.supermarketId,
    };
    updateShoppingList({ ...list, items: [...list.items, newItem] });
    toast({ title: `${item.name} aggiunto alla lista!` });
  };

  const handleUpdateProductBasePrice = (productId: string, supermarketId: string, newPrice: number) => {
    updateProductBasePrice(productId, supermarketId, newPrice);
  };

  if (!list) {
     return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <h1 className="text-2xl font-bold">Lista non trovata</h1>
        <p className="text-muted-foreground mt-2">
            La lista potrebbe essere stata archiviata o eliminata.
        </p>
         <Button onClick={() => router.push('/lists')} className="mt-6" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alle liste
        </Button>
      </div>
     )
  }


  return (
    <ShoppingListDetails
      list={list}
      allProducts={products}
      allSupermarkets={supermarkets}
      allCategories={categories}
      onUpdateList={handleUpdateList}
      onArchive={handleArchive}
      onDuplicateList={handleDuplicateList}
      onAddProductToList={handleAddProductToList}
      onUpdateProductBasePrice={handleUpdateProductBasePrice}
      onAddQuickProduct={handleQuickAddProduct}
    />
  );
}
