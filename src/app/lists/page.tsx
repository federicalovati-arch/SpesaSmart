'use client';
import { ShoppingLists } from './components/shopping-lists';
import { useData } from '@/context/data-context';
import type { ShoppingList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ListsPage() {
  const { shoppingLists, addShoppingList, setShoppingLists } = useData();
  const { toast } = useToast();
  
  const handleReorderLists = (reorderedLists: ShoppingList[]) => {
    setShoppingLists(reorderedLists);
    toast({ title: 'Ordine liste aggiornato' });
  };

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8">
      <ShoppingLists 
        lists={shoppingLists} 
        onAddList={addShoppingList} 
        onReorder={handleReorderLists}
      />
    </div>
  );
}
