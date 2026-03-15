'use client';

import { useState, useMemo } from 'react';
import type { Product, Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  LayoutGrid,
  Carrot,
  Slice,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type ProductListProps = {
  products: Product[];
  supermarkets: Supermarket[];
};

export function ProductList({
  products: initialProducts,
  supermarkets,
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
    if (category === 'Tutte') return <LayoutGrid className="mr-2 h-4 w-4" />;
    if (category === 'Frutta e Verdura') return <Carrot className="mr-2 h-4 w-4" />;
    if (['Carne', 'Forno'].includes(category)) return <Slice className="mr-2 h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <Badge variant="secondary" className="font-normal mt-1">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive/70 hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm mt-4">
                {product.prices
                  .sort((a,b) => a.price - b.price)
                  .map((priceInfo) => {
                  const supermarket = supermarkets.find(
                    (s) => s.id === priceInfo.supermarketId
                  );
                  return (
                    <div
                      key={priceInfo.supermarketId}
                      className="flex justify-between items-center"
                    >
                      <span className="text-muted-foreground text-base">
                        {supermarket?.name}
                      </span>
                      <span className="font-bold text-base">
                        €{priceInfo.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
