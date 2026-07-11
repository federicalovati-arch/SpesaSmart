'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { ProductVariation } from '@/analytics/types';
import { useState } from 'react';
import VariationDetailsSheet from './VariationDetailsSheet';

type VariationItem = {
  productName: string;
  supermarket: string;

  oldPrice: number;
  newPrice: number;

  variationEuro: number;
};

type VariationProductListProps = {
  title: string;
  type: 'increase' | 'decrease';

  products: ProductVariation[];
};

export default function VariationProductList({
  title,
  type,
  products,
}: VariationProductListProps) {

const [open, setOpen] = useState(false);

  return (
<>

    <Card className="rounded-2xl shadow-sm">

    <CardHeader className="pb-2">

      <CardTitle
        className={`text-base font-semibold flex items-center gap-2 ${
          type === 'increase'
            ? 'text-destructive'
            : 'text-primary'
        }`}
      >

        {type === 'increase' ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}

        {title} ({products.length})

      </CardTitle>

    </CardHeader>

    <CardContent className="space-y-4">

  {products.length === 0 ? (

    <p className="text-sm text-muted-foreground">
      {type === 'increase'
        ? 'Nessun prodotto ha registrato aumenti nel periodo selezionato.'
        : 'Nessun prodotto ha registrato ribassi nel periodo selezionato.'}
    </p>

  ) : (

    <>
      {products.slice(0, 3).map((product) => (

        <div
          key={product.productName}
          className="border-b last:border-0 pb-3 last:pb-0"
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

              <span className="text-foreground">
                €{product.newPrice.toFixed(2)}
              </span>

            </div>

            <span
              className={`font-semibold ${
                type === 'increase'
                  ? 'text-destructive'
                  : 'text-primary'
              }`}
            >
              {type === 'increase' ? '+' : '-'}
              €{Math.abs(product.variationEuro).toFixed(2)}
            </span>

          </div>

        </div>

      ))}

      {products.length > 3 && (

        <Button
  variant="ghost"
  className="w-full"
  onClick={() => setOpen(true)}
>
  Vedi tutti
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>

      )}

    </>

  )}

</CardContent>

  </Card>

<VariationDetailsSheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      products={products}
    />

  </>

);
}