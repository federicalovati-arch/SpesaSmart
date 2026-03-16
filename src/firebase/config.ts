import type { FirebaseOptions } from 'firebase/app';

// This file is confidential and should not be shared with anyone.
// It's part of the build process and is not included in the final app bundle.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This is a temporary measure to allow the app to be compiled.
// You should create a `.env.local` file with your Firebase configuration.
if (
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey === 'change-me'
) {
  console.warn(
    'Firebase configuration is missing. The app will run in guest mode only. Please create a `.env.local` file with your Firebase project credentials to enable cloud features.'
  );
}


export function getFirebaseConfig(): FirebaseOptions | null {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'change-me') {
    return null;
  }
  return firebaseConfig;
}
