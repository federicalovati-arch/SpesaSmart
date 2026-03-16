'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Database, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PriceOverrideDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialPrice: number;
  canUpdateCatalog: boolean;
  onApply: (newPrice: number) => void;
  onRemove: () => void;
  onUpdateCatalog: (newPrice: number) => void;
};

export function PriceOverrideDialog({
  isOpen,
  setIsOpen,
  initialPrice,
  canUpdateCatalog,
  onApply,
  onRemove,
  onUpdateCatalog,
}: PriceOverrideDialogProps) {
  const [price, setPrice] = useState(initialPrice.toFixed(2));
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setPrice(initialPrice.toFixed(2));
    }
  }, [isOpen, initialPrice]);

  const handleApply = () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ variant: 'destructive', title: 'Prezzo non valido' });
      return;
    }
    onApply(newPrice);
    setIsOpen(false);
  };
  
  const handleRemove = () => {
    onRemove();
    setIsOpen(false);
  }

  const handleUpdateCatalog = () => {
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({ variant: 'destructive', title: 'Prezzo non valido' });
      return;
    }
    onUpdateCatalog(newPrice);
    setIsOpen(false);
    toast({ title: 'Catalogo aggiornato!', description: 'Il prezzo base del prodotto è stato modificato.' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xs p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-center">Prezzo alla Cassa</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="p-6 pt-2 space-y-6">
            <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-gray-500">PREZZO UNITARIO (€)</label>
                <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-20 text-5xl font-bold text-center border-2 border-primary/50 focus-visible:ring-primary/50 bg-gray-50"
                    autoFocus
                />
            </div>
            <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRemove} className="flex-1 h-12 text-lg">
                        RIMUOVI
                    </Button>
                    <Button onClick={handleApply} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-lg">
                        APPLICA
                    </Button>
                 </div>
                 <Button variant="ghost" onClick={handleUpdateCatalog} className="w-full text-center text-sm text-muted-foreground h-12" disabled={!canUpdateCatalog}>
                    <Database className="mr-2 h-4 w-4"/> AGGIORNA CATALOGO (BASE)
                 </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
