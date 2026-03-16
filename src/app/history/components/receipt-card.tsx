'use client';

import type { Receipt } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

type ReceiptCardProps = {
  receipt: Receipt;
  onRestore: () => void;
};

export function ReceiptCard({ receipt, onRestore }: ReceiptCardProps) {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardContent className="p-4 grid grid-cols-3 items-center gap-4">
        <div className="col-span-2 space-y-2">
          <h3 className="font-bold text-lg truncate">{receipt.listName}</h3>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(receipt.archivedAt), 'dd/MM/yyyy', {
                  locale: it,
                })}
              </span>
            </div>
            <Badge
              variant="secondary"
              className="font-semibold bg-gray-200 text-gray-600 border-none"
            >
              {receipt.items.length} Articoli
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">TOTALE PAGATO</p>
            <p className="text-2xl font-bold text-primary">
              €{receipt.totalCost.toFixed(2)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRestore}
            className="h-10 w-10 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <RotateCcw className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Ripristina</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
