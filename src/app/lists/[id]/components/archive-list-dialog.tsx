'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Archive,
  Trash2,
  Plus,
  Wallet,
  Landmark,
  CreditCard,
  Ticket,
  Check,
} from 'lucide-react';
import type {
  ShoppingList,
  Receipt,
  ReceiptItem,
  Payment,
} from '@/lib/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


type EnrichedListItemForDialog = {
  productId: string;
  quantity: number;
  product: { name: string };
  bestPrice: number | null;
  basePrice: number | null;
  bestSupermarket: { id: string; name: string } | null;
};

type ArchiveListDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  list: ShoppingList;
  enrichedItems: EnrichedListItemForDialog[];
  optimalTotal: number;
  onArchive: (receipt: Receipt) => void;
};

const paymentMethods: {
  value: Payment['method'];
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'Contanti', label: 'Contanti', icon: Wallet },
  { value: 'Bancomat', label: 'Bancomat', icon: CreditCard },
  { value: 'Conad Card', label: 'Conad Card', icon: Landmark },
  { value: 'Buoni', label: 'Buoni', icon: Ticket },
];

export function ArchiveListDialog({
  isOpen,
  setIsOpen,
  list,
  enrichedItems,
  optimalTotal,
  onArchive,
}: ArchiveListDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [paymentsBySupermarket, setPaymentsBySupermarket] = useState<Record<string, Payment[]>>({});
  const [newPaymentAmounts, setNewPaymentAmounts] = useState<Record<string, string>>({});
  const [newPaymentMethods, setNewPaymentMethods] = useState<Record<string, Payment['method']>>({});

  const { toast } = useToast();

  const supermarketGroups = useMemo(() => {
    const groups: Record<string, { name: string; subtotal: number; items: EnrichedListItemForDialog[] }> = {};
    enrichedItems.forEach(item => {
      const supermarketId = item.bestSupermarket?.id || 'unknown';
      const supermarketName = item.bestSupermarket?.name || 'Senza Negozio';
      if (!groups[supermarketId]) {
        groups[supermarketId] = { name: supermarketName, subtotal: 0, items: [] };
      }
      groups[supermarketId].items.push(item);
      groups[supermarketId].subtotal += (item.bestPrice || 0) * item.quantity;
    });
    return groups;
  }, [enrichedItems]);

  const isFullyPaid = useMemo(() => {
    return Object.entries(supermarketGroups).every(([id, group]) => {
      if (group.subtotal <= 0) return true;
      const paid = (paymentsBySupermarket[id] || []).reduce((acc, p) => acc + p.amount, 0);
      return Math.abs(group.subtotal - paid) < 0.001;
    });
  }, [supermarketGroups, paymentsBySupermarket]);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date());
      setPaymentsBySupermarket({});
      setShowCalendar(false);
      
      const initialAmounts: Record<string, string> = {};
      const initialMethods: Record<string, Payment['method']> = {};
      Object.entries(supermarketGroups).forEach(([id, group]) => {
          if (group.subtotal > 0) {
              initialAmounts[id] = group.subtotal.toFixed(2);
              initialMethods[id] = 'Bancomat';
          }
      });
      setNewPaymentAmounts(initialAmounts);
      setNewPaymentMethods(initialMethods);
    }
  }, [isOpen, supermarketGroups]);

  const handleAddPayment = (supermarketId: string) => {
    const amountStr = newPaymentAmounts[supermarketId] || '';
    const method = newPaymentMethods[supermarketId] || 'Bancomat';
    const amount = parseFloat(amountStr);

    const group = supermarketGroups[supermarketId];
    const paidForGroup = (paymentsBySupermarket[supermarketId] || []).reduce((acc, p) => acc + p.amount, 0);
    const remainingForGroup = group.subtotal - paidForGroup;

    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Importo non valido', description: 'Inserisci un importo positivo.' });
      return;
    }
    if (amount > remainingForGroup + 0.001) {
      toast({ variant: 'destructive', title: 'Importo eccessivo', description: `L'importo non può superare il totale rimanente di €${remainingForGroup.toFixed(2)}.` });
      return;
    }

    const newPayment: Payment = { method, amount };
    setPaymentsBySupermarket(prev => ({
      ...prev,
      [supermarketId]: [...(prev[supermarketId] || []), newPayment],
    }));

    const newRemaining = remainingForGroup - amount;
    setNewPaymentAmounts(prev => ({
      ...prev,
      [supermarketId]: newRemaining > 0.001 ? newRemaining.toFixed(2) : '',
    }));
  };

  const removePayment = (supermarketId: string, index: number) => {
    const newPayments = [...(paymentsBySupermarket[supermarketId] || [])];
    const removedPayment = newPayments.splice(index, 1)[0];
    setPaymentsBySupermarket(prev => ({
      ...prev,
      [supermarketId]: newPayments,
    }));
    
    // On remove, set the input to the current remaining amount + removed amount
    const paidForGroup = newPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingForGroup = supermarketGroups[supermarketId].subtotal - paidForGroup;
    setNewPaymentAmounts(prev => ({
        ...prev,
        [supermarketId]: remainingForGroup.toFixed(2)
    }))
  };

  const handleArchiveConfirm = () => {
    if (!date) return;
    if (!isFullyPaid) {
        toast({
            variant: 'destructive',
            title: 'Pagamento incompleto',
            description: `Devi ancora completare il pagamento per uno o più negozi.`,
        });
        return;
    }

    const receiptItems: ReceiptItem[] = enrichedItems
      .map((item) => {
        if (item.bestPrice === null) return null;
        return {
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.bestPrice,
          basePrice: item.basePrice,
          supermarketId: item.bestSupermarket?.id,
          supermarketName: item.bestSupermarket?.name,
        };
      })
      .filter((item): item is ReceiptItem => item !== null);

    const allPayments: Payment[] = Object.values(paymentsBySupermarket).flat();

    const newReceipt: Receipt = {
      id: `receipt-${Date.now()}`,
      originalListId: list.id,
      listName: list.name,
      archivedAt: date.toISOString(),
      totalCost: optimalTotal,
      items: receiptItems,
      payments: allPayments,
    };

    onArchive(newReceipt);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Archivia Spesa</DialogTitle>
          <DialogDescription>
            Conferma i dettagli della spesa per archiviarla.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4 pr-3 -mr-6">
          <ScrollArea className="h-full pr-6">
            <div className="space-y-6">
            {/* Total Cost */}
            <div className="text-center bg-primary/10 py-3 rounded-lg">
                <p className="text-sm text-primary font-bold">TOTALE SPESA</p>
                <p className="text-4xl font-bold text-primary">
                €{optimalTotal.toFixed(2)}
                </p>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Data della Spesa</label>
                <Button
                    type="button"
                    variant={'outline'}
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                        format(date, 'PPP', { locale: it })
                    ) : (
                        <span>Scegli una data</span>
                    )}
                </Button>
                {showCalendar && (
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        setDate(d);
                        setShowCalendar(false);
                    }}
                    initialFocus
                    locale={it}
                    disabled={{ after: new Date() }}
                    className="rounded-md border bg-background"
                    />
                )}
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
                <label className="text-sm font-medium">Dettaglio Pagamenti</label>
                {Object.entries(supermarketGroups).filter(([,group])=> group.subtotal > 0).map(([id, group]) => {
                    const paidForGroup = (paymentsBySupermarket[id] || []).reduce((acc, p) => acc + p.amount, 0);
                    const remainingForGroup = group.subtotal - paidForGroup;
                    const isGroupPaid = remainingForGroup < 0.001;

                    return (
                        <div key={id} className="p-4 border rounded-xl space-y-3 bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold">{group.name}</h4>
                                <span className="font-bold text-lg text-primary">€{group.subtotal.toFixed(2)}</span>
                            </div>

                             {(paymentsBySupermarket[id] || []).map((payment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white border rounded-md">
                                    <div className="flex items-center gap-2">
                                    {React.createElement(paymentMethods.find(p => p.value === payment.method)?.icon || Wallet, { className: "h-5 w-5 text-gray-600"})}
                                    <span className="font-semibold">{payment.method}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">€{payment.amount.toFixed(2)}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePayment(id, index)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                    </div>
                                </div>
                            ))}
                            
                            {!isGroupPaid && (
                                <div className="p-3 bg-white border rounded-lg space-y-3">
                                <p className="text-sm font-semibold">Aggiungi Pagamento (Rimanenti: €{remainingForGroup.toFixed(2)})</p>
                                <div className="flex items-center gap-2">
                                    <Select 
                                        value={newPaymentMethods[id]} 
                                        onValueChange={(v) => setNewPaymentMethods(p => ({ ...p, [id]: v as Payment['method'] }))}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Metodo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.map(method => (
                                            <SelectItem key={method.value} value={method.value}>
                                                <div className="flex items-center gap-2">
                                                    <method.icon className="h-4 w-4" />
                                                    {method.label}
                                                </div>
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={newPaymentAmounts[id] || ''}
                                        onChange={(e) => setNewPaymentAmounts(p => ({...p, [id]: e.target.value }))}
                                        placeholder="Importo"
                                        className="w-28"
                                    />
                                    <Button size="icon" onClick={() => handleAddPayment(id)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                </div>
                            )}

                             {isGroupPaid && (
                                <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center justify-center gap-2">
                                    <Check className="h-4 w-4" />
                                    <p className="font-semibold">Pagato!</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleArchiveConfirm}
            disabled={!date || !isFullyPaid}
          >
            <Archive className="mr-2 h-4 w-4" />
            Conferma e Archivia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
