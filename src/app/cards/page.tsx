import { PageHeader } from '@/components/page-header';
import { CreditCard } from 'lucide-react';

export default function CardsPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <PageHeader title="Le Mie Carte" />
      <div className="text-center py-16 border-dashed border-2 rounded-lg">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Funzione non disponibile</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          La gestione delle carte fedeltà sarà disponibile in un futuro aggiornamento.
        </p>
      </div>
    </main>
  );
}
