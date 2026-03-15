'use client';

import type { Receipt } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Calendar, Hash, Tag, Undo } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type ReceiptCardProps = {
  receipt: Receipt;
  onRestore: () => void;
};

export function ReceiptCard({ receipt, onRestore }: ReceiptCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{receipt.listName}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(receipt.archivedAt), 'd MMMM yyyy', { locale: it })}</span>
                </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-primary">€{receipt.totalCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Costo Totale</p>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
            <AccordionItem value="details">
                <AccordionTrigger>Vedi Dettagli</AccordionTrigger>
                <AccordionContent>
                    <ul className="space-y-2 text-sm">
                        {receipt.items.map(item => (
                            <li key={item.productId} className="flex justify-between items-center">
                                <span>
                                    {item.productName} <span className="text-muted-foreground">x{item.quantity}</span>
                                </span>
                                <div className="text-right">
                                    <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                                    {item.supermarketName && <p className="text-xs text-muted-foreground">{item.supermarketName}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost" onClick={onRestore}>
          <Undo className="mr-2 h-4 w-4" />
          Ripristina Lista
        </Button>
      </CardFooter>
    </Card>
  );
}
