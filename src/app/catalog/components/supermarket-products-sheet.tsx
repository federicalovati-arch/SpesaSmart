'use client';

import * as React from 'react';
import Image from 'next/image';
import type { Supermarket, Product } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supermarketIcons } from '@/lib/icons';
import { X, Store } from 'lucide-react';

type SupermarketProductsSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  supermarket: Supermarket | null;
  allProducts: Product[];
};

export function SupermarketProductsSheet({
  isOpen,
  setIsOpen,
  supermarket,
  allProducts,
}: SupermarketProductsSheetProps) {
  const productsInSupermarket = React.useMemo(() => {
    if (!supermarket) return [];
    return allProducts
      .map(product => {
        const priceInfo = product.prices.find(p => p.supermarketId === supermarket.id);
        if (priceInfo) {
          return {
            ...product,
            displayPrice: priceInfo.price,
          };
        }
        return null;
      })
      .filter((p): p is Product & { displayPrice: number } => p !== null)
       .sort((a, b) => a.name.localeCompare(b.name));
  }, [supermarket, allProducts]);
  
  if (!supermarket) return null;
  
  const Icon = supermarketIcons[supermarket.icon] || Store;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] flex flex-col bg-background p-0"
      >
        <SheetHeader className="p-4 pb-2 text-left flex-row items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
             <Icon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <SheetTitle className="font-bold text-xl">
                {supermarket.name}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">{productsInSupermarket.length} prodotti</p>
          </div>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground ml-auto">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto px-4">
              <div className="space-y-3 py-4">
                {productsInSupermarket.length > 0 ? (
                    productsInSupermarket.map(product => {
                      const supermarketSpecificImage = supermarket ? product.images.find(img => img.supermarketId === supermarket.id) : undefined;
                      const generalImage = product.images.find(img => !img.supermarketId);
                      const fallbackImage = product.images.length > 0 ? product.images[0] : undefined;
                      const imageUrl = supermarketSpecificImage?.url || generalImage?.url || fallbackImage?.url;

                      return (
                        <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white shadow-sm">
                            {imageUrl ? (
                                <Image 
                                    src={imageUrl} 
                                    alt={product.name}
                                    width={56}
                                    height={56}
                                    className="rounded-lg object-cover bg-gray-100 h-14 w-14"
                                />
                            ) : (
                                <div className="h-14 w-14 rounded-lg bg-gray-100" />
                            )}
                            <div className="flex-1">
                                <p className="font-bold">{product.name}</p>
                                <Badge variant="secondary" className="mt-1 text-xs">{product.category}</Badge>
                            </div>
                            <p className="font-bold text-lg text-primary">€{product.displayPrice.toFixed(2)}</p>
                        </div>
                      )
                    })
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Nessun prodotto trovato per questo negozio.</p>
                    </div>
                )}
              </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}
