'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Supermarket, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Sparkles, Trash2, Loader2 } from 'lucide-react';
import { getCategorySuggestion } from '../actions';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Il nome del prodotto è obbligatorio.'),
  category: z.string().min(2, 'La categoria è obbligatoria.'),
  prices: z.array(
    z.object({
      supermarketId: z.string(),
      price: z.coerce.number().min(0, 'Il prezzo non può essere negativo.'),
    })
  ),
});

type AddProductDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  supermarkets: Supermarket[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
};

export function AddProductDialog({
  isOpen,
  setIsOpen,
  supermarkets,
  onAddProduct,
}: AddProductDialogProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      prices: supermarkets.map((s) => ({ supermarketId: s.id, price: 0 })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'prices',
  });

  const handleSuggestion = async () => {
    const productName = form.getValues('name');
    if (!productName) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Inserisci un nome prodotto per ricevere un suggerimento.',
      });
      return;
    }
    setIsSuggesting(true);
    const result = await getCategorySuggestion(productName);
    if (result.success && result.data) {
      form.setValue('name', result.data.standardizedProductName, { shouldValidate: true });
      form.setValue('category', result.data.suggestedCategory, { shouldValidate: true });
      toast({
        title: 'Suggerimento ricevuto!',
        description: 'Nome e categoria sono stati aggiornati.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Errore AI',
        description: result.error,
      });
    }
    setIsSuggesting(false);
  };

  function onSubmit(values: z.infer<typeof productSchema>) {
    const pricesWithValue = values.prices.filter(p => p.price > 0);
    onAddProduct({...values, prices: pricesWithValue});
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Prodotto</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del prodotto e i prezzi nei vari supermercati.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Prodotto</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="Es. Latte Intero" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={handleSuggestion} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="sr-only">Suggerisci con AI</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Latticini" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Prezzi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field, index) => {
                    const supermarket = supermarkets.find(s => s.id === field.supermarketId);
                    if (!supermarket) return null;
                    return (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`prices.${index}.price`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{supermarket.name}</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    );
                })}
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">Aggiungi Prodotto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
