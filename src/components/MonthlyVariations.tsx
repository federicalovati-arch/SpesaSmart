'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import VariationProductList from './VariationProductList';
import { VariationReport } from '@/analytics/types';

type MonthlyVariationsProps = {
  variationReport: VariationReport;
};

export default function MonthlyVariations({
  variationReport,
}: MonthlyVariationsProps) {

  return (

    <>


  <div className="space-y-3">



    <VariationProductList

      title="PRODOTTI AUMENTATI"

      type="increase"

      products={variationReport.increasedProducts}

    />



    <VariationProductList

      title="PRODOTTI DIMINUITI"

      type="decrease"

      products={variationReport.decreasedProducts}

    />



  </div>

</>

  );

}
