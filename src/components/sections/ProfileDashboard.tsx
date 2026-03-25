import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy } from '../../firebase';
import { CommunityDesign } from '../../types';
import { motion } from 'motion/react';
import { ArrowLeft, LogOut, Package, Palette, Image as ImageIcon, Heart, Trash2, DollarSign, TrendingUp, ShoppingBag, Star } from 'lucide-react';
import { playBlipSound } from '../../utils/sounds';
import { cn } from '../../utils/cn';

interface ProfileDashboardProps {
  onBack: () => void;
}

const ORDER_HISTORY_STORAGE_KEY = 'brainrot_order_history';

interface StoredOrder {
  id: string;
  providerOrderId?: string;
  createdAt: string;
  status: string;
  total: number;
  itemsCount: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    selectedSize?: string | null;
    selectedColor?: string | null;
  }>;
}

export default function ProfileDashboard({ onBack }: ProfileDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'community' | 'orders' | 'earnings'>('community');
  const [myDesigns, setMyDesigns] = useState<CommunityDesign[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const loadedTemplates = localStorage.getItem('brainrot_templates');
    if (loadedTemplates) {
      try {
        setSavedTemplates(JSON.parse(loadedTemplates));
      } catch (error) {
        console.error(error);
      }
    }

    const loadedOrders = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (loadedOrders) {
      try {
        setOrders(JSON.parse(loadedOrders));
      } catch (error) {
        console.error(error);
      }
    }

    if (!user) {
      setLoading(false);
      setOrdersLoading(false);
      return;
    }

    const designQuery = query(collection(db, 'communityDesigns'), where('authorId', '==', user.uid));
    const orderQueryRef = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeDesigns = onSnapshot(
      designQuery,
      (snapshot) => {
        const designs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommunityDesign[];
        setMyDesigns(designs);
        setLoading(false);
      },
      (error) => {
        console.warn('Community profile feed fallback:', error);
        setLoading(false);
      }
    );

    const unsubscribeOrders = onSnapshot(
      orderQueryRef,
      (snapshot) => {
        const remoteOrders = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            providerOrderId: data.providerOrderId,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            status: data.status || 'pending',
            total: data.total || 0,
            itemsCount: data.items?.reduce?.((sum: number, item: any) => sum + (item.quantity || 0), 0) || data.items?.length || 0,
            items: (data.items || []).map((item: any) => ({
              id: item.productId || item.id || 'unknown',
              name: item.name || item.productId || 'Prodotto',
              image: item.image || 'https://picsum.photos/seed/order-fallback/400/400',
              quantity: item.quantity || 1,
              price: item.price || 0,
              selectedSize: item.size || null,
              selectedColor: item.color || null,
            })),
          } as StoredOrder;
        });

        setOrders((current) => {
          const merged = new Map<string, StoredOrder>();
          [...remoteOrders, ...current].forEach((order) => merged.set(order.id, order));
          return Array.from(merged.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        });
        setOrdersLoading(false);
      },
      (error) => {
        console.warn('Order history fallback to localStorage:', error);
        setOrdersLoading(false);
      }
    );

    return () => {
      unsubscribeDesigns();
      unsubscribeOrders();
    };
  }, [user]);

  const earningsStats = useMemo(() => {
    const totalEarnings = myDesigns.reduce((acc, d) => acc + (d.totalEarnings || 0), 0);
    const totalSales = myDesigns.reduce((acc, d) => acc + (d.totalSales || 0), 0);
    const totalLikes = myDesigns.reduce((acc, d) => acc + d.likes, 0);
    const bestDesign = [...myDesigns].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))[0];
    return { totalEarnings, totalSales, totalLikes, bestDesign };
  }, [myDesigns]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center justify-center p-6">
        <h2 className="text-4xl font-black uppercase mb-4">Mettiti in coda, bro!</h2>
        <p className="text-lg font-mono mb-8">Devi fare il login per vedere questa pagina.</p>
        <button onClick={onBack} className="px-6 py-3 border-4 border-black bg-cyan-400 font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
          Torna Indietro
        </button>
      </div>
    );
  }

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playBlipSound();
    const updated = savedTemplates.filter((template) => template.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('brainrot_templates', JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f0f0f0] flex flex-col font-sans"
    >
      <div className="bg-white border-b-8 border-black p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playBlipSound(); onBack(); }}
            className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-black uppercase"
          >
            <ArrowLeft className="w-5 h-5" /> ESCI
          </motion.button>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter hidden sm:block">IL MIO DISAGIO</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-black uppercase">{user.displayName || 'Utente Anonimo'}</p>
            <p className="text-xs font-mono">{user.email}</p>
          </div>
          <button
            onClick={() => { playBlipSound(); logout(); }}
            className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-red-500 text-white hover:bg-black transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] font-black uppercase"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        <div className="w-full md:w-64 flex flex-col gap-4">
          <button
            onClick={() => { playBlipSound(); setActiveTab('community'); }}
            className={cn(
              'flex items-center gap-3 p-4 border-4 border-black font-black uppercase transition-all',
              activeTab === 'community' ? 'bg-pink-400 shadow-[6px_6px_0_0_rgba(0,0,0,1)] translate-x-1' : 'bg-white hover:bg-gray-100'
            )}
          >
            <ImageIcon className="w-6 h-6" /> Community Posts
          </button>
          <button
            onClick={() => { playBlipSound(); setActiveTab('templates'); }}
            className={cn(
              'flex items-center gap-3 p-4 border-4 border-black font-black uppercase transition-all',
              activeTab === 'templates' ? 'bg-cyan-400 shadow-[6px_6px_0_0_rgba(0,0,0,1)] translate-x-1' : 'bg-white hover:bg-gray-100'
            )}
          >
            <Palette className="w-6 h-6" /> Template Salvati
          </button>
          <button
            onClick={() => { playBlipSound(); setActiveTab('orders'); }}
            className={cn(
              'flex items-center gap-3 p-4 border-4 border-black font-black uppercase transition-all',
              activeTab === 'orders' ? 'bg-yellow-400 shadow-[6px_6px_0_0_rgba(0,0,0,1)] translate-x-1' : 'bg-white hover:bg-gray-100'
            )}
          >
            <Package className="w-6 h-6" /> I Miei Ordini
          </button>
          <button
            onClick={() => { playBlipSound(); setActiveTab('earnings'); }}
            className={cn(
              'flex items-center gap-3 p-4 border-4 border-black font-black uppercase transition-all relative',
              activeTab === 'earnings' ? 'bg-green-400 shadow-[6px_6px_0_0_rgba(0,0,0,1)] translate-x-1' : 'bg-white hover:bg-gray-100'
            )}
          >
            <DollarSign className="w-6 h-6" /> Royalty & Guadagni
            {earningsStats.totalEarnings > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-400 border-2 border-black text-black font-black text-xs px-2 py-0.5">
                €{earningsStats.totalEarnings.toFixed(0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex-grow bg-white border-8 border-black p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          {activeTab === 'community' && (
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">I Tuoi Capolavori</h2>
              {loading ? (
                <p className="font-mono text-xl animate-pulse">CARICAMENTO...</p>
              ) : myDesigns.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-black bg-gray-50">
                  <p className="font-mono text-xl mb-4">Non hai ancora pubblicato nulla.</p>
                  <p className="font-black uppercase text-pink-500">Che aspetti?!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myDesigns.map((design) => (
                    <div key={design.id} className="border-4 border-black bg-white group">
                      <div className="aspect-square bg-gray-100 border-b-4 border-black overflow-hidden relative">
                        <img src={design.image} alt={`Design di ${design.authorName}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-2 right-2 bg-white border-2 border-black flex items-center gap-1 px-2 py-1 font-black text-xs">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {design.likes || 0}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-mono text-sm truncate">{design.memeDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">Bozze Locali</h2>
              {savedTemplates.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-black bg-gray-50">
                  <p className="font-mono text-xl">Nessun template salvato in localStorage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTemplates.map((template) => (
                    <div key={template.id} className="border-4 border-black p-4 relative bg-cyan-50 group">
                      <div className="aspect-square border-4 border-black bg-white mb-4 overflow-hidden relative">
                        {template.thumbnail ? (
                          <img src={template.thumbnail} alt={`Anteprima template ${template.name}`} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black uppercase opacity-20">NO PREVIEW</div>
                        )}
                      </div>
                      <p className="font-black uppercase truncate pr-8">{template.name}</p>
                      <button
                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                        aria-label={`Elimina template ${template.name}`}
                        className="absolute right-4 bottom-4 p-2 bg-red-500 text-white border-2 border-black hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">Royalty & Guadagni</h2>

              {/* Stats overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-green-400 border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <DollarSign className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-black">€{earningsStats.totalEarnings.toFixed(2)}</div>
                  <p className="font-mono text-xs uppercase">Totale Guadagnato</p>
                </div>
                <div className="bg-yellow-400 border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <ShoppingBag className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-black">{earningsStats.totalSales}</div>
                  <p className="font-mono text-xs uppercase">Vendite Totali</p>
                </div>
                <div className="bg-pink-400 border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Heart className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-black">{earningsStats.totalLikes}</div>
                  <p className="font-mono text-xs uppercase">Like Totali</p>
                </div>
                <div className="bg-cyan-400 border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <div className="text-3xl font-black">12%</div>
                  <p className="font-mono text-xs uppercase">Tasso Royalty</p>
                </div>
              </div>

              {/* Info banner */}
              <div className="bg-black text-white border-4 border-black p-5 mb-8 flex items-start gap-4">
                <Star className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <p className="font-black uppercase text-sm mb-1">Come funzionano le Royalty?</p>
                  <p className="font-mono text-sm text-gray-300">
                    Ogni volta che un altro utente acquista un prodotto con il tuo design, ricevi automaticamente il{' '}
                    <strong className="text-green-400">12%</strong> del prezzo di vendita. I guadagni si accumulano
                    e vengono erogati mensilmente tramite il metodo di pagamento impostato nel tuo profilo.
                  </p>
                </div>
              </div>

              {/* Per-design earnings */}
              {loading ? (
                <p className="font-mono text-xl animate-pulse">CARICAMENTO...</p>
              ) : myDesigns.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-black bg-gray-50">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-mono text-xl mb-2">Non hai ancora design pubblicati.</p>
                  <p className="font-black uppercase text-green-600">Pubblica un design per iniziare a guadagnare!</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">Performance per Design</h3>
                  <div className="flex flex-col gap-4">
                    {[...myDesigns].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0)).map((design) => (
                      <div key={design.id} className="flex gap-4 border-4 border-black bg-white p-4">
                        <div className="w-20 h-20 shrink-0 border-4 border-black overflow-hidden bg-gray-100">
                          <img src={design.image} alt={design.memeDescription} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm truncate mb-2">{design.memeDescription}</p>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1 bg-green-100 border-2 border-green-400 px-2 py-1">
                              <DollarSign className="w-3 h-3 text-green-600" />
                              <span className="font-black text-sm text-green-700">€{(design.totalEarnings || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 border-2 border-gray-300 px-2 py-1">
                              <ShoppingBag className="w-3 h-3 text-gray-500" />
                              <span className="font-mono text-xs">{design.totalSales || 0} vendite</span>
                            </div>
                            <div className="flex items-center gap-1 bg-pink-100 border-2 border-pink-300 px-2 py-1">
                              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                              <span className="font-mono text-xs">{design.likes} like</span>
                            </div>
                          </div>
                        </div>
                        {earningsStats.bestDesign?.id === design.id && (
                          <div className="shrink-0 bg-yellow-400 border-2 border-black px-3 py-1 font-black text-xs uppercase self-start -rotate-2">
                            ★ Best
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">Storico Ordini</h2>
              {ordersLoading ? (
                <p className="font-mono text-xl animate-pulse">CARICAMENTO ORDINI...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border-4 border-dashed border-black bg-yellow-50">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-mono text-xl">Ancora nessun ordine registrato.</p>
                  <p className="font-black uppercase">Appena completi il checkout, li vedi qui.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <article key={order.id} className="border-4 border-black bg-yellow-50 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-600">
                            {order.providerOrderId || order.id}
                          </p>
                          <h3 className="text-2xl font-black uppercase">{new Date(order.createdAt).toLocaleDateString('it-IT')}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="border-2 border-black bg-black px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-white">
                            {order.status}
                          </span>
                          <span className="border-2 border-black bg-white px-3 py-1 font-black uppercase">
                            EUR {order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex gap-3 border-2 border-black bg-white p-3">
                            <img src={item.image} alt={item.name} className="h-20 w-20 border-2 border-black object-cover bg-gray-100" />
                            <div className="min-w-0">
                              <p className="truncate font-black uppercase">{item.name}</p>
                              <p className="font-mono text-xs uppercase text-gray-700">Qta {item.quantity}</p>
                              <p className="font-mono text-xs uppercase text-gray-700">
                                {item.selectedSize ? `Taglia ${item.selectedSize}` : 'Taglia standard'}
                                {item.selectedColor ? ` | ${item.selectedColor}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-gray-600">
                        {order.itemsCount} articoli totali
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
