import { PageHeader } from '@/components/page-header';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
      <PageHeader title="Profilo" />
       <div className="text-center py-16 border-dashed border-2 rounded-lg">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Profilo utente</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Le impostazioni del tuo profilo saranno disponibili qui.
        </p>
      </div>
    </main>
  );
}
