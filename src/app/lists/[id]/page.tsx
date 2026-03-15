import { notFound } from 'next/navigation';
import { mockProducts, mockShoppingLists, mockSupermarkets } from '@/lib/data';
import { ShoppingListDetails } from './components/shopping-list-details';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ListDetailPage({ params }: PageProps) {
  // In a real app, this data would be fetched from a database
  const list = mockShoppingLists.find((l) => l.id === params.id);
  const products = mockProducts;
  const supermarkets = mockSupermarkets;

  if (!list) {
    notFound();
  }

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <ShoppingListDetails
        list={list}
        allProducts={products}
        allSupermarkets={supermarkets}
      />
    </main>
  );
}
