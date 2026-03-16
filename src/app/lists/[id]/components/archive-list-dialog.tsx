'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Archive,
  Wallet,
  Landmark,
  CreditCard,
  Ticket,
  Check,
  X,
} from 'lucide-react';
import type {
  ShoppingList,
  Receipt,
  ReceiptItem,
  Payment,
} from '@/lib/types';
import { cn } from '@/lib/utils';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const [paymentInputs, setPaymentInputs] = useState<
    Record<string, Partial<Record<Payment['method'], string>>>
  >({});

  const { toast } = useToast();

  const supermarketGroups = useMemo(() => {
    const groups: Record<
      string,
      { name: string; subtotal: number; items: EnrichedListItemForDialog[] }
    > = {};
    enrichedItems.forEach((item) => {
      const supermarketId = item.bestSupermarket?.id || 'unknown';
      const supermarketName = item.bestSupermarket?.name || 'Senza Negozio';
      if (!groups[supermarketId]) {
        groups[supermarketId] = {
          name: supermarketName,
          subtotal: 0,
          items: [],
        };
      }
      groups[supermarketId].items.push(item);
      groups[supermarketId].subtotal += (item.bestPrice || 0) * item.quantity;
    });
    return groups;
  }, [enrichedItems]);

  const isFullyPaid = useMemo(() => {
    if (optimalTotal === 0) return true;
    return Object.entries(supermarketGroups).every(([id, group]) => {
      if (group.subtotal <= 0) return true;
      const groupPayments = paymentInputs[id] || {};
      const paid = Object.values(groupPayments).reduce((acc, amountStr) => {
        const amount = parseFloat(amountStr || '0');
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);
      return Math.abs(group.subtotal - paid) < 0.01;
    });
  }, [supermarketGroups, paymentInputs, optimalTotal]);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date());
      setPaymentInputs({});
    }
  }, [isOpen]);

  const handlePaymentInputChange = (
    supermarketId: string,
    method: Payment['method'],
    value: string
  ) => {
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setPaymentInputs((prev) => {
      const newInputs = { ...prev };
      if (!newInputs[supermarketId]) {
        newInputs[supermarketId] = {};
      }

      const currentInputs = { ...newInputs[supermarketId] };

      if (value === '' || parseFloat(value) === 0) {
        delete currentInputs[method];
      } else {
        currentInputs[method] = value;
      }

      newInputs[supermarketId] = currentInputs;
      return newInputs;
    });
  };

  const handleArchiveConfirm = () => {
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'Data mancante',
        description: `Seleziona la data della spesa.`,
      });
      return;
    }

    let allPaid = true;
    for (const [id, group] of Object.entries(supermarketGroups)) {
      if (group.subtotal > 0) {
        const groupPayments = paymentInputs[id] || {};
        const paid = Object.values(groupPayments).reduce(
          (acc, amountStr) => acc + (parseFloat(amountStr || '0') || 0),
          0
        );
        const remaining = group.subtotal - paid;
        if (Math.abs(remaining) >= 0.01) {
          toast({
            variant: 'destructive',
            title: 'Pagamento incompleto o errato',
            description: `Controlla i totali per ${
              group.name
            }. Rimanenza: €${remaining.toFixed(2)}`,
          });
          allPaid = false;
          break;
        }
      }
    }

    if (!allPaid) {
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

    const allPayments: Payment[] = [];
    Object.values(paymentInputs).forEach((groupPayments) => {
      Object.entries(groupPayments).forEach(([method, amountStr]) => {
        const amount = parseFloat(amountStr || '0');
        if (amount > 0) {
          allPayments.push({
            method: method as Payment['method'],
            amount,
          });
        }
      });
    });

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] flex flex-col p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b text-center">
          <SheetTitle>Archivia Spesa</SheetTitle>
          <SheetDescription>
            Conferma i dettagli della spesa per archiviarla.
          </SheetDescription>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="text-center bg-primary/10 py-3 rounded-lg">
              <p className="text-sm text-primary font-bold">TOTALE SPESA</p>
              <p className="text-4xl font-bold text-primary">
                €{optimalTotal.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="shopping-date" className="text-sm font-medium">
                Data della Spesa
              </label>
              <Input
                id="shopping-date"
                type="date"
                className="h-12 text-base"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    // Use parse from date-fns to avoid timezone issues
                    const parsedDate = parse(
                      e.target.value,
                      'yyyy-MM-dd',
                      new Date()
                    );
                    setDate(parsedDate);
                  } else {
                    setDate(undefined);
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">
                Dettaglio Pagamenti
              </label>
              {Object.entries(supermarketGroups)
                .filter(([, group]) => group.subtotal > 0)
                .map(([id, group]) => {
                  const groupPayments = paymentInputs[id] || {};
                  const paidForGroup = Object.values(groupPayments).reduce(
                    (acc, amountStr) =>
                      acc + (parseFloat(amountStr || '0') || 0),
                    0
                  );
                  const remainingForGroup = group.subtotal - paidForGroup;
                  const isGroupPaid = Math.abs(remainingForGroup) < 0.01;

                  return (
                    <div
                      key={id}
                      className="p-4 border rounded-xl space-y-3 bg-gray-50/50"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold">{group.name}</h4>
                        <span className="font-bold text-lg text-primary">
                          €{group.subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.value}
                            className="flex items-center gap-2"
                          >
                            <method.icon className="h-5 w-5 text-gray-600 w-5" />
                            <label
                              htmlFor={`${id}-${method.value}`}
                              className="flex-1 font-semibold"
                            >
                              {method.label}
                            </label>
                            <Input
                              id={`${id}-${method.value}`}
                              type="text"
                              inputMode="decimal"
                              step="0.01"
                              placeholder="€ 0.00"
                              value={paymentInputs[id]?.[method.value] || ''}
                              onChange={(e) =>
                                handlePaymentInputChange(
                                  id,
                                  method.value,
                                  e.target.value
                                )
                              }
                              className="w-28 text-right"
                            />
                          </div>
                        ))}
                      </div>

                      {isGroupPaid ? (
                        <div className="text-center p-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />
                          <p className="font-semibold">Pagato!</p>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'text-right text-sm font-semibold',
                            remainingForGroup < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        >
                          Rimanenti: €{remainingForGroup.toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 pt-4 border-t bg-background">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
