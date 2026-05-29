'use client';

import { useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useUser, useFirebaseApp, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, LogOut, Mail, ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export function AuthGate() {
  const app = useFirebaseApp();
  const { user, loading } = useUser();
  const { toast } = useToast();
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!app) {
        toast({
            variant: 'destructive',
            title: 'Configurazione Firebase Mancante',
            description: "Le credenziali Firebase non sono state configurate.",
        });
        return;
    }
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
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
        description: 'L\'accesso Google potrebbe essere bloccato su questa piattaforma. Prova con l\'email.',
      });
    }
  };

  const handleEmailAuth = () => {
    if (!app) return;
    const auth = getAuth(app);
    
    if (isRegistering) {
      initiateEmailSignUp(auth, email, password);
      toast({ title: 'Registrazione in corso...', description: 'Verrai collegato automaticamente.' });
    } else {
      initiateEmailSignIn(auth, email, password);
      toast({ title: 'Accesso in corso...', description: 'Verifica delle credenziali.' });
    }
  };

  const handleSignOut = async () => {
    if (!app) return;
    try {
      const auth = getAuth(app);
      await signOut(auth);
      toast({
        title: 'Uscita effettuata',
        description: 'A presto!',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Errore durante l\'uscita',
        description: error.message,
      });
    }
  };

  if (loading) {
    return <Button disabled variant="ghost">Caricamento...</Button>;
  }

  if (user) {
    return (
      <Button onClick={handleSignOut} variant="link" className="text-destructive font-bold">
        <LogOut className="mr-2 h-4 w-4" />
        Esci dall'account
      </Button>
    );
  }

  if (showEmailForm) {
    return (
      <Card className="w-full max-w-sm border-none shadow-none bg-transparent">
        <CardContent className="p-0 space-y-4">
          <div className="space-y-2">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleEmailAuth} className="w-full h-12 font-bold">
              {isRegistering ? <UserPlus className="mr-2 h-4 w-4"/> : <LogIn className="mr-2 h-4 w-4" />}
              {isRegistering ? 'REGISTRATI' : 'ACCEDI'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-semibold"
            >
              {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowEmailForm(false)} className="mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Torna alle opzioni
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <Button onClick={handleGoogleSignIn} className="h-12 bg-white text-black hover:bg-gray-100 border border-gray-200 font-bold shadow-sm">
        <img src="https://www.gstatic.com/firebase/anonymous-scan.png" alt="G" className="w-4 h-4 mr-2 hidden" /> 
        Continua con Google
      </Button>
      <Button onClick={() => setShowEmailForm(true)} variant="outline" className="h-12 border-primary text-primary hover:bg-primary/5 font-bold">
        <Mail className="mr-2 h-4 w-4" />
        Usa Email e Password
      </Button>
      <p className="text-[10px] text-center text-muted-foreground mt-2 px-4">
        L'accesso via email è consigliato se riscontri problemi con l'accesso Google sull'app Android.
      </p>
    </div>
  );
}
