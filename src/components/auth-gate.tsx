'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthGate() {
  const app = useFirebaseApp();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!app) return;
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Accesso effettuato!',
        description: 'Benvenuto/a!',
      });
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Errore di autenticazione',
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    if (!app) return;
    const auth = getAuth(app);
    try {
      await signOut(auth);
      toast({
        title: 'Uscita effettuata',
        description: 'A presto!',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
       toast({
        variant: 'destructive',
        title: 'Errore durante l\'uscita',
        description: error.message,
      });
    }
  };

  if (loading) {
    return <Button disabled>Caricamento...</Button>;
  }

  if (user) {
    return (
      <Button onClick={handleSignOut} variant="destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Esci
      </Button>
    );
  }

  return (
    <Button onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" />
      Accedi con Google
    </Button>
  );
}
