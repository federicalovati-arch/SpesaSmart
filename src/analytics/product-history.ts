import { Receipt } from '@/types';

export type ProductHistoryItem = {
 productId: string;

  date: string;

  supermarket: string;

  price: number;

  basePrice: number | null;

  quantity: number;
};

export function getProductHistory(
  receipts: Receipt[],
  productId: string
): ProductHistoryItem[] {

  const history: ProductHistoryItem[] = [];

for (const receipt of receipts) {

  for (const item of receipt.items) {

    if (item.productId !== productId) {
      continue;
    }

    history.push({

  productId: item.productId,

  date: receipt.archivedAt,

  supermarket: item.supermarketName ?? "",

  price: item.price,

  basePrice: item.basePrice ?? null,

  quantity: item.quantity,

});

  }

}

history.sort(
  (a, b) =>
    new Date(b.date).getTime() -
    new Date(a.date).getTime()
);

return history;

}