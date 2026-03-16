'use client';

import { useState } from 'react';
import { useData } from '@/context/data-context';
import { ReceiptCard } from './components/receipt-card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Receipt, Search, History } from 'lucide-react';

export default function HistoryPage() {
  const { receipts, unarchiveReceipt } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRestore = (receiptId: string) => {
    unarchiveReceipt(receiptId);
    toast({
      title: 'Lista Ripristinata',
      description: 'La lista della spesa è di nuovo attiva.',
    });
  };

  const filteredReceipts = receipts
    .filter((receipt) =>
      receipt.listName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()
    );

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Receipt className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Storico Spese</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Cerca scontrino..."
          className="pl-11 rounded-full bg-white shadow-sm h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredReceipts.length > 0 ? (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onRestore={() => handleRestore(receipt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg mt-8">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">
            Nessuno scontrino archiviato
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Completa e archivia una lista per vederla qui.
          </p>
        </div>
      )}
    </div>
  );
}
