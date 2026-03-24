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

export const BASE_PRODUCTS: BaseProduct[] = [
  {
    id: 'base-tshirt',
    name: 'T-Shirt Bianca',
    price: 25.00,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    category: 'wearable',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Bianco', hex: '#FFFFFF' }],
    overlay: { top: '35%', left: '35%', width: '30%', height: '40%', mixBlendMode: 'multiply' }
  },
  {
    id: 'base-hoodie',
    name: 'Felpa Nera',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    category: 'wearable',
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Nero', hex: '#000000' }],
    overlay: { top: '38%', left: '35%', width: '30%', height: '35%', mixBlendMode: 'screen' }
  },
  {
    id: 'base-mug',
    name: 'Tazza in Ceramica',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',
    category: 'useless',
    overlay: { top: '30%', left: '25%', width: '40%', height: '40%', mixBlendMode: 'multiply' }
  },
  {
    id: 'base-phonecase',
    name: 'Cover Telefono',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80',
    category: 'useless',
    overlay: { top: '20%', left: '25%', width: '50%', height: '60%', mixBlendMode: 'multiply' }
  },
  {
    id: 'base-poster',
    name: 'Poster Incorniciato',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?auto=format&fit=crop&w=800&q=80',
    category: 'decor',
    sizes: ['A4', 'A3', '50x70'],
    overlay: { top: '15%', left: '18%', width: '64%', height: '70%' }
  },
  {
    id: 'base-mousepad',
    name: 'Tappetino Mouse',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    category: 'useless',
    overlay: { top: '10%', left: '10%', width: '80%', height: '80%', mixBlendMode: 'multiply' }
  }
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
