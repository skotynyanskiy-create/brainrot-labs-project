import { initializeApp } from 'firebase/app';
import type {
  User as FirebaseUser
} from 'firebase/auth';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, startAfter, getDocFromServer, Timestamp, serverTimestamp, increment } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { env } from './config/env';
import { logger } from './utils/logger';

// Initialize Firebase SDK using environment variables
const app = initializeApp(env.firebase);
export const db = getFirestore(app, env.firebase.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);

  // Log dettagliato solo in sviluppo
  if (env.isDev) {
    logger.error('Firestore Error', { operationType, path, message });
  }

  // Messaggio generico al client — nessun dato sensibile esposto
  throw new Error(`Operazione "${operationType}" fallita. Riprova tra qualche istante.`);
}

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (env.isDev) {
        logger.error('Firebase offline — controlla la configurazione.');
      }
    }
  }
}
testConnection();

export {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  increment,
};
export type { FirebaseUser, DocumentSnapshot };
