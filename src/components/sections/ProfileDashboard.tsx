import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Boxes, DollarSign, Image as ImageIcon, LogOut, Package, Settings, Truck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { db, collection, onSnapshot, orderBy, query, where, Timestamp } from '../../firebase';
import type { CommunityDesign, UserProfile } from '../../types';
import { BASE_PRODUCTS, CREATOR_ROYALTY_RATE, STORAGE_KEYS } from '../../constants';
import { playBlipSound } from '../../utils/sounds';
import AuthPortal from '../account/AuthPortal';
import AccountSettingsPanel from '../account/AccountSettingsPanel';
import { getPayoutReadinessIssues, getProfileCompletionScore, PAYOUT_STATUS_LABELS } from '../../services/payouts/payoutConfig';

interface ProfileDashboardProps {
  onBack: () => void;
  onOpenCreatorTerms: () => void;
  onOpenRoyaltyPolicy: () => void;
}

type AccountTab = 'overview' | 'designs' | 'orders' | 'settings';

interface FirestoreOrderItem {
  productId?: string;
  id?: string;
  name?: string;
  image?: string;
  quantity?: number;
  price?: number;
  unitPrice?: number;
  size?: string | null;
  color?: string | null;
}

interface FirestoreOrderData {
  stripeSessionId?: string | null;
  printfulOrderId?: number | null;
  createdAt?: { toDate?: () => Date };
  paymentStatus?: string;
  fulfillmentStatus?: string;
  shippingLabel?: string | null;
  tracking?: {
    number?: string | null;
    url?: string | null;
    carrier?: string | null;
  };
  amounts?: {
    total?: number;
  };
  items?: FirestoreOrderItem[];
}

interface StoredOrder {
  id: string;
  providerOrderId?: string;
  printfulOrderId?: number | null;
  stripeSessionId?: string | null;
  createdAt: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  statusLabel: string;
  total: number;
  itemsCount: number;
  tracking?: {
    number?: string | null;
    url?: string | null;
    carrier?: string | null;
  };
  shippingLabel?: string | null;
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

const ACCOUNT_TABS: Array<{ id: AccountTab; label: string; icon: typeof Boxes; tone: string }> = [
  { id: 'overview', label: 'Overview', icon: Boxes, tone: 'bg-black text-white' },
  { id: 'designs', label: 'Design', icon: ImageIcon, tone: 'bg-cyan-400 text-black' },
  { id: 'orders', label: 'Ordini', icon: Package, tone: 'bg-yellow-400 text-black' },
  { id: 'settings', label: 'Impostazioni', icon: Settings, tone: 'bg-white text-black' },
];

function readStoredCollection<T>(storageKey: string): T[] {
  if (typeof window === 'undefined') return [];
  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return [];
  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [];
  }
}

function formatOrderStatus(paymentStatus?: string, fulfillmentStatus?: string) {
  if (paymentStatus === 'refunded') return 'Rimborsato';
  if (paymentStatus === 'failed') return 'Pagamento fallito';
  if (paymentStatus === 'cancelled') return 'Annullato';
  if (paymentStatus !== 'paid') return 'In attesa pagamento';

  switch (fulfillmentStatus) {
    case 'delivered':
      return 'Consegnato';
    case 'shipped':
      return 'Spedito';
    case 'submitted':
      return 'In produzione';
    case 'queued':
      return 'In coda';
    case 'failed':
      return 'Fulfillment fallito';
    default:
      return 'Pagato';
  }
}

function normalizeStoredOrder(order: Partial<StoredOrder> & { id: string }): StoredOrder {
  const paymentStatus = order.paymentStatus || 'pending';
  const fulfillmentStatus = order.fulfillmentStatus || 'draft';
  return {
    id: order.id,
    providerOrderId: order.providerOrderId,
    printfulOrderId: order.printfulOrderId ?? null,
    stripeSessionId: order.stripeSessionId ?? null,
    createdAt: order.createdAt || new Date().toISOString(),
    paymentStatus,
    fulfillmentStatus,
    statusLabel: order.statusLabel || formatOrderStatus(paymentStatus, fulfillmentStatus),
    total: order.total || 0,
    itemsCount: order.itemsCount || order.items?.length || 0,
    tracking: order.tracking,
    shippingLabel: order.shippingLabel ?? null,
    items: order.items || [],
  };
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="border-4 border-dashed border-black bg-gray-50 p-10 text-center">
      <p className="font-mono text-xl uppercase">{title}</p>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="border-4 border-black bg-black p-6 text-white">
      <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Creator profile</p>
      <h2 className="mt-4 text-4xl font-black uppercase tracking-tighter">
        @{profile?.username || profile?.email?.split('@')[0] || 'creator'}
      </h2>
      <p className="mt-2 text-lg font-black uppercase">{profile?.displayName || 'Profilo non completato'}</p>
      <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-gray-300">
        {profile?.creatorTagline || 'Aggiungi una tagline chiara per raccontare stile, tono e tipo di design che pubblichi.'}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {profile?.location && <span className="border border-white/20 px-3 py-1 font-mono text-xs uppercase">{profile.location}</span>}
        {profile?.socialHandle && <span className="border border-white/20 px-3 py-1 font-mono text-xs uppercase">{profile.socialHandle}</span>}
        <span className="border border-white/20 px-3 py-1 font-mono text-xs uppercase">
          Payout: {PAYOUT_STATUS_LABELS[profile?.payoutSetup?.status || 'not_configured']}
        </span>
      </div>
    </div>
  );
}

export default function ProfileDashboard({ onBack, onOpenCreatorTerms, onOpenRoyaltyPolicy }: ProfileDashboardProps) {
  const { user, userProfile, logout, saveProfile, loading: authLoading, isDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [myDesigns, setMyDesigns] = useState<CommunityDesign[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>(() => readStoredCollection<StoredOrder>(STORAGE_KEYS.ORDER_HISTORY).map((order) => normalizeStoredOrder(order)));
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
          memeDescription: 'Design demo locale per testare overview creator, publish e ordini collegati.',
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
        normalizeStoredOrder({
          id: 'demo-order-1',
          providerOrderId: 'PF-DEMO-001',
          createdAt: new Date().toISOString(),
          paymentStatus: 'paid',
          fulfillmentStatus: 'submitted',
          total: 42.9,
          itemsCount: 2,
          shippingLabel: 'Standard',
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
          ],
        }),
      ];

      queueMicrotask(() => {
        setMyDesigns(demoDesigns);
        setOrders(demoOrders);
        setDesignsLoading(false);
        setOrdersLoading(false);
      });
      return;
    }

    setDesignsLoading(true);
    setOrdersLoading(true);

    const designQuery = query(collection(db, 'communityDesigns'), where('authorId', '==', user.uid));
    const orderQueryRef = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribeDesigns = onSnapshot(designQuery, (snapshot) => {
      setMyDesigns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommunityDesign[]);
      setDesignsLoading(false);
    }, () => setDesignsLoading(false));

    const unsubscribeOrders = onSnapshot(orderQueryRef, (snapshot) => {
      const remoteOrders = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreOrderData;
        const paymentStatus = data.paymentStatus || 'pending';
        const fulfillmentStatus = data.fulfillmentStatus || 'draft';

        return normalizeStoredOrder({
          id: doc.id,
          providerOrderId: data.printfulOrderId ? `PF-${data.printfulOrderId}` : data.stripeSessionId || undefined,
          printfulOrderId: data.printfulOrderId ?? null,
          stripeSessionId: data.stripeSessionId ?? null,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          paymentStatus,
          fulfillmentStatus,
          total: data.amounts?.total || 0,
          itemsCount: data.items?.reduce?.((sum: number, item: FirestoreOrderItem) => sum + (item.quantity || 0), 0) || data.items?.length || 0,
          tracking: data.tracking,
          shippingLabel: data.shippingLabel ?? null,
          items: (data.items || []).map((item: FirestoreOrderItem) => ({
            id: item.productId || item.id || 'unknown',
            name: item.name || item.productId || 'Prodotto',
            image: item.image || BASE_PRODUCTS[0].image,
            quantity: item.quantity || 1,
            price: item.unitPrice || item.price || 0,
            selectedSize: item.size || null,
            selectedColor: item.color || null,
          })),
        });
      });

      setOrders((current) => {
        const merged = new Map<string, StoredOrder>();
        [...remoteOrders, ...current].forEach((order) => merged.set(order.id, normalizeStoredOrder(order)));
        return Array.from(merged.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      });
      setOrdersLoading(false);
    }, () => setOrdersLoading(false));

    return () => {
      unsubscribeDesigns();
      unsubscribeOrders();
    };
  }, [isDemoUser, user, userProfile]);

  const wallet = userProfile?.royaltyWallet;
  const readinessIssues = useMemo(() => getPayoutReadinessIssues(userProfile), [userProfile]);
  const profileCompletion = useMemo(() => getProfileCompletionScore(userProfile), [userProfile]);
  const recentOrders = orders.slice(0, 3);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0]">
        <div className="border-8 border-black bg-white px-10 py-8 font-mono text-xl font-black uppercase shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          Caricamento account...
        </div>
      </div>
    );
  }

  if (!user) return <AuthPortal onBack={onBack} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#f3f0ea]">
      <div className="sticky top-0 z-40 border-b-8 border-black bg-white px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { playBlipSound(); onBack(); }}
              className="flex items-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
            >
              <ArrowLeft className="h-5 w-5" />
              Esci
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Account Dashboard</h1>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">creazioni, ordini, royalty e impostazioni essenziali</p>
            </div>
          </div>
          <button
            onClick={() => { playBlipSound(); logout(); }}
            className="flex items-center gap-2 border-4 border-black bg-black px-4 py-3 font-black uppercase text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-red-500 hover:shadow-none"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:px-10 lg:flex-row">
        <aside className="w-full lg:w-80">
          <div className="border-8 border-black bg-white p-5 shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
            <ProfileSummary profile={userProfile} />

            <div className="mt-5 grid gap-2 font-mono text-xs uppercase">
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>Profilo</span>
                <strong>{profileCompletion}%</strong>
              </div>
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>Disponibile</span>
                <strong>EUR {(wallet?.available ?? 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between border-2 border-black bg-white px-3 py-2">
                <span>In attesa</span>
                <strong>EUR {(wallet?.pending ?? 0).toFixed(2)}</strong>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {ACCOUNT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { playBlipSound(); setActiveTab(tab.id); }}
                  className={`flex w-full items-center gap-3 border-4 border-black px-4 py-3 text-left font-black uppercase transition-all ${
                    activeTab === tab.id
                      ? `${tab.tone} translate-x-1 translate-y-1 shadow-none`
                      : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 border-8 border-black bg-white p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] md:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="border-4 border-black bg-cyan-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <ImageIcon className="mb-3 h-6 w-6" />
                  <div className="text-3xl font-black">{myDesigns.length}</div>
                  <p className="font-mono text-xs uppercase">Design pubblicati</p>
                </div>
                <div className="border-4 border-black bg-yellow-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <Package className="mb-3 h-6 w-6" />
                  <div className="text-3xl font-black">{orders.length}</div>
                  <p className="font-mono text-xs uppercase">Ordini registrati</p>
                </div>
                <div className="border-4 border-black bg-green-400 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <DollarSign className="mb-3 h-6 w-6" />
                  <div className="text-3xl font-black">EUR {(wallet?.available ?? 0).toFixed(2)}</div>
                  <p className="font-mono text-xs uppercase">Royalty disponibili</p>
                </div>
                <div className="border-4 border-black bg-black p-5 text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                  <Truck className="mb-3 h-6 w-6" />
                  <div className="text-3xl font-black">{recentOrders.filter((order) => order.fulfillmentStatus === 'shipped' || order.fulfillmentStatus === 'delivered').length}</div>
                  <p className="font-mono text-xs uppercase">Ordini spediti</p>
                </div>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="border-4 border-black bg-gray-50 p-5">
                  <h3 className="mb-4 border-b-4 border-black pb-4 text-2xl font-black uppercase">Stato profilo</h3>
                  <div className="border-2 border-black bg-white px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs uppercase">Completamento profilo</span>
                      <strong className="font-black uppercase">{profileCompletion}%</strong>
                    </div>
                    <div className="h-4 border-2 border-black bg-gray-100">
                      <div className="h-full bg-black transition-all" style={{ width: `${profileCompletion}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {readinessIssues.length === 0 ? (
                      <div className="border-2 border-black bg-green-100 px-4 py-3 font-mono text-xs uppercase">
                        Profilo pronto per publish, ordini e payout.
                      </div>
                    ) : (
                      readinessIssues.map((issue) => (
                        <div key={issue} className="border-2 border-black bg-yellow-100 px-4 py-3 font-mono text-xs uppercase">
                          {issue}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="border-4 border-black bg-gray-50 p-5">
                  <h3 className="mb-4 border-b-4 border-black pb-4 text-2xl font-black uppercase">Ordini recenti</h3>
                  {ordersLoading ? (
                    <p className="font-mono text-sm font-black uppercase animate-pulse">Caricamento ordini...</p>
                  ) : recentOrders.length === 0 ? (
                    <EmptyState title="Nessun ordine registrato." />
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="border-2 border-black bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{order.providerOrderId || order.id}</p>
                              <p className="font-black uppercase">{order.statusLabel}</p>
                            </div>
                            <p className="font-black uppercase">EUR {order.total.toFixed(2)}</p>
                          </div>
                          {(order.shippingLabel || order.tracking?.number) && (
                            <p className="mt-3 font-mono text-xs uppercase text-gray-600">
                              {order.shippingLabel || 'Tracking'}{order.tracking?.number ? ` · ${order.tracking.number}` : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === 'designs' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">I tuoi design</h2>
              {designsLoading ? (
                <p className="mt-8 font-mono text-xl font-black uppercase animate-pulse">Caricamento design...</p>
              ) : myDesigns.length === 0 ? (
                <div className="mt-8">
                  <EmptyState title="Nessun design pubblicato." />
                </div>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {myDesigns.map((design) => (
                    <article key={design.id} className="border-4 border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="aspect-square overflow-hidden border-b-4 border-black bg-gray-100">
                        <img src={design.image} alt={design.memeDescription} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-4 p-4">
                        <p className="font-mono text-sm leading-relaxed">{design.memeDescription}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="border-2 border-black bg-pink-100 px-2 py-2">
                            <div className="font-black">{design.likes}</div>
                            <div className="font-mono text-[10px] uppercase">Like</div>
                          </div>
                          <div className="border-2 border-black bg-yellow-100 px-2 py-2">
                            <div className="font-black">{design.totalSales || 0}</div>
                            <div className="font-mono text-[10px] uppercase">Vendite</div>
                          </div>
                          <div className="border-2 border-black bg-green-100 px-2 py-2">
                            <div className="font-black">{(design.totalEarnings || 0).toFixed(2)}</div>
                            <div className="font-mono text-[10px] uppercase">EUR</div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Ordini</h2>
              {ordersLoading ? (
                <p className="mt-8 font-mono text-xl font-black uppercase animate-pulse">Caricamento ordini...</p>
              ) : orders.length === 0 ? (
                <div className="mt-8">
                  <EmptyState title="Nessun ordine registrato." />
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {orders.map((order) => (
                    <article key={order.id} className="border-4 border-black bg-yellow-50 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gray-600">{order.providerOrderId || order.id}</p>
                          <h3 className="text-2xl font-black uppercase">{new Date(order.createdAt).toLocaleDateString('it-IT')}</h3>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">
                            pagamento {order.paymentStatus} · fulfillment {order.fulfillmentStatus}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="border-2 border-black bg-black px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-white">{order.statusLabel}</span>
                          <span className="border-2 border-black bg-white px-3 py-1 font-black uppercase">EUR {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex gap-3 border-2 border-black bg-white p-3">
                            <img src={item.image} alt={item.name} className="h-20 w-20 border-2 border-black bg-gray-100 object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-black uppercase">{item.name}</p>
                              <p className="font-mono text-xs uppercase text-gray-700">Qta {item.quantity}</p>
                              <p className="font-mono text-xs uppercase text-gray-700">
                                {item.selectedSize ? `Variante ${item.selectedSize}` : 'Variante standard'}
                                {item.selectedColor ? ` | ${item.selectedColor}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {(order.shippingLabel || order.tracking?.number || order.tracking?.url) && (
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          {order.shippingLabel && (
                            <div className="border-2 border-black bg-white px-3 py-2">
                              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">Spedizione</p>
                              <p className="font-black uppercase">{order.shippingLabel}</p>
                            </div>
                          )}
                          {order.tracking?.number && (
                            <div className="border-2 border-black bg-white px-3 py-2">
                              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">Tracking</p>
                              <p className="font-black uppercase">{order.tracking.number}</p>
                            </div>
                          )}
                          {order.tracking?.url && (
                            <a
                              href={order.tracking.url}
                              target="_blank"
                              rel="noreferrer"
                              className="border-2 border-black bg-cyan-400 px-3 py-2 font-black uppercase transition-colors hover:bg-black hover:text-white"
                            >
                              Apri tracking
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="border-b-4 border-black pb-4 text-4xl font-black uppercase italic">Impostazioni essenziali</h2>
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
