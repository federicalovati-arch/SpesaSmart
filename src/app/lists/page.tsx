'use client';
import { useState } from 'react';
import { ShoppingLists } from './components/shopping-lists';
import { useData } from '@/context/data-context';
import type { ShoppingList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';

const AddListDialog = dynamic(() => import('./components/add-list-dialog').then(mod => mod.AddListDialog), { ssr: false });

export default function ListsPage() {
  const { shoppingLists, addShoppingList, setShoppingLists, deleteShoppingList, duplicateShoppingList } = useData();
  const { toast } = useToast();

  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  
  const handleReorderLists = (reorderedLists: ShoppingList[]) => {
    setShoppingLists(reorderedLists);
    toast({ title: 'Ordine liste aggiornato' });
  };

  const handleOpenAddDialog = () => {
    setIsAddListDialogOpen(true);
  }

  const handleSaveList = (name: string, items?: ShoppingList['items']) => {
    addShoppingList({ name, items: items || [] });
    toast({ title: 'Lista creata!' });
    setIsAddListDialogOpen(false);
  }

  const handleDelete = (listId: string) => {
    deleteShoppingList(listId);
    toast({ title: 'Lista eliminata.' });
  }

  const handleDuplicate = (listId: string) => {
    duplicateShoppingList(listId);
    toast({ title: 'Lista duplicata!' });
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 h-full bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Le Mie Liste
        </h1>
        <Button onClick={handleOpenAddDialog} className="h-11 rounded-full text-base font-bold">
          <Plus className="mr-2 h-4 w-4" />
          Nuova
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto -mx-4 px-4">
        <ShoppingLists 
          lists={shoppingLists} 
          onReorder={handleReorderLists}
          onAddList={handleOpenAddDialog}
          onDeleteList={handleDelete}
          onDuplicateList={handleDuplicate}
        />
      </div>
      <AddListDialog
        isOpen={isAddListDialogOpen}
        setIsOpen={setIsAddListDialogOpen}
        onSave={handleSaveList}
      />
    </div>
  );
}
