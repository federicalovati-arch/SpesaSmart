import { mockSupermarkets } from '@/lib/data';
import { SupermarketList } from './components/supermarket-list';

export default async function SupermarketsPage() {
  // In a real app, you'd fetch this from a database
  const supermarkets = mockSupermarkets;

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <SupermarketList supermarkets={supermarkets} />
    </main>
  );
}
