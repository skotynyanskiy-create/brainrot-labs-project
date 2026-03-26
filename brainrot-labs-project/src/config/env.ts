const required = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Variabile d'ambiente obbligatoria mancante: ${key}`);
  }
  return value;
};

export const env = {
  firebase: {
    apiKey: required('VITE_FIREBASE_API_KEY'),
    authDomain: required('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: required('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: required('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: required('VITE_FIREBASE_APP_ID'),
    firestoreDatabaseId: required('VITE_FIREBASE_FIRESTORE_DB_ID'),
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  },
  isDev: import.meta.env.DEV as boolean,
};
