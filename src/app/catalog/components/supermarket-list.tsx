'use client';

import * as React from 'react';
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
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Zap, Clover, Carrot, Store, GripVertical } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

type SupermarketListProps = {
  supermarkets: Supermarket[];
  onDeleteSupermarket: (id: string) => void;
  onReorder: (supermarkets: Supermarket[]) => void;
};

const getSupermarketIcon = (name: string) => {
    const lowerCaseName = name.toLowerCase();
    if (lowerCaseName.includes('eurospin')) {
        return <Zap className="h-6 w-6 text-primary" />;
    }
    if (lowerCaseName.includes('conad')) {
        return <Clover className="h-6 w-6 text-primary" />;
    }
    if (lowerCaseName.includes('coop')) {
        return <Carrot className="h-6 w-6 text-primary" />;
    }
    return <Store className="h-6 w-6 text-primary" />;
};

function SortableSupermarketItem({ supermarket, onDeleteSupermarket }: {supermarket: Supermarket, onDeleteSupermarket: (id: string) => void}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: supermarket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="shadow-sm rounded-2xl bg-white">
      <CardContent className="p-3 flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-2">
            <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="bg-primary/10 p-3 rounded-xl">
            {getSupermarketIcon(supermarket.name)}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{supermarket.name}</h3>
          {supermarket.location && <p className="text-sm text-muted-foreground">{supermarket.location}</p>}
        </div>
        <div className="flex items-center gap-0">
            <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
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

export function SupermarketList({ supermarkets, onDeleteSupermarket, onReorder }: SupermarketListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
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
                <SortableSupermarketItem key={supermarket.id} supermarket={supermarket} onDeleteSupermarket={onDeleteSupermarket} />
            ))}
            </div>
        </SortableContext>
    </DndContext>
  );
}
