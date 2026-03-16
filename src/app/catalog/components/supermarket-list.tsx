'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog";
import { supermarketIcons } from '@/lib/icons';
import { Store } from 'lucide-react';

type SupermarketListProps = {
  supermarkets: Supermarket[];
  onDeleteSupermarket: (id: string) => void;
  onReorder: (supermarkets: Supermarket[]) => void;
  onEditSupermarket: (supermarket: Supermarket) => void;
  onShowProducts: (supermarket: Supermarket) => void;
};

const SupermarketIcon = ({ iconName }: { iconName: string }) => {
  const Icon = supermarketIcons[iconName] || Store;
  return <Icon className="h-6 w-6 text-primary" />;
};

function SortableSupermarketItem({ supermarket, onDeleteSupermarket, onEditSupermarket, onShowProducts }: {
  supermarket: Supermarket;
  onDeleteSupermarket: (id: string) => void;
  onEditSupermarket: (supermarket: Supermarket) => void;
  onShowProducts: (supermarket: Supermarket) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: supermarket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // We check if the click target or its parent is a button or has a drag handle listener
    // This prevents the sheet from opening when interacting with actions.
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('[aria-roledescription="sortable"]')) {
      return;
    }
    onShowProducts(supermarket);
  };


  return (
    <Card ref={setNodeRef} style={style} className="shadow-sm rounded-2xl bg-white">
      <CardContent className="p-3 flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-2" aria-roledescription="sortable">
            <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div 
          className="flex-grow flex items-center gap-4 cursor-pointer"
          onClick={() => onShowProducts(supermarket)}
        >
          <div className="bg-primary/10 p-3 rounded-xl">
              <SupermarketIcon iconName={supermarket.icon} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{supermarket.name}</h3>
            {supermarket.location && <p className="text-sm text-muted-foreground">{supermarket.location}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEditSupermarket(supermarket)}>
                <Edit className="h-5 w-5 text-gray-600" />
                <span className="sr-only">Modifica</span>
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive/70 hover:text-destructive"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Elimina</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro di voler eliminare {supermarket.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. Tutti i prezzi associati a questo negozio verranno rimossi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteSupermarket(supermarket.id)}>Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export function SupermarketList({ supermarkets, onDeleteSupermarket, onReorder, onEditSupermarket, onShowProducts }: SupermarketListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = supermarkets.findIndex((s) => s.id === active.id);
      const newIndex = supermarkets.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(supermarkets, oldIndex, newIndex);
      onReorder(newOrder.map((s, index) => ({ ...s, order: index + 1 })));
    }
  };
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={supermarkets.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pb-20">
            {supermarkets.map((supermarket) => (
                <SortableSupermarketItem 
                  key={supermarket.id} 
                  supermarket={supermarket} 
                  onDeleteSupermarket={onDeleteSupermarket}
                  onEditSupermarket={onEditSupermarket}
                  onShowProducts={onShowProducts}
                />
            ))}
            </div>
        </SortableContext>
    </DndContext>
  );
}
