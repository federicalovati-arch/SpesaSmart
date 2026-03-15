'use client';

import { useState, useEffect } from 'react';
import type {
  Firestore,
  DocumentReference,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseDocOptions<T> {
  initialData?: T;
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null,
  options: UseDocOptions<T> = {}
) {
  const firestore = useFirestore() as Firestore;
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore || !ref) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ ...doc.data(), id: doc.id });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'get',
        });
    
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, ref]);

  return { data, loading, error };
}
