export type Supermarket = {
  id: string;
  name: string;
  location?: string;
};

// New type for product images
export type ProductImage = {
  id: string;
  url: string;
  supermarketId?: string; // Optional link to a supermarket
};

export type ProductPrice = {
  supermarketId: string;
  price: number;
  brand?: string; // Store-specific brand
  imageId?: string; // Link to a specific image in the product's image gallery
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
};

export type ShoppingList = {
  id: string;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
};
