'use client';

import { useState, useEffect } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type EnrichedListItemForDialog = {
  productId: string;
  quantity: number;
  product: { name: string };
  bestPrice: number | null;
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] =
    useState<Payment['method']>('Bancomat');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const { toast } = useToast();

  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = optimalTotal - paidAmount;

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setDate(new Date());
      setPayments([]);
      setNewPaymentAmount(
        optimalTotal > 0 ? optimalTotal.toFixed(2) : ''
      );
      setNewPaymentMethod('Bancomat');
    }
  }, [isOpen, optimalTotal]);

  const handleAddPayment = () => {
    const amount = parseFloat(newPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Importo non valido',
        description: 'Inserisci un importo positivo.',
      });
      return;
    }
    if (amount > remainingAmount + 0.001) {
      // allow for small floating point inaccuracies
      toast({
        variant: 'destructive',
        title: 'Importo eccessivo',
        description: `L'importo non può superare il totale rimanente di €${remainingAmount.toFixed(
          2
        )}.`,
      });
      return;
    }

    setPayments([...payments, { method: newPaymentMethod, amount }]);
    setNewPaymentAmount(
      (remainingAmount - amount > 0)
        ? (remainingAmount - amount).toFixed(2)
        : ''
    );
  };
  
  const removePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };


  const handleArchiveConfirm = () => {
    if (!date) return;
    if (Math.abs(remainingAmount) > 0.001) {
        toast({
            variant: 'destructive',
            title: 'Pagamento incompleto',
            description: `Devi ancora pagare €${remainingAmount.toFixed(2)}.`,
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
      payments: payments,
    };

    onArchive(newReceipt);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archivia Spesa</DialogTitle>
          <DialogDescription>
            Conferma i dettagli della spesa per archiviarla.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
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
                  {date ? (
                    format(date, 'PPP', { locale: it })
                  ) : (
                    <span>Scegli una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={it}
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Metodo di Pagamento</label>
            <div className="space-y-2">
                {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                        <div className="flex items-center gap-2">
                           {React.createElement(paymentMethods.find(p => p.value === payment.method)?.icon || Wallet, { className: "h-5 w-5 text-gray-600"})}
                           <span className="font-semibold">{payment.method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800">€{payment.amount.toFixed(2)}</span>
                           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePayment(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                           </Button>
                        </div>
                    </div>
                ))}
            </div>

            {remainingAmount > 0.001 && (
                 <div className="p-3 bg-gray-50 border rounded-lg space-y-3">
                    <p className="text-sm font-semibold">Aggiungi Pagamento (Rimanenti: €{remainingAmount.toFixed(2)})</p>
                    <div className="flex items-center gap-2">
                        <Select value={newPaymentMethod} onValueChange={(v) => setNewPaymentMethod(v as Payment['method'])}>
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
                            value={newPaymentAmount}
                            onChange={(e) => setNewPaymentAmount(e.target.value)}
                            placeholder="Importo"
                            className="w-28"
                        />
                        <Button size="icon" onClick={handleAddPayment}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
            )}
             {payments.length > 0 && remainingAmount < 0.001 && (
                <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg">
                    <p className="font-semibold">Pagamento completato!</p>
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleArchiveConfirm}
            disabled={!date || Math.abs(remainingAmount) > 0.001}
          >
            <Archive className="mr-2 h-4 w-4" />
            Conferma e Archivia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
