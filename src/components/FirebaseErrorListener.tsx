'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: any) => {
      console.error("Firebase Permission Error:", error);
      
      const description = error.message.split('DENIED:')[1] || 'Controlla le regole di sicurezza di Firestore.';

      toast({
        variant: 'destructive',
        title: 'Errore di Permesso Firestore',
        description: description.trim(),
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
