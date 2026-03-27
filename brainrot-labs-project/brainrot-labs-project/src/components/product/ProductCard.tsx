import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { playCoinSound, playBlipSound } from '../../utils/sounds';
import { Skeleton } from '../ui/Skeleton';
import { db, doc, updateDoc } from '../../firebase';
import { increment } from 'firebase/firestore';
import { logger } from '../../utils/logger';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  bgColor?: string;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onSelect, bgColor = 'bg-white' }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCoinSound();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]?.name);
    addToast('Aggiunto al carrello. Il tuo conto in banca piange.');
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.category !== 'community') return;
    if (hasLiked) return;
    if (!user) { addToast('Accedi per mettere like.', 'info'); return; }
    playBlipSound();
    setHasLiked(true);
    try {
      await updateDoc(doc(db, 'communityDesigns', product.id), { likes: increment(1) });
      addToast('Hai dato un like a questo design. +1 aura.', 'success');
    } catch (error) {
      setHasLiked(false);
      logger.error('Like failed:', error);
      addToast('Errore nel salvare il like. Riprova.', 'error');
    }
  };

  const handleCardClick = () => {
    playBlipSound();
    onSelect(product);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02, rotate: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Apri la scheda di ${product.name}`}
      className={`brutalist-card p-4 md:p-6 flex flex-col h-full relative overflow-hidden cursor-pointer group border-4 md:border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all z-30 ${bgColor}`}
    >
      <div
        className={`image-glitch-container w-full flex-1 min-h-[200px] md:min-h-[250px] border-4 md:border-8 border-black mb-4 md:mb-6 overflow-hidden relative ${product.color} group-hover:bg-black transition-colors`}
        style={{ '--product-img': `url(${product.image})` } as React.CSSProperties}
      >
        {!isLoaded && <Skeleton className="absolute inset-0 z-0 m-4" />}

        <div className={`absolute top-3 left-3 md:top-4 md:left-4 z-30 px-2 md:px-3 py-1 border-2 md:border-4 border-black font-black text-[10px] md:text-xs uppercase italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-3 ${
          product.category === 'community' ? 'bg-yellow-400' : 'bg-cyan-400'
        }`}>
          {product.category === 'community' ? '[USER_MUTATION]' : '[LAB_CERTIFIED]'}
        </div>

        <motion.img
          whileHover={{ scale: 1.15, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => { const img = e.target as HTMLImageElement; img.onerror = null; img.style.opacity = '0.3'; setIsLoaded(true); }}
          className={`w-full h-full object-cover mix-blend-multiply relative z-10 transition-all duration-500 group-hover:mix-blend-normal group-hover:scale-110 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />

        <div className="absolute bottom-2 left-2 z-20 bg-black text-white px-2 py-1 text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          SCAN_ID: {product.id.slice(0, 8)}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs font-mono uppercase bg-black text-white px-2 py-0.5 font-black shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">ID: {product.id.slice(0, 4)}</span>
            <span className="text-[10px] md:text-xs font-mono uppercase text-pink-500 font-black italic border-b-2 border-pink-500">#{product.category}</span>
          </div>

          {product.category === 'community' && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={hasLiked}
              aria-label={`Metti like a ${product.name}`}
              className="flex items-center gap-1.5 bg-white border-2 md:border-4 border-black px-2 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-pink-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasLiked ? 'fill-current text-pink-500' : ''}`} />
              <span className="text-xs md:text-sm font-black">{(product.likes || 0) + (hasLiked ? 1 : 0)}</span>
            </motion.button>
          )}
        </div>

        <h2 className="text-xl md:text-3xl font-black leading-tight mb-1 md:mb-2 line-clamp-2 uppercase italic tracking-tighter group-hover:text-pink-500 transition-colors">
          {product.name}
        </h2>

        {product.authorName && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 border border-black rounded-full animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">Origin: @{product.authorName}</span>
          </div>
        )}
      </div>

      <p className="text-[13px] md:text-sm font-mono font-bold text-gray-800 mb-6 flex-grow line-clamp-3 leading-relaxed border-l-4 border-black pl-3 md:pl-4 bg-white/50 py-1">
        "{product.memeDescription}"
      </p>

      <div className="mt-auto pt-4 md:pt-6 border-t-4 md:border-t-8 border-black border-dashed flex flex-col gap-4 md:gap-5">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-mono uppercase text-gray-600 line-through font-black mb-1">EUR {(product.price * 1.5).toFixed(2)}</span>
            <div className="bg-yellow-400 border-4 border-black px-3 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform rotate-2 w-max">
              <span className="text-2xl md:text-3xl font-black text-black italic leading-none">EUR {product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          aria-label={`Aggiungi ${product.name} al carrello`}
          className="bg-black text-white hover:bg-cyan-400 hover:text-black w-full px-4 py-3 md:py-4 text-xl md:text-2xl font-black italic uppercase border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          COMPRA ORA
        </motion.button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
