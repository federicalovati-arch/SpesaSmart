import type { Product, Supermarket, ShoppingList } from './types';

export const mockSupermarkets: Supermarket[] = [
  { id: 's1', name: 'Supermercato Prezzobasso', location: 'Via Roma, 1' },
  { id: 's2', name: 'Risparmio Market', location: 'Corso Italia, 20' },
  { id: 's3', name: 'Qualità Store', location: 'Piazza Garibaldi, 5' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Latte Intero',
    category: 'Latticini',
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
    prices: [
        { supermarketId: 's1', price: 0.25 },
        { supermarketId: 's2', price: 0.22 },
        { supermarketId: 's3', price: 0.30 },
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
