'use client';

import { useState } from 'react';
import type { Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Zap, Clover, Carrot, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type SupermarketListProps = {
  supermarkets: Supermarket[];
};

const getSupermarketIcon = (name: string) => {
    const lowerCaseName = name.toLowerCase();
    if (lowerCaseName.includes('eurospin')) {
        return <Zap className="h-6 w-6 text-primary" />;
    }
    if (lowerCaseName.includes('conad')) {
        return <Clover className="h-6 w-6 text-primary" />;
    }
    if (lowerCaseName.includes('coop')) {
        return <Carrot className="h-6 w-6 text-primary" />;
    }
    return <Store className="h-6 w-6 text-primary" />;
};

export function SupermarketList({ supermarkets: initialSupermarkets }: SupermarketListProps) {
  const [supermarkets, setSupermarkets] = useState(initialSupermarkets);

  return (
    <div className="space-y-4">
      {supermarkets.map((supermarket) => (
        <Card key={supermarket.id} className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
                {getSupermarketIcon(supermarket.name)}
            </div>
            <h3 className="font-bold text-lg flex-grow">{supermarket.name}</h3>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Edit className="h-5 w-5 text-gray-600" />
                    <span className="sr-only">Modifica</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive/70 hover:text-destructive"
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Elimina</span>
                </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
