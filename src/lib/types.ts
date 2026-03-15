export type Supermarket = {
  id: string;
  name: string;
  location?: string;
};

export type ProductPrice = {
  supermarketId: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  prices: ProductPrice[];
};

export type ShoppingListItem = {
  productId: string;
  quantity: number;
  purchased: boolean;
};

export type ShoppingList = {
  id: string;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
};
