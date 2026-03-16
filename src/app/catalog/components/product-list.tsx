'use client';

import { useState, useMemo } from 'react';
import type { Product, Supermarket, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  LayoutGrid,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from "@/components/ui/alert-dialog";
import { iconMap } from './category-manager-dialog';
import { cn } from '@/lib/utils';

type ProductListProps = {
  products: Product[];
  supermarkets: Supermarket[];
  allCategories: Category[];
  onEditProductClick: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
};

export function ProductList({
  products: initialProducts,
  supermarkets,
  allCategories,
  onEditProductClick,
  onDeleteProduct,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');

  const filterCategories = useMemo(() => {
    const tutteCategory: Category = { name: 'Tutte', icon: 'layout-grid', id: 'all', order: 0 };
    const sortedCategories = [...allCategories].sort((a,b) => a.order - b.order);
    return [tutteCategory, ...sortedCategories];
  }, [allCategories]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => selectedCategory === 'Tutte' || p.category === selectedCategory)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialProducts, selectedCategory, searchQuery]);

  const getCategoryIcon = (iconName: string) => {
    const safeIconName = iconName || '';
    const Icon = (iconMap as { [key: string]: LucideIcon | undefined })[safeIconName.toLowerCase()] || LayoutGrid;
    return <Icon className="mr-2 h-4 w-4" />;
  };

  const getSupermarketName = (id: string) => {
    return supermarkets.find(s => s.id === id)?.name || 'Sconosciuto';
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Cerca prodotto..."
          className="pl-11 rounded-full bg-white shadow-sm h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 -mx-4 px-4 overflow-x-auto pb-2">
        {filterCategories.map((category) => {
          const isActive = selectedCategory === category.name;
          return (
            <Button
              key={category.id}
              variant={isActive ? 'default' : 'outline'}
              className={cn(`rounded-full whitespace-nowrap h-10 border-gray-300`,
                !isActive && 'bg-white text-foreground'
              )}
              onClick={() => setSelectedCategory(category.name)}
            >
              {getCategoryIcon(category.icon)}
              {category.name}
            </Button>
          )
        })}
      </div>

      <div className="space-y-4">
        {filteredProducts.map((product) => {
           return (
              <Card key={product.id} onClick={() => onEditProductClick(product)} className="overflow-hidden shadow-md rounded-2xl bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{product.name}</h3>
                          {product.category && (
                            <Badge variant="secondary" className="font-semibold mt-1 bg-gray-200 text-gray-600 border-none text-xs">
                                {product.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-0">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={(e) => e.stopPropagation()}>
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Sei sicuro di voler eliminare {product.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Questa azione non può essere annullata. Il prodotto verrà rimosso permanentemente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id);}}>Elimina</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                       <div className="mt-3 bg-gray-100/70 p-3 rounded-lg space-y-2">
                          {product.prices.length > 0 ? (
                            product.prices.sort((a,b) => a.price - b.price).map(price => (
                              <div key={price.supermarketId} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">{getSupermarketName(price.supermarketId)}</span>
                                  <span className="font-bold text-base">€{price.price.toFixed(2)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-center text-gray-500">Nessun prezzo inserito</p>
                          )}
                       </div>
                  </CardContent>
              </Card>
           )
        })}
      </div>
    </div>
  );
}
