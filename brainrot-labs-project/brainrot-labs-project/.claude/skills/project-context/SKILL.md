---
name: project-context
description: Carica e mantiene il contesto completo del progetto Brainrot Labs. Da usare all'inizio di ogni sessione o quando serve riallinearsi su stack, architettura e stato attuale.
user-invocable: false
allowed-tools: Read, Glob, Grep
---

## Brainrot Labs — Contesto Progetto

### Identità
Brand digitale moderno: e-commerce (abbigliamento + gadget personalizzati), esperienze interattive 3D, design premium e meme culture.

**Obiettivo**: ecosistema visivamente premium, altamente convertente, scalabile.
**Target**: 16–35 anni, digital-first, appassionati di design e personalizzazione.

### Stack tecnico
- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Animazioni**: Framer Motion (`motion/react`)
- **Backend**: Firebase Cloud Functions (Node.js gen1)
- **Database**: Firestore (custom DB: `ai-studio-50ddb2ab-7a71-4615-9174-eabd05b5b4bd`)
- **Auth**: Firebase Auth (Google OAuth)
- **AI**: Google Gemini (`@google/genai`)
- **Fulfillment**: Printful API (print-on-demand) — fallback MockProvider se API key vuota

### Design system — Brutalist Neomorph
- `border-4 border-black` (sezioni hero: `border-8`)
- `shadow-[Xpx_Xpx_0_0_rgba(0,0,0,1)]` — mai box-shadow standard
- Hover: `hover:translate-x-[Xpx] hover:translate-y-[Xpx] hover:shadow-[reduced]`
- Titoli: `font-black uppercase tracking-tighter`
- Label/badge: `font-mono uppercase tracking-[0.2em]`
- Palette: `#000`, `#fff`, `cyan-400`, `yellow-400`, `pink-500`, `green-400`
- Spaziatura generosa: `py-16 md:py-20`, `gap-6+`
- Animazioni: Framer Motion sempre — `whileHover`, stagger children, `useInView`

### Regole di sviluppo
- TypeScript strict — nessun `any` esplicito
- Errori → sempre `useToast()`, mai silenziosi
- `console.*` → solo via `src/utils/logger.ts`
- localStorage → try-catch + chiavi in `STORAGE_KEYS` (constants.ts)
- Error Boundaries su: ProductCustomizer, CartDrawer, CommunityPage, ProfileDashboard

### Architettura chiave
```
src/
  components/customizer/   # ProductCustomizer, Product3DPreview, BrainrotMeter, Soundboard
  components/layout/       # Header, Footer, CartDrawer
  components/product/      # ProductCard, ProductView, ProductGridSection, CommunityProductCard
  components/sections/     # Hero, CommunityPage, ProfileDashboard, FAQ, Features, ...
  components/ui/           # Button, Card, Badge, Toast, ErrorBoundary, Confetti, ...
  context/                 # ProductContext, CartContext, AuthContext, UIContext, ToastContext
  services/integrations/   # IntegrationService → PrintfulProvider | MockProvider
  utils/                   # logger, sounds, cn
  constants.ts             # BASE_PRODUCTS, PRODUCTS, MEME_BASES, STORAGE_KEYS
  types.ts                 # Interfacce TypeScript
  firebase.ts              # Init Firebase SDK + handleFirestoreError
```

### Stato noto (issues aperti)
- `CommunityGallery.tsx` — dead code (316 righe, mai importato)
- `ProfileDashboard.tsx` — 4x `as any`, 3x storage key hardcoded
- Like system — display only, nessuna scrittura su Firestore
- `CLAUDE.md` note: alcune già risolte nella sessione corrente
