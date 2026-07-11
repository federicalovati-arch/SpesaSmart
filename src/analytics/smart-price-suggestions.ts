import { ProductHistoryItem } from "./product-history";

export type SmartSuggestion = {
  productId: string;

  shouldSuggest: boolean;

  suggestedPrice: number;

  reason: string;
};

export function analyzePriceTrend(
  productId: string,
  history: ProductHistoryItem[]
): SmartSuggestion {

  if (history.length < 3) {

  return {
    productId,
    shouldSuggest: false,
    suggestedPrice: 0,
    reason: "Not enough history",
  };

}

const latestThree = history.slice(0, 3);
const threshold = 0.05;

const allHigherThanBase = latestThree.every(item =>

  item.basePrice !== null &&

  item.price >= item.basePrice * (1 + threshold)

);

const allLowerThanBase = latestThree.every(item =>

  item.basePrice !== null &&

  item.price <= item.basePrice * (1 - threshold)

);

const averagePrice =
  latestThree.reduce(
    (sum, item) => sum + item.price,
    0
  ) / latestThree.length;
if (allHigherThanBase || allLowerThanBase) {

  return {

    productId,

    shouldSuggest: true,

    suggestedPrice: averagePrice,

    reason: allHigherThanBase
      ? "Price has increased consistently"
      : "Price has decreased consistently",

  };

}

return {

  productId,

  shouldSuggest: false,

  suggestedPrice: 0,

  reason: "No stable trend",

};
}