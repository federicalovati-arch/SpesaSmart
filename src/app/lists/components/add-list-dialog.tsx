'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { ShoppingList } from '@/lib/types';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { parseListWithAI } from '../actions';
import { Loader2, Sparkles, X } from 'lucide-react';

const listSchema = z.object({
  name: z.string().min(2, 'Il nome della lista è obbligatorio.'),
  naturalLanguageList: z.string().optional(),
});

type AddListDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (name: string, items?: ShoppingList['items']) => void;
  listToEdit?: ShoppingList;
};

export function AddListDialog({
  isOpen,
  setIsOpen,
  onSave,
  listToEdit,
}: AddListDialogProps) {
  const { toast } = useToast();
  const [isParsing, setIsParsing] = React.useState(false);

  const form = useForm<z.infer<typeof listSchema>>({
    resolver: zodResolver(listSchema),
    defaultValues: { name: '', naturalLanguageList: '' },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: listToEdit?.name || '',
        naturalLanguageList: '',
      });
    }
  }, [isOpen, listToEdit, form]);

  async function onSubmit(values: z.infer<typeof listSchema>) {
    if (listToEdit) {
      onSave(values.name);
    } else {
      if (values.naturalLanguageList) {
        setIsParsing(true);
        const result = await parseListWithAI(values.naturalLanguageList);
        setIsParsing(false);
        if (result.success && result.data) {
          const aiItems = result.data.items.map((item) => ({
            productId: item.productName, // temporary use name as ID
            quantity: item.quantity,
            purchased: false,
          }));
          onSave(values.name, aiItems);
        } else {
          toast({
            variant: 'destructive',
            title: 'Errore AI',
            description: result.error,
          });
        }
      } else {
        onSave(values.name);
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0">
        <SheetHeader className="p-4 border-b text-center">
          <SheetTitle>
            {listToEdit ? 'Modifica Nome Lista' : 'Nuova Lista'}
          </SheetTitle>
          <SheetDescription className="px-4 text-center">
            {listToEdit
              ? 'Modifica il nome della tua lista.'
              : 'Crea una nuova lista della spesa.'}
          </SheetDescription>
          <SheetClose className="absolute right-4 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Lista</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Spesa Settimanale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!listToEdit && (
                <FormField
                  control={form.control}
                  name="naturalLanguageList"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span>Aggiungi prodotti (opzionale)</span>
                        <Sparkles className="h-4 w-4 text-primary" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Es: 2 litri di latte, pane, 5 mele, detersivo..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Usa il nostro AI per creare la lista da un testo
                        semplice.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <SheetFooter className="p-4 mt-auto border-t bg-background">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isParsing} className="w-full">
                {isParsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Analizzando...
                  </>
                ) : listToEdit ? (
                  'Salva'
                ) : (
                  'Crea Lista'
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
