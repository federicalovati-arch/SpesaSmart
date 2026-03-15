'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type {
  ShoppingList,
  Product,
  Supermarket,
  ShoppingListItem,
} from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Tag, Trophy, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ListDetailsProps = {
  list: ShoppingList;
  allProducts: Product[];
  allSupermarkets: Supermarket[];
};

type EnrichedListItem = ShoppingListItem & {
  product: Product;
  bestPrice: number | null;
  bestSupermarket: Supermarket | null;
};

export function ShoppingListDetails({
  list: initialList,
  allProducts,
  allSupermarkets,
}: ListDetailsProps) {
  const [list, setList] = useState(initialList);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('all');

  const handleToggleItem = (productId: string) => {
    setList((prevList) => ({
      ...prevList,
      items: prevList.items.map((item) =>
        item.productId === productId
          ? { ...item, purchased: !item.purchased }
          : item
      ),
    }));
  };

  const enrichedItems: EnrichedListItem[] = useMemo(() => {
    return list.items
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        if (!product) return null;

        let bestPrice: number | null = null;
        let bestSupermarket: Supermarket | null = null;

        if (selectedSupermarket === 'all') {
          const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
          if (sortedPrices.length > 0) {
            bestPrice = sortedPrices[0].price;
            bestSupermarket = allSupermarkets.find(s => s.id === sortedPrices[0].supermarketId) || null;
          }
        } else {
            const storePrice = product.prices.find(p => p.supermarketId === selectedSupermarket);
            if(storePrice) {
                bestPrice = storePrice.price;
                bestSupermarket = allSupermarkets.find(s => s.id === selectedSupermarket) || null;
            }
        }
        
        return { ...item, product, bestPrice, bestSupermarket };
      })
      .filter((item): item is EnrichedListItem => item !== null);
  }, [list.items, allProducts, allSupermarkets, selectedSupermarket]);

  const totals = useMemo(() => {
    const optimalTotal = enrichedItems.reduce((acc, item) => {
        if (item.bestPrice !== null) {
            return acc + item.bestPrice * item.quantity;
        }
        return acc;
    }, 0);

    const supermarketTotals = allSupermarkets.map(supermarket => {
        const total = list.items.reduce((acc, item) => {
            const product = allProducts.find(p => p.id === item.productId);
            const priceInfo = product?.prices.find(p => p.supermarketId === supermarket.id);
            if (priceInfo) {
                return acc + (priceInfo.price * item.quantity);
            }
            // If item not available, this store cannot complete the list.
            return Infinity; 
        }, 0);
        return { ...supermarket, total };
    });

    return { optimalTotal, supermarketTotals };
  }, [enrichedItems, list.items, allProducts, allSupermarkets]);


  return (
    <>
      <PageHeader
        title={list.name}
        actions={
          <Button asChild variant="outline">
            <Link href="/lists">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alle Liste
            </Link>
          </Button>
        }
      />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingCart /> Lista Prodotti</CardTitle>
                    <CardDescription>
                        Seleziona un supermercato per vedere i prezzi specifici o "Tutti" per il miglior prezzo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Select value={selectedSupermarket} onValueChange={setSelectedSupermarket}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona un supermercato" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tutti (prezzo migliore)</SelectItem>
                                {allSupermarkets.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        {enrichedItems.map((item) => (
                            <div key={item.productId} className={`flex items-center gap-4 p-3 rounded-lg ${item.purchased ? 'bg-muted/50' : 'bg-card'}`}>
                                <Checkbox
                                    id={`item-${item.productId}`}
                                    checked={item.purchased}
                                    onCheckedChange={() => handleToggleItem(item.productId)}
                                />
                                <div className="flex-1">
                                    <label htmlFor={`item-${item.productId}`} className={`font-medium ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.product.name}
                                    </label>
                                    <div className="text-sm text-muted-foreground">Quantità: {item.quantity}</div>
                                </div>
                                <div className="text-right">
                                    {item.bestPrice !== null ? (
                                        <>
                                            <div className="font-bold text-lg text-primary">€{(item.bestPrice * item.quantity).toFixed(2)}</div>
                                            <div className="text-xs text-muted-foreground">
                                                (€{item.bestPrice.toFixed(2)} / pz)
                                                {item.bestSupermarket && <Badge variant="secondary" className="ml-2">{item.bestSupermarket.name}</Badge>}
                                            </div>
                                        </>
                                    ) : (
                                        <Badge variant="destructive">Non disponibile</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
            <Card className="bg-primary/10 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary"><Trophy /> Spesa Ottimale</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-primary">€{totals.optimalTotal.toFixed(2)}</p>
                    <p className="text-sm text-primary/80">Totale acquistando ogni prodotto al prezzo più basso disponibile.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag/> Totale per Supermercato</CardTitle>
                    <CardDescription>Costo totale se acquistassi tutto in un unico negozio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supermercato</TableHead>
                                <TableHead className="text-right">Totale</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {totals.supermarketTotals.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {isFinite(s.total) ? `€${s.total.toFixed(2)}` : 'Incompleto'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
