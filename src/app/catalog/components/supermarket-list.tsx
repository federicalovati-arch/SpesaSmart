'use client';

import type { Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Zap, Clover, Carrot, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type SupermarketListProps = {
  supermarkets: Supermarket[];
  onDeleteSupermarket: (id: string) => void;
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

export function SupermarketList({ supermarkets, onDeleteSupermarket }: SupermarketListProps) {
  
  return (
    <div className="space-y-2 pb-20">
      {supermarkets.map((supermarket) => (
        <Card key={supermarket.id} className="shadow-sm rounded-2xl bg-white">
          <CardContent className="p-3 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
                {getSupermarketIcon(supermarket.name)}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg">{supermarket.name}</h3>
              {supermarket.location && <p className="text-sm text-muted-foreground">{supermarket.location}</p>}
            </div>
            <div className="flex items-center gap-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                    <Edit className="h-5 w-5 text-gray-600" />
                    <span className="sr-only">Modifica</span>
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive/70 hover:text-destructive"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Elimina</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sei sicuro di voler eliminare {supermarket.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Questa azione non può essere annullata. Tutti i prezzi associati a questo negozio verranno rimossi.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteSupermarket(supermarket.id)}>Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
