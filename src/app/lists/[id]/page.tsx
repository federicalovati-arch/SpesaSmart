'use client';

import { useRouter, useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { ShoppingListDetails } from './components/shopping-list-details';
import type { Receipt, ShoppingList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { shoppingLists, products, supermarkets, categories, updateShoppingList, archiveShoppingList, addProduct } = useData();

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
      onAddProduct={addProduct}
    />
  );
}
