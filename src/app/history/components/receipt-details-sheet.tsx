'use client';

import * as React from 'react';
import type { Receipt, Payment } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  X,
  Calendar,
  Wallet,
  CreditCard,
  Landmark,
  Ticket,
  Store,
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

type ReceiptDetailsSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  receipt: Receipt | null;
};

const paymentIcons: { [key in Payment['method']]: React.ElementType } = {
  'Contanti': Wallet,
  'Bancomat': CreditCard,
  'Conad Card': Landmark,
  'Buoni': Ticket,
};

export function ReceiptDetailsSheet({
  isOpen,
  setIsOpen,
  receipt,
}: ReceiptDetailsSheetProps) {
  if (!receipt) return null;
  
  const supermarketGroups = React.useMemo(() => {
    const groups: Record<string, { name: string; subtotal: number; items: Receipt['items'] }> = {};
    receipt.items.forEach(item => {
      const supermarketId = item.supermarketId || 'unknown';
      const supermarketName = item.supermarketName || 'Senza Negozio';
      if (!groups[supermarketId]) {
        groups[supermarketId] = { name: supermarketName, subtotal: 0, items: [] };
      }
      groups[supermarketId].items.push(item);
      groups[supermarketId].subtotal += item.price * item.quantity;
    });
    return Object.values(groups).sort((a,b) => b.subtotal - a.subtotal);
  }, [receipt.items]);
  
  const paymentGroups = React.useMemo(() => {
    if (!receipt.payments || receipt.payments.length === 0) return [];
    const groups: Record<string, { name: string; payments: Payment[] }> = {};
    receipt.payments.forEach(payment => {
      const supermarketId = payment.supermarketId || 'unknown';
      const supermarketName = payment.supermarketName || 'Sconosciuto';
      if (!groups[supermarketId]) {
        groups[supermarketId] = { name: supermarketName, payments: [] };
      }
      groups[supermarketId].payments.push(payment);
    });
    return Object.values(groups);
  }, [receipt.payments]);


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] flex flex-col bg-gray-50 p-0"
      >
        <SheetHeader className="p-4 pb-2 text-left">
          <SheetTitle className="font-bold text-xl">
            {receipt.listName}
          </SheetTitle>
           <SheetDescription className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(receipt.archivedAt), 'd MMMM yyyy', { locale: it })}</span>
                </div>
                <span>{receipt.items.length} articoli</span>
           </SheetDescription>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground ml-auto">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto px-4">
            <div className="py-4 space-y-6">

                <div className="text-center bg-primary/10 py-3 rounded-lg">
                    <p className="text-sm text-primary font-bold">TOTALE SPESO</p>
                    <p className="text-4xl font-bold text-primary">
                    €{receipt.totalCost.toFixed(2)}
                    </p>
                </div>

                {paymentGroups.length > 0 && (
                     <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">PAGAMENTI</h3>
                        <div className="space-y-3">
                        {paymentGroups.map(group => (
                            <div key={group.name} className="p-4 bg-white rounded-xl shadow-sm space-y-2">
                                <div className="flex items-center gap-2">
                                   <Store className="h-5 w-5 text-gray-500" />
                                    <h4 className="font-bold">{group.name}</h4>
                                </div>
                                {group.payments.map((payment, index) => {
                                    const Icon = paymentIcons[payment.method];
                                    return (
                                        <div key={index} className="flex items-center justify-between pl-1">
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5 text-gray-600" />
                                                <span className="font-semibold">{payment.method}</span>
                                            </div>
                                            <span className="font-bold text-gray-800">€{payment.amount.toFixed(2)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                
                <div>
                     <h3 className="text-sm font-semibold text-muted-foreground mb-2">ARTICOLI ACQUISTATI</h3>
                     <div className="space-y-4">
                        {supermarketGroups.map(group => (
                            <div key={group.name}>
                                <div className="flex items-center gap-2 mb-2">
                                   <Store className="h-5 w-5 text-gray-500" />
                                    <h4 className="font-bold text-lg">{group.name}</h4>
                                    <Badge className="ml-auto bg-gray-200 text-gray-700 font-bold hover:bg-gray-200">€{group.subtotal.toFixed(2)}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {group.items.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4 p-3 rounded-2xl bg-white shadow-sm">
                                            <div className="flex-1">
                                                <p className="font-bold">{item.productName}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} x €{item.price.toFixed(2)}</p>
                                            </div>
                                            <p className="font-bold text-lg text-primary">€{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

            </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}
