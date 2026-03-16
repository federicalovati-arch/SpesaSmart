'use client';

import { useState, useRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import type { Supermarket, Product, ProductImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Il nome del prodotto è obbligatorio.'),
  brand: z.string().optional(),
  category: z.string().min(2, 'La categoria è obbligatoria.'),
  prices: z.array(
    z.object({
      supermarketId: z.string(),
      price: z.coerce.number().optional().default(0),
      brand: z.string().optional(),
    })
  ),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      file: z.any().optional(),
      supermarketId: z.string().optional(),
    })
  ),
});

type AddProductDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  supermarkets: Supermarket[];
  categories: string[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product;
};

export function AddProductDialog({
  isOpen,
  setIsOpen,
  supermarkets,
  categories,
  onAddProduct,
  productToEdit,
}: AddProductDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultValues = useMemo(() => {
    const baseValues = {
        name: '',
        brand: '',
        category: '',
        images: [],
        prices: supermarkets.map((s) => ({
            supermarketId: s.id,
            price: 0,
            brand: '',
        })),
    };
    if (productToEdit) {
        return {
            ...baseValues,
            name: productToEdit.name,
            brand: productToEdit.brand || '',
            category: productToEdit.category,
            images: productToEdit.images.map(img => ({...img, file: undefined, supermarketId: img.supermarketId || ''})),
            prices: supermarkets.map((s) => {
                const priceInfo = productToEdit.prices.find(p => p.supermarketId === s.id);
                return {
                    supermarketId: s.id,
                    price: priceInfo?.price || 0,
                    brand: priceInfo?.brand || '',
                };
            }),
        }
    }
    return baseValues;
  }, [productToEdit, supermarkets])

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const { fields: priceFields } = useFieldArray({
    control: form.control,
    name: 'prices',
  });
  
  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          appendImage({
            id: `new-${Math.random()}`,
            url: e.target?.result as string,
            file: file,
            supermarketId: '',
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getSupermarketIcon = (supermarketId: string) => {
    const supermarket = supermarkets.find(s => s.id === supermarketId);
    const name = supermarket?.name.toLowerCase() || '';
    if (name.includes('eurospin')) return 'https://picsum.photos/seed/s1-logo/40/40';
    if (name.includes('conad')) return 'https://picsum.photos/seed/s2-logo/40/40';
    if (name.includes('coop')) return 'https://picsum.photos/seed/s3-logo/40/40';
    return 'https://picsum.photos/seed/s-default/40/40';
  }
  
  const watchedImages = form.watch('images');

  function onSubmit(values: z.infer<typeof productSchema>) {
    const pricesWithValue = values.prices.filter(p => p.price && p.price > 0);
    
    const finalImages = values.images.map(img => ({
      id: img.id.startsWith('new-') ? `img-${Date.now()}` : img.id,
      url: img.url,
      supermarketId: img.supermarketId || undefined,
    }));
        
    const productData: Omit<Product, 'id'> = {
      name: values.name,
      brand: values.brand,
      category: values.category,
      prices: pricesWithValue,
      images: finalImages,
    }
    
    onAddProduct(productData);
    form.reset(defaultValues);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-gray-50 p-0 flex flex-col max-h-[95vh] md:max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center">
            {productToEdit ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </DialogTitle>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-y-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">NOME PRODOTTO</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Acciughe" {...field} className="bg-white border-primary/50 focus-visible:ring-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">MARCA PRINCIPALE</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Granarolo..." {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">CATEGORIA</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Seleziona una categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-white p-6 rounded-t-2xl space-y-4 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500">PREZZI PER NEGOZIO</h3>
                  <div className="space-y-2">
                  {priceFields.map((field, index) => {
                      const supermarket = supermarkets.find(s => s.id === field.supermarketId);
                      if (!supermarket) return null;
                      
                      const imageForSupermarket = watchedImages.find(img => img.supermarketId === supermarket.id);
                      const generalImage = watchedImages.find(img => !img.supermarketId);
                      const imageUrlToShow = imageForSupermarket?.url || generalImage?.url || getSupermarketIcon(supermarket.id);

                      return (
                      <div key={field.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                          <Image
                              src={imageUrlToShow}
                              alt={supermarket.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover w-10 h-10 bg-white"
                          />
                          <div className="flex-1 font-semibold">{supermarket.name}</div>
                          <FormField
                              control={form.control}
                              name={`prices.${index}.price`}
                              render={({ field: priceField }) => (
                              <FormItem className="flex items-center gap-1">
                                  <FormControl>
                                      <Input type="number" step="0.01" {...priceField} className="w-20 text-right font-bold bg-white" placeholder="€ 0.00" />
                                  </FormControl>
                              </FormItem>
                              )}
                          />
                         <FormField
                            control={form.control}
                            name={`prices.${index}.brand`}
                            render={({ field: brandField }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...brandField} className="w-24 bg-white" placeholder="Marca" />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </div>
                    );
                })}
                </div>
            </div>

             <div className="bg-white p-6 pt-0 space-y-4">
                <h3 className="text-xs font-semibold text-gray-500">GALLERIA IMMAGINI</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:border-primary/50"
                    >
                        <Upload className="h-6 w-6" />
                        <span>Carica</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*"
                    />

                    {imageFields.map((image, index) => (
                        <div key={image.id} className="relative group aspect-square">
                            <Image src={image.url} alt={`Product image ${index + 1}`} fill className="object-cover rounded-lg" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                             <FormField
                                control={form.control}
                                name={`images.${index}.supermarketId`}
                                render={({ field }) => (
                                <div className="absolute bottom-1 left-1 right-1 z-0">
                                    <Select
                                        onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}
                                        value={field.value ? field.value : 'general'}
                                    >
                                        <FormControl>
                                        <SelectTrigger className="h-7 text-xs bg-black/60 backdrop-blur-sm text-white border-none focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="Assegna..." />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="general">Immagine Generale</SelectItem>
                                            {supermarkets.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>

            </div>
            <DialogFooter className="bg-white p-6 flex-col-reverse gap-2 border-t flex-shrink-0">
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-lg">SALVA</Button>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="w-full text-lg">
                ANNULLA
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
