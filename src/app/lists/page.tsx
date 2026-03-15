import { mockShoppingLists } from '@/lib/data';
import { ShoppingLists } from './components/shopping-lists';

export default async function ListsPage() {
  // In a real app, this is fetched from a DB
  const lists = mockShoppingLists;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <ShoppingLists lists={lists} />
    </main>
  );
}
