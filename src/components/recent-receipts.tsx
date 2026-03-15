import { Button } from '@/components/ui/button';

export function RecentReceipts() {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ultimi Scontrini</h2>
            <Button variant="ghost" className="text-primary hover:text-primary">Vedi archivio</Button>
        </div>
        <div className="text-center py-16 border-dashed border-2 rounded-lg bg-white">
            <p className="text-muted-foreground">Nessuno scontrino archiviato.</p>
        </div>
    </div>
  );
}
