import { PageHeader } from '@/components/page-header';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <PageHeader title="Storico" />
      <div className="text-center py-16 border-dashed border-2 rounded-lg">
        <History className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Cronologia non disponibile</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          La cronologia delle tue attività apparirà qui.
        </p>
      </div>
    </main>
  );
}
