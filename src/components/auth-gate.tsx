'use client';

import { useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useUser, useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, LogOut, Mail, ArrowLeft, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AuthGate() {
  const app = useFirebaseApp();
  const { user, loading } = useUser();
  const { toast } = useToast();
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!app) {
        toast({
            variant: 'destructive',
            title: 'Configurazione Firebase Mancante',
            description: "Le credenziali Firebase non sono state configurate.",
        });
        return;
    }
    setAuthError(null);
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
      let message = 'L\'accesso Google potrebbe essere bloccato su questa piattaforma.';
      if (error.code === 'auth/unauthorized-domain') {
        message = 'Dominio non autorizzato. Aggiungi questo dominio nella console Firebase.';
      }
      setAuthError(message);
      toast({
        variant: 'destructive',
        title: 'Errore di autenticazione',
        description: message,
      });
    }
  };

  const handleEmailAuth = () => {
    if (!app || !email || !password) return;
    const auth = getAuth(app);
    setIsAuthLoading(true);
    setAuthError(null);
    
    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast({ title: 'Account creato!', description: 'Benvenuto/a!' });
          setIsAuthLoading(false);
        })
        .catch((error: any) => {
          setIsAuthLoading(false);
          let message = 'Si è verificato un errore durante la registrazione.';
          if (error.code === 'auth/email-already-in-use') {
            message = 'Questa email è già registrata. Prova ad accedere invece di registrarti.';
          } else if (error.code === 'auth/invalid-email') {
            message = 'L\'indirizzo email non è valido.';
          } else if (error.code === 'auth/weak-password') {
            message = 'La password deve avere almeno 6 caratteri.';
          } else if (error.code === 'auth/operation-not-allowed') {
            message = 'Il metodo Email/Password non è abilitato nella console Firebase.';
          } else {
            message = error.message;
          }
          setAuthError(message);
          toast({
            variant: 'destructive',
            title: 'Errore Registrazione',
            description: message,
          });
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          toast({ title: 'Accesso effettuato!', description: 'Bentornato/a!' });
          setIsAuthLoading(false);
        })
        .catch((error: any) => {
          setIsAuthLoading(false);
          let message = 'Email o password non corretti.';
          if (error.code === 'auth/user-not-found') {
            message = 'Account non trovato. Se non hai mai usato questa email, clicca su "Registrati qui" sotto.';
          } else if (error.code === 'auth/wrong-password') {
            message = 'Password errata. Riprova o recupera la password se necessario.';
          } else if (error.code === 'auth/invalid-credential') {
            message = 'Credenziali non valide. Se è il tuo primo accesso, devi prima creare un account cliccando su "Registrati qui".';
          } else if (error.code === 'auth/unauthorized-domain') {
            message = 'Questo dominio non è autorizzato. Aggiungilo nella console Firebase sotto Authentication > Settings.';
          } else if (error.code === 'auth/operation-not-allowed') {
            message = 'L\'accesso con email non è abilitato nel tuo progetto Firebase.';
          } else {
            message = error.message;
          }
          setAuthError(message);
          toast({
            variant: 'destructive',
            title: 'Errore Accesso',
            description: message,
          });
        });
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
          <div className="text-center space-y-1">
             <h2 className="text-xl font-bold text-primary uppercase">
                {isRegistering ? 'Registrazione' : 'Accesso Email'}
             </h2>
             <p className="text-xs text-muted-foreground">
                {isRegistering ? 'Crea un nuovo account' : 'Inserisci le tue credenziali'}
             </p>
          </div>

          {authError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attenzione</AlertTitle>
              <AlertDescription className="text-xs">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white h-12"
              disabled={isAuthLoading}
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white h-12"
              disabled={isAuthLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleEmailAuth} className="w-full h-12 font-bold text-lg" disabled={isAuthLoading || !email || !password}>
              {isAuthLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : isRegistering ? (
                <UserPlus className="mr-2 h-5 w-5"/>
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isAuthLoading ? 'ELABORAZIONE...' : isRegistering ? 'CREA ACCOUNT' : 'ENTRA'}
            </Button>
            
            <div className="flex flex-col items-center gap-1 mt-2">
                <p className="text-sm text-muted-foreground">
                    {isRegistering ? 'Hai già un account?' : 'Non hai ancora un account?'}
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError(null);
                  }}
                  className="text-primary font-bold h-auto p-0"
                  disabled={isAuthLoading}
                >
                  {isRegistering ? 'Accedi qui' : 'Registrati qui'}
                </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowEmailForm(false)} className="mt-4 text-muted-foreground" disabled={isAuthLoading}>
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
        Continua con Google
      </Button>
      <Button onClick={() => setShowEmailForm(true)} variant="outline" className="h-12 border-primary text-primary hover:bg-primary/5 font-bold">
        <Mail className="mr-2 h-4 w-4" />
        Usa Email e Password
      </Button>
      <p className="text-[10px] text-center text-muted-foreground mt-2 px-4">
        L'accesso via email è consigliato per l'app Android. Se è la prima volta, clicca su "Usa Email" e poi su "Registrati qui".
      </p>
    </div>
  );
}
