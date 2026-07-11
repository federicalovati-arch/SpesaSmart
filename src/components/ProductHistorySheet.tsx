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

  <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

    <p className="font-semibold text-amber-900">
      Suggerimento intelligente
    </p>

    <p className="mt-3 text-sm text-amber-900 leading-relaxed">

      Negli ultimi acquisti questo prodotto ha mantenuto
      un prezzo stabilmente{" "}

      <strong>
        {suggestion.reason.includes("increased")
          ? "più alto"
          : "più basso"}
      </strong>

      {" "}del prezzo di riferimento.

    </p>

    <p className="mt-3 text-sm text-amber-900">

      Vuoi aggiornare manualmente il prezzo base?

    </p>

  </div>

)}

</SheetContent>
    </Sheet>

  );

}