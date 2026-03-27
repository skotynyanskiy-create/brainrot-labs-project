import { X, Trash2, AlertTriangle, CheckCircle2, Skull, LogIn, MapPin } from 'lucide-react';
import { logger } from '../../utils/logger';
import { STORAGE_KEYS } from '../../constants';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { playBlipSound, playCoinSound } from '../../utils/sounds';
import { db, collection, addDoc, serverTimestamp } from '../../firebase';
import type { LayerData } from '../../types';
import { getFunctions, httpsCallable } from 'firebase/functions';

const ORDER_HISTORY_STORAGE_KEY = STORAGE_KEYS.ORDER_HISTORY;

interface ShippingAddress {
  name: string;
  surname: string;
  address: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  phone: string;
}

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

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [checkoutState, setCheckoutState] = useState<'idle' | 'address' | 'loading' | 'success' | 'error' | 'needs-login'>('idle');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState<Partial<ShippingAddress>>({});

  useEffect(() => {
    if (checkoutState === 'success') {
      clearCart();
    }
  }, [checkoutState, clearCart]);


  const validateAddress = (): boolean => {
    const errors: Partial<ShippingAddress> = {};
    if (!shippingAddress.name.trim()) errors.name = 'Obbligatorio';
    if (!shippingAddress.surname.trim()) errors.surname = 'Obbligatorio';
    if (!shippingAddress.address.trim()) errors.address = 'Obbligatorio';
    if (!shippingAddress.city.trim()) errors.city = 'Obbligatorio';
    if (!shippingAddress.zip.trim()) errors.zip = 'Obbligatorio';
    else {
      const isItalian = shippingAddress.country.toLowerCase().includes('ital');
      const zipOk = isItalian ? /^\d{5}$/.test(shippingAddress.zip.trim()) : shippingAddress.zip.trim().length >= 2;
      if (!zipOk) errors.zip = isItalian ? 'CAP non valido (5 cifre)' : 'CAP non valido';
    }
    if (!shippingAddress.province.trim()) errors.province = 'Obbligatorio';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = () => {
    playBlipSound();
    if (!user) {
      setCheckoutState('needs-login');
      return;
    }
    setCheckoutState('address');
  };

  const handleAddressSubmit = async () => {
    if (!validateAddress() || !user) return;
    playBlipSound();

    setCheckoutState('loading');

    try {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Prepare order data
      const orderData = {
        id: orderId,
        userId: user.uid,
        customer: {
          name: `${shippingAddress.name} ${shippingAddress.surname}`,
          email: user.email || 'Unknown',
          shipping: {
            address1: shippingAddress.address,
            city: shippingAddress.city,
            state_code: shippingAddress.province.toUpperCase(),
            country_code: shippingAddress.country === 'Italia' ? 'IT' : shippingAddress.country.toUpperCase().slice(0, 2),
            zip: shippingAddress.zip,
            ...(shippingAddress.phone ? { phone: shippingAddress.phone } : {}),
          },
        },
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.selectedSize || undefined,
          color: item.selectedColor || undefined,
          customData: item.customData ? { designTextureUrl: item.customData.designTextureUrl } : undefined,
        })),
        total,
      };

      let providerOrderId = `LOCAL-${orderId}`;
      try {
        const functions = getFunctions();
        const processOrder = httpsCallable(functions, 'processOrder');
        const response = await processOrder(orderData);
        providerOrderId = (response.data as { providerOrderId?: string } | undefined)?.providerOrderId || providerOrderId;
      } catch (functionError) {
        logger.warn('Cloud function unavailable, using local order fallback:', functionError);
        addToast('Ordine salvato localmente — contattaci se non ricevi conferma email.', 'warning');
      }

      const localOrderRecord = {
        id: orderId,
        providerOrderId,
        createdAt: new Date().toISOString(),
        status: 'pending',
        total,
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.customData?.designTextureUrl || item.image,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        })),
      };

      const existingOrders = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
      let parsedOrders: unknown[] = [];
      if (existingOrders) {
        try {
          const raw: unknown = JSON.parse(existingOrders);
          parsedOrders = Array.isArray(raw) ? raw : [];
        } catch (storageError) {
          logger.warn('Invalid local order history, resetting:', storageError);
        }
      }
      localStorage.setItem(
        ORDER_HISTORY_STORAGE_KEY,
        JSON.stringify([localOrderRecord, ...parsedOrders].slice(0, 20))
      );

      // Save order to Firestore (as a record of the transaction)
      try {
        await addDoc(collection(db, 'orders'), {
          ...orderData,
          providerOrderId,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      } catch (firestoreError) {
        logger.warn('Firestore order save skipped:', firestoreError);
        addToast('Ordine confermato, ma il salvataggio online non è riuscito. Conserva l\'ID ordine.', 'warning');
      }
      
      setTimeout(() => {
        setCheckoutState('success');
        playCoinSound();
      }, 500);

    } catch (error) {
      logger.error('Checkout failed:', error);
      setCheckoutState('error');
      playBlipSound();
    }
  };

  const handleClose = () => {
    playBlipSound();
    setIsCartOpen(false);
    setTimeout(() => {
      setCheckoutState('idle');
      setShippingAddress(EMPTY_ADDRESS);
      setAddressErrors({});
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[550px] bg-white border-l-8 border-black z-50 flex flex-col shadow-[-24px_0_0_0_rgba(0,0,0,0.2)]"
          >
            <div className="p-8 border-b-8 border-black flex justify-between items-center bg-yellow-400">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                IL TUO <span className="bg-pink-500 text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] italic">CARRELLO</span>
              </h2>
              <button onClick={handleClose} aria-label="Chiudi carrello" className="p-3 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#f8f8f8] relative">
              {checkoutState === 'needs-login' && (
                <div className="absolute inset-0 bg-yellow-400 text-black p-10 flex flex-col justify-center items-center z-10 text-center border-8 border-black m-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <LogIn className="w-24 h-24 mb-8" />
                  <h3 className="text-5xl font-black uppercase mb-6 leading-none tracking-tighter">
                    <span className="bg-black text-white px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">CHI SEI?</span>
                  </h3>
                  <p className="text-xl font-sans font-bold mb-10 italic">"Fatti riconoscere così possiamo svuotarti il conto in banca."</p>
                  <div className="flex flex-col gap-6 w-full">
                    <button 
                      onClick={() => { playBlipSound(); login(); setCheckoutState('idle'); }} 
                      className="px-8 py-4 bg-black text-white border-4 border-black font-display text-2xl uppercase italic hover:bg-white hover:text-black transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      ACCEDI CON GOOGLE
                    </button>
                    <button 
                      onClick={() => setCheckoutState('idle')} 
                      className="px-8 py-4 bg-white border-4 border-black font-display text-2xl uppercase italic hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      ANNULLA
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'address' && (
                <div className="absolute inset-0 bg-white p-8 flex flex-col z-10 overflow-y-auto">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-black text-white p-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Dove Lo Mandiamo?</h3>
                      <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mt-1">Indirizzo di spedizione</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 flex-grow">
                    {([
                      { key: 'name', label: 'Nome', placeholder: 'Mario', col: 1 },
                      { key: 'surname', label: 'Cognome', placeholder: 'Rossi', col: 1 },
                      { key: 'address', label: 'Via e numero civico', placeholder: 'Via Roma 42', col: 2 },
                      { key: 'city', label: 'Città', placeholder: 'Milano', col: 1 },
                      { key: 'zip', label: 'CAP', placeholder: '20100', col: 1 },
                      { key: 'province', label: 'Provincia', placeholder: 'MI', col: 1 },
                      { key: 'country', label: 'Nazione', placeholder: 'Italia', col: 1 },
                      { key: 'phone', label: 'Telefono (opzionale)', placeholder: '+39 333 1234567', col: 2 },
                    ] as { key: keyof ShippingAddress; label: string; placeholder: string; col: 1 | 2 }[]).map(({ key, label, placeholder, col }) => (
                      <div key={key} className={col === 2 ? 'col-span-2' : 'col-span-1'}>
                        <label htmlFor={`cart-field-${key}`} className="block text-xs font-mono font-black uppercase tracking-widest mb-1">{label}</label>
                        <input
                          id={`cart-field-${key}`}
                          type="text"
                          value={shippingAddress[key]}
                          onChange={e => {
                            setShippingAddress(prev => ({ ...prev, [key]: e.target.value }));
                            if (addressErrors[key]) setAddressErrors(prev => ({ ...prev, [key]: undefined }));
                          }}
                          onBlur={() => {
                            const errors: Partial<ShippingAddress> = {};
                            if (key !== 'phone' && !shippingAddress[key].trim()) errors[key] = 'Obbligatorio';
                            if (key === 'zip' && shippingAddress[key].trim()) {
                              const isItalian = shippingAddress.country.toLowerCase().includes('ital');
                              const zipOk = isItalian ? /^\d{5}$/.test(shippingAddress[key].trim()) : shippingAddress[key].trim().length >= 2;
                              if (!zipOk) errors[key] = isItalian ? 'CAP non valido (5 cifre)' : 'CAP non valido';
                            }
                            if (Object.keys(errors).length > 0) setAddressErrors(prev => ({ ...prev, ...errors }));
                          }}
                          placeholder={placeholder}
                          className={`w-full border-4 ${addressErrors[key] ? 'border-red-500' : 'border-black'} px-3 py-2 font-mono font-bold text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-white`}
                        />
                        {addressErrors[key] && (
                          <p className="text-xs text-red-600 font-mono font-bold mt-1">{addressErrors[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 mt-8 pt-6 border-t-4 border-black">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddressSubmit}
                      className="w-full py-5 bg-cyan-400 text-black border-4 border-black font-black text-2xl uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
                    >
                      Conferma e Paga 💸
                    </motion.button>
                    <button
                      onClick={() => setCheckoutState('idle')}
                      className="w-full py-4 bg-white text-black border-4 border-black font-black text-lg uppercase italic hover:bg-black hover:text-white transition-colors"
                    >
                      ← Torna al Carrello
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'loading' && (
                <div className="absolute inset-0 bg-black text-green-400 font-mono p-10 flex flex-col justify-center items-center z-10">
                  <AlertTriangle className="w-20 h-20 mb-8 animate-pulse text-yellow-400" />
                  <h3 className="text-3xl font-black mb-6 text-center uppercase tracking-tighter">HACKERANDO IL TUO CONTO IN BANCA...</h3>
                  <div className="w-full h-12 border-8 border-green-400 p-2 bg-green-900/20">
                    <div className="h-full bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] animate-[checkout-progress_3s_ease-in-out_forwards]"></div>
                  </div>
                  <p className="mt-6 text-lg font-bold uppercase tracking-widest">SCARICANDO PIÙ RAM...</p>
                  <div className="mt-12 text-[10px] opacity-50 text-left w-full space-y-1">
                    <p>{`> INITIALIZING_BRAINROT_PROTOCOL`}</p>
                    <p>{`> BYPASSING_COMMON_SENSE_FIREWALL`}</p>
                    <p>{`> EXTRACTING_MEME_COINS...`}</p>
                  </div>
                </div>
              )}

              {checkoutState === 'success' && (
                <div className="absolute inset-0 bg-pink-500 text-white p-10 flex flex-col justify-center items-center z-10 text-center border-8 border-black m-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <CheckCircle2 className="w-24 h-24 mb-8" />
                  <h3 className="text-5xl font-black uppercase mb-6 leading-none tracking-tighter">
                    <span className="bg-white text-black px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">PAGATO!</span>
                  </h3>
                  <p className="text-xl font-sans font-bold mb-10 italic">"I tuoi soldi sono nostri. Spedizione prevista: quando ne avremo voglia."</p>
                  <button onClick={handleClose} className="px-8 py-4 bg-white text-black border-4 border-black font-display text-2xl uppercase italic hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                    CHIUDI E PIANGI
                  </button>
                </div>
              )}

              {checkoutState === 'error' && (
                <div className="absolute inset-0 bg-red-600 text-white p-10 flex flex-col justify-center items-center z-10 text-center border-8 border-black m-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
                  <Skull className="w-24 h-24 mb-8" />
                  <h3 className="text-5xl font-black uppercase mb-6 leading-none tracking-tighter">
                    <span className="bg-white text-red-600 px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">RIFIUTATA</span>
                  </h3>
                  <p className="text-xl font-sans font-bold mb-10 italic">"Sei troppo povero per questo livello di brainrot. Torna quando avrai venduto un rene."</p>
                  <div className="flex flex-col gap-6 w-full">
                    <button 
                      onClick={() => setCheckoutState('idle')} 
                      className="px-8 py-4 bg-black text-white border-4 border-white font-display text-2xl uppercase italic hover:bg-white hover:text-black transition-all shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      RIPROVA (SE HAI CORAGGIO)
                    </button>
                    <button 
                      onClick={handleClose} 
                      className="px-8 py-4 bg-white text-black border-4 border-black font-display text-2xl uppercase italic hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                    >
                      ESCI CON VERGOGNA
                    </button>
                  </div>
                </div>
              )}

              {checkoutState === 'idle' && items.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center py-20">
                  <div className="relative mb-10">
                    <Skull className="w-32 h-32 text-gray-300" />
                    <div className="absolute -top-4 -right-4 bg-red-500 text-white p-2 border-4 border-black font-display uppercase italic transform rotate-12">VUOTO!</div>
                  </div>
                  <p className="text-3xl font-display uppercase text-gray-400 mb-10 italic leading-tight">"Il tuo carrello è vuoto come le promesse del tuo ex."</p>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose} 
                    className="px-10 py-5 bg-black text-white font-display text-2xl uppercase italic border-4 border-black hover:bg-pink-500 hover:text-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-[16px_16px_0_0_rgba(0,0,0,1)] transition-colors"
                  >
                    TORNA A SPENDERE
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
                    {items.map(item => (
                      <motion.div 
                        key={item.cartItemId} 
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: -50, transition: { duration: 0.2 } }}
                        className="flex gap-4 border-4 border-black p-3 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
                      >
                        <div className={`w-20 h-20 md:w-24 md:h-24 border-4 border-black shrink-0 ${item.color} relative overflow-hidden bg-white group-hover:rotate-2 transition-transform`}>
                          {item.customData ? (
                            <div 
                              className="absolute origin-top-left"
                              style={{
                                width: item.customData.containerSize?.width || 500,
                                height: item.customData.containerSize?.height || 500,
                                transform: `scale(${96 / (item.customData.containerSize?.width || 500)})`
                              }}
                            >
                              <img src={item.customData.baseImage} className="w-full h-full object-cover absolute inset-0" />
                              <div 
                                className="absolute"
                                style={{
                                  top: item.customData.overlay.top,
                                  left: item.customData.overlay.left,
                                  width: item.customData.overlay.width,
                                  height: item.customData.overlay.height,
                                  transform: item.customData.overlay.rotate ? `rotate(${item.customData.overlay.rotate})` : 'none',
                                }}
                              >
                                {item.customData.layers?.map((layer: LayerData) => (
                                  <div 
                                    key={layer.id}
                                    className="absolute"
                                    style={{
                                      left: layer.x,
                                      top: layer.y,
                                      width: layer.width,
                                      height: layer.height,
                                      opacity: layer.opacity,
                                      filter: layer.filter,
                                      transform: `rotate(${layer.rotate}deg)`
                                    }}
                                  >
                                    {layer.type === 'text' ? (
                                      <div 
                                        className="w-full h-full flex items-center justify-center text-center"
                                        style={{ 
                                          fontSize: `${layer.fontSize}px`,
                                          fontFamily: layer.fontFamily,
                                          color: layer.color,
                                          WebkitTextStroke: `${layer.strokeWidth}px ${layer.strokeColor}`,
                                          fontWeight: 900,
                                          lineHeight: 1
                                        }}
                                      >
                                        {layer.content}
                                      </div>
                                    ) : (
                                      <img src={layer.content} className="w-full h-full object-contain" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                          )}
                        </div>
                        <div className="flex flex-col justify-between flex-grow min-w-0">
                          <div>
                            <h3 className="text-xl md:text-2xl font-black uppercase leading-tight mb-1.5 italic tracking-tighter truncate">{item.name}</h3>
                            <div className="flex flex-wrap gap-1.5 text-[10px] md:text-xs font-mono font-bold uppercase text-gray-500 mt-1">
                              {item.selectedSize && <span className="bg-black text-white px-1.5 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Taglia: {item.selectedSize}</span>}
                              {item.selectedColor && <span className="bg-black text-white px-1.5 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">Colore: {item.selectedColor}</span>}
                            </div>
                            <p className="text-xl md:text-2xl font-black text-pink-500 mt-2 italic">€{item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between items-end mt-2 md:mt-4">
                            <div className="flex items-center border-4 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                              <button onClick={() => { playBlipSound(); updateQuantity(item.cartItemId, item.quantity - 1); }} aria-label="Diminuisci quantità" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-r-4 border-black hover:bg-yellow-400 font-black text-xl transition-colors">-</button>
                              <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-mono font-black text-base">{item.quantity}</span>
                              <button onClick={() => { playBlipSound(); updateQuantity(item.cartItemId, item.quantity + 1); }} aria-label="Aumenta quantità" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-l-4 border-black hover:bg-yellow-400 font-black text-xl transition-colors">+</button>
                            </div>
                            <button onClick={() => { playBlipSound(); removeFromCart(item.cartItemId); }} aria-label="Rimuovi dal carrello" className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white text-black hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                              <Trash2 className="w-5 h-5" />
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
              <div className="p-6 md:p-8 border-t-8 border-black bg-white shrink-0">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">TOTALE DANNI:</span>
                  <span className="text-4xl md:text-5xl font-black text-pink-500 tracking-tighter italic leading-none">€{total.toFixed(2)}</span>
                </div>
                <p className="mb-6 font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  + Spedizione calcolata al checkout
                </p>
                <motion.button 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCheckout} 
                  className="w-full py-5 md:py-6 bg-cyan-400 text-black border-4 md:border-8 border-black font-black text-3xl md:text-4xl uppercase italic shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all tracking-tighter"
                >
                  PAGA ORA 💸
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
