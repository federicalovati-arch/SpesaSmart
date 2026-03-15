'use client';

import { useState, useEffect } from 'react';
import type {
  Firestore,
  CollectionReference,
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface UseCollectionOptions<T> {
  initialData?: T[];
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | CollectionReference<T> | null,
  options: UseCollectionOptions<T> = {}
) {
  const firestore = useFirestore() as Firestore;
  const [data, setData] = useState<T[] | null>(options.initialData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!firestore || !query) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        const permissionError = new FirestorePermissionError({
            path: query.path,
            operation: 'list',
          });
    
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, query]);

  return { data, loading, error };
}
