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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
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
import { Check, X } from 'lucide-react';

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-0 flex flex-col max-h-[85vh]"
      >
        <SheetHeader className="p-4 text-center border-b">
          <SheetTitle>
            {supermarketToEdit ? 'Modifica Negozio' : 'Nuovo Negozio'}
          </SheetTitle>
          <SheetDescription className="text-center px-4">
            {supermarketToEdit
              ? 'Modifica i dettagli del tuo supermercato.'
              : 'Aggiungi un nuovo supermercato al tuo elenco.'}
          </SheetDescription>
          <SheetClose className="absolute right-4 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-y-hidden"
          >
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
                                  'w-12 h-12 bg-gray-100 border-gray-200 relative shrink-0',
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
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t mt-auto bg-background">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Annulla
              </Button>
              <Button type="submit" className="w-full">
                Salva
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
