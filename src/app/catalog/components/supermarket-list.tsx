'use client';

import { useState } from 'react';
import type { Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Store, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SupermarketListProps = {
  supermarkets: Supermarket[];
};

export function SupermarketList({ supermarkets: initialSupermarkets }: SupermarketListProps) {
  const [supermarkets, setSupermarkets] = useState(initialSupermarkets);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tutti i Supermercati</CardTitle>
          <Button>
            <PlusCircle />
            Aggiungi Supermercato
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supermarkets.map((supermarket) => (
            <Card key={supermarket.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="h-5 w-5 text-primary" />
                      {supermarket.name}
                    </CardTitle>
                    {supermarket.location && (
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {supermarket.location}
                      </CardDescription>
                    )}
                  </div>
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
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
