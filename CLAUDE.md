# Brainrot Labs — CLAUDE.md

## Progetto
E-commerce di merchandise a tema meme con AI generativa (Gemini), customizer 3D (Three.js) e community. Full-stack: React SPA + Firebase Cloud Functions.

## Stack
- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Animazioni**: Framer Motion (motion)
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firestore (NoSQL)
- **Auth**: Firebase Auth (Google OAuth)
- **AI**: Google Gemini (`@google/genai`)
- **Fulfillment**: Printful API (print-on-demand)

## Comandi principali
```bash
npm run dev          # Dev server su http://localhost:5173
npm run build        # Build produzione → dist/
npm run preview      # Preview build locale
npm run lint         # TypeScript type check (tsc --noEmit)
firebase deploy      # Deploy hosting + functions (dopo build)
firebase deploy --only firestore:rules   # Solo regole Firestore
firebase deploy --only functions         # Solo Cloud Functions
firebase deploy --only hosting           # Solo frontend
```

## Struttura chiave
```
src/
  components/
    customizer/    # ProductCustomizer, Product3DPreview, BrainrotMeter, Soundboard
    layout/        # Header, Footer, CartDrawer, HomeView
    product/       # ProductCard, ProductView, ProductGridSection
    sections/      # Hero, CommunityPage, ProfileDashboard, FAQ, Features, ...
    ui/            # Button, Card, Badge, Toast, ErrorBoundary, Confetti, ...
  context/         # ProductContext, CartContext, AuthContext, UIContext, ToastContext
  services/
    integrations/  # IntegrationService → PrintfulProvider | MockProvider
  hooks/           # useDynamicCursor
  utils/           # sounds, cn, firestoreErrorHandler (duplica firebase.ts)
  config/          # env.ts (da creare)
  constants.ts     # BASE_PRODUCTS, PRODUCTS, STORAGE_KEYS (da aggiungere)
  types.ts         # Interfacce TypeScript
  firebase.ts      # Init Firebase SDK

functions/
  index.ts         # processOrder, generateMemeImage, suggestMemeCaptions
```

## Variabili d'ambiente richieste
### Frontend (.env) — prefix VITE_
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FIRESTORE_DB_ID=
VITE_SENTRY_DSN=        # opzionale, per error tracking
```

### Cloud Functions (.env nella cartella functions/)
```
GEMINI_API_KEY=
PRINTFUL_API_KEY=       # se vuoto → usa MockProvider
APP_URL=
```

## Regole di sviluppo
- TypeScript strict mode — nessun `any` esplicito
- Errori silenziosi vietati — usare sempre `useToast()` per notificare l'utente
- `console.log/error` solo in sviluppo — usare `src/utils/logger.ts`
- localStorage sempre con try-catch e schema validation
- Tutte le chiavi di storage in `STORAGE_KEYS` (constants.ts)
- Error boundaries intorno a: ProductCustomizer, CartDrawer, CommunityPage, ProfileDashboard

## Decisioni architetturali
- **MockProvider**: si attiva automaticamente se `PRINTFUL_API_KEY` è vuota — utile per sviluppo
- **Firebase config**: migrata da `firebase-applet-config.json` a variabili VITE_ (Fase 1)
- **Admin access**: solo tramite `role == 'admin'` in Firestore — email hardcoded rimossa
- **Rate limiting AI**: Firestore counter per utente (max chiamate/giorno)

## Deploy target
- **Hosting**: Firebase Hosting (`gen-lang-client-0894248501`)
- **Database**: Firestore custom DB (`ai-studio-50ddb2ab-7a71-4615-9174-eabd05b5b4bd`)
- **Functions**: Firebase Cloud Functions gen1

## Note importanti
- `firebase-admin` e `firebase-functions` appartengono SOLO a `functions/` — non al bundle frontend
- `src/utils/firestoreErrorHandler.ts` duplica codice di `src/firebase.ts` — da unificare
- `lazy`/`Suspense` importati in `App.tsx` ma non usati — da implementare per code splitting
- Le immagini prodotto provengono da servizi esterni (Unsplash, imgflip) — dipendenza fragile
