'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFirebaseApp } from '../provider';

export function useUser() {
  const app = useFirebaseApp();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app) {
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    try {
      const auth = getAuth(app);
      unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user);
          setLoading(false);
        },
        (error) => {
          console.error('Auth state change error', error);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Firebase Auth initialization error:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [app]);

  return { user, loading };
}
