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
            className="mb-8 flex items-center gap-2 px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-black uppercase"
          >
            <ArrowLeft className="w-5 h-5" />
            Torna Indietro
          </button>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-5">
              <div className="relative overflow-hidden border-8 border-black bg-white p-4 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                <div className={`relative overflow-hidden border-4 border-black ${product.color}`}>
                  <img
                    src={selectedImage}
                    alt={`${product.name} anteprima ${selectedImageIndex + 1}`}
                    className="aspect-square w-full object-cover mix-blend-multiply"
                  />
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    aria-label="Apri zoom immagine prodotto"
                    className="absolute right-4 top-4 border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => {
                      playBlipSound();
                      setSelectedImageIndex(index);
                    }}
                    aria-label={`Seleziona immagine ${index + 1} di ${product.name}`}
                    className={`overflow-hidden border-4 border-black bg-white p-2 transition-all ${selectedImageIndex === index ? 'translate-x-1 translate-y-1 shadow-none bg-yellow-300' : 'shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
                  >
                    <img src={image} alt="" aria-hidden="true" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <ShieldCheck className="mb-3 h-7 w-7" />
                  <p className="font-black uppercase">Qualita verificata</p>
                  <p className="mt-2 text-sm font-mono">Mock consistente, contrasto forte e stampa leggibile.</p>
                </div>
                <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <Truck className="mb-3 h-7 w-7" />
                  <p className="font-black uppercase">Spedizione rapida</p>
                  <p className="mt-2 text-sm font-mono">Tracking in arrivo appena l ordine entra in lavorazione.</p>
                </div>
                <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <MessageCircle className="mb-3 h-7 w-7" />
                  <p className="font-black uppercase">Recensioni visibili</p>
                  <p className="mt-2 text-sm font-mono">Feedback e rating direttamente nella scheda prodotto.</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="border-8 border-black bg-white p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
                <div className="mb-4 inline-flex border-4 border-black bg-cyan-400 px-4 py-1 text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  {product.rarity}
                </div>

                <h1 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter">
                  <span className="inline-block border-4 border-black bg-yellow-400 px-4 py-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)] -rotate-1">
                    {product.name}
                  </span>
                </h1>

                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <div>
                    <p className="text-sm font-mono uppercase text-gray-600 line-through">EUR {(product.price * 1.5).toFixed(2)}</p>
                    <div className="mt-2 inline-flex border-4 border-black bg-black px-5 py-2 text-white shadow-[8px_8px_0_0_rgba(236,72,153,1)]">
                      <span className="text-4xl font-black italic">EUR {product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-4 border-black bg-pink-500 px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-black text-black" />
                      <span className="font-black uppercase">{averageRating.toFixed(1)} / 5</span>
                    </div>
                    <p className="mt-1 text-xs font-mono uppercase">{reviews.length} recensioni verificate</p>
                  </div>
                </div>

                <div className="mt-6 border-4 border-black bg-gray-50 p-5">
                  <p className="text-lg font-mono font-bold leading-relaxed">{product.memeDescription}</p>
                </div>
              </div>

              <div className="border-8 border-black bg-white p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] space-y-6">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-sm font-black uppercase">Taglia</h2>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => { playBlipSound(); setSelectedSize(size); }}
                          aria-pressed={selectedSize === size}
                          className={`min-w-12 border-4 border-black px-4 py-2 font-black uppercase ${selectedSize === size ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-sm font-black uppercase">Colore</h2>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => { playBlipSound(); setSelectedColor(color.name); }}
                          aria-pressed={selectedColor === color.name}
                          className={`flex items-center gap-2 border-4 border-black px-4 py-2 font-black uppercase ${selectedColor === color.name ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
                        >
                          <span className="inline-block h-4 w-4 border-2 border-current" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 text-sm font-black uppercase">Quantita</h2>
                  <div className="inline-flex items-center border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <button onClick={() => { playBlipSound(); setQuantity(Math.max(1, quantity - 1)); }} aria-label="Diminuisci quantita" className="px-4 py-2 font-black text-xl">
                      -
                    </button>
                    <span className="border-x-4 border-black px-5 py-2 font-mono text-lg font-bold">{quantity}</span>
                    <button onClick={() => { playBlipSound(); setQuantity(quantity + 1); }} aria-label="Aumenta quantita" className="px-4 py-2 font-black text-xl">
                      +
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-3 border-4 border-black bg-yellow-400 px-6 py-4 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                  >
                    <Plus className="h-6 w-6" />
                    Compra Ora
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCustomizer}
                    className="flex items-center justify-center gap-3 border-4 border-black bg-cyan-400 px-6 py-4 text-xl font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                  >
                    <Wand2 className="h-6 w-6" />
                    Personalizza
                  </motion.button>
                </div>

                <div className="border-t-4 border-black pt-5">
                  <p className="mb-3 text-sm font-black uppercase">Condividi</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleShare('facebook')} aria-label="Condividi su Facebook" className="border-4 border-black bg-[#1877F2] p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <Facebook className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleShare('twitter')} aria-label="Condividi su X" className="border-4 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleShare('whatsapp')} aria-label="Condividi su WhatsApp" className="border-4 border-black bg-green-500 p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleShare('copy')} aria-label="Copia link prodotto" className="border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      Copia Link
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-14 border-8 border-black bg-white p-6 md:p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 inline-block border-4 border-black bg-black px-4 py-1 text-sm font-black uppercase text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  Recensioni Prodotto
                </p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Feedback Verificato</h2>
              </div>
              <div className="border-4 border-black bg-pink-500 px-5 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <p className="font-mono text-xs uppercase tracking-[0.25em]">Review Score</p>
                <p className="text-3xl font-black italic">{averageRating.toFixed(1)} / 5</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.id} className="border-4 border-black bg-yellow-50 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                  <div className="mb-5 flex items-center gap-3">
                    <img src={review.avatar} alt={`Avatar di ${review.name}`} className="h-14 w-14 border-4 border-black bg-white" />
                    <div>
                      <p className="font-black uppercase">{review.name}</p>
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-gray-700">{review.role}</p>
                    </div>
                  </div>
                  <div className="mb-4 flex gap-1">
                    {[...Array(review.rating)].map((_, index) => (
                      <Star key={index} className="h-5 w-5 fill-black text-black" />
                    ))}
                  </div>
                  <p className="font-mono leading-relaxed">{review.text}</p>
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
              className="absolute right-6 top-6 border-4 border-white bg-black p-3 text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex h-full items-center justify-center">
              <img src={selectedImage} alt={`${product.name} zoom`} className="max-h-full max-w-full border-8 border-white bg-white object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
