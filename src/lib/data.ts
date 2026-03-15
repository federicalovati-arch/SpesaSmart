import type { Product, Supermarket, ShoppingList, Category, Receipt } from './types';

export const mockSupermarkets: Supermarket[] = [
  { id: 's1', name: 'Eurospin', location: 'Via Roma, 1' },
  { id: 's2', name: 'Conad', location: 'Corso Italia, 20' },
  { id: 's3', name: 'Coop', location: 'Piazza Garibaldi, 5' },
];

export const mockCategories: Category[] = [
  { id: 'cat1', name: 'Frutta e Verdura', icon: 'carrot', order: 1 },
  { id: 'cat2', name: 'Carne', icon: 'beef', order: 2 },
  { id: 'cat3', name: 'Affettati', icon: 'package', order: 3 },
  { id: 'cat4', name: 'Latticini e uova', icon: 'egg', order: 4 },
  { id: 'cat5', name: 'Forno', icon: 'cookie', order: 5 },
  { id: 'cat6', name: 'Alimentari', icon: 'archive', order: 6 },
  { id: 'cat7', name: 'Barattoli', icon: 'archive', order: 7 },
  { id: 'cat8', name: 'Bevande', icon: 'glass-water', order: 8 },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Latte Intero',
    category: 'Latticini e uova',
    brand: 'Granarolo',
    images: [],
    prices: [
      { supermarketId: 's1', price: 1.2 },
      { supermarketId: 's2', price: 1.15 },
      { supermarketId: 's3', price: 1.25 },
    ],
  },
  {
    id: 'p2',
    name: 'Pane Casereccio',
    category: 'Forno',
    images: [],
    prices: [
      { supermarketId: 's1', price: 2.5 },
      { supermarketId: 's2', price: 2.6 },
      { supermarketId: 's3', price: 2.4 },
    ],
  },
  {
    id: 'p3',
    name: 'Mele Golden (1kg)',
    category: 'Frutta e Verdura',
    images: [],
    prices: [
      { supermarketId: 's1', price: 1.99 },
      { supermarketId: 's2', price: 2.1 },
      { supermarketId: 's3', price: 1.95 },
    ],
  },
  {
    id: 'p4',
    name: 'Pasta di Grano Duro (500g)',
    category: 'Alimentari',
    brand: 'Barilla',
    images: [],
    prices: [
      { supermarketId: 's1', price: 0.9 },
      { supermarketId: 's2', price: 0.85 },
      { supermarketId: 's3', price: 0.95 },
    ],
  },
  {
    id: 'p5',
    name: 'Petto di Pollo (500g)',
    category: 'Carne',
    images: [],
    prices: [
      { supermarketId: 's1', price: 5.5 },
      { supermarketId: 's2', price: 5.8 },
      { supermarketId: 's3', price: 5.4 },
    ],
  },
  {
    id: 'p6',
    name: 'Acqua Minerale Naturale (1.5L)',
    category: 'Bevande',
    images: [],
    prices: [
        { supermarketId: 's1', price: 0.25 },
        { supermarketId: 's2', price: 0.22 },
        { supermarketId: 's3', price: 0.30 },
    ]
  },
   {
    id: 'p7',
    name: 'Acciughe',
    category: 'Barattoli',
    brand: 'Marca Principale',
    images: [
        { id: 'img1', url: 'https://picsum.photos/seed/acciughe1/200/200' },
        { id: 'img2', url: 'https://picsum.photos/seed/acciughe2/200/200' },
        { id: 'img3', url: 'https://picsum.photos/seed/acciughe3/200/200' },
    ],
    prices: [
      { supermarketId: 's2', price: 2.41, brand: 'Conad', imageId: 'img1' },
      { supermarketId: 's3', price: 2.60, brand: 'Gli sp...', imageId: 'img2' },
      { supermarketId: 's1', price: 1.79, brand: 'Ondina', imageId: 'img3' },
    ]
  }
];

export const mockShoppingLists: ShoppingList[] = [
  {
    id: 'l1',
    name: 'Spesa Settimanale',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { productId: 'p1', quantity: 2, purchased: true },
      { productId: 'p2', quantity: 1, purchased: true },
      { productId: 'p3', quantity: 1, purchased: false },
      { productId: 'p4', quantity: 3, purchased: false },
    ],
  },
  {
    id: 'l2',
    name: 'Cena con Amici',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { productId: 'p5', quantity: 2, purchased: false },
      { productId: 'p6', quantity: 6, purchased: false },
    ],
  },
];


export const mockReceipts: Receipt[] = [];
