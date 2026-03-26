import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  FirebaseUser
} from '../firebase';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  db,
  doc,
  getDoc,
  setDoc
} from '../firebase';
import { useToast } from './ToastContext';
import type { UserProfile } from '../types';
import { DEFAULT_PAYOUT_SETUP, DEFAULT_ROYALTY_WALLET, DEFAULT_TAX_PROFILE } from '../services/payouts/payoutConfig';
import { DEFAULT_LEGAL_ACCEPTANCES } from '../services/legal/legalConfig';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoUser: boolean;
  login: () => Promise<void>;
  loginAsDemo: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (params: { displayName: string; email: string; password: string }) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  saveProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DEMO_AUTH_STORAGE_KEY = 'brainrot_demo_auth';
const DEMO_PROFILE_STORAGE_KEY = 'brainrot_demo_profile';
const isDevMode = import.meta.env.DEV;

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: string }).code) : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenziali non valide. Controlla email e password.';
    case 'auth/email-already-in-use':
      return 'Questa email è già registrata.';
    case 'auth/weak-password':
      return 'Password troppo debole. Usa almeno 6 caratteri.';
    case 'auth/operation-not-allowed':
      return 'Provider non abilitato in Firebase Authentication. Attiva Email/Password o Google nella console.';
    case 'auth/unauthorized-domain':
      return 'Dominio non autorizzato per il login. Aggiungi questo host nei domini autorizzati di Firebase Auth.';
    case 'auth/popup-closed-by-user':
      return 'Popup di accesso chiuso prima del completamento.';
    default:
      return fallback;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<FirebaseUser | null>(null);
  const [demoProfile, setDemoProfile] = useState<UserProfile | null>(null);
  const { addToast } = useToast();

  const buildDefaultProfile = (firebaseUser: FirebaseUser, authProvider: 'google' | 'password'): UserProfile => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: 'client',
    username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.slice(0, 8),
    creatorTagline: '',
    newsletterOptIn: false,
    creatorCategory: 'creator',
    legalName: firebaseUser.displayName || '',
    location: '',
    portfolioUrl: '',
    socialHandle: '',
    payoutEmail: firebaseUser.email ?? '',
    authProvider,
    createdAt: new Date().toISOString(),
    payoutSetup: {
      ...DEFAULT_PAYOUT_SETUP,
    },
    taxProfile: {
      ...DEFAULT_TAX_PROFILE,
      legalName: firebaseUser.displayName || '',
    },
    royaltyWallet: {
      ...DEFAULT_ROYALTY_WALLET,
    },
    legalAcceptances: {
      ...DEFAULT_LEGAL_ACCEPTANCES,
    },
    shippingAddress: {
      fullName: firebaseUser.displayName || '',
      address1: '',
      city: '',
      province: '',
      zip: '',
      country: 'Italia',
      phone: '',
    },
  });

  useEffect(() => {
    if (!isDevMode) return;

    const savedDemoProfile = localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    const isDemoEnabled = localStorage.getItem(DEMO_AUTH_STORAGE_KEY) === 'true';
    if (!isDemoEnabled) return;

    const fallbackDemoUser = {
      uid: 'demo_localhost_user',
      email: 'demo@localhost',
      displayName: 'Demo Creator',
      photoURL: null,
      providerData: [{ providerId: 'password' }],
    } as unknown as FirebaseUser;

    if (savedDemoProfile) {
      try {
        const parsedDemoProfile = JSON.parse(savedDemoProfile) as UserProfile;
        queueMicrotask(() => {
          setDemoUser(fallbackDemoUser);
          setDemoProfile(parsedDemoProfile);
          setLoading(false);
        });
        return;
      } catch (error) {
        void error;
      }
    }

    const nextDemoProfile: UserProfile = {
      ...buildDefaultProfile(fallbackDemoUser, 'password'),
      displayName: 'Demo Creator',
      role: 'creator',
      username: 'demo_creator',
      creatorTagline: 'Meme designer indipendente con setup payout pronto per il go-live.',
      bio: 'Profilo demo locale per revisionare la dashboard account, il workflow creator e le sezioni ordini/royalty.',
      creatorCategory: 'Visual meme creator',
      legalName: 'Demo Creator Studio',
      location: 'Milano, Italia',
      portfolioUrl: 'https://demo-creator.local',
      socialHandle: '@demo_creator',
      payoutEmail: 'demo@localhost',
      newsletterOptIn: true,
      authProvider: 'password',
      payoutSetup: {
        provider: 'stripe_connect',
        status: 'pending_verification',
        accountId: 'acct_demo_localhost',
        accountLabel: 'Demo Creator Studio',
        payoutCurrency: 'EUR',
        minimumPayoutAmount: 25,
        onboardingReady: true,
        connectedAt: new Date().toISOString(),
      },
      taxProfile: {
        legalName: 'Demo Creator Studio',
        businessType: 'individual',
        taxCountry: 'Italia',
        taxId: 'TSTXXX00A00X000X',
        vatId: '',
      },
      royaltyWallet: {
        available: 18.4,
        pending: 8,
        paidTotal: 124.3,
        nextPayoutEstimate: '2026-04-05',
        lastPayoutAt: '2026-03-10',
      },
      legalAcceptances: {
        creatorTerms: {
          accepted: true,
          version: '2026-03',
          acceptedAt: '2026-03-01T10:00:00.000Z',
        },
        royaltyPolicy: {
          accepted: true,
          version: '2026-03',
          acceptedAt: '2026-03-01T10:00:00.000Z',
        },
      },
    };

    localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(nextDemoProfile));
    queueMicrotask(() => {
      setDemoUser(fallbackDemoUser);
      setDemoProfile(nextDemoProfile);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const authProvider = firebaseUser.providerData.some((provider) => provider.providerId === 'password')
            ? 'password'
            : 'google';

          if (userDoc.exists()) {
            const existingProfile = userDoc.data() as UserProfile;
            const normalizedProfile: UserProfile = {
              ...buildDefaultProfile(firebaseUser, authProvider),
              ...existingProfile,
            };
            setUserProfile(normalizedProfile);
          } else {
            const newProfile = buildDefaultProfile(firebaseUser, authProvider);
            try {
              await setDoc(userDocRef, newProfile);
            } catch {
              addToast('Login riuscito, ma il profilo account non può essere salvato finché le regole Firestore non vengono aggiornate.');
            }
            setUserProfile(newProfile);
          }
        } catch {
          addToast('Login eseguito, ma il profilo account non è leggibile con le regole Firestore attuali.');
          setUserProfile(buildDefaultProfile(firebaseUser, 'google'));
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
    } catch (error) {
      addToast(getAuthErrorMessage(error, 'Accesso fallito. Riprova o controlla il pop-up del browser.'));
    }
  };

  const loginAsDemo = () => {
    if (!isDevMode) return;

    const nextDemoUser = {
      uid: 'demo_localhost_user',
      email: 'demo@localhost',
      displayName: 'Demo Creator',
      photoURL: null,
      providerData: [{ providerId: 'password' }],
    } as unknown as FirebaseUser;

    const nextDemoProfile: UserProfile = demoProfile ?? {
      ...buildDefaultProfile(nextDemoUser, 'password'),
      displayName: 'Demo Creator',
      role: 'creator',
      username: 'demo_creator',
      creatorTagline: 'Meme designer indipendente con setup payout pronto per il go-live.',
      bio: 'Profilo demo locale per revisionare la dashboard account, il workflow creator e le sezioni ordini/royalty.',
      creatorCategory: 'Visual meme creator',
      legalName: 'Demo Creator Studio',
      location: 'Milano, Italia',
      portfolioUrl: 'https://demo-creator.local',
      socialHandle: '@demo_creator',
      payoutEmail: 'demo@localhost',
      newsletterOptIn: true,
      authProvider: 'password',
      payoutSetup: {
        provider: 'stripe_connect',
        status: 'pending_verification',
        accountId: 'acct_demo_localhost',
        accountLabel: 'Demo Creator Studio',
        payoutCurrency: 'EUR',
        minimumPayoutAmount: 25,
        onboardingReady: true,
        connectedAt: new Date().toISOString(),
      },
      taxProfile: {
        legalName: 'Demo Creator Studio',
        businessType: 'individual',
        taxCountry: 'Italia',
        taxId: 'TSTXXX00A00X000X',
        vatId: '',
      },
      royaltyWallet: {
        available: 18.4,
        pending: 8,
        paidTotal: 124.3,
        nextPayoutEstimate: '2026-04-05',
        lastPayoutAt: '2026-03-10',
      },
      legalAcceptances: {
        creatorTerms: {
          accepted: true,
          version: '2026-03',
          acceptedAt: '2026-03-01T10:00:00.000Z',
        },
        royaltyPolicy: {
          accepted: true,
          version: '2026-03',
          acceptedAt: '2026-03-01T10:00:00.000Z',
        },
      },
    };

    localStorage.setItem(DEMO_AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(nextDemoProfile));
    setDemoUser(nextDemoUser);
    setDemoProfile(nextDemoProfile);
    setLoading(false);
    addToast('Accesso demo locale attivato.');
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      addToast(getAuthErrorMessage(error, 'Accesso email/password fallito. Controlla le credenziali.'));
      return false;
    }
  };

  const registerWithEmail = async ({ displayName, email, password }: { displayName: string; email: string; password: string }) => {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim()) {
        await updateProfile(credentials.user, { displayName: displayName.trim() });
      }

      const nextProfile: UserProfile = {
        ...buildDefaultProfile(credentials.user, 'password'),
        displayName: displayName.trim() || credentials.user.displayName,
        username: email.split('@')[0],
        payoutEmail: email,
      };

      try {
        await setDoc(doc(db, 'users', credentials.user.uid), nextProfile, { merge: true });
      } catch {
        addToast('Account creato, ma il profilo esteso non può ancora essere salvato con le regole Firestore attuali.');
      }
      setUserProfile(nextProfile);
      addToast('Account creato correttamente.');
      return true;
    } catch (error) {
      addToast(getAuthErrorMessage(error, 'Registrazione fallita. Verifica email e password.'));
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      addToast('Email di reset inviata.');
      return true;
    } catch (error) {
      addToast(getAuthErrorMessage(error, 'Impossibile inviare il reset password.'));
      return false;
    }
  };

  const saveProfile = async (updates: Partial<UserProfile>) => {
    const activeUser = demoUser || user;
    const activeProfile = demoProfile || userProfile;

    if (!activeUser) {
      addToast('Devi essere autenticato per aggiornare il profilo.');
      return false;
    }

    if (demoUser) {
      const nextProfile: UserProfile = {
        ...(activeProfile || buildDefaultProfile(activeUser, 'password')),
        ...updates,
      };
      localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      setDemoProfile(nextProfile);
      addToast('Profilo demo aggiornato in locale.');
      return true;
    }

    try {
      const liveUser = user as FirebaseUser;
      const normalizedDisplayName = updates.displayName !== undefined
        ? (typeof updates.displayName === 'string' ? updates.displayName.trim() || null : updates.displayName)
        : (userProfile?.displayName ?? liveUser.displayName);
      const normalizedPhotoURL = updates.photoURL !== undefined
        ? (typeof updates.photoURL === 'string' ? updates.photoURL.trim() || null : updates.photoURL)
        : (userProfile?.photoURL ?? liveUser.photoURL);

      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        const nextAuthDisplayName = updates.displayName !== undefined
          ? (typeof updates.displayName === 'string' ? updates.displayName.trim() || null : updates.displayName)
          : liveUser.displayName;
        const nextAuthPhotoURL = updates.photoURL !== undefined
          ? (typeof updates.photoURL === 'string' ? updates.photoURL.trim() || null : updates.photoURL)
          : liveUser.photoURL;

        if (nextAuthDisplayName !== liveUser.displayName || nextAuthPhotoURL !== liveUser.photoURL) {
          await updateProfile(liveUser, {
            displayName: nextAuthDisplayName,
            photoURL: nextAuthPhotoURL,
          });
        }
      }

      const nextProfile: UserProfile = {
        ...(userProfile || buildDefaultProfile(liveUser, 'google')),
        ...updates,
        displayName: normalizedDisplayName,
        photoURL: normalizedPhotoURL,
      };

      await setDoc(doc(db, 'users', liveUser.uid), nextProfile, { merge: true });
      setUserProfile(nextProfile);
      addToast('Profilo aggiornato.');
      return true;
    } catch {
      addToast('Aggiornamento profilo fallito. Se il login funziona ma il salvataggio no, devi pubblicare le nuove regole Firestore.');
      return false;
    }
  };

  const logout = async () => {
    if (demoUser) {
      localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
      setDemoUser(null);
      setDemoProfile(null);
      return;
    }

    try {
      await signOut(auth);
    } catch {
      addToast('Errore durante il logout. Riprova.');
    }
  };

  const activeUser = demoUser || user;
  const activeProfile = demoProfile || userProfile;
  const isDemoUser = Boolean(demoUser);

  return (
    <AuthContext.Provider value={{ user: activeUser, userProfile: activeProfile, loading, isDemoUser, login, loginAsDemo, loginWithEmail, registerWithEmail, resetPassword, saveProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
