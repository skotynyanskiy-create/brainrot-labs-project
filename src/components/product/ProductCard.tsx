import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { playCoinSound, playBlipSound } from '../../utils/sounds';
import { Skeleton } from '../ui/Skeleton';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  bgColor?: string;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onSelect, bgColor = 'bg-white' }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    playCoinSound();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]?.name);
    addToast('Aggiunto al carrello. Il tuo conto in banca piange.');
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.category !== 'community') return;
    playBlipSound();
    addToast('Hai dato un like a questo disagio. +1 aura.');
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
      className={`brutalist-card glassmorphism p-6 flex flex-col h-full relative overflow-hidden cursor-pointer group border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all z-30 ${bgColor}`}
    >
      <div className={`w-full flex-1 min-h-[250px] border-8 border-black mb-6 overflow-hidden relative ${product.color} group-hover:bg-black transition-colors`}>
        {!isLoaded && <Skeleton className="absolute inset-0 z-0 m-4" />}

        <div className={`absolute top-4 left-4 z-30 px-3 py-1 border-4 border-black font-black text-xs uppercase italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
          product.category === 'community' ? 'bg-yellow-400' : 'bg-cyan-400'
        }`}>
          {product.category === 'community' ? '[USER_MUTATION]' : '[LAB_CERTIFIED]'}
        </div>

        <motion.img
          whileHover={{ scale: 1.15, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover mix-blend-multiply relative z-10 transition-all duration-500 group-hover:mix-blend-normal group-hover:scale-110 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />
        <img
          src={product.image}
          alt=""
          aria-hidden="true"
          className="image-glitch-layer absolute inset-0 z-20 h-full w-full object-cover opacity-0 mix-blend-screen group-hover:opacity-50 group-hover:animate-[glitch-shift-cyan_180ms_steps(2,end)_infinite]"
        />
        <img
          src={product.image}
          alt=""
          aria-hidden="true"
          className="image-glitch-layer absolute inset-0 z-20 h-full w-full object-cover opacity-0 mix-blend-lighten group-hover:opacity-40 group-hover:animate-[glitch-shift-pink_160ms_steps(2,end)_infinite]"
        />

        <div className="absolute bottom-2 left-2 z-20 bg-black text-white px-2 py-1 text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          SCAN_ID: {product.id.slice(0, 8)}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase bg-black text-white px-2 py-0.5 font-black">ID: {product.id.slice(0, 4)}</span>
            <span className="text-xs font-mono uppercase text-pink-500 font-black italic">#{product.category}</span>
          </div>

          {product.category === 'community' && (
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              aria-label={`Metti like a ${product.name}`}
              className="flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-pink-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
            >
              <Heart className={`w-3 h-3 ${product.likes ? 'fill-current' : ''}`} />
              <span className="text-xs font-black">{product.likes || 0}</span>
            </motion.button>
          )}
        </div>

        <h2 className="text-xl md:text-2xl font-display leading-tight mb-2 line-clamp-2 uppercase italic tracking-tighter group-hover:text-pink-500 transition-colors">
          {product.name}
        </h2>

        {product.authorName && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-cyan-400 border border-black rounded-full animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-black">Origin: @{product.authorName}</span>
          </div>
        )}
      </div>

      <p className="text-sm font-mono font-medium text-black mb-8 flex-grow line-clamp-3 leading-relaxed border-l-4 border-black pl-4">
        {product.memeDescription}
      </p>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-auto pt-6 border-t-8 border-black border-dashed gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono uppercase text-gray-600 line-through font-black">EUR {(product.price * 1.5).toFixed(2)}</span>
          <div className="bg-yellow-400 border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <span className="text-2xl md:text-3xl font-display text-black italic leading-none">EUR {product.price.toFixed(2)}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          aria-label={`Aggiungi ${product.name} al carrello`}
          className="bg-black text-white hover:bg-yellow-400 hover:text-black px-6 py-3 text-xl md:text-2xl w-full sm:w-auto font-display italic uppercase border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2"
        >
          GIMME CASH
        </motion.button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
