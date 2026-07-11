'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useData } from '@/context/data-context';
import { getProductHistory } from '@/analytics/product-history';
import { analyzePriceTrend } from '@/analytics/smart-price-suggestions';


type ProductHistorySheetProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  productId: string | null;
};

export default function ProductHistorySheet({
  open,
  onOpenChange,
  productId,
}: ProductHistorySheetProps) {

  const { receipts } = useData();

  const history = productId
  ? getProductHistory(receipts, productId)
  : [];
  const suggestion = productId
  ? analyzePriceTrend(productId, history)
  : null;

  return (

    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >

      <SheetContent
  side="bottom"
  className="rounded-t-3xl"
>

  <SheetHeader>

    <SheetTitle>
      Storico prodotto
    </SheetTitle>
<p className="text-sm text-muted-foreground mt-4">
  Acquisti trovati: {history.length}
</p>
  </SheetHeader>

  <div className="mt-6 space-y-3">

    {history.map((item) => (

      <div
        key={item.date}
        className="rounded-xl border p-3"
      >

        <div className="flex justify-between items-center">

          <div>

            <p className="font-medium">
              {item.supermarket}
            </p>

            <p className="text-sm text-muted-foreground">
              {new Date(item.date).toLocaleDateString('it-IT')}
            </p>

          </div>

          <div className="text-right">

            <p className="font-bold">
              €{item.price.toFixed(2)}
            </p>

            {item.basePrice !== null && (

              <p className="text-xs text-muted-foreground">
                Base €{item.basePrice.toFixed(2)}
              </p>

            )}

          </div>

        </div>

      </div>

    ))}

  </div>

  {suggestion?.shouldSuggest && (

    <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">

      <p className="font-semibold text-amber-900">
        💡 Prezzzo stabile rilevato
      </p>

      <p className="mt-2 text-sm text-amber-800">
        Il prezzo di questo prodotto è rimasto stabilmente
        {suggestion.reason.includes('increased')
          ? ' più alto '
          : ' più basso '}
        del prezzo base negli ultimi acquisti.
      </p>

      <div className="mt-4 rounded-xl bg-white p-3">

        <p className="text-xs text-muted-foreground">
          Prezzo consigliato
        </p>

        <p className="text-2xl font-bold">
          €{suggestion.suggestedPrice.toFixed(2)}
        </p>

      </div>

    </div>

  )}

</SheetContent>
    </Sheet>

  );

}