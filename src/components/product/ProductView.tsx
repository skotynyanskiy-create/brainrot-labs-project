import { useMemo, useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';
import { ArrowLeft, Facebook, MessageCircle, Plus, ShieldCheck, Share2, Star, Truck, Wand2, X, ZoomIn } from 'lucide-react';
import { playBlipSound, playCoinSound } from '../../utils/sounds';
import { motion, AnimatePresence } from 'motion/react';

interface ProductViewProps {
  product: Product;
  onBack: () => void;
}

export default function ProductView({ product, onBack }: ProductViewProps) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { setIsCustomizerOpen } = useUI();

  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const galleryImages = useMemo(() => {
    const candidates = [
      product.customData?.designTextureUrl,
      product.image,
      `https://picsum.photos/seed/${product.id}-detail-1/1200/1200`,
      `https://picsum.photos/seed/${product.id}-detail-2/1200/1200`,
      `https://picsum.photos/seed/${product.id}-detail-3/1200/1200`,
    ].filter(Boolean) as string[];

    return Array.from(new Set(candidates));
  }, [product]);

  const reviews = useMemo(() => {
    return [
      {
        id: `${product.id}-review-1`,
        name: 'Arianna P.',
        role: 'Cliente verificata',
        avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${product.id}-arianna`,
        rating: 5,
        text: `Stampa nitida, materiali convincenti e il design ${product.name} dal vivo rende anche meglio.`,
      },
      {
        id: `${product.id}-review-2`,
        name: 'Davide M.',
        role: 'Repeat buyer',
        avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${product.id}-davide`,
        rating: 5,
        text: 'Packaging solido e zero sensazione di mock veloce. La scheda prodotto rispecchia davvero il risultato.',
      },
      {
        id: `${product.id}-review-3`,
        name: 'Sara T.',
        role: 'Fan della collection',
        avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${product.id}-sara`,
        rating: 4,
        text: 'Acquisto molto sopra la media del meme merch classico. Si vede attenzione su dettagli e personalita.',
      },
    ];
  }, [product]);

  const averageRating = useMemo(() => {
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const selectedImage = galleryImages[selectedImageIndex] || product.image;

  const handleAddToCart = () => {
    playCoinSound();
    addToCart(product, quantity, selectedSize, selectedColor);
    addToast('Aggiunto al carrello. Il tuo conto in banca piange.');
  };

  const handleOpenCustomizer = () => {
    playBlipSound();
    setIsCustomizerOpen(true);
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    playBlipSound();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Guarda questo capolavoro: ${product.name}`);

    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copiato. Vai a rovinare la giornata a qualcuno.');
      return;
    }

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="min-h-screen bg-[#f7f7f7] text-black pt-24 pb-16 px-6 md:px-12 relative z-40"
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => { playBlipSound(); onBack(); }}
            aria-label="Torna all elenco prodotti"
            className="mb-8 md:mb-12 flex items-center gap-2 w-max px-4 md:px-6 py-2 md:py-3 border-4 border-black bg-white hover:bg-yellow-400 text-black transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-black uppercase text-sm md:text-base"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            Torna Indietro
          </button>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <div className="relative overflow-hidden border-4 md:border-8 border-black bg-white p-3 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[16px_16px_0_0_rgba(0,0,0,1)] group">
                <div className={`relative overflow-hidden border-4 border-black ${product.color}`}>
                  <img
                    src={selectedImage}
                    alt={`${product.name} anteprima ${selectedImageIndex + 1}`}
                    className="aspect-square w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    aria-label="Apri zoom immagine prodotto"
                    className="absolute right-4 top-4 border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-yellow-400 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <ZoomIn className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => {
                      playBlipSound();
                      setSelectedImageIndex(index);
                    }}
                    aria-label={`Seleziona immagine ${index + 1} di ${product.name}`}
                    className={`overflow-hidden border-4 border-black bg-white p-1 md:p-2 transition-all ${selectedImageIndex === index ? 'translate-x-[4px] translate-y-[4px] shadow-none bg-yellow-400' : 'shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
                  >
                    <img src={image} alt="" aria-hidden="true" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:gap-6 md:grid-cols-3 mt-8">
                <div className="border-4 border-black bg-cyan-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <ShieldCheck className="mb-3 h-8 w-8" />
                  <p className="font-black uppercase text-sm md:text-base">Qualità Boss</p>
                  <p className="mt-2 text-xs md:text-sm font-mono font-bold opacity-90">Tessuto maxato, contrasto forte e stampa indistruttibile.</p>
                </div>
                <div className="border-4 border-black bg-green-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <Truck className="mb-3 h-8 w-8" />
                  <p className="font-black uppercase text-sm md:text-base">Speedrun</p>
                  <p className="mt-2 text-xs md:text-sm font-mono font-bold opacity-90">Tracking in arrivo non appena l'ordine spawna in magazzino.</p>
                </div>
                <div className="border-4 border-black bg-pink-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                  <MessageCircle className="mb-3 h-8 w-8" />
                  <p className="font-black uppercase text-sm md:text-base">No Bot</p>
                  <p className="mt-2 text-xs md:text-sm font-mono font-bold opacity-90">Recensioni 100% legit da altri degenerati come te.</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6 md:gap-8">
              <div className="border-4 md:border-8 border-black bg-white p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                <div className="mb-6 inline-flex border-4 border-black bg-cyan-400 px-4 py-1.5 text-xs md:text-sm font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-2">
                  Drop: {product.rarity}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
                  <span className="inline-block border-4 md:border-8 border-black bg-yellow-400 px-4 md:px-6 py-2 md:py-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] -rotate-1 mt-2 mb-2">
                    {product.name}
                  </span>
                </h1>

                <div className="mt-10 flex flex-wrap items-end gap-6 md:gap-8">
                  <div className="flex flex-col">
                    <p className="text-sm md:text-base font-mono font-black uppercase text-gray-600 line-through mb-1 border-b-2 border-gray-400 w-max">EUR {(product.price * 1.5).toFixed(2)}</p>
                    <div className="inline-flex border-4 border-black bg-pink-500 px-6 py-2 md:py-3 text-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform rotate-2">
                      <span className="text-4xl md:text-6xl font-black italic">€{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-4 border-black bg-white px-4 md:px-5 py-3 md:py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 md:h-8 md:w-8 fill-yellow-400 text-black stroke-[3px]" />
                      <span className="font-black text-xl md:text-2xl uppercase">{averageRating.toFixed(1)} <span className="text-sm text-gray-500">/ 5</span></span>
                    </div>
                    <p className="mt-1 text-[10px] md:text-xs font-mono font-bold uppercase">{reviews.length} recensioni basate</p>
                  </div>
                </div>

                <div className="mt-10 border-l-8 border-black bg-gray-50 p-5 md:p-6 italic shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                  <p className="text-lg md:text-xl font-mono font-bold leading-relaxed text-gray-800">"{product.memeDescription}"</p>
                </div>
              </div>

              <div className="border-4 md:border-8 border-black bg-white p-6 md:p-10 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[16px_16px_0_0_rgba(0,0,0,1)] space-y-8 md:space-y-10">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-black text-white px-3 py-1 font-mono font-black uppercase text-sm tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Taglia</span>
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => { playBlipSound(); setSelectedSize(size); }}
                          aria-pressed={selectedSize === size}
                          className={`min-w-[3.5rem] md:min-w-[4rem] flex items-center justify-center border-4 border-black px-4 py-2 md:py-3 font-black uppercase text-lg md:text-xl transition-all ${selectedSize === size ? 'bg-black text-white translate-x-[4px] translate-y-[4px] shadow-none' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-yellow-400 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-black text-white px-3 py-1 font-mono font-black uppercase text-sm tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Colore</span>
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => { playBlipSound(); setSelectedColor(color.name); }}
                          aria-pressed={selectedColor === color.name}
                          className={`flex items-center gap-3 border-4 border-black px-4 md:px-5 py-2 md:py-3 font-black uppercase text-sm md:text-base transition-all ${selectedColor === color.name ? 'bg-black text-white translate-x-[4px] translate-y-[4px] shadow-none' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-yellow-400 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]'}`}
                        >
                          <span className="inline-block h-5 w-5 md:h-6 md:w-6 border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-black text-white px-3 py-1 font-mono font-black uppercase text-sm tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Loot Drop Qty</span>
                  </div>
                  <div className="inline-flex items-stretch border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] h-14 md:h-16">
                    <button onClick={() => { playBlipSound(); setQuantity(Math.max(1, quantity - 1)); }} aria-label="Diminuisci quantita" className="w-14 md:w-16 flex items-center justify-center font-black text-3xl border-r-4 border-black hover:bg-yellow-400 transition-colors">
                      -
                    </button>
                    <span className="w-16 md:w-20 flex items-center justify-center font-mono text-2xl font-black bg-gray-50">{quantity}</span>
                    <button onClick={() => { playBlipSound(); setQuantity(quantity + 1); }} aria-label="Aumenta quantita" className="w-14 md:w-16 flex items-center justify-center font-black text-3xl border-l-4 border-black hover:bg-yellow-400 transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-10 pt-8 border-t-8 border-black border-dashed">
                  <motion.button
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-4 border-4 md:border-8 border-black bg-cyan-400 hover:bg-pink-500 px-6 py-5 md:py-6 text-2xl md:text-4xl font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                  >
                    <Plus className="h-8 w-8 md:h-10 md:w-10" />
                    Compra Ora
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCustomizer}
                    className="w-full flex items-center justify-center gap-3 border-4 border-black bg-white hover:bg-black hover:text-white px-6 py-4 text-xl md:text-2xl font-black uppercase italic shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                  >
                    <Wand2 className="h-6 w-6 md:h-8 md:w-8" />
                    Personalizza AI
                  </motion.button>
                </div>

                <div className="border-t-4 border-black pt-6">
                  <p className="mb-4 font-mono font-black text-sm uppercase tracking-widest">Condividi o pentiti</p>
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    <button onClick={() => handleShare('facebook')} aria-label="Condividi su Facebook" className="border-4 border-black bg-[#1877F2] p-3 md:p-4 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <Facebook className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('twitter')} aria-label="Condividi su X" className="border-4 border-black bg-black p-3 md:p-4 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <Share2 className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('whatsapp')} aria-label="Condividi su WhatsApp" className="border-4 border-black bg-green-500 p-3 md:p-4 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <MessageCircle className="h-6 w-6" />
                    </button>
                    <button onClick={() => handleShare('copy')} aria-label="Copia link prodotto" className="border-4 border-black bg-yellow-400 px-5 md:px-6 py-3 md:py-4 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
                      <span className="hidden sm:inline">Copia Link</span>
                      <span className="sm:hidden">Copia</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-20 border-4 md:border-8 border-black bg-white p-6 md:p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
            <div className="absolute -top-6 -right-6 md:-top-8 md:-right-8 bg-pink-500 border-4 border-black p-3 md:p-4 rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hidden sm:block z-10">
              <span className="font-black uppercase text-xl md:text-2xl text-white italic">LEGIT 100%</span>
            </div>

            <div className="mb-10 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
              <div>
                <div className="mb-4 inline-flex border-4 border-black bg-black px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] -rotate-1">
                  Data Logs
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Feedback<br/><span className="text-pink-500 italic">Verificato</span></h2>
              </div>
              <div className="border-4 border-black bg-yellow-400 px-6 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform rotate-2 w-max">
                <p className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-black/60 mb-1">Aura Score</p>
                <p className="text-4xl md:text-5xl font-black italic text-black">{averageRating.toFixed(1)} <span className="text-2xl text-black/50">/ 5</span></p>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
              {reviews.map((review, i) => (
                <article key={review.id} className={`border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform ${i % 2 === 0 ? 'bg-cyan-50' : 'bg-pink-50'}`}>
                  <div className="mb-6 flex items-center gap-4 border-b-2 border-black/10 pb-4">
                    <img src={review.avatar} alt={`Avatar di ${review.name}`} className="h-16 w-16 border-4 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]" />
                    <div>
                      <p className="font-black uppercase text-lg leading-tight">{review.name}</p>
                      <p className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.1em] text-gray-600 mt-1">{review.role}</p>
                    </div>
                  </div>
                  <div className="mb-5 flex gap-1.5 bg-white border-2 border-black w-max p-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] -rotate-2">
                    {[...Array(review.rating)].map((_, index) => (
                      <Star key={index} className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-black stroke-[3px]" />
                    ))}
                  </div>
                  <p className="font-mono font-medium leading-relaxed text-black/80">"{review.text}"</p>
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
              className="absolute right-6 top-6 border-4 border-white bg-black p-3 text-white hover:bg-red-500 hover:scale-110 transition-all z-50"
            >
              <X className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <div className="flex h-full items-center justify-center p-4 md:p-12">
              <img src={selectedImage} alt={`${product.name} zoom`} className="max-h-full max-w-full border-4 md:border-8 border-white bg-white object-contain shadow-[12px_12px_0_0_rgba(255,255,255,0.2)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
