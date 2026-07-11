'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { ProductVariation } from '@/analytics/types';
import { useState } from "react";
import ProductHistorySheet from './ProductHistorySheet';

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
const [historyOpen, setHistoryOpen] = useState(false);

  return (

    <>
    
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >

      <SheetContent
  side="bottom"
  className="rounded-t-2xl px-6 pb-8 max-h-[80vh] overflow-y-auto"
>

        <SheetHeader className="pb-4">

          <SheetTitle>

            {title}

          </SheetTitle>

        </SheetHeader>
<div className="space-y-4">

  {products.map((product) => (

    <button
  key={`${product.productId}-${product.date}`}
  onClick={() => {

  setSelectedProductId(product.productId);

  setHistoryOpen(true);

}}
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

</button>

  ))}

</div>
      </SheetContent>

    </Sheet>

<ProductHistorySheet
  open={historyOpen}
  onOpenChange={setHistoryOpen}
  productId={selectedProductId}
/>

</>

  );

}