'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Supermarket } from '@/lib/types';
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

const supermarketSchema = z.object({
  name: z.string().min(2, 'Il nome del supermercato è obbligatorio.'),
  location: z.string().optional(),
});

type AddSupermarketDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddSupermarket: (supermarket: Omit<Supermarket, 'id'>) => void;
};

export function AddSupermarketDialog({
  isOpen,
  setIsOpen,
  onAddSupermarket,
}: AddSupermarketDialogProps) {
  const form = useForm<z.infer<typeof supermarketSchema>>({
    resolver: zodResolver(supermarketSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  function onSubmit(values: z.infer<typeof supermarketSchema>) {
    onAddSupermarket(values);
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuovo Negozio</DialogTitle>
          <DialogDescription>
            Aggiungi un nuovo supermercato al tuo elenco.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Supermercato</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Lidl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Via Garibaldi, 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">Aggiungi</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
