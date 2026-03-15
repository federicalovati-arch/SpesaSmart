import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBasket, Store, List, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { mockProducts, mockShoppingLists, mockSupermarkets } from '@/lib/data';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Prodotti nel Catalogo',
      value: mockProducts.length,
      icon: ShoppingBasket,
    },
    {
      title: 'Supermercati',
      value: mockSupermarkets.length,
      icon: Store,
    },
    {
      title: 'Liste della Spesa',
      value: mockShoppingLists.length,
      icon: List,
    },
  ];

  return (
    <div className="flex-1">
      <main className="p-4 sm:p-6 lg:p-8">
        <PageHeader title="Dashboard" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/lists">
                <PlusCircle />
                Crea Nuova Lista
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/products">
                <ShoppingBasket />
                Aggiungi Prodotto
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/supermarkets">
                <Store />
                Aggiungi Supermercato
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
