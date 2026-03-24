import { motion, AnimatePresence } from 'motion/react';
import { useProduct } from '../../context/ProductContext';
import { useUI } from '../../context/UIContext';
import { RefreshCw, Search, Filter } from 'lucide-react';
import { db, setDoc, doc, Timestamp } from '../../firebase';
import { useState, useMemo, useEffect } from 'react';
import { playBlipSound } from '../../utils/sounds';
import { Product } from '../../types';
import ProductCard from '../product/ProductCard';

export default function CommunityGallery() {
  const { communityDesigns, setSelectedProduct } = useProduct();
  const { setIsCommunityOpen } = useUI();
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<'popularity' | 'date' | 'random'>('date');
  const [filterText, setFilterText] = useState('');
  const [minLikes, setMinLikes] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(6);
  const itemsPerLoad = 6;

  // Shuffle seed for random sort
  const [randomSeed, setRandomSeed] = useState(Math.random());

  const processedDesigns = useMemo(() => {
    let result = [...communityDesigns];

    // Filtering
    if (filterText) {
      result = result.filter(d => 
        d.memeDescription.toLowerCase().includes(filterText.toLowerCase()) ||
        d.authorName.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (minLikes > 0) {
      result = result.filter(d => d.likes >= minLikes);
    }

    // Sorting
    if (sortBy === 'popularity') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'date') {
      result.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'random') {
      // Simple shuffle using randomSeed
      result = result.sort(() => Math.sin(randomSeed) - 0.5);
    }

    return result;
  }, [communityDesigns, sortBy, filterText, minLikes, randomSeed]);

  useEffect(() => {
    setVisibleCount(itemsPerLoad);
  }, [sortBy, filterText, minLikes]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < processedDesigns.length) {
          setVisibleCount(prev => prev + itemsPerLoad);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [processedDesigns.length, visibleCount]);

  const displayedDesigns = processedDesigns.slice(0, visibleCount);

  const forceSeed = async () => {
    setIsSeeding(true);
    try {
      const initialDesigns = [
        {
          authorId: 'seed-1',
          authorName: 'MemeLord99',
          image: 'https://picsum.photos/seed/monalisa/800/800',
          memeDescription: 'La Gioconda ma con gli occhiali da sole e un kebab in mano. Arte pura.',
          createdAt: Timestamp.now(),
          likes: 420
        },
        {
          authorId: 'seed-2',
          authorName: 'DogeMaster',
          image: 'https://picsum.photos/seed/doge/800/800',
          memeDescription: 'Un Doge spaziale che cavalca un razzo verso la luna. To the moon!',
          createdAt: Timestamp.now(),
          likes: 69
        },
        {
          authorId: 'seed-3',
          authorName: 'CringeQueen',
          image: 'https://picsum.photos/seed/cat/800/800',
          memeDescription: 'Il mio gatto che cerca di capire perché ho comprato una maglietta con la sua faccia.',
          createdAt: Timestamp.now(),
          likes: 1337
        },
        {
          authorId: 'seed-4',
          authorName: 'SkibidiFan',
          image: 'https://picsum.photos/seed/toilet/800/800',
          memeDescription: 'Design ispirato alla Skibidi Toilet. Molto disagio, molto wow.',
          createdAt: Timestamp.now(),
          likes: 888
        },
        {
          authorId: 'seed-5',
          authorName: 'SigmaGrindset',
          image: 'https://picsum.photos/seed/sigma/800/800',
          memeDescription: 'Sigma Male Rule #420: Indossa solo magliette con meme che nessuno capisce.',
          createdAt: Timestamp.now(),
          likes: 999
        },
        {
          authorId: 'seed-6',
          authorName: 'GigaChad',
          image: 'https://picsum.photos/seed/chad/800/800',
          memeDescription: 'Sì, ho appena ordinato 10 magliette di Brainrot Labs. Come lo hai capito?',
          createdAt: Timestamp.now(),
          likes: 9999
        },
        {
          authorId: 'seed-7',
          authorName: 'VaporWaveVibes',
          image: 'https://picsum.photos/seed/vapor/800/800',
          memeDescription: 'A E S T H E T I C . Il disagio non è mai stato così retro.',
          createdAt: Timestamp.now(),
          likes: 777
        },
        {
          authorId: 'seed-8',
          authorName: 'NoobMaster69',
          image: 'https://picsum.photos/seed/gamer/800/800',
          memeDescription: 'Quando perdi a Fortnite ma almeno hai una maglietta leggendaria.',
          createdAt: Timestamp.now(),
          likes: 123
        }
      ];

      for (let i = 0; i < initialDesigns.length; i++) {
        await setDoc(doc(db, 'communityDesigns', `seed-design-${i}`), initialDesigns[i]);
      }
      window.location.reload(); // Refresh to see changes if snapshot is slow
    } catch (error) {
      console.error("Manual seeding failed:", error);
      alert("Errore durante il caricamento degli esempi. Riprova tra poco.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-white min-h-screen text-black selection:bg-pink-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Brutalist Style */}
        <div className="flex flex-col gap-12 mb-24 bg-yellow-400 border-8 border-black p-8 md:p-16 shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
            <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic transform -skew-x-6">
              GALLERY<br/>
              <span className="text-white" style={{ WebkitTextStroke: '3px black', textShadow: '6px 6px 0 #000' }}>ARCHIVE</span>
            </h1>
            <div className="flex flex-col gap-4">
              <div className="bg-black text-white px-4 py-2 font-mono text-sm uppercase font-bold w-max shadow-[4px_4px_0_0_rgba(236,72,153,1)]">
                // COMMUNITY_VAULT_v2.0
              </div>
              <p className="font-mono text-lg max-w-xs text-black uppercase leading-tight font-bold border-l-4 border-black pl-4">
                L'archivio definitivo del disagio digitale. Scegli il tuo veleno.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-12 border-t-4 border-black relative z-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
              <input 
                type="text" 
                placeholder="CERCA NEL DATABASE..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pl-14 pr-4 py-5 bg-white border-4 border-black font-mono text-lg font-black uppercase focus:outline-none focus:bg-black focus:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>

            <div className="flex border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <button 
                onClick={() => { playBlipSound(); setSortBy('date'); }}
                className={`flex-1 py-5 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-colors ${sortBy === 'date' ? 'bg-black text-white' : ''}`}
              >
                Recenti
              </button>
              <button 
                onClick={() => { playBlipSound(); setSortBy('popularity'); }}
                className={`flex-1 py-5 border-x-4 border-black font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-colors ${sortBy === 'popularity' ? 'bg-black text-white' : ''}`}
              >
                Popolari
              </button>
              <button 
                onClick={() => { 
                  playBlipSound(); 
                  setRandomSeed(Math.random());
                  setSortBy('random'); 
                }}
                className={`flex-1 py-5 font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-colors ${sortBy === 'random' ? 'bg-black text-white' : ''}`}
              >
                Casuale
              </button>
            </div>

            <button 
              onClick={() => {
                playBlipSound();
                setShowFilters(!showFilters);
              }}
              className={`py-5 border-4 border-black transition-all flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${showFilters ? 'bg-pink-500 text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white hover:bg-black hover:text-white'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtri</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-24"
            >
              <div className="p-8 border-8 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="block font-black uppercase text-sm tracking-widest">Soglia Popolarità: {minLikes} Likes</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="2000" 
                      step="50"
                      value={minLikes}
                      onChange={(e) => setMinLikes(parseInt(e.target.value))}
                      className="w-full h-4 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black border-4 border-black"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        playBlipSound();
                        setFilterText('');
                        setMinLikes(0);
                        setSortBy('date');
                      }}
                      className="w-full py-5 border-4 border-black bg-white hover:bg-black hover:text-white transition-all font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                      Resetta Database
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {communityDesigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-8 border-dashed border-black bg-gray-50">
            <div className="text-8xl mb-6">🏜️</div>
            <h2 className="text-4xl font-black uppercase mb-4 text-center px-4">Ancora Nessun Disagio</h2>
            <p className="text-xl font-mono text-gray-600 max-w-md text-center mb-8 px-4">
              La community sta ancora elaborando il trauma. Sii il primo a condividere la tua creazione!
            </p>
            <button 
              onClick={forceSeed}
              disabled={isSeeding}
              className="flex items-center gap-2 px-8 py-4 bg-cyan-400 border-4 border-black font-black uppercase text-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
            >
              {isSeeding ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                "Carica Esempi"
              )}
            </button>
          </div>
        ) : processedDesigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-8 border-dashed border-black bg-gray-50">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-4xl font-black uppercase mb-4 text-center px-4">Nessun Risultato</h2>
            <p className="text-xl font-mono text-gray-600 max-w-md text-center mb-8 px-4">
              I tuoi filtri sono troppo rigidi per questo livello di disagio. Prova a rilassarti un po'.
            </p>
            <button 
              onClick={() => {
                playBlipSound();
                setFilterText('');
                setMinLikes(0);
              }}
              className="px-8 py-4 bg-white border-4 border-black font-black uppercase text-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Pulisci Filtri
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-16">
              {displayedDesigns.map((design, i) => {
                const virtualProduct: Product = {
                  id: design.id,
                  name: `Design by @${design.authorName}`,
                  price: 29.99,
                  image: design.image,
                  category: 'community' as const,
                  memeDescription: design.memeDescription,
                  rarity: 'Epic' as const,
                  color: 'white',
                  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                  colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
                  likes: design.likes,
                  authorName: design.authorName
                };

                return (
                  <motion.div 
                    key={design.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % itemsPerLoad) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard 
                      product={virtualProduct} 
                      onSelect={(p) => {
                        setSelectedProduct(p);
                        setIsCommunityOpen(false);
                      }} 
                      bgColor="bg-yellow-50"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div id="infinite-scroll-sentinel" className="h-20 flex items-center justify-center">
              {visibleCount < processedDesigns.length && (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest">Caricamento altro disagio...</span>
                </div>
              )}
              {visibleCount >= processedDesigns.length && processedDesigns.length > 0 && (
                <div className="py-8 border-t-4 border-black w-full text-center">
                  <span className="font-mono text-sm font-black uppercase tracking-widest opacity-40">Hai raggiunto il fondo del barile. Complimenti.</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
