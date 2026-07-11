'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type ProductHistorySheetProps = {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  productId: string | null;
};

export default function ProductHistorySheet({
  open,
  onOpenChange,
  productId,
}: ProductHistorySheetProps) {

  return (

    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >

      <SheetContent
        side="bottom"
        className="rounded-t-3xl"
      >

        <SheetHeader>

          <SheetTitle>

            Storico prodotto

          </SheetTitle>

        </SheetHeader>

      </SheetContent>

    </Sheet>

  );

}