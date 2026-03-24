import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, getDoc, setDoc, FirebaseUser } from '../firebase';
import { useToast } from './ToastContext';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'client',
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch {
          addToast('Errore nel caricamento del profilo. Riprova.');
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [addToast]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      addToast('Accesso fallito. Riprova o controlla il pop-up del browser.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      addToast('Errore durante il logout. Riprova.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
