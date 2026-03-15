'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ShoppingList } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type ShoppingListsProps = {
  lists: ShoppingList[];
  onAddList: (list: Omit<ShoppingList, 'id' | 'createdAt'>) => void;
};

export function ShoppingLists({ lists }: ShoppingListsProps) {
  // TODO: Implement Add List Dialog
  const handleAddList = () => {
    console.log("Add new list");
  }

  return (
    <>
      <PageHeader
        title="Le Mie Liste"
        actions={
          <Button onClick={handleAddList}>
            <PlusCircle />
            Crea Lista
          </Button>
        }
      />
      {lists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const itemsCount = list.items.length;
            const purchasedCount = list.items.filter(i => i.purchased).length;
            
            return (
              <Card key={list.id} className="flex flex-col">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <Calendar className="h-4 w-4" />
                    Creato {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true, locale: it })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <div className="text-sm text-muted-foreground">
                    {purchasedCount} di {itemsCount} prodotti acquistati.
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button asChild className="w-full">
                    <Link href={`/lists/${list.id}`}>
                      Vai alla Lista
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <List className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nessuna lista trovata</h3>
            <p className="mt-2 text-sm text-muted-foreground">Inizia creando la tua prima lista della spesa.</p>
            <Button className="mt-6" onClick={handleAddList}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crea Lista
            </Button>
        </div>
      )}
    </>
  );
}
