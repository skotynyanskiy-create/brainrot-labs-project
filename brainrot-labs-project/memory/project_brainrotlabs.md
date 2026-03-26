---
name: Brainrot Labs - Stato Progetto
description: Stato attuale del progetto e-commerce meme con royalty system implementato
type: project
---

Progetto e-commerce meme (React 19 + Firebase + Three.js + Tailwind).

**Why:** Creator economy con royalty al 12% su ogni vendita di design community.

**How to apply:** Quando si lavora su nuove feature, rispettare il design brutalist (bordi 4-8px neri, shadow offset, colori: giallo #FCD34D, cyan, pink, verde per earnings).

Implementazioni completate (2026-03-24):
- types.ts: CommunityDesign esteso con totalSales, totalEarnings, royaltyRate (12%), isPublished, tags, productType
- HowItWorks.tsx: Redesign 5-step workflow (Scegli → Crea → 3D → Acquista → Pubblica & Guadagna) con banner royalty verde
- CommunityPage.tsx: Redesign completo con Creator Spotlight, stats hero (designs, likes, vendite, royalty pagate), sort tabs (top/new/trending/underground), royalty info panel, come funzionano le royalty section
- ProfileDashboard.tsx: Aggiunto tab "Royalty & Guadagni" con stats (guadagnato/vendite/like/tasso), breakdown per-design, info banner
- ProductContext.tsx: Fallback data estesa a 6 design con tutti i campi royalty popolati
