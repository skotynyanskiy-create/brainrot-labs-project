import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, DollarSign, Heart, Image as ImageIcon, LayoutDashboard, LogOut, Package, Palette, Settings, ShoppingBag, Trash2, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, collection, onSnapshot, orderBy, query, where, Timestamp } from '../../firebase';
import type { CommunityDesign, CustomTemplate } from '../../types';
import { BASE_PRODUCTS, CREATOR_ROYALTY_RATE, STORAGE_KEYS } from '../../constants';
import { playBlipSound } from '../../utils/sounds';
import { cn } from '../../utils/cn';
import AuthPortal from '../account/AuthPortal';
import AccountSettingsPanel from '../account/AccountSettingsPanel';
import { PAYOUT_STATUS_LABELS, getPayoutProviderMeta, getPayoutReadinessIssues, getProfileCompletionScore } from '../../services/payouts/payoutConfig';
import { CREATOR_TERMS_VERSION, ROYALTY_POLICY_VERSION } from '../../services/legal/legalConfig';

interface ProfileDashboardProps {
  onBack: () => void;
  onOpenCreatorTerms: () => void;
  onOpenRoyaltyPolicy: () => void;
}
type AccountTab = 'overview' | 'creations' | 'templates' | 'orders' | 'earnings' | 'settings';
type SavedTemplate = CustomTemplate & { thumbnail?: string };

interface FirestoreOrderItem {
  productId?: string;
  id?: string;
  name?: string;
  image?: string;
  quantity?: number;
  price?: number;
  size?: string | null;
  color?: string | null;
}

interface FirestoreOrderData {
  providerOrderId?: string;
  createdAt?: { toDate?: () => Date };
  status?: string;
  total?: number;
  items?: FirestoreOrderItem[];
}

interface StoredOrder {
  id: string;
  providerOrderId?: string;
  createdAt: string;
  status: string;
  total: number;
  itemsCount: number;
  items: Array<{ id: string; name: string; image: string; quantity: number; price: number; selectedSize?: string | null; selectedColor?: string | null; }>;
}

const ACCOUNT_TABS: Array<{ id: AccountTab; label: string; icon: typeof LayoutDashboard; color: string }> = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-black text-white' },
  { id: 'creations', label: 'Creazioni', icon: ImageIcon, color: 'bg-pink-400' },
  { id: 'templates', label: 'Bozze', icon: Palette, color: 'bg-cyan-400' },
  { id: 'orders', label: 'Ordini', icon: Package, color: 'bg-yellow-400' },
  { id: 'earnings', label: 'Royalty', icon: DollarSign, color: 'bg-green-400' },
  { id: 'settings', label: 'Impostazioni', icon: Settings, color: 'bg-white' },
];

const readStoredCollection = <T,>(storageKey: string): T[] => {
  if (typeof window === 'undefined') return [];

  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch (error) {
    void error;
    return [];
  }
};

function EmptyState({ title }: { title: string }) {
  return (
    <div className="mt-8 border-4 border-dashed border-black bg-gray-50 p-10 text-center">
      <p className="font-mono text-xl uppercase">{title}</p>
    </div>
  );
}

export default function ProfileDashboard({ onBack, onOpenCreatorTerms, onOpenRoyaltyPolicy }: ProfileDashboardProps) {
  const { user, userProfile, logout, saveProfile, loading: authLoading, isDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [myDesigns, setMyDesigns] = useState<CommunityDesign[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => readStoredCollection<SavedTemplate>(STORAGE_KEYS.TEMPLATES));
  const [orders, setOrders] = useState<StoredOrder[]>(() => readStoredCollection<StoredOrder>(STORAGE_KEYS.ORDER_HISTORY));
  const [designsLoading, setDesignsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setMyDesigns([]);
        setDesignsLoading(false);
        setOrdersLoading(false);
      });
      return;
    }

    if (isDemoUser) {
      const demoDesigns: CommunityDesign[] = [
        {
          id: 'demo-design-1',
          authorId: user.uid,
          authorName: userProfile?.displayName || 'Demo Creator',
          image: BASE_PRODUCTS[0].image,
          memeDescription: 'Design demo locale per validare card creazione, metriche vendita e tasso royalty.',
          productType: 'wearable',
          createdAt: Timestamp.fromDate(new Date()),
          likes: 48,
          totalSales: 11,
          totalEarnings: 26.4,
          royaltyRate: CREATOR_ROYALTY_RATE,
          isPublished: true,
        },
      ];
      const demoOrders: StoredOrder[] = [
        {
          id: 'demo-order-1',
          providerOrderId: 'LOCAL-DEMO-001',
          createdAt: new Date().toISOString(),
          status: 'processing',
          total: 42.9,
          itemsCount: 2,
          items: [
            {
              id: BASE_PRODUCTS[0].id,
              name: BASE_PRODUCTS[0].name,
              image: BASE_PRODUCTS[0].image,
              quantity: 1,
              price: BASE_PRODUCTS[0].price,
              selectedSize: BASE_PRODUCTS[0].sizes?.[0] || null,
              selectedColor: BASE_PRODUCTS[0].colors?.[0]?.name || null,
            },
            {
              id: BASE_PRODUCTS[1]?.id || 'demo-item-2',
              name: BASE_PRODUCTS[1]?.name || 'Prodotto demo',
              image: BASE_PRODUCTS[1]?.image || BASE_PRODUCTS[0].image,
              quantity: 1,
              price: BASE_PRODUCTS[1]?.price || 0,
              selectedSize: BASE_PRODUCTS[1]?.sizes?.[0] || null,
              selectedColor: BASE_PRODUCTS[1]?.colors?.[0]?.name || null,
            },
          ],
        },
      ];
      queueMicrotask(() => {
        setMyDesigns(demoDesigns);
        setOrders(demoOrders);
        setDesignsLoading(false);
        setOrdersLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      setDesignsLoading(true);
      setOrdersLoading(true);
    });
    const designQuery = query(collection(db, 'communityDesigns'), where('authorId', '==', user.uid));
    const orderQueryRef = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeDesigns = onSnapshot(designQuery, (snapshot) => {
      setMyDesigns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommunityDesign[]);
      setDesignsLoading(false);
    }, () => setDesignsLoading(false));

    const unsubscribeOrders = onSnapshot(orderQueryRef, (snapshot) => {
      const remoteOrders = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreOrderData;
        return {
          id: doc.id,
          providerOrderId: data.providerOrderId,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          status: data.status || 'pending',
          total: data.total || 0,
          itemsCount: data.items?.reduce?.((sum: number, item: FirestoreOrderItem) => sum + (item.quantity || 0), 0) || data.items?.length || 0,
          items: (data.items || []).map((item: FirestoreOrderItem) => ({
            id: item.productId || item.id || 'unknown',
            name: item.name || item.productId || 'Prodotto',
            image: item.image || BASE_PRODUCTS[0].image,
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
    }, () => setOrdersLoading(false));

    return () => { unsubscribeDesigns(); unsubscribeOrders(); };
  }, [isDemoUser, user, userProfile]);

  const earningsStats = useMemo(() => ({
    totalEarnings: myDesigns.reduce((acc, design) => acc + (design.totalEarnings || 0), 0),
    totalSales: myDesigns.reduce((acc, design) => acc + (design.totalSales || 0), 0),
    totalLikes: myDesigns.reduce((acc, design) => acc + design.likes, 0),
    bestDesign: [...myDesigns].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))[0],
  }), [myDesigns]);

  const profileCompletion = useMemo(() => getProfileCompletionScore(userProfile), [userProfile]);
  const payoutIssues = useMemo(() => getPayoutReadinessIssues(userProfile), [userProfile]);
  const payoutProvider = getPayoutProviderMeta(userProfile?.payoutSetup?.provider || 'none');
  const royaltyWallet = userProfile?.royaltyWallet;
  const totalCreatorEarnings = useMemo(() => {
    const walletTotal = (royaltyWallet?.available ?? 0) + (royaltyWallet?.pending ?? 0) + (royaltyWallet?.paidTotal ?? 0);
    return walletTotal > 0 ? walletTotal : earningsStats.totalEarnings;
  }, [earningsStats.totalEarnings, royaltyWallet]);

  const handleDeleteTemplate = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    playBlipSound();
    const updated = savedTemplates.filter((template) => template.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]"><div className="border-8 border-black bg-white px-10 py-8 font-mono text-xl font-black uppercase shadow-[12px_12px_0_0_rgba(0,0,0,1)]">Caricamento account...</div></div>;
  }
  if (!user) return <AuthPortal onBack={onBack} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#f0f0f0]">
      <div className="sticky top-0 z-40 border-b-8 border-black bg-white px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { playBlipSound(); onBack(); }} className="flex items-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <ArrowLeft className="h-5 w-5" /> Esci
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Account Dashboard</h1>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">creazioni, ordini, royalty, payout e gestione profilo</p>
            </div>
          </div>
          <button onClick={() => { playBlipSound(); logout(); }} className="flex items-center gap-2 border-4 border-black bg-red-500 px-4 py-3 font-black uppercase text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:flex-row">
        <aside className="w-full lg:w-80">
          <div className="border-8 border-black bg-white p-5 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
            <div className="border-4 border-black bg-yellow-400 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em]">Profilo creator</p>
              <h2 className="mt-2 text-2xl font-black uppercase">{userProfile?.displayName || user.displayName || 'Creator'}</h2>
              <p className="mt-1 font-mono text-xs uppercase text-gray-700">@{userProfile?.username || user.email?.split('@')[0] || user.uid.slice(0, 8)}</p>
              <p className="mt-2 text-sm font-black uppercase text-gray-900">{userProfile?.creatorTagline || userProfile?.creatorCategory || 'Profilo creator in setup'}</p>
              <p className="mt-4 text-sm font-medium leading-relaxed">{userProfile?.bio || 'Completa il profilo per gestire payout, dati account e presentazione creator.'}</p>
            </div>
            <div className="mt-4 grid gap-2 text-xs font-mono uppercase">
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>Completamento</span>
                <strong>{profileCompletion}%</strong>
              </div>
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>Payout</span>
                <strong>{PAYOUT_STATUS_LABELS[userProfile?.payoutSetup?.status || 'not_configured']}</strong>
              </div>
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>Wallet</span>
                <strong>EUR {(royaltyWallet?.available ?? 0).toFixed(2)}</strong>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {ACCOUNT_TABS.map((tab) => (
                <button key={tab.id} onClick={() => { playBlipSound(); setActiveTab(tab.id); }} className={cn('flex w-full items-center gap-3 border-4 border-black px-4 py-3 text-left font-black uppercase transition-all', activeTab === tab.id ? `${tab.color} shadow-none translate-x-1 translate-y-1` : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1')}>
                  <tab.icon className="h-5 w-5" /> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 border-8 border-black bg-white p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] md:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Panoramica Account</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="border-4 border-black bg-cyan-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"><LayoutDashboard className="mb-3 h-6 w-6" /><div className="text-3xl font-black">{myDesigns.length}</div><p className="font-mono text-xs uppercase">Creazioni pubblicate</p></div>
                <div className="border-4 border-black bg-yellow-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"><Package className="mb-3 h-6 w-6" /><div className="text-3xl font-black">{orders.length}</div><p className="font-mono text-xs uppercase">Ordini registrati</p></div>
                <div className="border-4 border-black bg-green-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"><DollarSign className="mb-3 h-6 w-6" /><div className="text-3xl font-black">EUR {(royaltyWallet?.available ?? earningsStats.totalEarnings).toFixed(2)}</div><p className="font-mono text-xs uppercase">Saldo disponibile</p></div>
                <div className="border-4 border-black bg-pink-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"><Palette className="mb-3 h-6 w-6" /><div className="text-3xl font-black">{profileCompletion}%</div><p className="font-mono text-xs uppercase">Profilo pronto</p></div>
              </div>

              <div className="grid gap-8 xl:grid-cols-2">
                <section className="border-4 border-black bg-gray-50 p-5">
                  <h3 className="mb-4 border-b-4 border-black pb-4 text-2xl font-black uppercase">Stato account</h3>
                  <div className="space-y-3 text-sm font-mono uppercase">
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Provider accesso</span><strong>{userProfile?.authProvider || 'google'}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Modalita</span><strong>{isDemoUser ? 'demo locale' : 'live'}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Metodo payout</span><strong>{payoutProvider.shortLabel}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Stato payout</span><strong>{PAYOUT_STATUS_LABELS[userProfile?.payoutSetup?.status || 'not_configured']}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Email payout</span><strong>{userProfile?.payoutEmail || user.email || 'non impostata'}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Royalty creator</span><strong>{CREATOR_ROYALTY_RATE}%</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Creator Terms</span><strong>{userProfile?.legalAcceptances?.creatorTerms?.accepted ? 'accettati' : 'da accettare'}</strong></div>
                    <div className="flex justify-between border-2 border-black bg-white px-4 py-3"><span>Royalty Policy</span><strong>{userProfile?.legalAcceptances?.royaltyPolicy?.accepted ? 'accettata' : 'da accettare'}</strong></div>
                  </div>
                </section>
                <section className="border-4 border-black bg-gray-50 p-5">
                  <h3 className="mb-4 border-b-4 border-black pb-4 text-2xl font-black uppercase">Setup creator</h3>
                  <div className="border-2 border-black bg-white px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs uppercase">Profilo completato</span>
                      <strong className="font-black uppercase">{profileCompletion}%</strong>
                    </div>
                    <div className="h-4 border-2 border-black bg-gray-100">
                      <div className="h-full bg-black transition-all" style={{ width: `${profileCompletion}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {payoutIssues.length === 0 ? (
                      <div className="border-2 border-black bg-green-100 px-4 py-3 font-mono text-xs uppercase">Profilo pronto per il collegamento payout finale.</div>
                    ) : (
                      payoutIssues.slice(0, 4).map((issue) => (
                        <div key={issue} className="border-2 border-black bg-yellow-100 px-4 py-3 font-mono text-xs uppercase">{issue}</div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <section className="grid gap-4 xl:grid-cols-3">
                <div className="border-4 border-black bg-black p-5 text-white">
                  <p className="font-black uppercase">Creator public card</p>
                  <p className="mt-3 font-mono text-xs uppercase text-gray-300">{userProfile?.creatorCategory || 'Categoria da definire'}</p>
                  <p className="mt-2 text-lg font-black uppercase">{userProfile?.displayName || 'Creator'}</p>
                  <p className="mt-3 font-mono text-sm leading-relaxed text-gray-300">{userProfile?.creatorTagline || 'Aggiungi una tagline per migliorare il profilo pubblico.'}</p>
                  <p className="mt-3 font-mono text-xs uppercase text-cyan-300">{userProfile?.location || 'Location non impostata'}</p>
                </div>
                <div className="border-4 border-black bg-white p-5">
                  <p className="font-black uppercase">Wallet royalty</p>
                  <div className="mt-4 space-y-3 font-mono text-xs uppercase">
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Disponibile</span><strong>EUR {(royaltyWallet?.available ?? 0).toFixed(2)}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>In attesa</span><strong>EUR {(royaltyWallet?.pending ?? 0).toFixed(2)}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Gia pagato</span><strong>EUR {(royaltyWallet?.paidTotal ?? 0).toFixed(2)}</strong></div>
                  </div>
                </div>
                <div className="border-4 border-black bg-white p-5">
                  <p className="font-black uppercase">Hook integrazione</p>
                  <p className="mt-3 font-mono text-sm leading-relaxed">
                    Il profilo salva già provider, stato, account ID, profilo fiscale e wallet. Il backend finale dovrà solo gestire onboarding e sincronizzazione dal provider.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => { playBlipSound(); onOpenCreatorTerms(); }} className="border-2 border-black bg-cyan-400 px-3 py-2 text-xs font-black uppercase">
                      Apri Creator Terms {CREATOR_TERMS_VERSION}
                    </button>
                    <button onClick={() => { playBlipSound(); onOpenRoyaltyPolicy(); }} className="border-2 border-black bg-green-400 px-3 py-2 text-xs font-black uppercase">
                      Apri Royalty Policy {ROYALTY_POLICY_VERSION}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'creations' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Creazioni</h2>
              {designsLoading ? <p className="mt-8 font-mono text-xl font-black uppercase animate-pulse">Caricamento creazioni...</p> : myDesigns.length === 0 ? <EmptyState title="Nessuna creazione pubblicata." /> : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {myDesigns.map((design) => (
                    <article key={design.id} className="border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="aspect-square overflow-hidden border-b-4 border-black bg-gray-100"><img src={design.image} alt={design.memeDescription} className="h-full w-full object-cover" /></div>
                      <div className="space-y-4 p-4">
                        <p className="font-mono text-sm leading-relaxed">{design.memeDescription}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="border-2 border-black bg-pink-100 px-2 py-2"><Heart className="mx-auto mb-1 h-4 w-4" /><div className="font-black">{design.likes}</div><div className="font-mono text-[10px] uppercase">Like</div></div>
                          <div className="border-2 border-black bg-yellow-100 px-2 py-2"><ShoppingBag className="mx-auto mb-1 h-4 w-4" /><div className="font-black">{design.totalSales || 0}</div><div className="font-mono text-[10px] uppercase">Vendite</div></div>
                          <div className="border-2 border-black bg-green-100 px-2 py-2"><DollarSign className="mx-auto mb-1 h-4 w-4" /><div className="font-black">{(design.totalEarnings || 0).toFixed(2)}</div><div className="font-mono text-[10px] uppercase">EUR</div></div>
                        </div>
                        <div className="flex items-center justify-between border-2 border-black bg-black px-3 py-2 text-xs font-black uppercase text-white"><span>{design.productType || 'community'}</span><span>{(design.royaltyRate || CREATOR_ROYALTY_RATE).toFixed(1)}% royalty</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Bozze e Template</h2>
              {savedTemplates.length === 0 ? <EmptyState title="Nessuna bozza salvata." /> : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {savedTemplates.map((template) => (
                    <article key={template.id} className="relative border-4 border-black bg-cyan-50 p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="mb-4 aspect-square overflow-hidden border-4 border-black bg-white">{template.previewImage || template.thumbnail ? <img src={template.previewImage || template.thumbnail} alt={`Preview di ${template.name}`} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center font-black uppercase opacity-30">No preview</div>}</div>
                      <p className="truncate pr-10 font-black uppercase">{template.name}</p>
                      <p className="mt-2 font-mono text-xs uppercase text-gray-500">{template.baseProductId}</p>
                      <button onClick={(event) => handleDeleteTemplate(template.id, event)} className="absolute right-4 top-4 border-2 border-black bg-red-500 p-2 text-white" aria-label={`Elimina template ${template.name}`}><Trash2 className="h-4 w-4" /></button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Ordini</h2>
              {ordersLoading ? <p className="mt-8 font-mono text-xl font-black uppercase animate-pulse">Caricamento ordini...</p> : orders.length === 0 ? <EmptyState title="Nessun ordine registrato." /> : (
                <div className="mt-8 space-y-6">
                  {orders.map((order) => (
                    <article key={order.id} className="border-4 border-black bg-yellow-50 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-600">{order.providerOrderId || order.id}</p><h3 className="text-2xl font-black uppercase">{new Date(order.createdAt).toLocaleDateString('it-IT')}</h3></div>
                        <div className="flex items-center gap-3"><span className="border-2 border-black bg-black px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-white">{order.status}</span><span className="border-2 border-black bg-white px-3 py-1 font-black uppercase">EUR {order.total.toFixed(2)}</span></div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex gap-3 border-2 border-black bg-white p-3">
                            <img src={item.image} alt={item.name} className="h-20 w-20 border-2 border-black bg-gray-100 object-cover" />
                            <div className="min-w-0"><p className="truncate font-black uppercase">{item.name}</p><p className="font-mono text-xs uppercase text-gray-700">Qta {item.quantity}</p><p className="font-mono text-xs uppercase text-gray-700">{item.selectedSize ? `Taglia ${item.selectedSize}` : 'Taglia standard'}{item.selectedColor ? ` | ${item.selectedColor}` : ''}</p></div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-gray-600">{order.itemsCount} articoli totali</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-8">
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Royalty e Guadagni</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="border-4 border-black bg-green-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"><DollarSign className="mb-2 h-6 w-6" /><div className="text-3xl font-black">EUR {totalCreatorEarnings.toFixed(2)}</div><p className="font-mono text-xs uppercase">Guadagni totali</p></div>
                <div className="border-4 border-black bg-yellow-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"><ShoppingBag className="mb-2 h-6 w-6" /><div className="text-3xl font-black">{earningsStats.totalSales}</div><p className="font-mono text-xs uppercase">Vendite attivate</p></div>
                <div className="border-4 border-black bg-pink-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"><Heart className="mb-2 h-6 w-6" /><div className="text-3xl font-black">EUR {(royaltyWallet?.available ?? 0).toFixed(2)}</div><p className="font-mono text-xs uppercase">Saldo disponibile</p></div>
                <div className="border-4 border-black bg-cyan-400 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"><TrendingUp className="mb-2 h-6 w-6" /><div className="text-3xl font-black">{CREATOR_ROYALTY_RATE}%</div><p className="font-mono text-xs uppercase">Tasso royalty</p></div>
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="border-4 border-black bg-black p-5 text-white">
                  <p className="font-black uppercase">Workflow payout</p>
                  <p className="mt-3 max-w-4xl font-mono text-sm leading-relaxed text-gray-300">Ogni design pubblicato eredita il tasso royalty del {CREATOR_ROYALTY_RATE}%. Il totale maturato viene aggregato qui, mentre stato payout, dati fiscali e metodo di accredito si gestiscono nelle impostazioni.</p>
                  <p className="mt-3 font-mono text-xs uppercase text-green-400">Metodo: {payoutProvider.label}</p>
                  <p className="mt-2 font-mono text-xs uppercase text-green-400">Stato: {PAYOUT_STATUS_LABELS[userProfile?.payoutSetup?.status || 'not_configured']}</p>
                  <p className="mt-2 font-mono text-xs uppercase text-green-400">Payout email: {userProfile?.payoutEmail || user.email || 'non impostata'}</p>
                </div>
                <div className="border-4 border-black bg-white p-5">
                  <p className="font-black uppercase">Wallet timeline</p>
                  <div className="mt-4 space-y-3 font-mono text-xs uppercase">
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Disponibile</span><strong>EUR {(royaltyWallet?.available ?? 0).toFixed(2)}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>In attesa</span><strong>EUR {(royaltyWallet?.pending ?? 0).toFixed(2)}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Totale pagato</span><strong>EUR {(royaltyWallet?.paidTotal ?? 0).toFixed(2)}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Prossimo payout</span><strong>{royaltyWallet?.nextPayoutEstimate || 'da definire'}</strong></div>
                  </div>
                  <div className="mt-4 space-y-2 font-mono text-xs uppercase">
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Creator Terms</span><strong>{userProfile?.legalAcceptances?.creatorTerms?.accepted ? 'ok' : 'mancano'}</strong></div>
                    <div className="flex justify-between border-2 border-black px-3 py-2"><span>Royalty Policy</span><strong>{userProfile?.legalAcceptances?.royaltyPolicy?.accepted ? 'ok' : 'manca'}</strong></div>
                  </div>
                </div>
              </div>
              {designsLoading ? <p className="font-mono text-xl font-black uppercase animate-pulse">Caricamento performance...</p> : myDesigns.length === 0 ? <EmptyState title="Nessun design pubblicato per ora." /> : (
                <div className="space-y-4">
                  {[...myDesigns].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0)).map((design) => (
                    <article key={design.id} className="flex flex-col gap-4 border-4 border-black bg-white p-4 md:flex-row">
                      <img src={design.image} alt={design.memeDescription} className="h-28 w-28 border-4 border-black bg-gray-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm leading-relaxed">{design.memeDescription}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <span className="border-2 border-black bg-green-100 px-3 py-1 text-xs font-black uppercase">EUR {(design.totalEarnings || 0).toFixed(2)}</span>
                          <span className="border-2 border-black bg-yellow-100 px-3 py-1 text-xs font-black uppercase">{design.totalSales || 0} vendite</span>
                          <span className="border-2 border-black bg-pink-100 px-3 py-1 text-xs font-black uppercase">{design.likes} like</span>
                          <span className="border-2 border-black bg-cyan-100 px-3 py-1 text-xs font-black uppercase">{(design.royaltyRate || CREATOR_ROYALTY_RATE).toFixed(1)}% royalty</span>
                        </div>
                      </div>
                      {earningsStats.bestDesign?.id === design.id && <div className="self-start border-2 border-black bg-yellow-400 px-3 py-1 text-xs font-black uppercase">Best performer</div>}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Impostazioni Account</h2>
              <div className="mt-8">
                <AccountSettingsPanel
                  userProfile={userProfile}
                  onSave={saveProfile}
                  onOpenCreatorTerms={onOpenCreatorTerms}
                  onOpenRoyaltyPolicy={onOpenRoyaltyPolicy}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
