import { X, Trash2, AlertTriangle, CheckCircle2, ShoppingBag, LogIn, MapPin, Truck, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { createCheckoutSession, getShippingQuote } from '../../services/commerce/client';
import type { ShippingAddressInput } from '../../services/commerce/types';
import { playBlipSound } from '../../utils/sounds';
import { logger } from '../../utils/logger';

type ShippingAddress = ShippingAddressInput;

type LocalShippingOption = {
  id: string;
  shipping: string;
  label: string;
  rate: number;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
};

const EMPTY_ADDRESS: ShippingAddress = {
  name: '',
  surname: '',
  address: '',
  city: '',
  zip: '',
  province: '',
  country: 'Italia',
  phone: '',
};

type CheckoutState = 'idle' | 'address' | 'shipping' | 'review' | 'loading' | 'success' | 'error' | 'needs-login';

const LOCAL_CHECKOUT_ENABLED = import.meta.env.DEV;

function buildLocalShippingOptions(orderTotal: number, country: string): LocalShippingOption[] {
  const isItaly = country.toLowerCase().includes('ital');
  const standardRate = orderTotal >= 49 ? 0 : isItaly ? 5.9 : 8.9;
  const expressRate = isItaly ? 11.9 : 16.9;

  return [
    {
      id: 'local-standard',
      shipping: 'STANDARD',
      label: standardRate === 0 ? 'Standard gratuita' : 'Standard',
      rate: standardRate,
      currency: 'EUR',
      minDeliveryDays: isItaly ? 3 : 5,
      maxDeliveryDays: isItaly ? 5 : 8,
    },
    {
      id: 'local-express',
      shipping: 'EXPRESS',
      label: 'Express',
      rate: expressRate,
      currency: 'EUR',
      minDeliveryDays: isItaly ? 1 : 2,
      maxDeliveryDays: isItaly ? 2 : 4,
    },
  ];
}

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Partial<ShippingAddress>>({});
  const [loadingMessage, setLoadingMessage] = useState('Prepariamo spedizione e checkout sicuro...');
  const [shippingOptions, setShippingOptions] = useState<LocalShippingOption[]>([]);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const checkoutStatus = url.searchParams.get('checkout');

    if (checkoutStatus === 'success') {
      clearCart();
      setCheckoutState('success');
      setIsCartOpen(true);
      addToast('Pagamento confermato. Ti aggiorneremo con tracking e stato ordine.', 'success');
      url.searchParams.delete('checkout');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      return;
    }

    if (checkoutStatus === 'cancel') {
      setCheckoutState('idle');
      setIsCartOpen(true);
      addToast('Checkout annullato. Il carrello e rimasto invariato.', 'warning');
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [addToast, clearCart, setIsCartOpen]);

  const validateAddress = (): boolean => {
    const errors: Partial<ShippingAddress> = {};
    if (!shippingAddress.name.trim()) errors.name = 'Obbligatorio';
    if (!shippingAddress.surname.trim()) errors.surname = 'Obbligatorio';
    if (!shippingAddress.address.trim()) errors.address = 'Obbligatorio';
    if (!shippingAddress.city.trim()) errors.city = 'Obbligatorio';
    if (!shippingAddress.zip.trim()) {
      errors.zip = 'Obbligatorio';
    } else {
      const isItalian = shippingAddress.country.toLowerCase().includes('ital');
      const zipOk = isItalian ? /^\d{5}$/.test(shippingAddress.zip.trim()) : shippingAddress.zip.trim().length >= 2;
      if (!zipOk) errors.zip = isItalian ? 'CAP non valido (5 cifre)' : 'CAP non valido';
    }
    if (!shippingAddress.province.trim()) errors.province = 'Obbligatorio';
    if (!shippingAddress.country.trim()) errors.country = 'Obbligatorio';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetOverlayState = () => {
    setCheckoutState('idle');
    setLoadingMessage('Prepariamo spedizione e checkout sicuro...');
    setAddressErrors({});
    setShippingOptions([]);
    setSelectedShippingOptionId('');
  };

  const handleCheckout = () => {
    playBlipSound();
    if (!LOCAL_CHECKOUT_ENABLED && items.some((item) => item.designId?.startsWith('local-dev-'))) {
      addToast('Questo carrello contiene bozze locali: attiva le Functions o usa un account reale per il checkout.', 'warning');
      return;
    }
    if (!LOCAL_CHECKOUT_ENABLED && !user) {
      setCheckoutState('needs-login');
      return;
    }
    setCheckoutState('address');
  };

  const selectedShippingOption = shippingOptions.find((option) => option.id === selectedShippingOptionId) ?? shippingOptions[0];
  const checkoutGrandTotal = total + (selectedShippingOption?.rate ?? 0);

  const handleAddressSubmit = async () => {
    if (!validateAddress()) return;

    playBlipSound();
    if (LOCAL_CHECKOUT_ENABLED) {
      const options = buildLocalShippingOptions(total, shippingAddress.country);
      setShippingOptions(options);
      setSelectedShippingOptionId(options[0]?.id ?? '');
      setCheckoutState('shipping');
      return;
    }

    if (!user) return;

    setCheckoutState('loading');

    try {
      setLoadingMessage('Calcolo spedizione reale con Printful...');
      const shippingQuote = await getShippingQuote({
        cartItems: items,
        shippingAddress,
      });

      const selectedOption = shippingQuote.options[0];
      if (!selectedOption) {
        throw new Error('Nessuna opzione di spedizione disponibile.');
      }

      setLoadingMessage('Creo la sessione Stripe sicura...');
      const session = await createCheckoutSession({
        cartItems: items,
        shippingAddress,
        quoteId: shippingQuote.quoteId,
        shippingOptionId: selectedOption.id,
      });

      if (!session.checkoutUrl) {
        throw new Error('Stripe non ha restituito un checkoutUrl valido.');
      }

      window.location.href = session.checkoutUrl;
    } catch (error) {
      logger.error('Checkout hosted failed:', error);
      setCheckoutState('error');
      addToast(error instanceof Error ? error.message : 'Checkout non disponibile al momento.', 'error');
      playBlipSound();
    }
  };

  const persistLocalOrder = () => {
    if (typeof window === 'undefined') return;

    const orderId = `local-order-${Date.now()}`;
    const storedValue = window.localStorage.getItem('brainrot_order_history');
    const existingOrders = storedValue ? JSON.parse(storedValue) as unknown[] : [];
    const nextOrder = {
      id: orderId,
      providerOrderId: `LOCAL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      paymentStatus: 'paid',
      fulfillmentStatus: 'queued',
      statusLabel: 'Ordine locale confermato',
      total: checkoutGrandTotal,
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
      shippingLabel: selectedShippingOption?.label ?? 'Standard',
      items: items.map((item) => ({
        id: item.productId,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize ?? null,
        selectedColor: item.selectedColor ?? null,
      })),
    };

    const nextOrders = [nextOrder, ...(Array.isArray(existingOrders) ? existingOrders : [])];
    window.localStorage.setItem('brainrot_order_history', JSON.stringify(nextOrders));
  };

  const handleLocalCheckoutConfirm = async () => {
    if (!selectedShippingOption) {
      addToast('Seleziona un metodo di spedizione.', 'warning');
      return;
    }

    playBlipSound();
    setLoadingMessage('Registriamo l’ordine locale e simuliamo il pagamento...');
    setCheckoutState('loading');

    await new Promise((resolve) => window.setTimeout(resolve, 900));
    persistLocalOrder();
    clearCart();
    setCheckoutState('success');
    addToast('Ordine locale confermato. Flusso checkout pronto per i test.', 'success');
  };

  const handleClose = () => {
    playBlipSound();
    setIsCartOpen(false);
    setTimeout(() => {
      resetOverlayState();
    }, 300);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l-8 border-black bg-white shadow-[-24px_0_0_0_rgba(0,0,0,0.2)] md:w-[550px]"
          >
            <div className="flex items-center justify-between border-b-8 border-black bg-yellow-400 p-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none md:text-5xl">
                IL TUO <span className="border-4 border-black bg-pink-500 px-4 py-1 text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] italic">CARRELLO</span>
              </h2>
              <button
                onClick={handleClose}
                aria-label="Chiudi carrello"
                className="border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-black hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="relative flex-grow overflow-y-auto bg-[#f8f8f8] p-8">
              {checkoutState === 'needs-login' && (
                <div className="absolute inset-0 z-10 m-8 flex flex-col items-center justify-center border-8 border-black bg-yellow-400 p-10 text-center text-black shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <LogIn className="mb-8 h-24 w-24" />
                  <h3 className="mb-6 text-5xl font-black uppercase tracking-tighter leading-none">
                    <span className="border-4 border-black bg-black px-4 py-2 text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">ACCESSO RICHIESTO</span>
                  </h3>
                  <p className="mb-10 text-xl font-bold">Per il checkout serve un account attivo: ordini, tracking e royalty restano collegati al tuo profilo.</p>
                  <div className="flex w-full flex-col gap-6">
                    <button
                      onClick={() => { playBlipSound(); login(); setCheckoutState('idle'); }}
                      className="border-4 border-black bg-black px-8 py-4 text-2xl font-black uppercase italic text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:bg-white hover:text-black hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      ACCEDI CON GOOGLE
                    </button>
                    <button
                      onClick={() => setCheckoutState('idle')}
                      className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      TORNA AL CARRELLO
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'address' && (
                <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-white p-8">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="border-4 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Indirizzo di spedizione</h3>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-gray-500">Verifichiamo tariffe reali prima del pagamento</p>
                    </div>
                  </div>

                  <div className="grid flex-grow grid-cols-2 gap-4">
                    {([
                      { key: 'name', label: 'Nome', placeholder: 'Mario', col: 1 },
                      { key: 'surname', label: 'Cognome', placeholder: 'Rossi', col: 1 },
                      { key: 'address', label: 'Via e numero civico', placeholder: 'Via Roma 42', col: 2 },
                      { key: 'city', label: 'Citta', placeholder: 'Milano', col: 1 },
                      { key: 'zip', label: 'CAP', placeholder: '20100', col: 1 },
                      { key: 'province', label: 'Provincia', placeholder: 'MI', col: 1 },
                      { key: 'country', label: 'Nazione', placeholder: 'Italia', col: 1 },
                      { key: 'phone', label: 'Telefono (opzionale)', placeholder: '+39 333 1234567', col: 2 },
                    ] as const).map(({ key, label, placeholder, col }) => (
                      <div key={key} className={col === 2 ? 'col-span-2' : 'col-span-1'}>
                        <label htmlFor={`cart-field-${key}`} className="mb-1 block text-xs font-mono font-black uppercase tracking-widest">
                          {label}
                        </label>
                        <input
                          id={`cart-field-${key}`}
                          type="text"
                          value={shippingAddress[key]}
                          onChange={(event) => {
                            setShippingAddress((prev) => ({ ...prev, [key]: event.target.value }));
                            if (addressErrors[key]) {
                              setAddressErrors((prev) => ({ ...prev, [key]: undefined }));
                            }
                          }}
                          placeholder={placeholder}
                          className={`w-full border-4 px-3 py-2 font-mono text-sm font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 ${addressErrors[key] ? 'border-red-500' : 'border-black'} bg-white`}
                        />
                        {addressErrors[key] && (
                          <p className="mt-1 text-xs font-mono font-bold text-red-600">{addressErrors[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t-4 border-black pt-6">
                    <p className="mb-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {LOCAL_CHECKOUT_ENABLED
                        ? 'Checkout locale attivo: il prossimo step simula spedizione e pagamento per validare il flusso UX.'
                        : 'La spedizione viene calcolata server-side con il catalogo sincronizzato e validata prima di aprire Stripe Checkout.'}
                    </p>
                    <div className="flex flex-col gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddressSubmit}
                        className="w-full border-4 border-black bg-cyan-400 py-5 text-2xl font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                      >
                        {LOCAL_CHECKOUT_ENABLED ? 'CONTINUA ALLA SPEDIZIONE' : 'CONTINUA SU STRIPE'}
                      </motion.button>
                      <button
                        onClick={() => setCheckoutState('idle')}
                        className="w-full border-4 border-black bg-white py-4 text-lg font-black uppercase italic transition-colors hover:bg-black hover:text-white"
                      >
                        TORNA AL CARRELLO
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutState === 'shipping' && (
                <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-white p-8">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="border-4 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Scegli la spedizione</h3>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-gray-500">Step locale per simulare tariffe e tempi</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {shippingOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { playBlipSound(); setSelectedShippingOptionId(option.id); }}
                        className={`w-full border-4 p-5 text-left transition-all ${
                          selectedShippingOptionId === option.id
                            ? 'border-cyan-400 bg-black text-white shadow-none'
                            : 'border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-2xl font-black uppercase italic">{option.label}</p>
                            <p className="mt-2 font-mono text-xs uppercase tracking-widest opacity-70">
                              {option.minDeliveryDays}-{option.maxDeliveryDays} giorni stimati
                            </p>
                          </div>
                          <p className="text-3xl font-black italic">EUR {option.rate.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 border-t-4 border-black pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="font-black uppercase text-xl italic">Totale provvisorio</p>
                      <p className="text-3xl font-black italic text-pink-500">EUR {checkoutGrandTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => setCheckoutState('review')}
                        className="w-full border-4 border-black bg-cyan-400 py-5 text-2xl font-black uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                      >
                        CONTINUA AL RIEPILOGO
                      </button>
                      <button
                        onClick={() => setCheckoutState('address')}
                        className="w-full border-4 border-black bg-white py-4 text-lg font-black uppercase italic transition-colors hover:bg-black hover:text-white"
                      >
                        TORNA ALL’INDIRIZZO
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutState === 'review' && (
                <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-white p-8">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="border-4 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Riepilogo checkout locale</h3>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-gray-500">Ultimo step prima della conferma ordine</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="border-4 border-black bg-yellow-50 p-5">
                      <p className="font-black uppercase text-sm">Spedizione</p>
                      <p className="mt-2 font-mono text-sm">{shippingAddress.name} {shippingAddress.surname}</p>
                      <p className="font-mono text-sm">{shippingAddress.address}</p>
                      <p className="font-mono text-sm">{shippingAddress.zip} {shippingAddress.city} ({shippingAddress.province})</p>
                      <p className="font-mono text-sm">{shippingAddress.country}</p>
                    </div>

                    <div className="border-4 border-black bg-cyan-50 p-5">
                      <p className="font-black uppercase text-sm">Metodo selezionato</p>
                      <p className="mt-2 text-2xl font-black uppercase italic">{selectedShippingOption?.label ?? 'Standard'}</p>
                      <p className="font-mono text-sm">EUR {(selectedShippingOption?.rate ?? 0).toFixed(2)}</p>
                    </div>

                    <div className="border-4 border-black bg-white p-5">
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.cartItemId} className="flex items-center justify-between gap-4 border-b-2 border-black/10 pb-3 last:border-b-0 last:pb-0">
                            <div className="min-w-0">
                              <p className="truncate font-black uppercase">{item.name}</p>
                              <p className="font-mono text-xs uppercase text-gray-500">
                                {item.quantity}x {item.selectedSize ?? 'std'} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                              </p>
                            </div>
                            <p className="font-black italic">EUR {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t-4 border-black pt-6">
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center justify-between font-mono text-sm uppercase">
                        <span>Subtotale</span>
                        <span>EUR {total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-sm uppercase">
                        <span>Spedizione</span>
                        <span>EUR {(selectedShippingOption?.rate ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-3xl font-black italic">
                        <span>Totale</span>
                        <span className="text-pink-500">EUR {checkoutGrandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLocalCheckoutConfirm}
                        className="w-full border-4 border-black bg-pink-500 py-5 text-2xl font-black uppercase italic text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                      >
                        CONFERMA ORDINE LOCALE
                      </motion.button>
                      <button
                        onClick={() => setCheckoutState('shipping')}
                        className="w-full border-4 border-black bg-white py-4 text-lg font-black uppercase italic transition-colors hover:bg-black hover:text-white"
                      >
                        TORNA ALLA SPEDIZIONE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutState === 'loading' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black p-10 font-mono text-green-400">
                  <AlertTriangle className="mb-8 h-20 w-20 animate-pulse text-yellow-400" />
                  <h3 className="mb-6 text-center text-3xl font-black uppercase tracking-tighter">Checkout in preparazione</h3>
                  <div className="h-12 w-full border-8 border-green-400 bg-green-900/20 p-2">
                    <div className="h-full animate-[checkout-progress_3s_ease-in-out_forwards] bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                  </div>
                  <p className="mt-6 text-center text-lg font-bold uppercase tracking-widest">{loadingMessage}</p>
                </div>
              )}

              {checkoutState === 'success' && (
                <div className="absolute inset-0 z-10 m-8 flex flex-col items-center justify-center border-8 border-black bg-pink-500 p-10 text-center text-white shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <CheckCircle2 className="mb-8 h-24 w-24" />
                  <h3 className="mb-6 text-5xl font-black uppercase tracking-tighter leading-none">
                    <span className="border-4 border-black bg-white px-4 py-2 text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">PAGAMENTO CONFERMATO</span>
                  </h3>
                  <p className="mb-10 text-xl font-bold">
                    {LOCAL_CHECKOUT_ENABLED
                      ? 'Il tuo ordine locale e stato registrato. Puoi usare questo flusso per testare UX, dati e passaggi prima di collegare Stripe e Printful.'
                      : 'Il tuo ordine e stato registrato. Fulfillment, tracking e aggiornamenti arriveranno nella dashboard account.'}
                  </p>
                  <button
                    onClick={handleClose}
                    className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                  >
                    CHIUDI
                  </button>
                </div>
              )}

              {checkoutState === 'error' && (
                <div className="absolute inset-0 z-10 m-8 flex flex-col items-center justify-center border-8 border-black bg-red-600 p-10 text-center text-white shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <AlertTriangle className="mb-8 h-24 w-24" />
                  <h3 className="mb-6 text-5xl font-black uppercase tracking-tighter leading-none">
                    <span className="border-4 border-black bg-white px-4 py-2 text-red-600 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">CHECKOUT NON DISPONIBILE</span>
                  </h3>
                  <p className="mb-10 text-xl font-bold">
                    Non siamo riusciti a creare una sessione Stripe valida. Verifica indirizzo, varianti e disponibilita, poi riprova.
                  </p>
                  <div className="flex w-full flex-col gap-6">
                    <button
                      onClick={() => setCheckoutState('address')}
                      className="border-4 border-white bg-black px-8 py-4 text-2xl font-black uppercase italic text-white shadow-[8px_8px_0_0_rgba(255,255,255,1)] transition-all hover:bg-white hover:text-black hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      RIVEDI INDIRIZZO
                    </button>
                    <button
                      onClick={handleClose}
                      className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      CHIUDI
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'idle' && items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-10">
                    <ShoppingBag className="h-32 w-32 text-gray-300" />
                    <div className="absolute -top-4 -right-4 border-4 border-black bg-red-500 p-2 font-black uppercase text-white rotate-12">VUOTO</div>
                  </div>
                  <p className="mb-6 text-3xl font-black uppercase italic text-gray-500">Nessun articolo nel carrello.</p>
                  <p className="mb-10 max-w-sm font-mono text-sm uppercase tracking-[0.15em] text-gray-500">
                    Salva un design, scegli una variante valida e torna qui per attivare il checkout sicuro.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="border-4 border-black bg-black px-10 py-5 text-2xl font-black uppercase italic text-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-pink-500 hover:text-black hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
                  >
                    TORNA ALLO SHOP
                  </motion.button>
                </div>
              ) : checkoutState === 'idle' && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  className="flex flex-col gap-4 md:gap-5"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.cartItemId}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: -50, transition: { duration: 0.2 } }}
                        className="group flex gap-4 border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
                      >
                        <div className={`relative h-20 w-20 shrink-0 overflow-hidden border-4 border-black bg-white md:h-24 md:w-24 ${item.color}`}>
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>

                        <div className="flex min-w-0 flex-grow flex-col justify-between">
                          <div>
                            <div className="mb-2 flex flex-wrap gap-2">
                              <span className="border-2 border-black bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                                {item.sourceType === 'community' ? 'Community' : item.baseProductId ?? 'Custom'}
                              </span>
                              {item.authorName && (
                                <span className="border-2 border-black bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em]">
                                  by {item.authorName}
                                </span>
                              )}
                            </div>

                            <h3 className="truncate text-xl font-black uppercase leading-tight tracking-tighter italic md:text-2xl">
                              {item.name}
                            </h3>

                            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-mono font-bold uppercase text-gray-500 md:text-xs">
                              {item.selectedSize && (
                                <span className="bg-black px-1.5 py-0.5 text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                                  Variante: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="bg-black px-1.5 py-0.5 text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                                  Finitura: {item.selectedColor}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xl font-black italic text-pink-500 md:text-2xl">
                              EUR {item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-4 flex items-end justify-between">
                            <div className="flex items-center border-4 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                              <button
                                onClick={() => { playBlipSound(); updateQuantity(item.cartItemId, item.quantity - 1); }}
                                aria-label="Diminuisci quantita"
                                className="flex h-8 w-8 items-center justify-center border-r-4 border-black text-xl font-black transition-colors hover:bg-yellow-400 md:h-10 md:w-10"
                              >
                                -
                              </button>
                              <span className="flex h-8 w-8 items-center justify-center font-mono text-base font-black md:h-10 md:w-10">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => { playBlipSound(); updateQuantity(item.cartItemId, item.quantity + 1); }}
                                aria-label="Aumenta quantita"
                                className="flex h-8 w-8 items-center justify-center border-l-4 border-black text-xl font-black transition-colors hover:bg-yellow-400 md:h-10 md:w-10"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => { playBlipSound(); removeFromCart(item.cartItemId); }}
                              aria-label="Rimuovi dal carrello"
                              className="flex h-10 w-10 items-center justify-center border-4 border-black bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all hover:bg-red-500 hover:text-white hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {items.length > 0 && checkoutState === 'idle' && (
              <div className="shrink-0 border-t-8 border-black bg-white p-6 md:p-8">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xl font-black uppercase italic tracking-tighter md:text-2xl">TOTALE ORDINE</span>
                    <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                      {totalItems} articoli, spedizione calcolata prima del pagamento
                    </p>
                  </div>
                  <span className="text-4xl font-black italic leading-none tracking-tighter text-pink-500 md:text-5xl">
                    EUR {total.toFixed(2)}
                  </span>
                </div>

                <p className="mb-6 font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {LOCAL_CHECKOUT_ENABLED
                    ? 'Checkout locale attivo: spedizione, riepilogo e conferma ordine simulati in locale.'
                    : 'Stripe Checkout hosted, prezzi validati server-side, ordine Printful creato solo dopo conferma pagamento.'}
                </p>

                <motion.button
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCheckout}
                  className="w-full border-4 border-black bg-cyan-400 py-5 text-3xl font-black uppercase italic tracking-tighter shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 md:border-8 md:py-6 md:text-4xl md:shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
                >
                  {LOCAL_CHECKOUT_ENABLED ? 'VAI AL CHECKOUT LOCALE' : 'VAI AL CHECKOUT'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
