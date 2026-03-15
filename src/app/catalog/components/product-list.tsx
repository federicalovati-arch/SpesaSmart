'use client';

import { useState, useMemo } from 'react';
import type { Product, Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type ProductListProps = {
  products: Product[];
  supermarkets: Supermarket[];
  onAddProductClick: () => void;
};

export function ProductList({
  products: initialProducts,
  supermarkets,
  onAddProductClick,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');

  const categories = useMemo(() => {
    const allCategories = initialProducts.map((p) => p.category);
    return ['Tutte', ...Array.from(new Set(allCategories))];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => selectedCategory === 'Tutte' || p.category === selectedCategory)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [initialProducts, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: string) => {
    // Keeping this simple for now
    if (category === 'Tutte') return <LayoutGrid className="mr-2 h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Cerca prodotto..."
          className="pl-11 rounded-full bg-white shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 -mx-4 px-4 overflow-x-auto pb-2 -mb-2">
        {categories.slice(0, 5).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className={`rounded-full whitespace-nowrap border-gray-300 ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-foreground'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryIcon(category)}
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
           const mainImage = product.images.length > 0 ? product.images[0].url : `https://picsum.photos/seed/${product.id}/400/300`;
           const cheapestPrice = product.prices.length > 0 ? Math.min(...product.prices.map(p => p.price)) : null;

           return (
              <Card key={product.id} className="overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-[4/3]">
                      <Image 
                          src={mainImage} 
                          alt={product.name} 
                          fill
                          className="object-cover"
                          data-ai-hint="product image"
                      />
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                      <h3 className="text-base font-bold flex-grow">{product.name}</h3>
                       <div className="flex justify-between items-end mt-2">
                          <Badge variant="secondary" className="font-normal">
                              {product.category}
                          </Badge>
                          {cheapestPrice !== null && (
                              <div className="text-right">
                                  <div className="text-xs text-muted-foreground">da</div>
                                  <div className="font-bold text-lg text-primary">€{cheapestPrice.toFixed(2)}</div>
                              </div>
                          )}
                       </div>
                  </CardContent>
              </Card>
           )
        })}
      </div>
      <div className="fixed bottom-6 right-6 z-10">
         <Button onClick={onAddProductClick} className="rounded-full h-14 w-14 shadow-lg">
             <Plus className="h-6 w-6" />
             <span className="sr-only">Aggiungi Prodotto</span>
         </Button>
      </div>
    </div>
  );
}
