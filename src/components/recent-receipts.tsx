'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Receipt } from '@/lib/types';
import { Receipt as ReceiptIcon } from 'lucide-react';

type RecentReceiptsProps = {
    receipts: Receipt[];
};

export function RecentReceipts({ receipts }: RecentReceiptsProps) {
    const recentReceipts = receipts
        .sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime())
        .slice(0, 6);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Ultimi Scontrini</h2>
                <Button variant="ghost" asChild className="text-primary hover:text-primary">
                    <Link href="/history">Vedi archivio</Link>
                </Button>
            </div>
            {recentReceipts.length > 0 ? (
                 <div className="space-y-3">
                    {recentReceipts.map(receipt => (
                        <Card key={receipt.id} className="shadow-md rounded-2xl bg-white">
                             <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <ReceiptIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">{receipt.listName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(receipt.archivedAt), 'dd/MM/yyyy', { locale: it })}
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-primary">€{receipt.totalCost.toFixed(2)}</p>
                             </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg bg-white">
                    <ReceiptIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Nessuno scontrino archiviato.</p>
                </div>
            )}
        </div>
    );
}
