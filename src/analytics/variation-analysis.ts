import { ProductVariation, VariationReport } from "./types";

export function analyzeMonthVariations(
  receipts: Receipt[],
  products: Product[],
  month: number,
  year: number
): VariationReport {

  const increasedProducts: ProductVariation[] = [];
  const decreasedProducts: ProductVariation[] = [];

  let totalIncrease = 0;
  let totalSavings = 0;

  const monthlyReceipts = receipts.filter((receipt) => {

    const date = new Date(receipt.archivedAt);

    return (
      date.getMonth() === month &&
      date.getFullYear() === year
    );

  });

  for (const receipt of monthlyReceipts) {

    // Analizziamo ogni prodotto dello scontrino
    for (const item of receipt.items) {

      if (item.basePrice == null) {
        continue;
      }

      const variationEuro = item.price - item.basePrice;

      const variationPercent =
        item.basePrice > 0
          ? (variationEuro / item.basePrice) * 100
          : 0;

      const variation: ProductVariation = {
        productId: item.productId,
        productName: item.productName,

        supermarket: item.supermarketName ?? "",

        oldPrice: item.basePrice,
        newPrice: item.price,

        variationEuro,
        variationPercent,

        date: receipt.archivedAt,
      };

      if (variationEuro > 0) {

        increasedProducts.push(variation);

        totalIncrease += variationEuro;

      } else if (variationEuro < 0) {

        decreasedProducts.push(variation);

        totalSavings += Math.abs(variationEuro);

      }

    }

  }

  increasedProducts.sort(
    (a, b) => b.variationEuro - a.variationEuro
  );

  decreasedProducts.sort(
    (a, b) => a.variationEuro - b.variationEuro
  );

  return {
    increasedProducts,
    decreasedProducts,
    increasedCount: increasedProducts.length,
    decreasedCount: decreasedProducts.length,
    totalIncrease,
    totalSavings,
  };

}