'use client';
import { ShoppingLists } from './components/shopping-lists';
import { useData } from '@/context/data-context';

export default function ListsPage() {
  const { shoppingLists, addShoppingList } = useData();

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <ShoppingLists lists={shoppingLists} onAddList={addShoppingList} />
    </main>
  );
}
