'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Plus, Box, LayoutGrid, LucideIcon } from 'lucide-react';
import type { Product, Supermarket, ShoppingListItem, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { categoryIconMap as iconMap } from '@/lib/icons';
import { cn } from '@/lib/utils';

type AddItemSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  allProducts: Product[];
  allSupermarkets: Supermarket[];
  allCategories: Category[];
  listItems: ShoppingListItem[];
  onAddCatalogProduct: (product: Product) => void;
  onAddQuickProduct: (item: { name: string; price: number; supermarketId: string }) => void;
};

const quickAddSchema = z.object({
  name: z.string().min(2, 'Il nome è obbligatorio.'),
  price: z.coerce.number().min(0.01, 'Il prezzo è obbligatorio.'),
  supermarketId: z.string().min(1, 'Seleziona un negozio.'),
});

export function AddItemSheet({
  isOpen,
  setIsOpen,
  allProducts,
  allSupermarkets,
  allCategories,
  listItems,
  onAddCatalogProduct,
  onAddQuickProduct,
}: AddItemSheetProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Tutte');

  const form = useForm<z.infer<typeof quickAddSchema>>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { name: '', price: 0, supermarketId: '' },
  });

  const productsNotInList = React.useMemo(() => {
    const itemProductIds = new Set(listItems.map((item) => item.productId));
    return allProducts.filter((p) => !itemProductIds.has(p.id));
  }, [allProducts, listItems]);

  const filterCategories = React.useMemo(() => {
    const tutteCategory: Category = { name: 'Tutte', icon: 'layout-grid', id: 'all', order: 0 };
    const sortedCategories = [...allCategories].sort((a, b) => a.order - b.order);
    return [tutteCategory, ...sortedCategories];
  }, [allCategories]);

  const filteredProducts = React.useMemo(() => {
    return productsNotInList
      .filter((p) => selectedCategory === 'Tutte' || p.category === selectedCategory)
      .filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [productsNotInList, searchQuery, selectedCategory]);

  const getCategoryIcon = (iconName: string) => {
    const safeIconName = iconName || '';
    const Icon = (iconMap as { [key: string]: LucideIcon | undefined })[safeIconName.toLowerCase()] || LayoutGrid;
    return <Icon className="mr-2 h-4 w-4" />;
  };

  const handleAddProduct = (product: Product) => {
    onAddCatalogProduct(product);
    toast({
      title: `${product.name} aggiunto!`,
      description: 'Puoi modificare la quantità nella lista.',
    });
  };

  function onQuickAddSubmit(values: z.infer<typeof quickAddSchema>) {
    onAddQuickProduct(values);
    form.reset();
    toast({
      title: `${values.name} aggiunto!`,
      description: 'Aggiunta rapida completata.',
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] flex flex-col bg-background p-0"
      >
        <Tabs defaultValue="catalog" className="flex-1 flex flex-col pt-4 min-h-0">
           <div className="relative px-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-full h-11 p-1">
                  <TabsTrigger value="catalog" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">
                  DAL CATALOGO
                  </TabsTrigger>
                  <TabsTrigger value="quick" className="rounded-full text-sm data-[state=active]:bg-white data-[state=active]:shadow-md">
                  AGGIUNTA RAPIDA
                  </TabsTrigger>
              </TabsList>
              <SheetClose className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 bg-gray-200/80 h-7 w-7 flex items-center justify-center ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          
            <TabsContent value="catalog" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="px-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Cerca nel catalogo..."
                    className="pl-11 rounded-full bg-white shadow-sm h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 -mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
                  {filterCategories.map((category) => {
                    const isActive = selectedCategory === category.name;
                    return (
                      <Button
                        key={category.id}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'rounded-full whitespace-nowrap h-9 border-gray-300',
                          !isActive && 'bg-white text-foreground'
                        )}
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        {getCategoryIcon(category.icon)}
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 mt-2">
                <div className="space-y-2 pb-4">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-2 rounded-xl bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                          <Box className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.category} {product.brand ? `• ${product.brand}` : ''}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 rounded-full text-primary"
                          onClick={() => handleAddProduct(product)}
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground">Nessun prodotto trovato.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="quick" className="flex-1 overflow-y-auto mt-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onQuickAddSubmit)}
                  className="px-4 space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Prodotto</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Biscotti trovati in offerta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prezzo (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1.99"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supermarketId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negozio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allSupermarkets.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg">Aggiungi alla Lista</Button>
                </form>
              </Form>
            </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
