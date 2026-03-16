'use client';
import { useState } from 'react';
import { ShoppingLists } from './components/shopping-lists';
import { useData } from '@/context/data-context';
import type { ShoppingList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddListDialog } from './components/add-list-dialog';

export default function ListsPage() {
  const { shoppingLists, addShoppingList, updateShoppingList, deleteShoppingList, duplicateShoppingList, setShoppingLists } = useData();
  const { toast } = useToast();

  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [listToEdit, setListToEdit] = useState<ShoppingList | undefined>(undefined);
  
  const handleReorderLists = (reorderedLists: ShoppingList[]) => {
    setShoppingLists(reorderedLists);
    toast({ title: 'Ordine liste aggiornato' });
  };

  const handleOpenAddDialog = () => {
    setListToEdit(undefined);
    setIsAddListDialogOpen(true);
  }

  const handleOpenEditDialog = (list: ShoppingList) => {
    setListToEdit(list);
    setIsAddListDialogOpen(true);
  }

  const handleSaveList = (name: string, items?: ShoppingList['items']) => {
    if (listToEdit) {
      updateShoppingList({ ...listToEdit, name });
      toast({ title: 'Lista aggiornata!' });
    } else {
      addShoppingList({ name, items: items || [] });
      toast({ title: 'Lista creata!' });
    }
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
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 flex-1 bg-gray-50">
      <ShoppingLists 
        lists={shoppingLists} 
        onReorder={handleReorderLists}
        onAddList={handleOpenAddDialog}
        onEditList={handleOpenEditDialog}
        onDeleteList={handleDelete}
        onDuplicateList={handleDuplicate}
      />
      <AddListDialog
        isOpen={isAddListDialogOpen}
        setIsOpen={setIsAddListDialogOpen}
        onSave={handleSaveList}
        listToEdit={listToEdit}
      />
    </div>
  );
}
