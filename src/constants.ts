import { Product, BaseProduct } from './types';

export const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    url: 'https://instagram.com/brainrotlabs',
    emoji: '📸',
    color: 'bg-pink-500 text-white',
    ariaLabel: 'Visita il nostro profilo Instagram',
  },
  {
    label: 'TikTok',
    url: 'https://tiktok.com/@brainrotlabs',
    emoji: '📱',
    color: 'bg-black text-white',
    ariaLabel: 'Visita il nostro profilo TikTok',
  },
  {
    label: 'X / Twitter',
    url: 'https://x.com/brainrotlabs',
    emoji: '🐦',
    color: 'bg-cyan-400 text-black',
    ariaLabel: 'Visita il nostro profilo X (Twitter)',
  },
] as const;

export const STORAGE_KEYS = {
  CART: 'brainrot_cart',
  ORDER_HISTORY: 'brainrot_order_history',
  TEMPLATES: 'brainrot_templates',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// BASE PRODUCTS — Printful-ready
// Only 2 customisable products: T-Shirt and iPhone 15 Pro Case.
// Variant IDs from Printful Catalog API (verified against catalog as of 2024).
// To refresh: GET https://api.printful.com/products/{printfulProductId}/variants
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_PRODUCTS: BaseProduct[] = [
  // ── Bella+Canvas 3001 Unisex T-Shirt (Printful Product 71) ─────────────────
  {
    id: 'base-tshirt',
    name: 'T-Shirt Bella+Canvas 3001',
    price: 28.00,
    // Neutral flat-lay product photo (stable CDN, no auth required)
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    category: 'wearable',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'White',            hex: '#FFFFFF' },
      { name: 'Black',            hex: '#000000' },
      { name: 'Athletic Heather', hex: '#B2BABB' },
      { name: 'Navy',             hex: '#1F305E' },
      { name: 'Red',              hex: '#EF3340' },
    ],
    // Front print area (chest): ~28% top, 25% left, 50% wide, 52% tall (on 800px image)
    overlay: { top: '28%', left: '25%', width: '50%', height: '52%', mixBlendMode: 'multiply' },
    printfulProductId: 71,
    printfulPlacement: 'front',
    printfulVariants: [
      // White
      { id: 4011, size: 'S',   colorName: 'White', colorHex: '#FFFFFF' },
      { id: 4012, size: 'M',   colorName: 'White', colorHex: '#FFFFFF' },
      { id: 4013, size: 'L',   colorName: 'White', colorHex: '#FFFFFF' },
      { id: 4014, size: 'XL',  colorName: 'White', colorHex: '#FFFFFF' },
      { id: 4015, size: '2XL', colorName: 'White', colorHex: '#FFFFFF' },
      // Black
      { id: 4017, size: 'S',   colorName: 'Black', colorHex: '#000000' },
      { id: 4018, size: 'M',   colorName: 'Black', colorHex: '#000000' },
      { id: 4019, size: 'L',   colorName: 'Black', colorHex: '#000000' },
      { id: 4020, size: 'XL',  colorName: 'Black', colorHex: '#000000' },
      { id: 4021, size: '2XL', colorName: 'Black', colorHex: '#000000' },
      // Athletic Heather
      { id: 4032, size: 'S',   colorName: 'Athletic Heather', colorHex: '#B2BABB' },
      { id: 4033, size: 'M',   colorName: 'Athletic Heather', colorHex: '#B2BABB' },
      { id: 4034, size: 'L',   colorName: 'Athletic Heather', colorHex: '#B2BABB' },
      { id: 4035, size: 'XL',  colorName: 'Athletic Heather', colorHex: '#B2BABB' },
      { id: 4036, size: '2XL', colorName: 'Athletic Heather', colorHex: '#B2BABB' },
      // Navy
      { id: 4066, size: 'S',   colorName: 'Navy', colorHex: '#1F305E' },
      { id: 4067, size: 'M',   colorName: 'Navy', colorHex: '#1F305E' },
      { id: 4068, size: 'L',   colorName: 'Navy', colorHex: '#1F305E' },
      { id: 4069, size: 'XL',  colorName: 'Navy', colorHex: '#1F305E' },
      { id: 4070, size: '2XL', colorName: 'Navy', colorHex: '#1F305E' },
      // Red
      { id: 4050, size: 'S',   colorName: 'Red', colorHex: '#EF3340' },
      { id: 4051, size: 'M',   colorName: 'Red', colorHex: '#EF3340' },
      { id: 4052, size: 'L',   colorName: 'Red', colorHex: '#EF3340' },
      { id: 4053, size: 'XL',  colorName: 'Red', colorHex: '#EF3340' },
      { id: 4054, size: '2XL', colorName: 'Red', colorHex: '#EF3340' },
    ],
  },

  // ── iPhone 15 Pro Snap Case (Printful Product 571) ──────────────────────────
  {
    id: 'base-phonecase',
    name: 'iPhone 15 Pro Case',
    price: 19.00,
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80',
    category: 'useless',
    sizes: ['15 Pro', '15 Pro Max'],
    colors: [
      { name: 'Glossy', hex: '#F5F5F5' },
      { name: 'Matte',  hex: '#E0E0E0' },
    ],
    // Full-bleed back surface: 5% margin all around
    // Use 'normal' blend mode (design IS the product, not overlaid on color)
    overlay: { top: '5%', left: '5%', width: '90%', height: '90%' },
    printfulProductId: 571,
    printfulPlacement: 'default',
    printfulVariants: [
      { id: 11534, size: '15 Pro',     colorName: 'Glossy', colorHex: '#F5F5F5' },
      { id: 11535, size: '15 Pro',     colorName: 'Matte',  colorHex: '#E0E0E0' },
      { id: 11536, size: '15 Pro Max', colorName: 'Glossy', colorHex: '#F5F5F5' },
      { id: 11537, size: '15 Pro Max', colorName: 'Matte',  colorHex: '#E0E0E0' },
    ],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'T-Shirt "This is Fine"',
    price: 29.99,
    image: 'https://i.imgflip.com/1iruch.jpg',
    category: 'wearable',
    memeDescription: 'Il cane nel fuoco che sorride. Stampa fronte ad alta resa su cotone 180g. Per chi affronta ogni lunedì con la stessa energia stoica e distaccata.',
    rarity: 'Epic',
    color: 'bg-orange-400',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Nero', hex: '#000000' }, { name: 'Bianco', hex: '#FFFFFF' }, { name: 'Arancione', hex: '#F97316' }]
  },
  {
    id: '2',
    name: 'Mug "Stonks"',
    price: 15.50,
    image: 'https://i.imgflip.com/2xscjb.png',
    category: 'useless',
    memeDescription: 'Tazza in ceramica 330ml con stampa perimetrale. Il grafico sale. Il tuo portafoglio no. Ma almeno il caffè è caldo e l\'ironia è gratuita.',
    rarity: 'Legendary',
    color: 'bg-cyan-400',
    sizes: ['330ml'],
    colors: [{ name: 'Bianco', hex: '#FFFFFF' }, { name: 'Nero', hex: '#000000' }]
  },
  {
    id: '3',
    name: 'Cuscino "Hide the Pain Harold"',
    price: 24.99,
    image: 'https://i.imgflip.com/1g8my4.jpg',
    category: 'decor',
    memeDescription: 'Harold sorride. Harold soffre. Stampa fronte-retro su cuscino 40x40cm con imbottitura inclusa. Il simbolo definitivo dell\'uomo che regge tutto in silenzio.',
    rarity: 'Rare',
    color: 'bg-yellow-400',
    sizes: ['40x40', '50x50'],
    colors: [{ name: 'Bianco', hex: '#FFFFFF' }]
  },
  {
    id: '4',
    name: 'Felpa "Doge"',
    price: 49.99,
    image: 'https://i.imgflip.com/4t0m5.jpg',
    category: 'wearable',
    memeDescription: 'Much wow. Very felpa. Cotone felpato 320g, stampa fronte ad alta saturazione. Calda come il supporto emotivo di un Shiba Inu che non ti giudica.',
    rarity: 'Common',
    color: 'bg-amber-300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Giallo Doge', hex: '#FCD34D' }, { name: 'Nero', hex: '#000000' }, { name: 'Grigio', hex: '#9CA3AF' }]
  },
  {
    id: '5',
    name: 'Poster "Woman Yelling at Cat"',
    price: 19.99,
    image: 'https://i.imgflip.com/345v97.jpg',
    category: 'decor',
    memeDescription: 'Stampa fine art su carta 200g, formato A3 o 50x70. Il contrasto tra caos umano e equanimità felina — un\'opera che fa conversazione e divide le famiglie.',
    rarity: 'Epic',
    color: 'bg-pink-400',
    sizes: ['A4', 'A3', '50x70'],
    colors: [{ name: 'Standard', hex: '#FFFFFF' }]
  },
  {
    id: '6',
    name: 'Tappetino Mouse "Chad"',
    price: 12.99,
    image: 'https://i.imgflip.com/5c7lwq.png',
    category: 'useless',
    memeDescription: 'Superficie microforata 60x30cm, base antiscivolo in gomma naturale. Il Chad ti osserva mentre lavori. Lui approva ogni tua decisione. Lui non dubita mai.',
    rarity: 'Legendary',
    color: 'bg-stone-400',
    sizes: ['60x30cm'],
    colors: [{ name: 'Standard', hex: '#FFFFFF' }]
  },
  {
    id: '7',
    name: 'Cover "Distracted Boyfriend"',
    price: 16.99,
    image: 'https://i.imgflip.com/1ur9b0.jpg',
    category: 'useless',
    memeDescription: 'Cover rigida con stampa UV resistente ai graffi. Compatibile con i modelli più diffusi. Per chi distrae l\'attenzione dal telefono... con un altro telefono.',
    rarity: 'Epic',
    color: 'bg-blue-400',
    sizes: ['iPhone 14', 'iPhone 15', 'Samsung S24'],
    colors: [{ name: 'Opaco', hex: '#F8F8F8' }, { name: 'Lucido', hex: '#FFFFFF' }]
  },
  {
    id: '8',
    name: 'T-Shirt "Success Kid"',
    price: 24.99,
    image: 'https://i.imgflip.com/1bhk.jpg',
    category: 'wearable',
    memeDescription: 'Stampa petto su cotone organico 180g. Il pugno chiuso, la mascella determinata. Per ogni piccola vittoria quotidiana che nessuno commemora — tranne te.',
    rarity: 'Rare',
    color: 'bg-green-400',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Verde', hex: '#4ADE80' }, { name: 'Bianco', hex: '#FFFFFF' }, { name: 'Nero', hex: '#000000' }]
  },
  {
    id: '9',
    name: 'Poster "Two Buttons"',
    price: 18.99,
    image: 'https://i.imgflip.com/1g8sqw.jpg',
    category: 'decor',
    memeDescription: 'Stampa fine art 200g. Due bottoni. Entrambi importanti. Nessuno dei due chiaramente giusto. Un manifesto esistenziale per chi prende decisioni — o finge di farlo.',
    rarity: 'Common',
    color: 'bg-red-400',
    sizes: ['A4', 'A3'],
    colors: [{ name: 'Standard', hex: '#FFFFFF' }]
  }
];
