'use client';

import { useState, useMemo } from 'react';
import type { Product, Supermarket, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  LayoutGrid,
  Trash2,
  Image as ImageIcon,
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
    return [{name: 'Tutte', icon: 'layout-grid'}, ...allCategories];
  }, [allCategories]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => selectedCategory === 'Tutte' || p.category === selectedCategory)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [initialProducts, selectedCategory, searchQuery]);

  const getCategoryIcon = (iconName: string) => {
    const Icon = (iconMap as { [key: string]: LucideIcon | undefined })[iconName.toLowerCase()];
    if (iconName === 'layout-grid') return <LayoutGrid className="mr-2 h-4 w-4" />;
    if (Icon) {
      return <Icon className="mr-2 h-4 w-4" />;
    }
    // Return a transparent icon to maintain alignment
    return <LayoutGrid className="mr-2 h-4 w-4 opacity-0" />;
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

      <div className="flex gap-2 -mx-4 px-4 overflow-x-auto pb-2 -mb-2">
        {filterCategories.slice(0, 5).map((category) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            className={`rounded-full whitespace-nowrap border-gray-300 h-10 ${
              selectedCategory === category.name
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-foreground'
            }`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {getCategoryIcon(category.icon)}
            {category.name}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredProducts.map((product) => {
           return (
              <Card key={product.id} className="overflow-hidden shadow-md rounded-2xl">
                  <CardContent className="p-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-base font-bold">{product.name}</h3>
                          <Badge variant="secondary" className="font-semibold mt-1 bg-gray-200 text-gray-600 border-none text-xs">
                              {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" onClick={() => onEditProductClick(product)}>
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
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
                                        <AlertDialogAction onClick={() => onDeleteProduct(product.id)}>Elimina</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                       <div className="mt-2 bg-gray-100/70 p-2 rounded-lg space-y-1">
                          {product.prices.sort((a,b) => a.price - b.price).map(price => (
                              <div key={price.supermarketId} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">{getSupermarketName(price.supermarketId)}</span>
                                  <span className="font-bold text-base">€{price.price.toFixed(2)}</span>
                              </div>
                          ))}
                       </div>
                  </CardContent>
              </Card>
           )
        })}
      </div>
    </div>
  );
}
