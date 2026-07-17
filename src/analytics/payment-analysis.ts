import type { Receipt } from "@/lib/types";
import { useState } from "react";

export type PaymentMethodStatistics = {
  totalSpent: number;

  methods: {
    method: string;
    total: number;
    uses: number;

    supermarkets: {
      supermarketName: string;
      total: number;
      uses: number;
    }[];
  }[];
};

export function getPaymentMethodStatistics(
  receipts: Receipt[],
  year: number
): PaymentMethodStatistics {

  const paymentMap = new Map<
  string,
  {
    method: string;
    total: number;
    uses: number;

    supermarkets: Map<
      string,
      {
        supermarketName: string;
        total: number;
        uses: number;
      }
    >;
  }
>();

  let totalSpent = 0;

  for (const receipt of receipts) {

    const receiptYear = new Date(receipt.archivedAt).getFullYear();

    if (receiptYear !== year) continue;

    if (!receipt.payments) continue;

    for (const payment of receipt.payments) {

const supermarketName =
  payment.supermarketName?.trim() &&
  payment.supermarketName !== "undefined"
    ? payment.supermarketName.trim()
    : "Supermercato sconosciuto";

      totalSpent += payment.amount;

      const existing = paymentMap.get(payment.method);

      if (existing) {

  existing.total += payment.amount;
  existing.uses++;

  const supermarket = existing.supermarkets.get(supermarketName);

  if (supermarket) {

    supermarket.total += payment.amount;
    supermarket.uses++;

  } else {

    existing.supermarkets.set(supermarketName, {
      supermarketName: supermarketName,
      total: payment.amount,
      uses: 1,
    });

  }

} else {

        paymentMap.set(payment.method, {
  method: payment.method,
  total: payment.amount,
  uses: 1,
  supermarkets: new Map([
    [
      supermarketName,
      {
        supermarketName: supermarketName,
        total: payment.amount,
        uses: 1,
      },
    ],
  ]),
});

      }

    }

  }

  const methods = Array.from(paymentMap.values())
  .map((method) => {
    let supermarkets = Array.from(method.supermarkets.values());

    // Cerca eventuali supermercati "mancanti"
    const unknown = supermarkets.find(
      (s) =>
        !s.supermarketName ||
        s.supermarketName === "undefined" ||
        s.supermarketName === "Supermercato sconosciuto"
    );

    // Se c'è un solo supermercato valido, unisci i dati
    const validSupermarkets = supermarkets.filter(
      (s) =>
        s.supermarketName &&
        s.supermarketName !== "undefined" &&
        s.supermarketName !== "Supermercato sconosciuto"
    );

    if (unknown && validSupermarkets.length === 1) {
      validSupermarkets[0].total += unknown.total;
      validSupermarkets[0].uses += unknown.uses;

      supermarkets = validSupermarkets;
    } else {
      supermarkets = supermarkets.sort((a, b) => b.total - a.total);
    }

    return {
      method: method.method,
      total: method.total,
      uses: method.uses,
      supermarkets,
    };
  })
  .sort((a, b) => b.total - a.total);
console.log(
  methods.find((m) => m.method === "Bancomat")
);
  return {
    totalSpent,
    methods,
  };

}