'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type {
  ShoppingList,
  Product,
  Supermarket,
  ShoppingListItem,
  Receipt,
  Category,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Copy,
  Plus,
  Sparkles,
  TrendingUp,
  Pencil,
  Trash2,
  Archive,
  Store,
  Clover,
  Zap,
  Carrot,
  LucideIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ArchiveListDialog } from './archive-list-dialog';
import { cn } from '@/lib/utils';


type ListDetailsProps = {
  list: ShoppingList;
  allProducts: Product[];
  allSupermarkets: Supermarket[];
  allCategories: Category[];
  onUpdateList: (list: ShoppingList) => void;
  onArchive: (receipt: Receipt) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
};

type EnrichedListItem = ShoppingListItem & {
  product: Product;
  price: number | null;
  supermarket: Supermarket | null;
  brand: string | null;
  imageUrl: string | null;
  priceStatus: 'offer' | 'increase' | 'normal';
};

const getSupermarketIcon = (supermarketName: string): LucideIcon => {
    const lowerCaseName = supermarketName.toLowerCase();
    if (lowerCaseName.includes('eurospin')) return Zap;
    if (lowerCaseName.includes('conad')) return Clover;
    if (lowerCaseName.includes('coop')) return Carrot;
    return Store;
}


export function ShoppingListDetails({
  list: initialList,
  allProducts,
  allSupermarkets,
  onUpdateList,
  onArchive,
}: ListDetailsProps) {
  const router = useRouter();
  const [list, setList] = useState(initialList);
  const [view, setView] = useState<'standard' | 'risparmio'>('risparmio');
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleItemChange = (productId: string, values: Partial<ShoppingListItem>) => {
    const updatedList = {
      ...list,
      items: list.items.map((item) =>
        item.productId === productId
          ? { ...item, ...values }
          : item
      ),
    };
    setList(updatedList);
    onUpdateList(updatedList);
  };
  
  const handleDeleteItem = (productId: string) => {
    const updatedList = {
        ...list,
        items: list.items.filter((item) => item.productId !== productId),
    };
    setList(updatedList);
    onUpdateList(updatedList);
  }

  const enrichedItems: EnrichedListItem[] = useMemo(() => {
    return list.items
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        if (!product) return null;

        let price: number | null = null;
        let supermarket: Supermarket | null = null;
        let brand: string | null = product.brand || null;
        let imageUrl: string | null = null;
        let priceStatus: 'offer' | 'increase' | 'normal' = 'normal';

        const supermarketIdToUse = item.assignedSupermarketId;
        
        let priceInfo;

        if (supermarketIdToUse) {
            priceInfo = product.prices.find(p => p.supermarketId === supermarketIdToUse);
        } else { // 'automatic'
            priceInfo = [...product.prices].sort((a, b) => a.price - b.price)[0];
        }

        if (priceInfo) {
            price = priceInfo.price;
            supermarket = allSupermarkets.find(s => s.id === priceInfo.supermarketId) || null;
            if(priceInfo.brand) brand = priceInfo.brand;

            const generalImage = product.images.find(img => !img.supermarketId);
            const supermarketImage = product.images.find(img => img.supermarketId === priceInfo.supermarketId);

            if (supermarketImage) {
                imageUrl = supermarketImage.url;
            } else if (generalImage) {
                imageUrl = generalImage.url;
            }
        }
        
        if (item.overridePrice !== null && item.overridePrice !== undefined && price !== null) {
            if (item.overridePrice < price) priceStatus = 'offer';
            else if (item.overridePrice > price) priceStatus = 'increase';
            price = item.overridePrice;
        }

        return { ...item, product, price, supermarket, brand, imageUrl, priceStatus };
      })
      .filter((item): item is EnrichedListItem => item !== null);
  }, [list.items, allProducts, allSupermarkets]);

  const groupedItems = useMemo(() => {
    if (view === 'standard') return null;

    return enrichedItems.reduce((acc, item) => {
        const key = item.supermarket?.id || 'unknown';
        if (!acc[key]) {
            acc[key] = {
                supermarket: item.supermarket,
                items: [],
                subtotal: 0,
            };
        }
        acc[key].items.push(item);
        if(item.price) {
            acc[key].subtotal += item.price * item.quantity;
        }
        return acc;
    }, {} as Record<string, {supermarket: Supermarket | null, items: EnrichedListItem[], subtotal: number}>);
  }, [enrichedItems, view]);


  const totalCost = useMemo(() => {
    return enrichedItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  }, [enrichedItems]);
  
  const purchasedCount = useMemo(() => list.items.filter(i => i.purchased).length, [list.items]);
  const progress = list.items.length > 0 ? (purchasedCount / list.items.length) * 100 : 0;
  
  const SupermarketIcon = ({name}: {name: string}) => {
      const Icon = getSupermarketIcon(name);
      return <Icon className="h-5 w-5 text-gray-500" />
  }
  
  const enrichedItemsForDialog = useMemo(() => {
    return enrichedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        product: { name: item.product.name },
        bestPrice: item.price,
        bestSupermarket: item.supermarket ? { id: item.supermarket.id, name: item.supermarket.name } : null
    }));
  }, [enrichedItems]);

  return (
    <>
      <div className="flex flex-col bg-gray-50 flex-1 min-h-screen">
        {/* Header */}
        <header className="p-4 bg-gray-50">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{list.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {list.items.length} ARTICOLI • {format(new Date(list.createdAt), 'dd/MM/yyyy', { locale: it })}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex items-center gap-2 my-4">
                <Button className="flex-1 h-11 rounded-lg bg-white text-primary shadow hover:bg-gray-100"><Plus className="mr-2"/> AGGIUNGI</Button>
                <Button className="flex-1 h-11 rounded-lg bg-white text-primary shadow hover:bg-gray-100" disabled><Sparkles className="mr-2"/> AI Advisor</Button>
            </div>
             <div className="flex items-center justify-center p-1 rounded-full bg-gray-200/60 w-full mb-2">
                <button
                    onClick={() => setView('standard')}
                    className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                    view === 'standard' ? 'bg-white shadow text-primary' : 'bg-transparent text-gray-500'
                    }`}
                    >
                    STANDARD
                </button>
                <button
                    onClick={() => setView('risparmio')}
                    className={`flex-1 text-center py-2 px-4 rounded-full text-sm font-semibold transition-all ${
                    view === 'risparmio' ? 'bg-white shadow text-primary' : 'bg-transparent text-gray-500'
                    }`}
                >
                    RISPARMIO
                </button>
            </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-4 pb-40">
             <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-500">PROGRESSIVO SPESA</p>
                <div className="flex items-center gap-3">
                    <Progress value={progress} className="h-2" />
                    <span className="text-sm font-bold w-12 text-right">{Math.round(progress)}%</span>
                </div>
            </div>
            
            {view === 'risparmio' && groupedItems && (
                <div className="space-y-4">
                    {Object.values(groupedItems).sort((a,b) => b.subtotal - a.subtotal).map(({supermarket, items, subtotal}) => (
                        <div key={supermarket?.id || 'unknown'}>
                            <div className="flex items-center gap-2 mb-2">
                               {supermarket && <SupermarketIcon name={supermarket.name} />}
                                <h2 className="font-bold text-lg">{supermarket?.name || 'Senza Negozio'}</h2>
                                <Badge className="ml-auto bg-gray-200 text-gray-700 font-bold hover:bg-gray-200">€{subtotal.toFixed(2)}</Badge>
                            </div>
                            <div className="space-y-2">
                                {items.map(item => (
                                   <div key={item.productId} className={cn("flex items-start gap-3 p-3 rounded-2xl bg-white shadow-sm", item.purchased && "opacity-60")}>
                                        <Checkbox
                                            checked={item.purchased}
                                            onCheckedChange={(checked) => handleItemChange(item.productId, { purchased: !!checked })}
                                            className="h-6 w-6 rounded-full mt-1 border-2"
                                        />
                                        {item.imageUrl ? 
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Image src={item.imageUrl} alt={item.product.name} width={56} height={56} className="rounded-lg object-cover bg-gray-100 h-14 w-14 cursor-pointer" />
                                                </DialogTrigger>
                                                <DialogContent className="p-0 max-w-lg bg-transparent border-none shadow-none">
                                                    <Image src={item.imageUrl} alt={item.product.name} width={500} height={500} className="rounded-lg object-contain w-full h-full" />
                                                </DialogContent>
                                            </Dialog>
                                            : <div className="h-14 w-14 rounded-lg bg-gray-100" />
                                        }
                                        <div className="flex-1">
                                            <p className={cn("font-bold", item.purchased && "line-through")}>{item.product.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} x €{(item.price || 0).toFixed(2)}
                                                {item.brand && <span className="text-primary"> • {item.brand}</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <p className="font-bold text-primary text-lg">€{((item.price || 0) * item.quantity).toFixed(2)}</p>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70" onClick={() => handleDeleteItem(item.productId)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {view === 'standard' && (
                 <div className="space-y-2">
                    <div className="p-4 text-center bg-gray-100 rounded-lg">
                        <p className="text-muted-foreground">La vista standard non è ancora stata implementata.</p>
                    </div>
                </div>
            )}
        </main>
        
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-sm text-primary-foreground p-4 pt-3 rounded-t-3xl md:hidden">
            <div className="text-center mb-2">
                <p className="text-xs uppercase font-bold opacity-80">Riepilogo Spesa</p>
                <p className="text-sm opacity-80">Totale Stimato</p>
                <p className="text-4xl font-bold">€{totalCost.toFixed(2)}</p>
            </div>
            <Button className="w-full h-14 text-lg bg-white text-primary rounded-xl shadow hover:bg-gray-100" onClick={() => setIsArchiveDialogOpen(true)}>
                <Archive className="mr-2"/> Archivia Spesa
            </Button>
        </footer>
      </div>
      <ArchiveListDialog
        isOpen={isArchiveDialogOpen}
        setIsOpen={setIsArchiveDialogOpen}
        list={list}
        enrichedItems={enrichedItemsForDialog}
        optimalTotal={totalCost}
        onArchive={onArchive}
      />
    </>
  );
}
