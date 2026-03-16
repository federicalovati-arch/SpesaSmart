'use client';

import { PageHeader } from '@/components/page-header';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthGate } from '@/components/auth-gate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, loading } = useUser();

  const getInitials = (name?: string | null) => {
    if (!name) return '...';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('');
  };

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8">
      <PageHeader title="Profilo" />
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Utente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Caricamento...</p>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-xl">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : (
              <p>Nessun utente autenticato. Accedi per visualizzare il tuo profilo.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Autenticazione</CardTitle>
            </CardHeader>
            <CardContent>
                 <AuthGate />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
