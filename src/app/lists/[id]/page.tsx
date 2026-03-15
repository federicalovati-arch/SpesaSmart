'use client';

import { notFound, useRouter } from 'next/navigation';
import { useData } from '@/context/data-context';
import { ShoppingListDetails } from './components/shopping-list-details';
import type { Receipt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


type PageProps = {
  params: {
    id: string;
  };
};

export default function ListDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { shoppingLists, products, supermarkets, updateShoppingList, archiveShoppingList } = useData();

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

  if (!list) {
     return (
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
            <h1 className="text-2xl font-bold">Lista non trovata</h1>
            <p className="text-muted-foreground mt-2">
                La lista potrebbe essere stata archiviata o eliminata.
            </p>
             <button onClick={() => router.push('/lists')} className="mt-4 text-primary underline">Torna alle liste</button>
        </div>
      </main>
     )
  }


  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <ShoppingListDetails
        list={list}
        allProducts={products}
        allSupermarkets={supermarkets}
        onUpdateList={updateShoppingList}
        onArchive={handleArchive}
      />
    </main>
  );
}
