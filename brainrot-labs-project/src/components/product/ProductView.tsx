import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BarChart3,
  Copy,
  DollarSign,
  Facebook,
  Heart,
  MessageCircle,
  Plus,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
  Wand2,
  X,
  ZoomIn,
} from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';
import { useProduct } from '../../context/ProductContext';
import { CREATOR_ROYALTY_RATE, MEME_BASES } from '../../constants';
import { playBlipSound, playCoinSound } from '../../utils/sounds';

interface ProductViewProps {
  product: Product;
  onBack: () => void;
}

const getMemeBaseForProduct = (productId: string) => {
  const seed = productId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return MEME_BASES[seed % MEME_BASES.length];
};

export default function ProductView({ product, onBack }: ProductViewProps) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { setIsCustomizerOpen } = useUI();
  const { communityDesigns } = useProduct();

  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const communityDesign = useMemo(
    () => communityDesigns.find((design) => design.id === product.id),
    [communityDesigns, product.id]
  );

  const isCommunityProduct = product.category === 'community' && Boolean(communityDesign);
  const totalSales = communityDesign?.totalSales || 0;
  const totalEarnings = communityDesign?.totalEarnings || 0;
  const royaltyRate = communityDesign?.royaltyRate || CREATOR_ROYALTY_RATE;
  const memeBase = useMemo(() => getMemeBaseForProduct(product.id), [product.id]);
  const tags = useMemo(
    () => [...new Set([...(communityDesign?.tags || []), ...memeBase.tags, memeBase.category])],
    [communityDesign?.tags, memeBase]
  );

  const galleryImages = useMemo(() => {
    const candidates = isCommunityProduct
      ? [memeBase.url, communityDesign?.image, product.customData?.designTextureUrl]
      : [product.image, communityDesign?.image, product.customData?.designTextureUrl];

    return Array.from(new Set(candidates.filter(Boolean) as string[]));
  }, [communityDesign, isCommunityProduct, memeBase.url, product]);

  const reviews = useMemo(() => {
    if (isCommunityProduct) {
      return [
        {
          id: `${product.id}-review-1`,
          name: 'Marta B.',
          role: 'Acquirente community',
          rating: 5,
          text: 'La scheda del design è finalmente chiara: capisco subito autore, supporto, numeri e resa finale.',
        },
        {
          id: `${product.id}-review-2`,
          name: 'Riccardo F.',
          role: 'Cliente verificato',
          rating: 5,
          text: 'Ottima distinzione tra design community e prodotto base. Il flusso adesso ha senso anche lato acquisto.',
        },
        {
          id: `${product.id}-review-3`,
          name: 'Giulia T.',
          role: 'Supporter creator',
          rating: 4,
          text: 'Mi piace vedere royalty, vendite e creator in un unico posto. Rende il design molto più credibile.',
        },
      ];
    }

    return [
      {
        id: `${product.id}-review-1`,
        name: 'Arianna P.',
        role: 'Cliente verificata',
        rating: 5,
        text: `Il visual di ${product.name} e coerente con la scheda: stampa leggibile, materiali solidi e nessun effetto mock casuale.`,
      },
      {
        id: `${product.id}-review-2`,
        name: 'Davide M.',
        role: 'Repeat buyer',
        rating: 5,
        text: 'Packaging pulito e una pagina prodotto che racconta il risultato reale. Nessuna immagine riempitiva fuori contesto.',
      },
      {
        id: `${product.id}-review-3`,
        name: 'Sara T.',
        role: 'Fan della collection',
        rating: 4,
        text: 'Si vede attenzione su copy, visual e resa finale. Il prodotto resta ironico ma la presentazione è molto più credibile del merch medio.',
      },
    ];
  }, [isCommunityProduct, product.id, product.name]);

  const averageRating = useMemo(
    () => reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    [reviews]
  );

  const selectedImage = galleryImages[selectedImageIndex] || product.image;

  const handleAddToCart = () => {
    playCoinSound();
    addToCart(product, quantity, selectedSize, selectedColor);
    addToast(isCommunityProduct ? 'Design aggiunto al carrello.' : 'Prodotto aggiunto al carrello.');
  };

  const handleOpenCustomizer = () => {
    playBlipSound();
    setIsCustomizerOpen(true);
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    playBlipSound();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Guarda questo prodotto: ${product.name}`);

    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copiato.');
      return;
    }

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const infoCards = isCommunityProduct
    ? [
        {
          icon: UserRound,
          title: 'Base meme esplicita',
          text: `Questo remix parte dal template ${memeBase.name}. La scheda tiene visibile la base usata, non solo il supporto finale.`,
          color: 'bg-yellow-400',
        },
        {
          icon: BarChart3,
          title: 'Remix leggibile',
          text: `Autore, base meme, supporto e performance stanno nello stesso flusso, senza staccare il contenuto dal contesto community.`,
          color: 'bg-cyan-400',
        },
        {
          icon: DollarSign,
          title: 'Royalty attive',
          text: `Questo remix segue il modello creator con rate del ${royaltyRate.toFixed(1)}% su ogni vendita pubblicata.`,
          color: 'bg-green-400',
        },
      ]
    : [
        {
          icon: ShieldCheck,
          title: 'Qualità di stampa',
          text: 'Visual leggibile, supporto coerente e resa pensata per il prodotto selezionato.',
          color: 'bg-cyan-400',
        },
        {
          icon: Truck,
          title: 'Produzione on demand',
          text: 'Checkout, produzione e tracking seguono il flusso reale del laboratorio.',
          color: 'bg-green-400',
        },
        {
          icon: MessageCircle,
          title: 'Scheda chiara',
          text: 'Copy, immagini e dettagli puntano allo stesso risultato, senza riempitivi scollegati.',
          color: 'bg-pink-400',
        },
      ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative z-40 min-h-screen bg-[#f7f7f7] px-6 pb-16 pt-24 text-black md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => { playBlipSound(); onBack(); }}
            aria-label="Torna indietro"
            className="mb-8 flex w-max items-center gap-2 border-4 border-black bg-white px-4 py-3 text-sm font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-yellow-400 hover:shadow-none md:mb-12 md:px-6 md:text-base"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
            Torna indietro
          </button>

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-6">
              <div className="group overflow-hidden border-4 border-black bg-white p-3 shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:border-8 md:p-5">
                <div className={`relative overflow-hidden border-4 border-black ${product.color}`}>
                  <img
                    src={selectedImage}
                    alt={`${product.name} anteprima ${selectedImageIndex + 1}`}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    aria-label="Apri zoom"
                    className="absolute right-4 top-4 border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-400 hover:shadow-none"
                  >
                    <ZoomIn className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => { playBlipSound(); setSelectedImageIndex(index); }}
                    aria-label={`Seleziona immagine ${index + 1}`}
                    className={`overflow-hidden border-4 border-black bg-white p-1 md:p-2 ${selectedImageIndex === index ? 'translate-x-[4px] translate-y-[4px] bg-yellow-400 shadow-none' : 'shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
                  >
                    <img src={image} alt="" aria-hidden="true" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {infoCards.map((card) => (
                  <div key={card.title} className={`border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${card.color}`}>
                    <card.icon className="mb-3 h-8 w-8" />
                    <p className="text-sm font-black uppercase md:text-base">{card.title}</p>
                    <p className="mt-2 text-xs font-mono font-bold opacity-90 md:text-sm">{card.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6 md:gap-8">
              <div className="border-4 border-black bg-white p-6 shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:border-8 md:p-10">
                <div className="mb-6 flex flex-wrap gap-3">
                  <div className="inline-flex rotate-[-2deg] border-4 border-black bg-cyan-400 px-4 py-1.5 text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:text-sm">
                    {isCommunityProduct ? 'Base meme community' : `Drop: ${product.rarity}`}
                  </div>
                  {isCommunityProduct && (
                    <div className="inline-flex rotate-[2deg] border-4 border-black bg-yellow-400 px-4 py-1.5 text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:text-sm">
                      {memeBase.name}
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl lg:text-7xl">
                  <span className="mb-2 mt-2 inline-block rotate-[-1deg] border-4 border-black bg-yellow-400 px-4 py-2 shadow-[10px_10px_0_0_rgba(0,0,0,1)] md:px-6 md:py-3">
                    {product.name}
                  </span>
                </h1>

                {isCommunityProduct && communityDesign && (
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="border-4 border-black bg-black px-4 py-4 text-white">
                      <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Creator</p>
                      <p className="mt-2 text-2xl font-black uppercase">@{communityDesign.authorName}</p>
                    </div>
                    <div className="border-4 border-black bg-white px-4 py-4">
                      <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">Base meme</p>
                      <p className="mt-2 text-2xl font-black uppercase">{memeBase.name}</p>
                    </div>
                  </div>
                )}

                <div className="mt-10 flex flex-wrap items-end gap-6 md:gap-8">
                  <div className="flex flex-col">
                    <p className="mb-1 w-max border-b-2 border-gray-400 text-sm font-black uppercase text-gray-600 line-through md:text-base">EUR {(product.price * 1.5).toFixed(2)}</p>
                    <div className="inline-flex rotate-[2deg] border-4 border-black bg-pink-500 px-6 py-2 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <span className="text-4xl font-black italic md:text-6xl">EUR {product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-max rotate-[-2deg] border-4 border-black bg-white px-5 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 fill-yellow-400 text-black stroke-[3px] md:h-8 md:w-8" />
                      <span className="text-xl font-black uppercase md:text-2xl">{averageRating.toFixed(1)} <span className="text-sm text-gray-500">/ 5</span></span>
                    </div>
                    <p className="mt-1 text-[10px] font-mono font-bold uppercase md:text-xs">{reviews.length} recensioni</p>
                  </div>
                </div>

                <div className="mt-10 border-l-8 border-black bg-gray-50 p-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] md:p-6">
                  <p className="text-lg font-mono font-bold leading-relaxed text-gray-800 md:text-xl">
                    {isCommunityProduct
                      ? `${product.memeDescription} Template di partenza: ${memeBase.name}, categoria ${memeBase.category}.`
                      : product.memeDescription}
                  </p>
                </div>

                {isCommunityProduct && communityDesign && (
                  <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="border-4 border-black bg-pink-100 px-4 py-4">
                      <div className="flex items-center gap-2"><Heart className="h-4 w-4" /><span className="font-black">{product.likes || 0}</span></div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Like</p>
                    </div>
                    <div className="border-4 border-black bg-yellow-100 px-4 py-4">
                      <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /><span className="font-black">{totalSales}</span></div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Vendite</p>
                    </div>
                    <div className="border-4 border-black bg-green-100 px-4 py-4">
                      <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><span className="font-black">EUR {totalEarnings.toFixed(2)}</span></div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Royalty</p>
                    </div>
                    <div className="border-4 border-black bg-cyan-100 px-4 py-4">
                      <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /><span className="font-black">{royaltyRate.toFixed(1)}%</span></div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Rate</p>
                    </div>
                    <div className="border-4 border-black bg-white px-4 py-4">
                      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span className="font-black">{memeBase.usageCount}</span></div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]">Usi base</p>
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="border-2 border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-8 border-4 border-black bg-white p-6 shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:border-8 md:p-10">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <span className="bg-black px-3 py-1 font-mono text-sm font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Taglia</span>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => { playBlipSound(); setSelectedSize(size); }}
                          aria-pressed={selectedSize === size}
                          className={`min-w-[4rem] border-4 border-black px-4 py-3 text-lg font-black uppercase transition-all ${selectedSize === size ? 'translate-x-[4px] translate-y-[4px] bg-black text-white shadow-none' : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-yellow-400 hover:shadow-none'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="bg-black px-3 py-1 font-mono text-sm font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Colore</span>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => { playBlipSound(); setSelectedColor(color.name); }}
                          aria-pressed={selectedColor === color.name}
                          className={`flex items-center gap-3 border-4 border-black px-5 py-3 text-sm font-black uppercase transition-all ${selectedColor === color.name ? 'translate-x-[4px] translate-y-[4px] bg-black text-white shadow-none' : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-yellow-400 hover:shadow-none'}`}
                        >
                          <span className="inline-block h-6 w-6 border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="bg-black px-3 py-1 font-mono text-sm font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Quantità</span>
                  <div className="mt-4 inline-flex h-16 items-stretch border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <button onClick={() => { playBlipSound(); setQuantity(Math.max(1, quantity - 1)); }} className="flex w-16 items-center justify-center border-r-4 border-black text-3xl font-black transition-colors hover:bg-yellow-400" aria-label="Diminuisci quantità">-</button>
                    <span className="flex w-20 items-center justify-center bg-gray-50 font-mono text-2xl font-black">{quantity}</span>
                    <button onClick={() => { playBlipSound(); setQuantity(quantity + 1); }} className="flex w-16 items-center justify-center border-l-4 border-black text-3xl font-black transition-colors hover:bg-yellow-400" aria-label="Aumenta quantità">+</button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t-8 border-dashed border-black pt-8">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-4 border-4 border-black bg-cyan-400 px-6 py-5 text-2xl font-black uppercase shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-pink-500 hover:shadow-none md:border-8 md:text-4xl"
                  >
                    <Plus className="h-8 w-8 md:h-10 md:w-10" />
                    {isCommunityProduct ? 'Compra questo remix' : 'Compra ora'}
                  </motion.button>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    + Spedizione calcolata al checkout
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCustomizer}
                    className="flex w-full items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-black hover:text-white hover:shadow-none md:text-2xl"
                  >
                    <Wand2 className="h-6 w-6 md:h-8 md:w-8" />
                    Apri customizer
                  </motion.button>
                </div>

                <div className="border-t-4 border-black pt-6">
                  <p className="mb-4 font-mono text-sm font-black uppercase tracking-widest">Condividi</p>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    <button onClick={() => handleShare('facebook')} aria-label="Condividi su Facebook" className="border-4 border-black bg-[#1877F2] p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      <Facebook className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('twitter')} aria-label="Condividi su X" className="border-4 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      <Share2 className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('whatsapp')} aria-label="Condividi su WhatsApp" className="border-4 border-black bg-green-500 p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      <MessageCircle className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('copy')} aria-label="Copia link" className="flex items-center justify-center gap-2 border-4 border-black bg-yellow-400 px-5 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      <Copy className="h-5 w-5" />
                      Copia link
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="relative mt-20 border-4 border-black bg-white p-6 shadow-[16px_16px_0_0_rgba(0,0,0,1)] md:border-8 md:p-12">
            <div className="absolute right-4 top-4 rotate-[8deg] border-4 border-black bg-pink-500 px-4 py-2 text-xl font-black uppercase text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:right-8 md:top-[-24px]">
              Verified
            </div>

            <div className="mb-10 flex flex-col gap-6 border-b-4 border-black pb-8 md:mb-16 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-4 inline-flex rotate-[-1deg] border-4 border-black bg-black px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] md:text-sm">
                  Feedback
                </div>
                <h2 className="text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
                  {isCommunityProduct ? 'Feedback sul remix community' : 'Recensioni prodotto'}
                </h2>
              </div>
              <div className="w-max rotate-[2deg] border-4 border-black bg-yellow-400 px-6 py-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <p className="mb-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/60">Score</p>
                <p className="text-4xl font-black italic text-black md:text-5xl">{averageRating.toFixed(1)} <span className="text-2xl text-black/50">/ 5</span></p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 md:gap-8">
              {reviews.map((review, index) => (
                <article key={review.id} className={`border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 ${index % 2 === 0 ? 'bg-cyan-50' : 'bg-pink-50'}`}>
                  <div className="mb-6 flex items-start justify-between gap-4 border-b-2 border-black/10 pb-4">
                    <div>
                      <p className="text-lg font-black uppercase">{review.name}</p>
                      <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.1em] text-gray-600">{review.role}</p>
                    </div>
                    <div className="border-2 border-black bg-white px-2 py-1 font-mono text-xs font-black uppercase">
                      {review.rating}/5
                    </div>
                  </div>
                  <div className="mb-5 flex w-max gap-1.5 border-2 border-black bg-white p-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-yellow-400 text-black stroke-[3px]" />
                    ))}
                  </div>
                  <p className="font-mono leading-relaxed text-black/80">{review.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </motion.div>

      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 p-6"
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              aria-label="Chiudi zoom immagine"
              className="absolute right-6 top-6 z-50 border-4 border-white bg-black p-3 text-white transition-all hover:scale-110 hover:bg-red-500"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <div className="flex h-full items-center justify-center p-4 md:p-12">
              <img src={selectedImage} alt={`${product.name} zoom`} className="max-h-full max-w-full border-4 border-white bg-white object-contain shadow-[12px_12px_0_0_rgba(255,255,255,0.2)] md:border-8" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
