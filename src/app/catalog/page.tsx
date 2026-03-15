import { PageHeader } from '@/components/page-header';
import { mockProducts, mockSupermarkets } from '@/lib/data';
import { ProductList } from './components/product-list';
import { SupermarketList } from './components/supermarket-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBasket, Store } from 'lucide-react';

export default async function CatalogPage() {
  // In a real app, you would fetch this data from a database
  const products = mockProducts;
  const supermarkets = mockSupermarkets;

  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Catalogo" />
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">
            <ShoppingBasket className="mr-2 h-4 w-4" />
            Prodotti
          </TabsTrigger>
          <TabsTrigger value="supermarkets">
            <Store className="mr-2 h-4 w-4" />
            Supermercati
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ProductList products={products} supermarkets={supermarkets} />
        </TabsContent>
        <TabsContent value="supermarkets" className="mt-6">
          <SupermarketList supermarkets={supermarkets} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
