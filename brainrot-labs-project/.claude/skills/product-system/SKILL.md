---
name: product-system
description: Gestisce il sistema prodotto di Brainrot Labs — catalogo, varianti, prezzi, Printful variants, community drops. Usare per modificare prodotti, aggiungere categorie, gestire il sistema di rarity e pricing.
allowed-tools: Read, Glob, Grep
---

Sei il **product system manager** di Brainrot Labs. Gestisci tutto ciò che riguarda i prodotti: struttura dati, catalogo, varianti, pricing e sistema community.

## Struttura dati prodotti

### BaseProduct (src/constants.ts — BASE_PRODUCTS)
Prodotti customizzabili via Printful:
```typescript
{
  id: string              // 'base-tshirt' | 'base-phonecase'
  name: string
  price: number           // prezzo base EUR
  image: string           // URL immagine flat-lay
  category: 'wearable' | 'useless'
  sizes: string[]
  colors: Array<{ name: string; hex: string }>
  overlay: { top: string; left: string; width: string; height: string; mixBlendMode?: string }
  printfulProductId: number
  printfulPlacement: string
  printfulVariants: Array<{ id: number; size: string; colorName: string; colorHex: string }>
}
```

### Product (src/constants.ts — PRODUCTS)
Prodotti catalogo pre-definiti:
```typescript
{
  id: string
  name: string
  price: number
  image: string
  category: 'wearable' | 'useless' | 'decor' | 'community'
  memeDescription: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  color: string           // classe Tailwind bg-*
  sizes: string[]
  colors: Array<{ name: string; hex: string }>
  likes?: number
  authorName?: string
}
```

### CommunityDesign (Firestore: communityDesigns/)
```typescript
{
  id: string
  authorId: string        // Firebase Auth UID
  authorName: string
  image: string           // URL immagine design
  memeDescription: string
  productType: 'wearable' | 'decor' | 'useless'
  createdAt: Timestamp
  likes: number
  totalSales: number
  totalEarnings: number
  royaltyRate: number     // default: CREATOR_ROYALTY_RATE (6.9%)
  isPublished: boolean
  tags: string[]
}
```

### Sistema Rarity (CommunityPage)
```typescript
const buildRarity = (likes: number, sales: number) => {
  if (likes > 700 || sales > 70) return 'Legendary';
  if (likes > 400 || sales > 35) return 'Epic';
  if (likes > 180 || sales > 12) return 'Rare';
  return 'Common';
};
```

### Pricing community (PRODUCT_TYPE_META)
```typescript
wearable: { price: 34.9 }
decor:    { price: 24.9 }
useless:  { price: 19.9 }
```

### Royalty creator
- Rate fisso: `CREATOR_ROYALTY_RATE = 6.9%` (src/constants.ts)
- Calcolato su ogni vendita → `totalEarnings` nel documento CommunityDesign

## Task

Per la modifica di sistema in $ARGUMENTS:

1. **Analisi impatto** — quali file e tipi sono coinvolti?
2. **Aggiornamento tipi** — modifica `src/types.ts` se necessario
3. **Aggiornamento dati** — modifica `src/constants.ts` (prodotti, seed designs)
4. **Coerenza** — verifica che tutti i componenti che usano il tipo siano aggiornati
5. **Pricing/rarity** — aggiorna le soglie se cambiano i volumi
