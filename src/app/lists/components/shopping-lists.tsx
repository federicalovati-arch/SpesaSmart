'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import type { ShoppingList } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Calendar, ArrowRight, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type ShoppingListsProps = {
  lists: ShoppingList[];
  onAddList: (list: Omit<ShoppingList, 'id' | 'createdAt' | 'order'>) => void;
  onReorder: (lists: ShoppingList[]) => void;
};

function SortableListItem({ list }: {list: ShoppingList}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const itemsCount = list.items.length;
  const purchasedCount = list.items.filter(i => i.purchased).length;

  return (
    <Card ref={setNodeRef} style={style} className="flex flex-col">
      <div className="flex items-start p-3">
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-3 -m-3 mr-1">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className='flex-grow'>
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base">{list.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
              <Calendar className="h-4 w-4" />
              Creato {formatDistanceToNow(new Date(list.createdAt), { addSuffix: true, locale: it })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <div className="text-sm text-muted-foreground">
              {purchasedCount} di {itemsCount} prodotti acquistati.
            </div>
          </CardContent>
        </div>
      </div>
      <CardFooter className="p-3">
        <Button asChild className="w-full">
          <Link href={`/lists/${list.id}`}>
            Vai alla Lista
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ShoppingLists({ lists, onReorder }: ShoppingListsProps) {
  // TODO: Implement Add List Dialog
  const handleAddList = () => {
    console.log("Add new list");
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(lists, oldIndex, newIndex);
      onReorder(newOrder.map((l, index) => ({ ...l, order: index + 1 })));
    }
  };

  return (
    <>
      <PageHeader
        title="Liste"
        actions={
          <Button onClick={handleAddList}>
            <PlusCircle />
            Crea Lista
          </Button>
        }
      />
      {lists.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lists.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {lists.map((list) => (
                <SortableListItem key={list.id} list={list} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <List className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nessuna lista trovata</h3>
            <p className="mt-2 text-sm text-muted-foreground">Inizia creando la tua prima lista della spesa.</p>
            <Button className="mt-6" onClick={handleAddList}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crea Lista
            </Button>
        </div>
      )}
    </>
  );
}
