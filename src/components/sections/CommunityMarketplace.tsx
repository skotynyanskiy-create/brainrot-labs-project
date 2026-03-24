import { motion } from 'motion/react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useProduct } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { playCoinSound, playBlipSound } from '../../utils/sounds';

export default function CommunityMarketplace() {
  const { communityDesigns } = useProduct();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (design: any) => {
    playCoinSound();
    // Assuming community designs can be added to cart as a product
    addToCart({
      id: design.id,
      name: `Design di ${design.authorName}`,
      price: 29.99,
      image: design.image,
      category: 'wearable',
      memeDescription: design.memeDescription,
      rarity: 'Common',
      color: 'bg-white',
    }, 1);
    addToast(`Design di ${design.authorName} aggiunto al carrello!`);
  };

  return (
    <section className="py-32 px-6 md:px-12 bg-white border-b-8 border-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-20">
          Community <span className="text-cyan-500">Marketplace</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {communityDesigns.map((design, i) => (
            <motion.div 
              key={design.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-8 border-black p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white group"
            >
              <img src={design.image} alt={design.memeDescription} className="w-full aspect-square object-cover border-4 border-black mb-6" />
              <h3 className="text-2xl font-black uppercase mb-2">{design.memeDescription}</h3>
              <p className="font-mono text-gray-600 mb-6">di @{design.authorName}</p>
              <div className="flex justify-between items-center">
                <button className="flex items-center gap-2 font-black">
                  <Heart className="w-6 h-6" /> {design.likes}
                </button>
                <button 
                  onClick={() => { playBlipSound(); handleAddToCart(design); }}
                  className="bg-cyan-500 text-white font-black uppercase px-6 py-3 border-4 border-black hover:bg-cyan-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" /> Acquista
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
