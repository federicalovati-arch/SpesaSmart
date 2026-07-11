'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Copy,
    Plus,
    Sparkles,
    Pencil,
    Trash2,
    Archive,
    Store,
    Clover,
    Zap,
    Carrot,
    LucideIcon,
    Check as CheckIcon,
    ShoppingBasket,
    Minus,
    Box,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const ArchiveListDialog = dynamic(() => import('./archive-list-dialog').then(mod => mod.ArchiveListDialog), { ssr: false });
const PriceOverrideDialog = dynamic(() => import('./price-override-dialog').then(mod => mod.PriceOverrideDialog), { ssr: false });
const AddItemSheet = dynamic(() => import('./add-item-sheet').then(mod => mod.AddItemSheet), { ssr: false });


type ListDetailsProps = {
  list: ShoppingList;
  allProducts: Product[];
  allSupermarkets: Supermarket[];
  allCategories: Category[];
  onUpdateList: (list: ShoppingList) => void;
  onArchive: (receipt: Receipt) => void;
  onDuplicateList: (listId: string) => void;
  onAddProductToList: (product: Product, quantity: number) => void;
  onUpdateProductBasePrice: (productId: string, supermarketId: string, newPrice: number) => void;
  onAddQuickProduct: (item: { name: string; price: number; supermarketId: string }) => void;
};

type EnrichedListItem = ShoppingListItem & {
  product: Product;
  price: number | null;
  basePrice: number | null;
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

const ListFooter = ({ totalCost, onArchiveClick, disabled }: { totalCost: number; onArchiveClick: () => void; disabled: boolean }) => (
    <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-lg">
            <div>
                <p className="text-xs text-muted-foreground">Totale Stimato</p>
                <p className="text-2xl font-bold text-primary">€{totalCost.toFixed(2)}</p>
            </div>
            <Button
                className="h-12 px-4"
                onClick={onArchiveClick}
                disabled={disabled}
            >
                <CheckIcon className="mr-2 h-4 w-4"/> Archivia Spesa
            </Button>
        </div>
    </div>
);


export function ShoppingListDetails({
  list: initialList,
  allProducts,
  allSupermarkets,
  allCategories,
  onUpdateList,
  onArchive,
  onDuplicateList,
  onAddProductToList,
  onUpdateProductBasePrice,
  onAddQuickProduct,
}: ListDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [list, setList] = useState(initialList);
  const [view, setView] = useState<'standard' | 'risparmio'>('standard');
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [listName, setListName] = useState(initialList.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);
  const [selectedItemForPrice, setSelectedItemForPrice] = useState<EnrichedListItem | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    setList(initialList);
  }, [initialList]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  const handleNameChange = () => {
    if (listName.trim() === '') {
      setListName(list.name); // revert
      toast({ variant: 'destructive', title: 'Il nome non può essere vuoto.' });
      return;
    }
    const updatedList = { ...list, name: listName };
    setList(updatedList);
    onUpdateList(updatedList);
    setIsEditingName(false);
    toast({ title: 'Nome lista aggiornato!' });
  }

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
      .map((item): EnrichedListItem | null => {
        if (item.isQuickAdd) {
            const supermarket = allSupermarkets.find(s => s.id === item.assignedSupermarketId) || null;
            return {
                ...item,
                product: {
                    id: item.productId,
                    name: item.quickAddName || 'Prodotto Rapido',
                    category: 'Vario',
                    brand: '',
                    prices: [],
                    images: [],
                },
                price: item.overridePrice || 0,
                basePrice: item.overridePrice || 0,
                supermarket: supermarket,
                brand: 'Aggiunta rapida',
                imageUrl: null,
                priceStatus: 'normal'
            };
        }

        const product = allProducts.find((p) => p.id === item.productId);
        if (!product) return null;

        let price: number | null = null;
        let basePrice: number | null = null;
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
            basePrice = priceInfo.price;
            supermarket = allSupermarkets.find(s => s.id === priceInfo.supermarketId) || null;
            if(priceInfo.brand) brand = priceInfo.brand;

            const generalImage = product.images.find(img => !img.supermarketId);
            const supermarketImage = product.images.find(img => img.supermarketId === priceInfo.supermarketId);
            const fallbackImage = product.images.length > 0 ? product.images[0].url : null;
            imageUrl = supermarketImage?.url || generalImage?.url || fallbackImage;
        }
        
        if (item.overridePrice !== null && item.overridePrice !== undefined) {
            if (basePrice !== null && item.overridePrice < basePrice) priceStatus = 'offer';
            else if (basePrice !== null && item.overridePrice > basePrice) priceStatus = 'increase';
            price = item.overridePrice;
        }

        return { ...item, product, price, basePrice, supermarket, brand, imageUrl, priceStatus };
      })
      .filter((item): item is EnrichedListItem => item !== null)
      .sort((a, b) => (a.product.name > b.product.name ? 1 : -1));
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
  
  const totalQuantity = useMemo(() => list.items.reduce((sum, item) => sum + item.quantity, 0), [list.items]);
  const purchasedQuantity = useMemo(
    () =>
      list.items
        .filter((i) => i.purchased)
        .reduce((sum, item) => sum + item.quantity, 0),
    [list.items]
  );
  const progress = totalQuantity > 0 ? (purchasedQuantity / totalQuantity) * 100 : 0;
  
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
        basePrice: item.basePrice,
        bestSupermarket: item.supermarket ? { id: item.supermarket.id, name: item.supermarket.name } : null
    }));
  }, [enrichedItems]);

  const handleOpenPriceDialog = (item: EnrichedListItem) => {
    setSelectedItemForPrice(item);
    setIsPriceDialogOpen(true);
  };

  const handleApplyPrice = (newPrice: number) => {
    if (!selectedItemForPrice) return;
    handleItemChange(selectedItemForPrice.productId, { overridePrice: newPrice });
  };

  const handleRemovePriceOverride = () => {
    if (!selectedItemForPrice) return;
    handleItemChange(selectedItemForPrice.productId, { overridePrice: null });
  };

  const handleUpdateCatalogPrice = (newPrice: number) => {
    if (!selectedItemForPrice || !selectedItemForPrice.supermarket) {
        toast({ variant: 'destructive', title: 'Impossibile aggiornare', description: 'Nessun supermercato associato a questo prezzo.' });
        return;
    };
    onUpdateProductBasePrice(selectedItemForPrice.productId, selectedItemForPrice.supermarket.id, newPrice);
  };

  return (
    <>
      <div className="flex flex-col bg-background h-full">
        {/* Header */}
        <header className="p-4 bg-background sticky top-0 z-10 border-b border-border">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                 <ShoppingBasket className="h-7 w-7 text-gray-400" />
                <div className="flex-1 flex items-center gap-2" >
                    {isEditingName ? (
                      <Input 
                        ref={nameInputRef}
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        onBlur={handleNameChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                        className="text-2xl font-bold h-auto p-0 border-none focus-visible:ring-0 bg-transparent"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold truncate" onClick={() => setIsEditingName(true)}>{list.name}</h1>
                    )}
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => isEditingName ? handleNameChange() : setIsEditingName(true)}>
                       {isEditingName ? <CheckIcon className="h-5 w-5 text-primary"/> : <Pencil className="h-4 w-4"/>}
                    </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDuplicateList(list.id)}>
                    <Copy className="h-5 w-5" />
                </Button>
            </div>
             <p className="text-sm text-muted-foreground ml-16 -mt-2">
                {totalQuantity} ARTICOLI • {format(new Date(list.createdAt), 'dd/MM/yyyy', { locale: it })}
            </p>
            <div className="flex items-center gap-2 my-4">
                <Button className="flex-1 h-11 rounded-lg shadow-sm" onClick={() => setIsAddItemSheetOpen(true)}><Plus className="mr-2"/> Aggiungi</Button>
                <Button className="flex-1 h-11 rounded-lg bg-white text-foreground shadow-sm hover:bg-gray-100" disabled><Sparkles className="mr-2"/> AI Advisor</Button>
                <Button
                    onClick={() => setView(view === 'risparmio' ? 'standard' : 'risparmio')}
                    variant={view === 'risparmio' ? 'default' : 'outline'}
                    className={cn(
                        "flex-1 h-11 rounded-lg shadow-sm",
                        view === 'standard' && 'bg-white text-foreground border-gray-300'
                    )}
                >
                    <Zap className="mr-2"/> Risparmio
                </Button>
            </div>
            
            <div className="space-y-1 mb-2 px-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Progressivo Spesa</p>
                <div className="flex items-center gap-3">
                    <Progress value={progress} className="h-2" />
                    <span className="text-sm font-bold w-12 text-right">{Math.round(progress)}%</span>
                </div>
            </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-4 pb-40 md:pb-4">
            
            {view === 'risparmio' && groupedItems && (
                <div className="space-y-4 pt-2">
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (item.imageUrl) {
                                                    setEnlargedImage(item.imageUrl);
                                                }
                                            }}
                                            disabled={!item.imageUrl}
                                            className="shrink-0"
                                        >
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={item.product.name} width={56} height={56} className="rounded-lg object-cover bg-background h-14 w-14" />
                                            ) : (
                                                <div className="h-14 w-14 rounded-lg bg-background flex items-center justify-center">
                                                    <Box className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </button>
                                        <div className="flex-1">
                                            <p className={cn("font-bold", item.purchased && "line-through")}>{item.product.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} x €{(item.price || 0).toFixed(2)}
                                                {item.brand && <span className="text-primary font-medium"> • {item.brand}</span>}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <button type="button" onClick={() => handleOpenPriceDialog(item)} className={cn("p-1 -m-1 text-right", item.purchased && "line-through")}>
                                                <p className={cn(
                                                    "font-bold text-lg",
                                                    item.priceStatus === 'offer' && 'text-green-600',
                                                    item.priceStatus === 'increase' && 'text-destructive',
                                                    item.priceStatus === 'normal' && 'text-primary'
                                                )}>
                                                    €{((item.price || 0) * item.quantity).toFixed(2)}
                                                </p>
                                            </button>
                                            <div className="-mt-1 -mr-2">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenPriceDialog(item)}>
                                                    <Pencil className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {view === 'standard' && (
                 <div className="space-y-2 pt-2">
                    {enrichedItems.map(item => (
                         <div key={item.productId} className={cn("flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm", item.purchased && "opacity-50")}>
                            <Checkbox
                                checked={item.purchased}
                                onCheckedChange={(checked) => handleItemChange(item.productId, { purchased: !!checked })}
                                className="h-6 w-6 rounded-full mt-1 border-2 border-primary data-[state=checked]:bg-primary"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (item.imageUrl) {
                                        setEnlargedImage(item.imageUrl);
                                    }
                                }}
                                disabled={!item.imageUrl}
                                className="shrink-0"
                            >
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-lg object-cover bg-background h-12 w-12" />
                                ) : (
                                    <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center">
                                    <Box className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                            </button>
                            <div className="flex-1 space-y-0.5 self-stretch flex flex-col">
                                <p className={cn("font-bold", item.purchased && "line-through")}>{item.product.name}</p>
                                
                                {item.isQuickAdd && item.supermarket ? (
                                    <div className="flex items-center gap-1 h-auto p-1 bg-gray-100 w-fit text-xs text-muted-foreground font-semibold rounded-md">
                                        <Store className="h-3 w-3" />
                                        <span>{item.supermarket.name}</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={item.assignedSupermarketId || 'automatic'}
                                        onValueChange={(value) => handleItemChange(item.productId, { assignedSupermarketId: value === 'automatic' ? null : value, overridePrice: null })}
                                        disabled={item.isQuickAdd}
                                    >
                                        <SelectTrigger className="h-auto p-1 border-none bg-gray-100 focus:ring-0 focus:ring-offset-0 w-fit text-xs text-muted-foreground font-semibold rounded-md">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="automatic">Miglior Prezzo</SelectItem>
                                            {item.product.prices.map(p => {
                                                const supermarket = allSupermarkets.find(s => s.id === p.supermarketId);
                                                return supermarket ? (
                                                    <SelectItem key={p.supermarketId} value={p.supermarketId}>
                                                        {supermarket.name} (€{p.price.toFixed(2)})
                                                    </SelectItem>
                                                ) : null;
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}

                                <p className="text-xs text-gray-500 pt-0.5 mt-auto">{item.brand || item.product.brand || ' '}</p>
                            </div>

                             <div className="flex flex-col items-end justify-between self-stretch -my-1">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => handleItemChange(item.productId, { quantity: Math.max(1, item.quantity - 1) })}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => handleItemChange(item.productId, { quantity: item.quantity + 1 })}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button type="button" onClick={() => handleOpenPriceDialog(item)} className={cn("p-1 -m-1 text-right", item.purchased && "line-through")}>
                                        <p className={cn(
                                            "font-bold text-base",
                                            item.priceStatus === 'offer' && 'text-green-600',
                                            item.priceStatus === 'increase' && 'text-destructive',
                                            item.priceStatus === 'normal' && 'text-primary'
                                        )}>
                                            €{((item.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </button>
                                    <div className="flex items-center justify-end -mr-2 -mt-1">
                                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenPriceDialog(item)}>
                                            <Pencil className="h-4 w-4 text-gray-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70" onClick={() => handleDeleteItem(item.productId)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
        
        {/* Desktop Footer */}
        <footer className="hidden md:block p-4 bg-background border-t">
          <ListFooter 
            totalCost={totalCost}
            onArchiveClick={() => setIsArchiveDialogOpen(true)}
            disabled={list.items.length === 0}
          />
        </footer>
      </div>
      
      {/* Mobile Footer */}
      <footer className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm md:hidden z-30 border-t">
        <ListFooter 
          totalCost={totalCost}
          onArchiveClick={() => setIsArchiveDialogOpen(true)}
          disabled={list.items.length === 0}
        />
      </footer>
      <ArchiveListDialog
        isOpen={isArchiveDialogOpen}
        setIsOpen={setIsArchiveDialogOpen}
        list={list}
        enrichedItems={enrichedItemsForDialog}
        optimalTotal={totalCost}
        onArchive={onArchive}
      />
      {selectedItemForPrice && (
        <PriceOverrideDialog
            isOpen={isPriceDialogOpen}
            setIsOpen={setIsPriceDialogOpen}
            initialPrice={selectedItemForPrice.overridePrice ?? selectedItemForPrice.basePrice ?? 0}
            canUpdateCatalog={!!selectedItemForPrice.supermarket && !selectedItemForPrice.isQuickAdd}
            onApply={handleApplyPrice}
            onRemove={handleRemovePriceOverride}
            onUpdateCatalog={handleUpdateCatalogPrice}
        />
      )}
      <AddItemSheet
        isOpen={isAddItemSheetOpen}
        setIsOpen={setIsAddItemSheetOpen}
        allProducts={allProducts}
        allSupermarkets={allSupermarkets}
        allCategories={allCategories}
        listItems={list.items}
        onAddCatalogProduct={(product) => onAddProductToList(product, 1)}
        onAddQuickProduct={onAddQuickProduct}
      />
      {enlargedImage && (
        <Dialog
          open={!!enlargedImage}
          onOpenChange={() => setEnlargedImage(null)}
        >
          <DialogContent className="p-0 bg-transparent border-none shadow-none w-auto max-w-full max-h-screen lg:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="sr-only">Immagine Prodotto Ingrandita</DialogTitle>
                <DialogDescription className="sr-only">Visualizzazione ingrandita dell'immagine del prodotto.</DialogDescription>
            </DialogHeader>
            <Image
              src={enlargedImage}
              alt="Enlarged product image"
              width={800}
              height={800}
              className="object-contain w-full h-auto max-h-[80vh] rounded-lg"
            />
            <DialogClose className="absolute -top-2 -right-2 z-50 rounded-full bg-white/80 p-1.5 text-black opacity-100 ring-offset-0 focus:ring-0 backdrop-blur-sm hover:bg-white">
              <X className="h-5 w-5" />
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
