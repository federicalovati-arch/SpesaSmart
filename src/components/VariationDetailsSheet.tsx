'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { ProductVariation } from '@/analytics/types';
import { useState } from "react";

type VariationDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;

  products: ProductVariation[];
};

export default function VariationDetailsSheet({
  open,
  onOpenChange,
  title,
  products,
}: VariationDetailsSheetProps) {

    const [selectedProductId, setSelectedProductId] =
  useState<string | null>(null);

  return (

    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >

      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8">

        <SheetHeader>

          <SheetTitle>

            {title}

          </SheetTitle>

        </SheetHeader>
<div className="mt-6 space-y-4">

  {products.map((product) => (

    <button
  key={product.productId }
  onClick={() =>
  setSelectedProductId(
    selectedProductId === product.productId
      ? null
      : product.productId
  )
}
  className="w-full border-b last:border-0 pb-3 last:pb-0 text-left transition-colors hover:bg-muted/40 rounded-lg px-2 py-2"
>

      <p className="font-medium">
        {product.productName}
      </p>

      <div className="flex items-center justify-between mt-1">

  <div className="text-sm text-muted-foreground">

    {product.supermarket} •{" "}

    <span className="text-gray-400">
      €{product.oldPrice.toFixed(2)}
    </span>

    <span className="mx-2">→</span>

    <span>
      €{product.newPrice.toFixed(2)}
    </span>

  </div>

  <span
    className={`font-semibold ${
      product.variationEuro >= 0
        ? 'text-destructive'
        : 'text-primary'
    }`}
  >
    {product.variationEuro >= 0 ? '+' : '-'}
    €{Math.abs(product.variationEuro).toFixed(2)}
  </span>

</div>

{selectedProductId === product.productId && (

  <div className="mt-4 rounded-xl bg-muted/30 p-4">

    <p className="text-sm font-semibold">
      Storico prezzi
    </p>

    <p className="mt-2 text-sm text-muted-foreground">
      (qui mostreremo gli acquisti precedenti)
    </p>

  </div>

)}

</button>

  ))}

</div>
      </SheetContent>

    </Sheet>

  );

}