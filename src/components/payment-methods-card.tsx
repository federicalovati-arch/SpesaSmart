"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { WalletCards, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, } from "lucide-react";

import { getPaymentMethodStatistics } from "@/analytics/payment-analysis";
import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";


type PaymentMethodsCardProps = {
  selectedYear: number;
  onPreviousYear: () => void;
  onNextYear: () => void;
};

export function PaymentMethodsCard(props: PaymentMethodsCardProps) {
  console.log("PROPS:", props);

  const {
    selectedYear,
    onPreviousYear,
    onNextYear,
  } = props;
  const { receipts } = useData();

  const statistics = getPaymentMethodStatistics(
    receipts,
    selectedYear
  );

  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  console.log({
  selectedYear,
  onPreviousYear,
  onNextYear,
});

  return (
    <Card className="shadow-lg rounded-3xl border-none">
  <CardHeader className="pb-3">
  <CardTitle className="flex items-center gap-2">
    <WalletCards className="h-5 w-5 text-primary" />
    Come paghi la tua spesa
  </CardTitle>

  <div className="flex items-center justify-center gap-4 mt-2">
    <Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 rounded-full"
  onClick={() => {
    onPreviousYear();
  }}
>
  <ChevronLeft className="h-4 w-4" />
</Button>

    <span className="text-medium font-semibold text-primary">
      {selectedYear}
    </span>

    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={onNextYear}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</CardHeader>

 <CardContent className="space-y-4">
  {statistics.methods.length === 0 ? (
    <p className="text-muted-foreground">
      Nessun pagamento disponibile.
    </p>
  ) : (
    statistics.methods.map((method, index) => {
      const isExpanded = expandedMethod === method.method;
      const isExpandable =
  method.supermarkets.length > 1 ||
  (
    method.method !== "Conad Card" &&
    method.supermarkets.length === 1
  );

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