export type Supermarket = {
  id: string;
  name: string;
  location?: string;
  order: number;
  icon: string;
};

// New type for product images
export type ProductImage = {
  id:string;
  url: string;
  supermarketId?: string; // Optional link to a supermarket
};

export type ProductPrice = {
  supermarketId: string;
  price: number;
  brand?: string; // Store-specific brand
};

export type Product = {
  id: string;
  name: string;
  brand?: string; // Main brand
  category: string;
  prices: ProductPrice[];
  images: ProductImage[]; // Image gallery
};

export type ShoppingListItem = {
  productId: string;
  quantity: number;
  purchased: boolean;
  assignedSupermarketId?: string | null; // null or 'automatic' for auto-selection
  overridePrice?: number | null;

  // For quick-add items
  isQuickAdd?: boolean;
  quickAddName?: string;
};

export type ShoppingList = {
  id: string;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
  order: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  order: number;
};

export type Payment = {
  method: 'Contanti' | 'Bancomat' | 'Conad Card' | 'Buoni' | 'Sconto';
  amount: number;
  supermarketId: string;
  supermarketName: string;
};

export type ReceiptItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  basePrice?: number | null; // The original catalog price, if available
  supermarketId?: string;
  supermarketName?: string;
};

export type Receipt = {
  id: string;
  listName: string;
  archivedAt: string;
  totalCost: number;
  items: ReceiptItem[];
  originalListId: string;
  payments?: Payment[];
};
