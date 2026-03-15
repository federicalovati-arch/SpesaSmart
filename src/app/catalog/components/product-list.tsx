'use client';

import { useState } from 'react';
import type { Product, Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddProductDialog } from './add-product-dialog';

type ProductListProps = {
  products: Product[];
  supermarkets: Supermarket[];
};

export function ProductList({
  products: initialProducts,
  supermarkets,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    // In a real app, this would be an API call
    setProducts((prev) => [
      ...prev,
      { ...newProduct, id: `p${prev.length + 10}` },
    ]);
  };

  const getPriceForSupermarket = (product: Product, supermarketId: string) => {
    const priceInfo = product.prices.find(
      (p) => p.supermarketId === supermarketId
    );
    return priceInfo
      ? `€${priceInfo.price.toFixed(2)}`
      : '-';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tutti i Prodotti</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle />
              Aggiungi Prodotto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prodotto</TableHead>
                <TableHead>Categoria</TableHead>
                {supermarkets.map((s) => (
                  <TableHead key={s.id}>{s.name}</TableHead>
                ))}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  {supermarkets.map((s) => (
                    <TableCell key={s.id}>
                      {getPriceForSupermarket(product, s.id)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Apri menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Modifica</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Elimina</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddProductDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        supermarkets={supermarkets}
        onAddProduct={handleAddProduct}
      />
    </>
  );
}
