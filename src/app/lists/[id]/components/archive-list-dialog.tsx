'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, Archive } from 'lucide-react';
import type { ShoppingList, Receipt, ReceiptItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type EnrichedListItemForDialog = {
  productId: string;
  quantity: number;
  product: { name: string };
  bestPrice: number | null;
  bestSupermarket: { id: string, name: string } | null;
};

type ArchiveListDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  list: ShoppingList;
  enrichedItems: EnrichedListItemForDialog[];
  optimalTotal: number;
  onArchive: (receipt: Receipt) => void;
};

export function ArchiveListDialog({
  isOpen,
  setIsOpen,
  list,
  enrichedItems,
  optimalTotal,
  onArchive,
}: ArchiveListDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleArchiveConfirm = () => {
    if (!date) return;

    const receiptItems: ReceiptItem[] = enrichedItems
      .map(item => {
        if (item.bestPrice === null) return null;
        return {
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.bestPrice,
          supermarketId: item.bestSupermarket?.id,
          supermarketName: item.bestSupermarket?.name,
        };
      })
      .filter((item): item is ReceiptItem => item !== null);

    const newReceipt: Receipt = {
      id: `receipt-${Date.now()}`,
      originalListId: list.id,
      listName: list.name,
      archivedAt: date.toISOString(),
      totalCost: optimalTotal,
      items: receiptItems,
    };
    
    onArchive(newReceipt);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Archivia Spesa</DialogTitle>
          <DialogDescription>
            Una volta archiviata, la lista diventerà uno scontrino storico e non potrà più essere modificata.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Data della Spesa</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: it }) : <span>Scegli una data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-sm">
            <p>Stai per archiviare la lista <span className="font-bold">{list.name}</span>.</p>
            <p className="mt-2">Il costo totale registrato sarà di <span className="font-bold">€{optimalTotal.toFixed(2)}</span>.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Annulla</Button>
          <Button onClick={handleArchiveConfirm} disabled={!date}>
            <Archive className="mr-2 h-4 w-4" />
            Conferma e Archivia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
