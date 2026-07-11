'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

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

  products: VariationItem[];
};

export default function VariationProductList({
  title,
  type,
  products,
}: VariationProductListProps) {

  return (

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

        {title}

      </CardTitle>

    </CardHeader>

    <CardContent className="space-y-4">

  <div>

    <p className="font-medium">
      Carta Igienica
    </p>

    <div className="flex items-center justify-between mt-1">

      <div className="text-sm text-muted-foreground">

        Conad •
        <span className="ml-1 text-gray-400">
          €1,80
        </span>

        <span className="mx-2">
          →
        </span>

        <span className="text-foreground">
          €1,90
        </span>

      </div>

      <span className="font-semibold text-destructive">
        +€0,10
      </span>

    </div>

  </div>

  <Button
    variant="ghost"
    className="w-full"
  >
    Vedi tutti
  </Button>

</CardContent>

  </Card>

);
}