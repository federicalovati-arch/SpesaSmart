import { ProductVariation, VariationReport } from "./types";

export function analyzeMonthVariations(
  receipts: any[],
  products: any[],
  month: number,
  year: number
): VariationReport {

  const increasedProducts: ProductVariation[] = [];
  const decreasedProducts: ProductVariation[] = [];

  let totalIncrease = 0;
  let totalSavings = 0;

  // Qui inseriremo l'algoritmo nella prossima fase

  return {
    increasedProducts,
    decreasedProducts,
    increasedCount: increasedProducts.length,
    decreasedCount: decreasedProducts.length,
    totalIncrease,
    totalSavings,
  };
}
const monthlyReceipts = receipts.filter((receipt) => {

  const date = new Date(receipt.archivedAt);

  return (
    date.getMonth() === month &&
    date.getFullYear() === year
  );

});
for (const receipt of monthlyReceipts) {

  // analizzeremo ogni prodotto acquistato

}