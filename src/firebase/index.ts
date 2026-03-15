import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getFirebaseConfig } from './config';

// Provides the Firebase app, auth, and firestore instances.
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length
    ? apps[0]
    : initializeApp(getFirebaseConfig());

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}

export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useFirebaseApp, useAuth, useFirestore, useFirebase } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
