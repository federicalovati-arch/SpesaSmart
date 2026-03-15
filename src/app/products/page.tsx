import { PageHeader } from '@/components/page-header';
import { mockProducts, mockSupermarkets } from '@/lib/data';
import { ProductList } from './components/product-list';

export default async function ProductsPage() {
  // In a real app, you would fetch this data from a database
  const products = mockProducts;
  const supermarkets = mockSupermarkets;

  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8">
      <ProductList products={products} supermarkets={supermarkets} />
    </main>
  );
}
