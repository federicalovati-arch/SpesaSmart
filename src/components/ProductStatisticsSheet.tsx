import { useData } from "@/context/data-context";
import { useState, useEffect, useMemo } from "react";
import { getProductStatistics } from "@/analytics/product-statistics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { Product } from "@/lib/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export default function ProductStatisticsSheet({
  open,
  onOpenChange,
  product,
}: Props) {
  const { receipts, supermarkets } = useData();
  const availableYears = useMemo(() => {
  if (!product) return [];

  const years = new Set<number>();

  receipts.forEach(receipt => {
    receipt.items.forEach(item => {
      if (item.productId === product.id) {
        years.add(new Date(receipt.archivedAt).getFullYear());
      }
    });
  });

  return Array.from(years).sort((a, b) => b - a);
}, [receipts, product]);

const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
useEffect(() => {
  if (availableYears.length > 0) {
    setSelectedYear(availableYears[0]);
  }
}, [availableYears]);

const statistics =
  product
    ? getProductStatistics(
        receipts,
        product.id,
        selectedYear
      )
    : null;
    const supermarketsToShow = (product?.prices ?? []).map((productPrice) => {

  const market = supermarkets.find(
    (s) => s.id === productPrice.supermarketId
  );

  const existing = statistics.supermarkets.find(
    (s) => s.supermarketId === productPrice.supermarketId
  );

 return {
  supermarketId: productPrice.supermarketId,
  supermarketName: market?.name ?? "Supermercato",

  history: existing?.history ?? [],

  catalogPrice: productPrice.price,
};

});
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
       <SheetHeader className="pb-2">

  <div className="flex items-start justify-between gap-4">

    <div className="text-left">

      <SheetTitle className="text-2xl">
        {product?.name ?? "Statistiche prodotto"}
      </SheetTitle>

      <p className="text-muted-foreground mt-1">
        {product?.category}
      </p>

    </div>

    <div className="w-28">

      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(Number(value))}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem
              key={year}
              value={year.toString()}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>

      </Select>

    </div>

  </div>

</SheetHeader>

        <div className="space-y-1 pt-1 pb-2 text-center">

  <p className="text-3xl font-bold text-primary">
  {statistics?.purchasesThisYear ?? 0}
</p>

<p className="text-muted-foreground">
  {statistics?.purchasesThisYear === 1 ? "acquisto" : "acquisti"} nel {new Date().getFullYear()}
</p>

</div>
<div className="mt-5">

  <div className="grid grid-cols-3 gap-3">

    <div className="rounded-2xl border p-4 text-center">

  <p className="text-1xl font-bold text-primary">
    €{statistics?.averagePrice.toFixed(2)}
  </p>

  <p className="text-xs text-muted-foreground mt-1">
    Prezzo medio
  </p>
</div>

    <div className="rounded-2xl border p-4 text-center">

  <p className="text-1xl font-bold text-green-600">
    €{statistics?.minimumPrice.toFixed(2)}
  </p>

  <p className="text-xs text-muted-foreground mt-1">
    Miglior prezzo
  </p>
</div>

    <div className="rounded-2xl border p-4 text-center">

  <p className="text-1xl font-bold text-red-500">
    €{statistics?.maximumPrice.toFixed(2)}
  </p>

  <p className="text-xs text-muted-foreground mt-1">
    Prezzo massimo
  </p>
</div>

  </div>
</div>
<div className="mt-8 border-t pt-6">

  <h3 className="text-lg font-semibold mb-4">
    Storico prezzi
  </h3>

  <Accordion type="single" collapsible className="space-y-3">
    {supermarketsToShow.map((market) => (
      <AccordionItem
        key={market.supermarketId}
        value={market.supermarketId}
        className="border rounded-xl px-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex w-full justify-between items-center pr-2">
            <div className="text-left">
              <p className="font-semibold">
                {market.supermarketName}
              </p>

              <p className="text-sm text-muted-foreground">
  {market.history.length === 0
    ? "Mai acquistato"
    : `${market.history.length} ${market.history.length === 1 ? "acquisto" : "acquisti"}`}
</p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
  <div className="space-y-2">

    <div className="rounded-lg border border-dashed p-3 bg-muted/30">

      <p className="text-xs text-muted-foreground">
        Prezzo di partenza
      </p>

      <p className="text-lg font-bold text-primary">
        €{market.catalogPrice.toFixed(2)}
      </p>

    </div>

    {market.history.map((purchase, index) => (

      <div
        key={index}
        className="flex justify-between items-center rounded-lg border p-3"
      >

        <div>
          <p className="font-medium">
            {purchase.date.toLocaleDateString("it-IT")}
          </p>

          <p className="text-sm text-muted-foreground">
            Quantità: {purchase.quantity}
          </p>
        </div>

        <div className="text-right font-bold text-primary">
          €{purchase.price.toFixed(2)}
        </div>

      </div>

    ))}

  </div>
</AccordionContent>

      </AccordionItem>
    ))}
  </Accordion>
</div>
      </SheetContent>
    </Sheet>
  );
}