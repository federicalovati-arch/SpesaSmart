'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import {
  Apple,
  Beef,
  CakeSlice,
  Carrot,
  Coffee,
  Cookie,
  Egg,
  Fish,
  GlassWater,
  Archive,
  Package,
  Pizza,
  GripVertical,
  Edit,
  Trash2,
  X,
  Save,
  LucideIcon,
  ShoppingBasket,
  Wine,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const iconMap: { [key: string]: LucideIcon } = {
  apple: Apple,
  beef: Beef,
  'cake-slice': CakeSlice,
  carrot: Carrot,
  coffee: Coffee,
  cookie: Cookie,
  egg: Egg,
  fish: Fish,
  'glass-water': GlassWater,
  archive: Archive,
  package: Package,
  pizza: Pizza,
  'shopping-basket': ShoppingBasket,
  wine: Wine,
  sparkles: Sparkles,
};

const availableIcons = Object.keys(iconMap);

type CategoryManagerDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategory: (category: Category) => void;
  onReorder: (categories: Category[]) => void;
};

function SortableCategoryItem({ category, onStartEdit, onDeleteCategory }: { category: Category, onStartEdit: (category: Category) => void, onDeleteCategory: (categoryId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = iconMap[name] || Sparkles;
    return <Icon className="h-6 w-6 text-primary" />;
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab touch-none">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <div className="p-2 bg-primary/10 rounded-lg">
        <IconComponent name={category.icon} />
      </div>
      <span className="flex-1 font-semibold">{category.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => onStartEdit(category)}
      >
        <Edit className="h-5 w-5 text-gray-600" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive/70 hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              L'eliminazione di una categoria è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteCategory(category.id)}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function CategoryManagerDialog({
  isOpen,
  setIsOpen,
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
  onReorder,
}: CategoryManagerDialogProps) {
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryOrder, setNewCategoryOrder] = useState(1);
  const [newCategoryIcon, setNewCategoryIcon] = useState(availableIcons[0]);

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingOrder, setEditingOrder] = useState(1);
  const [editingIcon, setEditingIcon] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Set default order to max order + 1
    if (categories.length > 0) {
      const maxOrder = Math.max(...categories.map(c => c.order));
      setNewCategoryOrder(maxOrder + 1);
    }
  }, [categories]);

  const handleAdd = () => {
    if (newCategoryName.trim() === '') {
      toast({
        variant: 'destructive',
        description: 'Il nome della categoria non può essere vuoto.',
      });
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        toast({ variant: 'destructive', description: 'Questa categoria esiste già.' });
        return;
    }
    onAddCategory({ name: newCategoryName, order: newCategoryOrder, icon: newCategoryIcon });
    setNewCategoryName('');
    const maxOrder = Math.max(...categories.map(c => c.order), 0);
    setNewCategoryOrder(maxOrder + 2);
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditingName(category.name);
    setEditingOrder(category.order);
    setEditingIcon(category.icon);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleSaveEdit = () => {
    if (!editingCategory) return;
    if (editingName.trim() === '') {
        toast({ variant: 'destructive', description: 'Il nome della categoria non può essere vuoto.' });
        return;
    }
    const existingCategory = categories.find(c => c.name.toLowerCase() === editingName.toLowerCase());
    if (existingCategory && existingCategory.id !== editingCategory) {
        toast({ variant: 'destructive', description: 'Questa categoria esiste già.' });
        return;
    }

    onUpdateCategory({ id: editingCategory, name: editingName, order: editingOrder, icon: editingIcon });
    handleCancelEdit();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      onReorder(newOrder.map((c, index) => ({ ...c, order: index + 1 })));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] flex flex-col bg-gray-50"
      >
        <SheetHeader className="text-center p-4 border-b">
          <SheetTitle className="font-bold text-lg">
            Gestione Categorie
          </SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="p-4">
            <div className="p-4 rounded-xl bg-white shadow-sm space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500">NOME</label>
                        <Input
                            placeholder="Nome..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="bg-gray-100 border-gray-200"
                        />
                    </div>
                    <div className="w-20">
                        <label className="text-xs font-semibold text-gray-500">ORDINE</label>
                        <Input
                            type="number"
                            value={newCategoryOrder}
                            onChange={(e) => setNewCategoryOrder(Number(e.target.value))}
                             className="bg-gray-100 border-gray-200"
                        />
                    </div>
                </div>
                <div>
                     <label className="text-xs font-semibold text-gray-500 mb-2 block">ICONA</label>
                     <ScrollArea className="w-full">
                        <div className="flex gap-2 pb-2">
                         {availableIcons.map(iconKey => (
                            <Button key={iconKey} variant="outline" size="icon" className={cn("w-12 h-12 bg-gray-100 border-gray-200", newCategoryIcon === iconKey && "ring-2 ring-primary border-primary")} onClick={() => setNewCategoryIcon(iconKey)}>
                                {React.createElement(iconMap[iconKey], { className: "h-6 w-6 text-gray-600"})}
                            </Button>
                         ))}
                        </div>
                         <div className="h-1 w-full" />
                     </ScrollArea>
                </div>
                <Button onClick={handleAdd} className="w-full h-12 bg-primary hover:bg-primary/90 text-lg">CREA</Button>
            </div>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground px-4 mt-2 mb-2">
          TUTTE LE CATEGORIE
        </h3>
        <ScrollArea className="flex-1 px-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 pb-4">
                {categories.map((category) => (
                  <div key={category.id}>
                    {editingCategory === category.id ? (
                        // Editing state
                         <div className="flex flex-col gap-2 p-3 rounded-xl bg-white shadow-md border border-primary">
                            <div className="flex gap-2">
                                <Input
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="h-8 flex-1"
                                />
                                <Input
                                    type="number"
                                    value={editingOrder}
                                    onChange={(e) => setEditingOrder(Number(e.target.value))}
                                    className="h-8 w-16"
                                />
                            </div>
                            <ScrollArea className="w-full">
                                <div className="flex gap-2 pb-2">
                                {availableIcons.map(iconKey => (
                                    <Button key={iconKey} variant="outline" size="icon" className={cn("w-10 h-10 bg-gray-100 border-gray-200", editingIcon === iconKey && "ring-2 ring-primary border-primary")} onClick={() => setEditingIcon(iconKey)}>
                                        {React.createElement(iconMap[iconKey], { className: "h-5 w-5 text-gray-600"})}
                                    </Button>
                                ))}
                                </div>
                            </ScrollArea>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}><X className="h-4 w-4 mr-1" /> Annulla</Button>
                                <Button size="sm" onClick={handleSaveEdit}><Save className="h-4 w-4 mr-1" /> Salva</Button>
                            </div>
                         </div>
                    ) : (
                        // Display state
                        <SortableCategoryItem 
                          category={category}
                          onStartEdit={handleStartEdit}
                          onDeleteCategory={onDeleteCategory}
                        />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
