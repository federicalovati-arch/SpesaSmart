'use client';

import Link from 'next/link';
import * as React from 'react';
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
import type { ShoppingList } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, List, GripVertical, ArrowRight, Copy, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


type ShoppingListsProps = {
  lists: ShoppingList[];
  onReorder: (lists: ShoppingList[]) => void;
  onAddList: () => void;
  onDeleteList: (listId: string) => void;
  onDuplicateList: (listId: string) => void;
};

function SortableListItem({ list, onDuplicate, onDelete }: {
  list: ShoppingList;
  onDuplicate: (listId: string) => void;
  onDelete: (listId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const itemsCount = list.items.length;
  const purchasedCount = list.items.filter(i => i.purchased).length;
  const isCompleted = itemsCount > 0 && purchasedCount === itemsCount;

  return (
    <Card ref={setNodeRef} style={style} className="bg-white shadow-md rounded-2xl">
      <CardContent className="p-3 flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab p-2 touch-none">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <Link href={`/lists/${list.id}`} className="flex-1 flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <List className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold">{list.name}</p>
            <div className="flex items-center gap-2">
              {isCompleted && <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0">OK</Badge>}
              <p className="text-sm text-muted-foreground">{list.items.length} articoli</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-500" />
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onDuplicate(list.id)}>
          <Copy className="h-5 w-5 text-gray-500" />
           <span className="sr-only">Duplica</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/70 hover:text-destructive">
              <Trash2 className="h-5 w-5" />
               <span className="sr-only">Elimina</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro di voler eliminare "{list.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Questa azione non può essere annullata. La lista verrà rimossa permanentemente.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(list.id)}>Elimina</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

export function ShoppingLists({ lists, onReorder, onAddList, onDeleteList, onDuplicateList }: ShoppingListsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(lists, oldIndex, newIndex);
      onReorder(newOrder.map((l, index) => ({ ...l, order: index + 1 })));
    }
  };

  return (
    <>
      {lists.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 pb-20">
              {lists.map((list) => (
                <SortableListItem 
                    key={list.id} 
                    list={list}
                    onDelete={onDeleteList}
                    onDuplicate={onDuplicateList}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg mt-8">
            <List className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nessuna lista trovata</h3>
            <p className="mt-2 text-sm text-muted-foreground">Inizia creando la tua prima lista della spesa.</p>
            <Button className="mt-6" onClick={onAddList}>
                <Plus className="mr-2 h-4 w-4" />
                Crea Nuova Lista
            </Button>
        </div>
      )}
    </>
  );
}
