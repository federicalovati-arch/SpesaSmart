'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { ShoppingList } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { parseListWithAI } from '../actions';
import { Loader2, Sparkles } from 'lucide-react';


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
        if(values.naturalLanguageList) {
            setIsParsing(true);
            const result = await parseListWithAI(values.naturalLanguageList);
            setIsParsing(false);
            if(result.success && result.data) {
                const aiItems = result.data.items.map(item => ({
                    productId: item.productName, // temporary use name as ID
                    quantity: item.quantity,
                    purchased: false,
                }));
                onSave(values.name, aiItems);
            } else {
                toast({ variant: 'destructive', title: 'Errore AI', description: result.error });
            }
        } else {
             onSave(values.name);
        }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {listToEdit ? 'Modifica Nome Lista' : 'Nuova Lista'}
          </DialogTitle>
          <DialogDescription>
            {listToEdit ? 'Modifica il nome della tua lista.' : 'Crea una nuova lista della spesa.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                        <FormLabel>Aggiungi prodotti (opzionale)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Es: 2 litri di latte, pane, 5 mele, detersivo..."
                                className="resize-none"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Usa il nostro AI per creare la lista da un testo semplice.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
           
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isParsing}>
                {isParsing 
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizzando...</>
                    : listToEdit ? 'Salva' : 'Crea Lista'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
