'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supermarketIcons, availableSupermarketIcons } from '@/lib/icons';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const supermarketSchema = z.object({
  name: z.string().min(2, 'Il nome del supermercato è obbligatorio.'),
  location: z.string().optional(),
  icon: z.string().min(1, "L'icona è obbligatoria."),
});

type AddSupermarketDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (supermarket: Omit<Supermarket, 'id' | 'order'>, id?: string) => void;
  supermarketToEdit?: Supermarket;
};

export function AddSupermarketDialog({
  isOpen,
  setIsOpen,
  onSave,
  supermarketToEdit,
}: AddSupermarketDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof supermarketSchema>>({
    resolver: zodResolver(supermarketSchema),
  });
  
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: supermarketToEdit?.name || '',
        location: supermarketToEdit?.location || '',
        icon: supermarketToEdit?.icon || 'store',
      });
    }
  }, [isOpen, supermarketToEdit, form]);

  function onSubmit(values: z.infer<typeof supermarketSchema>) {
    onSave(values, supermarketToEdit?.id);
    setIsOpen(false);
  }

  const selectedIcon = form.watch('icon');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {supermarketToEdit ? 'Modifica Negozio' : 'Nuovo Negozio'}
          </DialogTitle>
          <DialogDescription>
            {supermarketToEdit
              ? 'Modifica i dettagli del tuo supermercato.'
              : 'Aggiungi un nuovo supermercato al tuo elenco.'}
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

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icona</FormLabel>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {availableSupermarketIcons.map((iconKey) => {
                        const Icon = supermarketIcons[iconKey];
                        return (
                          <Button
                            key={iconKey}
                            type="button"
                            variant="outline"
                            size="icon"
                            className={cn(
                              'w-12 h-12 bg-gray-100 border-gray-200 relative',
                              selectedIcon === iconKey &&
                                'ring-2 ring-primary border-primary'
                            )}
                            onClick={() => field.onChange(iconKey)}
                          >
                            <Icon className="h-6 w-6 text-gray-600" />
                            {selectedIcon === iconKey && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="h-1 w-full" />
                  </ScrollArea>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Annulla
              </Button>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
