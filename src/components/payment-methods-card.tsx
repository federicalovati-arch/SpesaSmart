"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { WalletCards, ChevronDown, ChevronUp } from "lucide-react";

import { getPaymentMethodStatistics } from "@/analytics/payment-analysis";
import { useData } from "@/context/data-context";


type PaymentMethodsCardProps = {
  selectedYear: number;
};

export function PaymentMethodsCard({
  selectedYear,
}: PaymentMethodsCardProps) {
  const { receipts } = useData();

  const statistics = getPaymentMethodStatistics(
    receipts,
    selectedYear
  );

  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  return (
    <Card className="shadow-lg rounded-3xl border-none">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <WalletCards className="h-5 w-5 text-primary" />
      Come paghi la tua spesa
    </CardTitle>
  </CardHeader>

 <CardContent className="space-y-4">
  {statistics.methods.length === 0 ? (
    <p className="text-muted-foreground">
      Nessun pagamento disponibile.
    </p>
  ) : (
    statistics.methods.map((method, index) => {
      const isExpanded = expandedMethod === method.method;
      const isExpandable = method.supermarkets.length > 1;

      return (
        <div
          key={method.method}
          onClick={() => {
            if (!isExpandable) return;

            setExpandedMethod(
              isExpanded ? null : method.method
            );
          }}
          className={`border-b pb-3 ${
            isExpandable ? "cursor-pointer" : ""
          }`}
        >
          {/* Riga principale */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{method.method}</p>

                {index === 0 && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
                    Più usato
                  </Badge>
                )}

                {isExpandable && (
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {method.uses} utilizzi • {method.supermarkets.length}{" "}
{method.supermarkets.length === 1
  ? "supermercato"
  : "supermercati"}
              </p>
            </div>

            <p className="font-semibold">
              {method.total.toLocaleString("it-IT", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>

          {/* Dettaglio supermercati */}
          {isExpanded && (
            <div className="mt-4 rounded-lg bg-muted/40 p-3 space-y-2">
              {method.supermarkets.map((supermarket) => (
                <div
                  key={supermarket.supermarketName}
                  className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {supermarket.supermarketName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {supermarket.uses} utilizzi
                    </p>
                  </div>

                  <p className="font-medium">
                    {supermarket.total.toLocaleString("it-IT", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })
  )}
</CardContent>
    </Card>
  );
}