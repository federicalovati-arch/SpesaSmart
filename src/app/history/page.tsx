'use client';

import { PageHeader } from '@/components/page-header';
import { History } from 'lucide-react';
import { useData } from '@/context/data-context';
import { ReceiptCard } from './components/receipt-card';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { receipts, unarchiveReceipt } = useData();
  const { toast } = useToast();

  const handleRestore = (receiptId: string) => {
    unarchiveReceipt(receiptId);
    toast({
      title: 'Lista Ripristinata',
      description: 'La lista della spesa è di nuovo attiva.',
    });
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <PageHeader title="Storico Scontrini" />
      {receipts.length > 0 ? (
        <div className="space-y-4">
          {receipts.map(receipt => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onRestore={() => handleRestore(receipt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nessuno scontrino archiviato</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Completa e archivia una lista per vederla qui.
          </p>
        </div>
      )}
    </main>
  );
}
