import type { Receipt } from "@/lib/types";

export type ProductStatistics = {
  purchasesThisYear: number;

  averagePrice: number;
  minimumPrice: number;
  maximumPrice: number;

  firstPurchase: Date | null;
  lastPurchase: Date | null;

  supermarkets: {
  supermarketId: string;
  supermarketName: string;

  history: {
  date: Date;
  price: number;
  quantity: number;
}[];
}[];
};

export function getProductStatistics(
  receipts: Receipt[],
  productId: string,
  year: number
): ProductStatistics {

  let purchasesThisYear = 0;
  const prices: number[] = [];
  let firstPurchase: Date | null = null;
let lastPurchase: Date | null = null;
const supermarketMap = new Map<
  string,
  {
    supermarketId: string;
    supermarketName: string;

history: {
  date: Date;
  price: number;
  quantity: number;
}[];
  }
>();

  for (const receipt of receipts) {

  const receiptYear = new Date(receipt.archivedAt).getFullYear();

  if (receiptYear !== year) continue;

  for (const item of receipt.items) {

    if (item.productId === productId) {

      purchasesThisYear++;

      if (item.price > 0) {
        prices.push(item.price);
      }

      const supermarketId = item.supermarketId ?? "unknown";
      const supermarketName = item.supermarketName ?? "Sconosciuto";

      const existing = supermarketMap.get(supermarketId);

      const purchase = {
  date: new Date(receipt.archivedAt),
  price: Number(item.price),
  quantity: item.quantity,
};

const purchaseDate = purchase.date;

if (!firstPurchase || purchaseDate < firstPurchase) {
  firstPurchase = purchaseDate;
}

if (!lastPurchase || purchaseDate > lastPurchase) {
  lastPurchase = purchaseDate;
}

      if (existing) {
        existing.history.push(purchase);
      } else {
        supermarketMap.set(supermarketId, {
          supermarketId,
          supermarketName,
          history: [purchase],
        });
      }

    }

  }   // ← CHIUDE for(item)

}   // ← CHIUDE for(receipt)


  const averagePrice =
    prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;

const minimumPrice =
    prices.length > 0
        ? Math.min(...prices)
        : 0;

const maximumPrice =
    prices.length > 0
        ? Math.max(...prices)
        : 0;
const supermarkets = Array.from(supermarketMap.values())
  .map((market) => ({
    ...market,
    history: [...market.history].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    ),
  }))
  .sort((a, b) => b.history.length - a.history.length);

  return {
  purchasesThisYear,

  averagePrice,
  minimumPrice,
  maximumPrice,

  firstPurchase,
  lastPurchase,

  supermarkets,
};
}