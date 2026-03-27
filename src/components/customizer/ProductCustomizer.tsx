import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { BaseProduct, Meme, LayerData as Layer, CustomTemplate } from '../../types';
import { BASE_PRODUCTS, CREATOR_ROYALTY_RATE, STORAGE_KEYS, MEME_BASES } from '../../constants';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import {
  ArrowLeft, ArrowRight, Plus, Search, Loader2, Type, Save,
  Trash2, Upload, Download, Layers, Image as ImageIcon, X,
  ChevronUp, ChevronDown, Copy, Lock, Unlock, FlipHorizontal,
  FlipVertical, Sparkles, Brain, CheckCircle2, Wand2, Palette,
  ShoppingBag,
} from 'lucide-react';
import { playBlipSound, playCoinSound } from '../../utils/sounds';
import { motion, AnimatePresence } from 'motion/react';
import { Rnd } from 'react-rnd';
import { toPng } from 'html-to-image';
import { cn } from '../../utils/cn';
import { logger } from '../../utils/logger';
import Product3DPreview from './Product3DPreview';
import type {
  GenerateImageRequest, GenerateImageResponse,
  SuggestCaptionRequest, SuggestCaptionResponse, VoicePreset,
} from '../../services/aiTypes';
import { publishCommunityDesign, saveDesignDraft } from '../../services/commerce/client';
import { buildCartItemId, getCatalogVariantsForBaseProduct, resolveCatalogVariantBySelection } from '../../services/commerce/helpers';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductCustomizerProps {
  onBack: () => void;
  initialMeme?: { url: string; name: string };
  /** Se passato, seleziona il prodotto base e salta direttamente allo step 2 */
  initialBaseProductId?: string;
  /** Chiamato dopo una pubblicazione riuscita — usato per redirect alla community */
  onPublished?: () => void;
}

// ─── Voice presets ────────────────────────────────────────────────────────────
const VOICE_PRESETS: Array<{
  id: VoicePreset;
  label: string;
  description: string;
  layerStyle: Partial<Layer>;
}> = [
  {
    id: 'chaotic',
    label: 'Chaos',
    description: 'Caption urlate, energia alta, stile meme aggressivo.',
    layerStyle: { fontFamily: 'Impact', color: '#ffffff', strokeColor: '#000000', strokeWidth: 3, fontSize: 34 },
  },
  {
    id: 'sales',
    label: 'Hype',
    description: 'Tono da drop, punchline pulite e leggibili.',
    layerStyle: { fontFamily: "'Playfair Display'", color: '#111111', strokeColor: '#facc15', strokeWidth: 2, fontSize: 30 },
  },
  {
    id: 'deadpan',
    label: 'Dry',
    description: 'Ironia piatta, minimal e più editoriale.',
    layerStyle: { fontFamily: "'JetBrains Mono'", color: '#ffffff', strokeColor: '#06b6d4', strokeWidth: 1, fontSize: 28 },
  },
];

// ─── Step definition ──────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, { short: string; long: string; color: string }> = {
  1: { short: 'Prodotto', long: 'Scegli il prodotto',  color: 'bg-cyan-400' },
  2: { short: 'Design',   long: 'Aggiungi il design',  color: 'bg-pink-500' },
  3: { short: 'Conferma', long: 'Conferma e acquista', color: 'bg-green-400' },
};

type DesignTab = 'meme' | 'ai' | 'stickers' | 'upload';

const STICKERS = [
  { name: 'MLG Glasses', url: 'https://i.imgur.com/v8p0mXW.png' },
  { name: 'Thug Life',   url: 'https://i.imgur.com/6W6H20P.png' },
  { name: 'Deal With It',url: 'https://i.imgur.com/r6Sj9m1.png' },
];

const LOCAL_DRAFTS_STORAGE_KEY = 'brainrot_local_design_drafts';

const remoteUrlPattern = /^https?:\/\//i;

const getDefaultSelectionForBase = (base: BaseProduct) => {
  const firstColor = base.colors?.[0]?.name ?? 'White';
  const firstVariant = resolveCatalogVariantBySelection(base.id, base.sizes?.[0], firstColor);

  return {
    color: firstColor,
    size:
      firstVariant?.size
      ?? firstVariant?.phoneModel
      ?? firstVariant?.posterSize
      ?? base.sizes?.[0]
      ?? base.variantOptions?.[0]?.value
      ?? 'M',
  };
};

// ─── Component ───────────────────────────────────────────────────────────────
const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ onBack, initialMeme, initialBaseProductId, onPublished }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user, isDemoUser } = useAuth();
  const { setIsProfileOpen, setIsCustomizerOpen } = useUI();
  const initialBase = BASE_PRODUCTS.find((p) => p.id === initialBaseProductId) ?? BASE_PRODUCTS[0];
  const initialSelection = getDefaultSelectionForBase(initialBase);

  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>(initialBaseProductId ? 2 : 1);

  // ── Product state ───────────────────────────────────────────────────────────
  const [selectedBase, setSelectedBase] = useState<BaseProduct>(initialBase);
  const [selectedSize,  setSelectedSize]  = useState<string>(initialSelection.size);
  const [selectedColor, setSelectedColor] = useState<string>(initialSelection.color);
  const [quantity, setQuantity] = useState(1);

  // ── Design state ────────────────────────────────────────────────────────────
  const [layers,        setLayers]        = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [designTab,     setDesignTab]     = useState<DesignTab>('meme');

  // ── Meme library ────────────────────────────────────────────────────────────
  const [memes,       setMemes]       = useState<Meme[]>([]);
  const [memesLoading,setMemesLoading]= useState(true);
  const [memeSearch,  setMemeSearch]  = useState('');

  // ── AI ──────────────────────────────────────────────────────────────────────
  const [aiPrompt,         setAiPrompt]         = useState('');
  const [voicePreset,      setVoicePreset]       = useState<VoicePreset>('chaotic');
  const [isGenerating,     setIsGenerating]      = useState(false);
  const [isSuggestingText, setIsSuggestingText]  = useState(false);
  const [hasApiKey,        setHasApiKey]         = useState(false);

  // ── 3D / export ─────────────────────────────────────────────────────────────
  const [designTextureUrl, setDesignTextureUrl]   = useState<string | null>(null);
  const [isTextureUpdating,setIsTextureUpdating]  = useState(false);
  const [isExporting,      setIsExporting]        = useState(false);
  const [show2DCanvas,     setShow2DCanvas]       = useState(false); // step 2 toggle

  // ── Templates ───────────────────────────────────────────────────────────────
  const [savedTemplates, setSavedTemplates] = useState<CustomTemplate[]>([]);
  const [showSaveModal,  setShowSaveModal]  = useState(false);
  const [templateName,   setTemplateName]  = useState('');

  // ── Publish ─────────────────────────────────────────────────────────────────
  const [isPublishing, setIsPublishing] = useState(false);

  // ── Canvas refs ─────────────────────────────────────────────────────────────
  const canvasRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Init ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    window.aistudio?.hasSelectedApiKey().then(setHasApiKey).catch(() => setHasApiKey(false));
  }, []);

  // ── Auto-load meme base from TrendingSection entry ────────────────────────
  useEffect(() => {
    if (!initialMeme) return;
    void addLayer('meme', initialMeme.url, {
      sourceUrl: initialMeme.url,
      x: 50,
      y: 30,
      width: 300,
      height: 300,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loaded = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (loaded) {
      try { setSavedTemplates(JSON.parse(loaded)); } catch (e) { logger.error('Failed to load templates', e); }
    }
  }, []);

  useEffect(() => {
    fetch('https://api.imgflip.com/get_memes')
      .then(r => r.json())
      .then(data => { if (data.success) setMemes(data.data.memes); })
      .catch(e => logger.error('Imgflip fetch error', e))
      .finally(() => setMemesLoading(false));
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      setShow2DCanvas(true);
      return;
    }
    setShow2DCanvas(false);
  }, [currentStep]);

  // ── Texture auto-update ───────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsTextureUpdating(true);
      const texture = await captureDesignTexture();
      setDesignTextureUrl(texture);
      setIsTextureUpdating(false);
    }, 500);
    return () => clearTimeout(timer);
   
  }, [layers, selectedBase]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const activeLayer = layers.find(l => l.id === activeLayerId);

  const selectedColorHex = selectedBase.colors?.find(c => c.name === selectedColor)?.hex ?? '#ffffff';
  const catalogVariants = getCatalogVariantsForBaseProduct(selectedBase.id);

  /** Available sizes for the currently-selected color */
  const availableSizes = selectedBase.id === 'base-tshirt'
    ? catalogVariants
        .filter(v => v.colorName === selectedColor)
        .map(v => v.size)
        .filter((value): value is string => Boolean(value))
    : selectedBase.id === 'base-phonecase'
      ? catalogVariants
          .map(v => v.phoneModel)
          .filter((value): value is string => Boolean(value))
      : selectedBase.sizes ?? selectedBase.variantOptions?.map((option) => option.value) ?? [];

  const canGoToStep2 = selectedBase !== null && selectedSize !== '' && selectedColor !== '';
  const canGoToStep3 = layers.length > 0;

  const goToStep = (step: Step) => {
    if (step === 2 && !canGoToStep2) {
      addToast('Seleziona prodotto, colore e taglia prima di continuare.');
      return;
    }
    if (step === 3 && !canGoToStep3) {
      addToast('Aggiungi almeno un elemento al design per continuare.');
      return;
    }
    setCurrentStep(step);
    playBlipSound();
  };

  // ─── Product selection ────────────────────────────────────────────────────
  const handleBaseChange = (base: BaseProduct) => {
    playBlipSound();
    setSelectedBase(base);
    const defaults = getDefaultSelectionForBase(base);
    setSelectedColor(defaults.color);
    setSelectedSize(defaults.size);
  };

  const handleColorChange = (colorName: string) => {
    playBlipSound();
    setSelectedColor(colorName);
    const variantsForColor = getCatalogVariantsForBaseProduct(selectedBase.id).filter(v => v.colorName === colorName);
    const stillValid = variantsForColor.some(v => v.size === selectedSize || v.phoneModel === selectedSize);
    if (!stillValid && variantsForColor.length > 0) {
      setSelectedSize(variantsForColor[0].size ?? variantsForColor[0].phoneModel ?? selectedSize);
    }
  };

  // ─── Layer operations ─────────────────────────────────────────────────────
  const urlToDataUrl = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossibile scaricare asset remoto: ${response.status}`);
    }

    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Conversione asset remoto fallita.'));
      };
      reader.onerror = () => reject(reader.error ?? new Error('Lettura asset remoto fallita.'));
      reader.readAsDataURL(blob);
    });
  }, []);

  const addLayer = useCallback(async (type: 'meme' | 'text' | 'image', content: string, overrides: Partial<Layer> = {}) => {
    let normalizedContent = content;
    let normalizedOverrides = overrides;

    if (type !== 'text' && remoteUrlPattern.test(content)) {
      try {
        normalizedContent = await urlToDataUrl(content);
        normalizedOverrides = {
          ...overrides,
          sourceUrl: overrides.sourceUrl ?? content,
        };
      } catch (error) {
        logger.error('addLayer remote asset normalization failed', error);
        addToast('Immagine remota non caricabile. Prova con un upload diretto o un altro meme.', 'error');
        return;
      }
    }

    playBlipSound();
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: normalizedContent,
      x: 80, y: 80,
      width:  type === 'text' ? 200 : 160,
      height: type === 'text' ? 60  : 160,
      rotate: 0, opacity: 1,
      fontSize:    type === 'text' ? 32    : undefined,
      fontFamily:  type === 'text' ? 'Impact' : undefined,
      color:       type === 'text' ? '#ffffff' : undefined,
      strokeColor: type === 'text' ? '#000000' : undefined,
      strokeWidth: type === 'text' ? 2 : undefined,
      ...normalizedOverrides,
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [addToast, urlToDataUrl]);

  const updateLayer = (id: string, updates: Partial<Layer>) =>
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const removeLayer = (id: string) => {
    playBlipSound();
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) setActiveLayerId(null);
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    playBlipSound();
    const dup = { ...layer, id: Math.random().toString(36).substr(2, 9), x: layer.x + 20, y: layer.y + 20 };
    setLayers(prev => [...prev, dup]);
    setActiveLayerId(dup.id);
  };

  const moveLayer = (id: string, dir: 'up' | 'down') => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      if (dir === 'up' && idx < next.length - 1) [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      if (dir === 'down' && idx > 0)             [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  };

  // ─── Canvas / texture ─────────────────────────────────────────────────────
  const captureDesignTexture = async (): Promise<string | null> => {
    if (!canvasRef.current) return designTextureUrl;
    try {
      return await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: 'transparent',
        cacheBust: true,
      });
    } catch (e) {
      logger.error('captureDesignTexture failed', e);
      return designTextureUrl;
    }
  };

  const exportDesign = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    playBlipSound();
    try {
      const url = await toPng(canvasRef.current, { cacheBust: true });
      const a = document.createElement('a');
      a.download = `brainrot-design-${Date.now()}.png`;
      a.href = url;
      a.click();
      addToast('Design esportato!');
    } catch (err) {
      logger.error('exportDesign failed', err);
      addToast("Errore durante l'esportazione.");
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Carica un file immagine valido.'); return; }
    const reader = new FileReader();
    reader.onload = ev => addLayer('image', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ─── AI ──────────────────────────────────────────────────────────────────
  const generateMemeWithAI = async () => {
    if (aiPrompt.trim().length < 6) { addToast('Scrivi un prompt più chiaro.'); return; }
    if (!user) { addToast('Fai login per usare gli strumenti AI.'); return; }
    setIsGenerating(true);
    playBlipSound();
    try {
      const fns = getFunctions();
      const generateMemeImage = httpsCallable<GenerateImageRequest, GenerateImageResponse>(fns, 'generateMemeImage');
      const res = await generateMemeImage({ prompt: aiPrompt.trim(), voicePreset });
      addLayer('meme', res.data.imageDataUrl);
      addToast("Meme generato dall'AI.");
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === 'functions/unauthenticated') addToast('Sessione richiesta. Accedi e riprova.');
      else if (err?.code === 'functions/failed-precondition') addToast('AI non configurata lato server.');
      else addToast("Errore nella generazione. Riprova.");
      logger.error('generateMemeWithAI error', error);
    } finally { setIsGenerating(false); }
  };

  const suggestAICaption = async () => {
    if (aiPrompt.trim().length < 6) { addToast('Scrivi un tema specifico.'); return; }
    if (!user) { addToast('Fai login per usare gli strumenti AI.'); return; }
    setIsSuggestingText(true);
    playBlipSound();
    try {
      const fns = getFunctions();
      const suggestMemeCaptions = httpsCallable<SuggestCaptionRequest, SuggestCaptionResponse>(fns, 'suggestMemeCaptions');
      const res = await suggestMemeCaptions({ prompt: aiPrompt.trim(), voicePreset });
      const suggestions = res.data.suggestions || [];
      if (suggestions.length > 0) {
        const caption = suggestions[Math.floor(Math.random() * suggestions.length)].trim();
        const voiceStyle = VOICE_PRESETS.find(p => p.id === voicePreset)?.layerStyle || {};
        addLayer('text', caption, voiceStyle);
        addToast("Caption aggiunta!");
      }
    } catch (error: unknown) {
      logger.error('suggestAICaption error', error);
      addToast("L'AI non ha risposto. Riprova.");
    } finally { setIsSuggestingText(false); }
  };

  // ─── Templates ───────────────────────────────────────────────────────────
  const handleSaveTemplate = () => {
    if (layers.length === 0) { addToast('Aggiungi qualcosa prima di salvare.'); return; }
    setTemplateName(`Design ${new Date().toLocaleTimeString()}`);
    setShowSaveModal(true);
    playBlipSound();
  };

  const confirmSaveTemplate = async () => {
    if (!templateName.trim()) { addToast('Dai un nome al template.'); return; }
    playBlipSound();
    let thumbnail = '';
    if (canvasRef.current) {
      try { thumbnail = await toPng(canvasRef.current, { quality: 0.4, pixelRatio: 0.5 }); }
      catch (e) { logger.error('Thumbnail capture failed', e); }
    }
    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      createdAt: new Date().toISOString(),
      baseProductId: selectedBase.id,
      layers,
      previewImage: thumbnail,
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
    addToast('Template salvato!');
    setShowSaveModal(false);
  };

  const handleLoadTemplate = (template: CustomTemplate) => {
    playBlipSound();
    const base = BASE_PRODUCTS.find(b => b.id === template.baseProductId) || BASE_PRODUCTS[0];
    setSelectedBase(base);
    setSelectedSize(base.sizes?.[0] ?? 'M');
    setSelectedColor(base.colors?.[0]?.name ?? 'White');
    setLayers(template.layers || []);
    setActiveLayerId(null);
    addToast('Template caricato!');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playBlipSound();
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
  };

  const requireAuthenticatedDraftFlow = () => {
    if (user) return true;

    addToast('Accedi prima di salvare il design o aggiungerlo al carrello.', 'warning');
    setIsCustomizerOpen(false);
    setIsProfileOpen(true);
    return false;
  };

  const createLocalDraftFallback = (texture: string | null) => {
    const previewUrl = texture ?? designTextureUrl ?? selectedBase.image;
    const localDesignId = `local-dev-${Date.now()}`;
    const localDraft = {
      id: localDesignId,
      baseProductId: selectedBase.id,
      selectionKey: `${selectedBase.id}:${selectedSize}:${selectedColor}`,
      previewUrl,
      layerConfig: layers,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = window.localStorage.getItem(LOCAL_DRAFTS_STORAGE_KEY);
        const parsed = existing ? JSON.parse(existing) as unknown[] : [];
        const next = Array.isArray(parsed) ? [localDraft, ...parsed].slice(0, 24) : [localDraft];
        window.localStorage.setItem(LOCAL_DRAFTS_STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        logger.warn('Local draft fallback storage failed', error);
      }
    }

    addToast('Bozza salvata in locale. Per checkout reale servono Functions attive.', 'warning');
    return {
      designId: localDesignId,
      previewUrl,
    };
  };

  // ─── Add to cart ──────────────────────────────────────────────────────────
  const persistDesignDraft = async (options?: { requireAuth?: boolean }) => {
    const requireAuth = options?.requireAuth ?? false;
    const texture = await captureDesignTexture();
    const normalizedTexture = texture ?? designTextureUrl;

    if (!normalizedTexture && !(import.meta.env.DEV || isDemoUser)) {
      addToast('Errore nella cattura del design. Riprova.', 'error');
      return null;
    }

    if (!user) {
      if (requireAuth) {
        requireAuthenticatedDraftFlow();
        return null;
      }

      if (import.meta.env.DEV) {
        return createLocalDraftFallback(normalizedTexture);
      }

      addToast('Accedi prima di aggiungere il design al carrello.', 'warning');
      setIsCustomizerOpen(false);
      setIsProfileOpen(true);
      return null;
    }

    const detectedMemeBase = detectMemeBaseFromLayers(layers);
    if (isDemoUser) {
      return createLocalDraftFallback(normalizedTexture);
    }

    if (!normalizedTexture) {
      addToast('Preview non disponibile per il salvataggio del design.', 'error');
      return null;
    }

    try {
      const response = await saveDesignDraft({
        baseProductId: selectedBase.id,
        sourceType: 'customizer',
        selectionKey: `${selectedBase.id}:${selectedSize}:${selectedColor}`,
        layerConfig: layers,
        previewDataUrl: normalizedTexture,
        printPlacements: [
          {
            placement: selectedBase.printfulPlacement,
            technique: selectedBase.id === 'base-tshirt' ? 'dtg' : selectedBase.id === 'base-phonecase' ? 'uv' : 'print',
            imageDataUrl: normalizedTexture,
          },
        ],
        metadata: {
          memeDescription: aiPrompt.trim() || `Design ${selectedBase.name}`,
          memeBaseId: detectedMemeBase?.id ?? null,
          memeBaseName: detectedMemeBase?.name ?? null,
          memeBaseCategory: detectedMemeBase?.category ?? null,
          tags: detectedMemeBase?.tags ?? [],
          hasCustomText: layers.some((layer) => layer.type === 'text'),
          hasAILayer: false,
          layerCount: layers.length,
        },
      });

      return {
        designId: response.designId,
        previewUrl: response.previewUrl,
      };
    } catch (error) {
      logger.error('persistDesignDraft error', error);
      if (import.meta.env.DEV || isDemoUser) {
        return createLocalDraftFallback(normalizedTexture);
      }
      throw error;
    }
  };

  const detectMemeBaseFromLayers = (currentLayers: Layer[]) => {
    const memeLayer = currentLayers.find((l) => l.type === 'meme');
    if (!memeLayer) return null;
    return MEME_BASES.find((mb) => mb.url === (memeLayer.sourceUrl ?? memeLayer.content)) ?? null;
  };

  const handlePublishToCommunity = async () => {
    if (layers.length === 0) {
      addToast('Aggiungi almeno un elemento al design.');
      return;
    }
    if (!requireAuthenticatedDraftFlow()) {
      return;
    }

    playBlipSound();
    setIsPublishing(true);
    try {
      const persisted = await persistDesignDraft({ requireAuth: true });
      if (!persisted) return;

      if (persisted.designId.startsWith('local-dev-')) {
        addToast('Pubblicazione community disponibile quando le Functions sono attive.', 'warning');
        return;
      }

      await publishCommunityDesign({
        designId: persisted.designId,
        memeDescription: aiPrompt.trim() || `Design ${selectedBase.name}`,
      });

      addToast('Design pubblicato! Ora visibile nella community.');
      onPublished?.();
    } catch (error) {
      logger.error('handlePublishToCommunity error', error);
      addToast('Errore durante la pubblicazione.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddToCart = async () => {
    if (layers.length === 0) { addToast('Aggiungi almeno un elemento al design.'); return; }
    playCoinSound();
    setIsExporting(true);
    try {
      const persisted = await persistDesignDraft();
      if (!persisted) return;

      const catalogVariant = resolveCatalogVariantBySelection(selectedBase.id, selectedSize, selectedColor);
      if (!catalogVariant) {
        addToast('Variante non disponibile per il checkout.', 'error');
        return;
      }
      const productId = `${selectedBase.id}:${catalogVariant.id}`;
      const previewUrl = persisted.previewUrl || designTextureUrl || selectedBase.image;
      addToCart({
        cartItemId: buildCartItemId({
          sourceType: 'customizer',
          productId,
          designId: persisted.designId,
          catalogVariantRef: catalogVariant.id,
        }),
        sourceType: 'customizer',
        productId,
        baseProductId: selectedBase.id,
        designId: persisted.designId,
        catalogVariantRef: catalogVariant.id,
        quantity,
        price: catalogVariant.price,
        name: `${selectedBase.name} - Custom`,
        image: previewUrl,
        category: selectedBase.category,
        memeDescription: aiPrompt || 'Creato da te, genio incompreso.',
        color: 'bg-green-400',
        selectedSize,
        selectedColor,
      });
      addToast('Capolavoro aggiunto al carrello!');
      onBack();
      /*
        name:            `${selectedBase.name} — Custom`,
      */
    } catch (error) {
      logger.error('handleAddToCart error', error);
      addToast("Errore durante l'aggiunta al carrello.");
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Render helpers ───────────────────────────────────────────────────────
  const filteredMemes = memes.filter(m => m.name.toLowerCase().includes(memeSearch.toLowerCase()));

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-[#f0f0f0] flex flex-col font-sans overflow-hidden"
    >
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b-4 border-black shrink-0 z-10 flex items-center justify-between px-4 py-3 gap-4">
        {/* Left: back + branding */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playBlipSound(); onBack(); }}
            className="flex items-center gap-2 px-3 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-black uppercase text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ESCI</span>
          </motion.button>
          <div className="hidden sm:block">
            <p className="font-black uppercase text-xs tracking-widest text-gray-500">BRAINROT STUDIO</p>
            <p className="font-black uppercase text-sm leading-tight">{selectedBase.name}</p>
          </div>
        </div>

        {/* Center: step indicator */}
        <div className="flex items-center gap-1 md:gap-3">
          {([1, 2, 3] as Step[]).map((step) => (
            <React.Fragment key={step}>
              <button
                onClick={() => {
                  if (step < currentStep) setCurrentStep(step);
                  else goToStep(step);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 border-4 border-black font-black uppercase text-[10px] md:text-xs transition-all',
                  currentStep === step
                    ? `${STEP_LABELS[step].color} shadow-none translate-x-0.5 translate-y-0.5`
                    : step < currentStep
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-white opacity-50 cursor-not-allowed'
                )}
              >
                {step < currentStep
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <span className="w-4 h-4 flex items-center justify-center font-black">{step}</span>
                }
                <span className="hidden md:inline">{STEP_LABELS[step].short}</span>
              </button>
              {step < 3 && <div className="w-4 md:w-8 h-0.5 bg-black/30" />}
            </React.Fragment>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {currentStep === 2 && (
            <button
              onClick={() => { setShow2DCanvas(s => !s); playBlipSound(); }}
              className={cn(
                'hidden md:flex items-center gap-2 px-3 py-2 border-4 border-black font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all',
                show2DCanvas ? 'bg-yellow-400 text-black' : 'bg-white text-black'
              )}
            >
              <Palette className="w-4 h-4" />
              {show2DCanvas ? 'Vista 3D' : 'Posiziona in 2D'}
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            className="hidden md:flex items-center gap-2 px-3 py-2 border-4 border-black bg-cyan-400 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Save className="w-4 h-4" /> SALVA
          </button>
          <button
            onClick={exportDesign}
            disabled={isExporting}
            className="hidden md:flex items-center gap-2 px-3 py-2 border-4 border-black bg-pink-400 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            ESPORTA
          </button>
        </div>
      </header>

      {/* ── BODY: Left panel + Right preview ─────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="w-full md:w-[38%] lg:w-[32%] bg-white border-r-4 border-black flex flex-col overflow-y-auto">

          {/* Step title */}
          <div className={cn('px-6 py-4 border-b-4 border-black', STEP_LABELS[currentStep].color)}>
            <p className="font-mono text-xs uppercase tracking-widest opacity-60">Step {currentStep} / 3</p>
            <h2 className="text-2xl font-black uppercase italic">{STEP_LABELS[currentStep].long}</h2>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-6">

            {/* ─── STEP 1: Product selection ──────────────────────────────── */}
            {currentStep === 1 && (
              <>
                {/* Base meme indicator */}
                {initialMeme && (
                  <div className="flex items-center gap-3 bg-green-100 border-4 border-green-500 p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-black uppercase text-xs text-green-700">BASE MEME CARICATA</p>
                      <p className="font-mono text-xs text-green-600">"{initialMeme.name}" — scegli il prodotto e avanza al design</p>
                    </div>
                    <img src={initialMeme.url} alt={initialMeme.name} className="w-10 h-10 object-cover border-2 border-green-500 shrink-0 ml-auto" />
                  </div>
                )}

                {/* Product cards */}
                <div>
                  <p className="font-black uppercase text-xs tracking-widest mb-3">Scegli il prodotto base</p>
                  <div className="grid grid-cols-2 gap-4">
                    {BASE_PRODUCTS.map(base => (
                      <button
                        key={base.id}
                        onClick={() => handleBaseChange(base)}
                        className={cn(
                          'border-4 border-black p-3 flex flex-col items-center gap-2 transition-all relative',
                          selectedBase.id === base.id
                            ? 'bg-cyan-400 shadow-none translate-x-0.5 translate-y-0.5'
                            : 'bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                        )}
                      >
                        <div className="aspect-square w-full border-4 border-black overflow-hidden">
                          <Product3DPreview
                            baseProductId={base.id}
                            designTextureUrl={null}
                            baseColor={selectedBase.id === base.id ? (selectedColor || '#ffffff') : '#ffffff'}
                            autoRotate={true}
                          />
                        </div>
                        <span className="font-black uppercase text-xs leading-tight text-center">{base.name}</span>
                        <span className="font-mono text-xs text-gray-500">€{base.price.toFixed(2)}</span>
                        {selectedBase.id === base.id && (
                          <div className="absolute top-2 right-2 bg-black text-white p-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color swatches */}
                {selectedBase.colors && selectedBase.colors.length > 0 && (
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-3">
                      Colore — <span className="font-mono normal-case text-gray-500">{selectedColor}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedBase.colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleColorChange(c.name)}
                          title={c.name}
                          className={cn(
                            'w-10 h-10 border-4 transition-all',
                            selectedColor === c.name
                              ? 'border-black shadow-none scale-110'
                              : 'border-gray-300 hover:border-black hover:scale-105'
                          )}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size pills */}
                {availableSizes.length > 0 && (
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-3">
                      Taglia — <span className="font-mono normal-case text-gray-500">{selectedSize}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          onClick={() => { setSelectedSize(size); playBlipSound(); }}
                          className={cn(
                            'px-4 py-2 border-4 border-black font-black uppercase text-sm transition-all',
                            selectedSize === size
                              ? 'bg-black text-white shadow-none translate-x-0.5 translate-y-0.5'
                              : 'bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved templates */}
                {savedTemplates.length > 0 && (
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-3">Template Salvati</p>
                    <div className="grid grid-cols-2 gap-3">
                      {savedTemplates.map(t => (
                        <div key={t.id} className="relative border-4 border-black bg-gray-50 group">
                          <button onClick={() => handleLoadTemplate(t)} className="w-full p-2 flex flex-col gap-1">
                            {t.previewImage
                              ? <img src={t.previewImage} alt={t.name} className="w-full aspect-square object-contain border-2 border-black" />
                              : <div className="w-full aspect-square bg-gray-200 border-2 border-black flex items-center justify-center font-black text-xs">NO PREVIEW</div>
                            }
                            <span className="font-black uppercase text-[10px] truncate">{t.name}</span>
                          </button>
                          <button
                            onClick={e => handleDeleteTemplate(t.id, e)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─── STEP 2: Design tools ────────────────────────────────────── */}
            {currentStep === 2 && (
              <>
                {/* Sub-tab navigation */}
                <div className="grid grid-cols-4 gap-1 -mx-1">
                  {([
                    { id: 'meme',    icon: ImageIcon, label: 'Meme',    color: 'bg-pink-500 text-white' },
                    { id: 'ai',      icon: Brain,     label: 'AI',      color: 'bg-purple-500 text-white' },
                    { id: 'stickers',icon: Sparkles,  label: 'Stickers',color: 'bg-yellow-400 text-black' },
                    { id: 'upload',  icon: Upload,    label: 'Upload',  color: 'bg-cyan-400 text-black' },
                  ] as Array<{ id: DesignTab; icon: typeof ImageIcon; label: string; color: string }>).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setDesignTab(tab.id); playBlipSound(); }}
                      className={cn(
                        'flex flex-col items-center gap-1 py-2 border-4 border-black font-black uppercase text-[9px] transition-all',
                        designTab === tab.id
                          ? `${tab.color} shadow-none translate-x-0.5 translate-y-0.5`
                          : 'bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Add text button (always visible in step 2) */}
                <button
                  onClick={() => addLayer('text', 'TUO TESTO', {})}
                  className="w-full flex items-center gap-3 px-4 py-3 border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black uppercase text-sm"
                >
                  <Type className="w-5 h-5" /> + Aggiungi Testo
                </button>

                {/* ── MEME LIBRARY ── */}
                {designTab === 'meme' && (
                  <div>
                    {/* Basi trending */}
                    <div className="mb-4">
                      <p className="font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                        🔥 BASI TRENDING
                        <span className="font-mono text-[10px] text-gray-400 normal-case tracking-normal">clicca per aggiungere</span>
                      </p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {MEME_BASES.map(base => (
                          <button
                            key={base.id}
                            onClick={() => addLayer('meme', base.url)}
                            title={`${base.name} · usato ${base.usageCount.toLocaleString()}x`}
                            className="aspect-square border-2 border-black overflow-hidden bg-gray-100 hover:border-cyan-500 hover:scale-105 transition-all relative group"
                          >
                            <img src={base.url} alt={base.name} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[8px] font-black uppercase text-center leading-tight px-1">{base.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-black/10 pt-3 mb-3">
                      <p className="font-black uppercase text-xs tracking-widest mb-2 text-gray-500">LIBRERIA IMGFLIP</p>
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cerca meme..."
                        value={memeSearch}
                        onChange={e => setMemeSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border-4 border-black font-mono text-sm focus:outline-none focus:ring-0"
                      />
                    </div>
                    {memesLoading
                      ? <div className="text-center py-8 font-mono text-sm animate-pulse">Caricamento meme...</div>
                      : (
                        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                          {filteredMemes.slice(0, 60).map(meme => (
                            <button
                              key={meme.id}
                              onClick={() => addLayer('meme', meme.url)}
                              className="aspect-square border-4 border-black overflow-hidden bg-gray-100 hover:border-pink-500 transition-all hover:scale-105"
                            >
                              <img src={meme.url} alt={meme.name} className="w-full h-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )
                    }
                  </div>
                )}

                {/* ── AI GENERATOR ── */}
                {designTab === 'ai' && (
                  <div className="space-y-5">
                    {!user && (
                      <div className="bg-yellow-100 border-4 border-yellow-400 p-3 font-mono text-xs">
                        Accedi per usare gli strumenti AI.
                      </div>
                    )}

                    <textarea
                      rows={3}
                      placeholder="Descrivi il meme che vuoi generare..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      className="w-full border-4 border-black p-3 font-mono text-sm resize-none focus:outline-none focus:ring-0"
                    />

                    {/* Voice preset */}
                    <div>
                      <p className="font-black uppercase text-xs mb-2">Stile / Voice</p>
                      <div className="flex gap-2">
                        {VOICE_PRESETS.map(vp => (
                          <button
                            key={vp.id}
                            onClick={() => setVoicePreset(vp.id)}
                            title={vp.description}
                            className={cn(
                              'flex-1 py-2 border-4 border-black font-black uppercase text-xs transition-all',
                              voicePreset === vp.id
                                ? 'bg-purple-500 text-white shadow-none'
                                : 'bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none'
                            )}
                          >
                            {vp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={generateMemeWithAI}
                        disabled={isGenerating || !user}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black bg-purple-500 text-white font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                      >
                        {isGenerating
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Genero...</>
                          : <><Wand2 className="w-4 h-4" /> Genera Immagine</>
                        }
                      </button>
                      <button
                        onClick={suggestAICaption}
                        disabled={isSuggestingText || !user}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black bg-cyan-400 font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                      >
                        {isSuggestingText
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Genero...</>
                          : <><Type className="w-4 h-4" /> Testo AI</>
                        }
                      </button>
                    </div>

                    {!hasApiKey && (
                      <button
                        onClick={() => window.aistudio?.openSelectKey()}
                        className="w-full py-2 border-4 border-dashed border-gray-400 font-mono text-xs text-gray-500 hover:border-black transition-all"
                      >
                        Configura API Key AI →
                      </button>
                    )}
                  </div>
                )}

                {/* ── STICKERS ── */}
                {designTab === 'stickers' && (
                  <div className="grid grid-cols-3 gap-3">
                    {STICKERS.map(s => (
                      <button
                        key={s.name}
                        onClick={() => addLayer('image', s.url)}
                        title={s.name}
                        className="aspect-square border-4 border-black p-2 bg-white hover:bg-yellow-50 hover:border-yellow-400 transition-all"
                      >
                        <img src={s.url} alt={s.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                    <button
                      onClick={() => addLayer('meme', 'https://i.imgflip.com/1bhk.jpg')}
                      className="aspect-square border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black transition-all"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                )}

                {/* ── UPLOAD ── */}
                {designTab === 'upload' && (
                  <div>
                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-4 border-dashed border-black hover:bg-gray-50 cursor-pointer transition-all">
                      <Upload className="w-10 h-10" />
                      <span className="font-black uppercase text-sm">Carica Immagine</span>
                      <span className="font-mono text-xs text-gray-400">PNG, JPG, GIF, WebP</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                )}

                {/* ── LAYER LIST ── */}
                {layers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Livelli ({layers.length})
                      </p>
                      <button
                        onClick={() => { setLayers([]); setActiveLayerId(null); playBlipSound(); }}
                        className="text-xs font-mono text-red-500 hover:underline"
                      >
                        Svuota
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                      {[...layers].reverse().map((layer, i) => (
                        <div
                          key={layer.id}
                          onClick={() => setActiveLayerId(layer.id)}
                          className={cn(
                            'flex items-center gap-2 p-2 border-2 border-black cursor-pointer transition-all text-xs',
                            activeLayerId === layer.id ? 'bg-pink-100 border-pink-500' : 'bg-white hover:bg-gray-50'
                          )}
                        >
                          <div className="w-8 h-8 border-2 border-black overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                            {layer.type === 'text'
                              ? <span className="font-black text-[10px]">T</span>
                              : <img src={layer.content} alt="" className="w-full h-full object-cover" />
                            }
                          </div>
                          <span className="font-mono truncate flex-1">
                            {layer.type === 'text' ? layer.content.slice(0, 18) : `Immagine ${layers.length - i}`}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={e => { e.stopPropagation(); moveLayer(layer.id, 'up'); }} className="p-0.5 hover:bg-gray-200"><ChevronUp className="w-3 h-3" /></button>
                            <button onClick={e => { e.stopPropagation(); moveLayer(layer.id, 'down'); }} className="p-0.5 hover:bg-gray-200"><ChevronDown className="w-3 h-3" /></button>
                            <button onClick={e => { e.stopPropagation(); removeLayer(layer.id); }} className="p-0.5 hover:bg-red-100 text-red-500"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active layer properties */}
                {activeLayer && (
                  <div className="border-4 border-black p-4 bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-black uppercase text-xs">Proprietà livello</p>
                      <div className="flex gap-1">
                        <button onClick={() => updateLayer(activeLayer.id, { flipX: !activeLayer.flipX })}
                          className={cn('p-1.5 border-2 border-black', activeLayer.flipX && 'bg-cyan-400')}><FlipHorizontal className="w-3 h-3" /></button>
                        <button onClick={() => updateLayer(activeLayer.id, { flipY: !activeLayer.flipY })}
                          className={cn('p-1.5 border-2 border-black', activeLayer.flipY && 'bg-cyan-400')}><FlipVertical className="w-3 h-3" /></button>
                        <button onClick={() => updateLayer(activeLayer.id, { locked: !activeLayer.locked })}
                          className={cn('p-1.5 border-2 border-black', activeLayer.locked && 'bg-red-500 text-white')}>
                          {activeLayer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        <button onClick={() => duplicateLayer(activeLayer.id)}
                          className="p-1.5 border-2 border-black hover:bg-cyan-400"><Copy className="w-3 h-3" /></button>
                        <button onClick={() => removeLayer(activeLayer.id)}
                          className="p-1.5 border-2 border-black bg-red-500 text-white"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div>
                      <label className="font-black uppercase text-[10px] block mb-1">Opacità</label>
                      <input type="range" min="0" max="1" step="0.05" value={activeLayer.opacity}
                        onChange={e => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full accent-black" />
                    </div>

                    <div>
                      <label className="font-black uppercase text-[10px] block mb-1">Rotazione</label>
                      <input type="range" min="0" max="360" value={activeLayer.rotate}
                        onChange={e => updateLayer(activeLayer.id, { rotate: parseInt(e.target.value) })}
                        className="w-full accent-black" />
                    </div>

                    {activeLayer.type === 'text' && (
                      <>
                        <div>
                          <label className="font-black uppercase text-[10px] block mb-1">Dimensione Testo</label>
                          <input type="range" min="10" max="120" value={activeLayer.fontSize ?? 32}
                            onChange={e => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full accent-black" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-black uppercase text-[10px] block mb-1">Colore Testo</label>
                            <input type="color" value={activeLayer.color ?? '#ffffff'}
                              onChange={e => updateLayer(activeLayer.id, { color: e.target.value })}
                              className="w-full h-8 border-2 border-black cursor-pointer" />
                          </div>
                          <div>
                            <label className="font-black uppercase text-[10px] block mb-1">Colore Bordo</label>
                            <input type="color" value={activeLayer.strokeColor ?? '#000000'}
                              onChange={e => updateLayer(activeLayer.id, { strokeColor: e.target.value })}
                              className="w-full h-8 border-2 border-black cursor-pointer" />
                          </div>
                        </div>
                        <div>
                          <label className="font-black uppercase text-[10px] block mb-1">Font</label>
                          <select
                            value={activeLayer.fontFamily ?? 'Impact'}
                            onChange={e => updateLayer(activeLayer.id, { fontFamily: e.target.value })}
                            className="w-full border-4 border-black p-2 font-mono text-xs focus:outline-none"
                          >
                            {['Impact', 'Arial', 'Comic Sans MS', "'JetBrains Mono'", "'Playfair Display'", "'Space Grotesk'"].map(f => (
                              <option key={f} value={f}>{f.replace(/'/g, '')}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="font-black uppercase text-[10px] block mb-1">Contenuto</label>
                          <input
                            type="text"
                            value={activeLayer.content}
                            onChange={e => updateLayer(activeLayer.id, { content: e.target.value })}
                            className="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── STEP 3: Confirm ────────────────────────────────────────── */}
            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  {/* Order summary */}
                  <div className="border-4 border-black p-4 bg-gray-50 space-y-3">
                    <h3 className="font-black uppercase text-sm border-b-2 border-black pb-2">Riepilogo Ordine</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 border-4 border-black overflow-hidden shrink-0">
                        <Product3DPreview
                          baseProductId={selectedBase.id}
                          designTextureUrl={null}
                          baseColor={selectedColor || '#ffffff'}
                          autoRotate={true}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-black uppercase text-sm">{selectedBase.name}</p>
                        <p className="font-mono text-xs text-gray-500">{selectedColor} · {selectedSize}</p>
                        <p className="font-black text-lg">€{selectedBase.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Layers thumbnail strip */}
                    {layers.length > 0 && (
                      <div>
                        <p className="font-mono text-xs text-gray-500 mb-2">{layers.length} elemento{layers.length > 1 ? 'i' : 'o'} nel design</p>
                        <div className="flex gap-1 flex-wrap">
                          {layers.map(l => (
                            <div key={l.id} className="w-10 h-10 border-2 border-black overflow-hidden bg-gray-100 shrink-0">
                              {l.type === 'text'
                                ? <div className="w-full h-full flex items-center justify-center text-[8px] font-black bg-black text-white">T</div>
                                : <img src={l.content} alt="" className="w-full h-full object-cover" />
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-2">Quantità</p>
                    <div className="flex items-center gap-3 border-4 border-black bg-white w-fit">
                      <button onClick={() => { if (quantity > 1) { setQuantity(q => q - 1); playBlipSound(); } }}
                        className="w-12 h-12 border-r-4 border-black font-black text-xl hover:bg-gray-100 transition-colors">
                        −
                      </button>
                      <span className="w-12 text-center font-black text-xl">{quantity}</span>
                      <button onClick={() => { setQuantity(q => q + 1); playBlipSound(); }}
                        className="w-12 h-12 border-l-4 border-black font-black text-xl hover:bg-gray-100 transition-colors">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Publish to community */}
                  <div className="border-4 border-black p-4 bg-green-50">
                    <div>
                      <p className="font-black uppercase text-sm">Pubblica nella community</p>
                      <p className="font-mono text-xs text-gray-500 mt-0.5">
                        La pubblicazione avviene solo con questa azione esplicita. Ogni vendita attiva il {CREATOR_ROYALTY_RATE}% di royalty.
                        {!user && ' (richiede login)'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handlePublishToCommunity}
                      disabled={isPublishing}
                      className="mt-4 flex w-full items-center justify-center gap-3 border-4 border-black bg-green-400 px-4 py-3 text-sm font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-green-400 hover:shadow-none disabled:opacity-60"
                    >
                      {isPublishing
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Pubblico...</>
                        : <><Upload className="w-5 h-5" /> Pubblica nella community</>
                      }
                    </motion.button>
                  </div>

                  {/* Total */}
                  <div className="border-4 border-black p-4 bg-yellow-400 flex items-center justify-between">
                    <span className="font-black uppercase text-lg">Totale</span>
                    <span className="font-black text-2xl">€{(selectedBase.price * quantity).toFixed(2)}</span>
                  </div>
                </div>

                {/* Add to cart CTA */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black bg-yellow-400 font-black uppercase text-xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all italic disabled:opacity-60"
                >
                  {isExporting
                    ? <><Loader2 className="w-6 h-6 animate-spin" /> Elaboro...</>
                    : <><ShoppingBag className="w-6 h-6" /> AGGIUNGI AL CARRELLO</>
                  }
                </motion.button>
              </>
            )}
          </div>

          {/* ── STEP NAVIGATION ─────────────────────────────────────────────── */}
          <div className="border-t-4 border-black p-4 flex items-center justify-between bg-white">
            <button
              onClick={() => { if (currentStep > 1) setCurrentStep(s => (s - 1) as Step); else onBack(); playBlipSound(); }}
              className="flex items-center gap-2 px-4 py-2 border-4 border-black font-black uppercase text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'ESCI' : 'INDIETRO'}
            </button>

            <span className="font-mono text-xs text-gray-400">{currentStep} / 3</span>

            {currentStep < 3 && (
              <button
                onClick={() => goToStep((currentStep + 1) as Step)}
                disabled={currentStep === 1 ? !canGoToStep2 : !canGoToStep3}
                className="flex items-center gap-2 px-6 py-2 border-4 border-black font-black uppercase text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-black text-white"
              >
                AVANTI <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {currentStep === 3 && <div className="w-28" />}
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ──────────────────────────────────────────── */}
        <div className="hidden md:flex flex-col flex-grow bg-[#1a1a1a] relative overflow-hidden">

          {/* Status bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur border border-white/20 px-3 py-1.5">
            <div className={cn('w-2 h-2 rounded-full', isTextureUpdating ? 'bg-yellow-400 animate-spin' : 'bg-green-500')} />
            <span className="text-[10px] font-mono text-white uppercase tracking-widest">
              {isTextureUpdating ? 'Aggiornamento...' : `${layers.length} livell${layers.length === 1 ? 'o' : 'i'}`}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {/* 2D canvas editor — step 2 only when toggled */}
            {currentStep === 2 && show2DCanvas ? (
              <motion.div
                key="2d-canvas"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full flex items-center justify-center p-12"
              >
                <div
                  ref={containerRef}
                  className="relative bg-white border-8 border-black shadow-[24px_24px_0_0_rgba(255,255,255,0.1)] overflow-hidden"
                  style={{ width: '100%', maxWidth: 500, aspectRatio: '1' }}
                >
                  <div ref={canvasRef} className="absolute inset-0">
                    {/* Sfondo colore prodotto — nessuna foto 2D */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: selectedColorHex ?? '#ffffff' }}
                    />

                    {/* Area di stampa evidenziata */}
                    <div
                      className="absolute pointer-events-none border-2 border-dashed border-black/20 bg-black/5"
                      style={{
                        top:    selectedBase.overlay.top,
                        left:   selectedBase.overlay.left,
                        width:  selectedBase.overlay.width,
                        height: selectedBase.overlay.height,
                      }}
                    >
                      <span className="absolute -top-5 left-0 font-mono text-[9px] font-black uppercase tracking-widest text-black/40">Area stampa</span>
                    </div>

                    {/* Editable layers */}
                    <div
                      className="absolute"
                      style={{
                        top:    selectedBase.overlay.top,
                        left:   selectedBase.overlay.left,
                        width:  selectedBase.overlay.width,
                        height: selectedBase.overlay.height,
                      }}
                    >
                      {layers.map(layer => (
                        <Rnd
                          key={layer.id}
                          position={{ x: layer.x, y: layer.y }}
                          size={{ width: layer.width, height: layer.height }}
                          onDragStop={(_e, d) => updateLayer(layer.id, { x: d.x, y: d.y })}
                          onResizeStop={(_e, _dir, r, _delta, pos) =>
                            updateLayer(layer.id, { width: parseInt(r.style.width), height: parseInt(r.style.height), ...pos })
                          }
                          bounds="parent"
                          disableDragging={layer.locked}
                          enableResizing={!layer.locked}
                          className={`absolute pointer-events-auto ${activeLayerId === layer.id ? 'z-20' : 'z-10'}`}
                          onClick={() => setActiveLayerId(layer.id)}
                        >
                          <div
                            className={cn(
                              'w-full h-full relative transition-all',
                              activeLayerId === layer.id ? 'ring-4 ring-pink-500 ring-offset-1' : 'hover:ring-2 hover:ring-white/50'
                            )}
                            style={{
                              opacity:   layer.opacity,
                              filter:    layer.filter,
                              transform: `rotate(${layer.rotate}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                            }}
                          >
                            {layer.type === 'text' ? (
                              <div
                                className="w-full h-full flex items-center justify-center text-center p-1 select-none"
                                style={{
                                  fontSize:        `${layer.fontSize}px`,
                                  fontFamily:      layer.fontFamily,
                                  color:           layer.color,
                                  WebkitTextStroke: `${layer.strokeWidth}px ${layer.strokeColor}`,
                                  fontWeight: 900,
                                  lineHeight: 1.1,
                                }}
                              >
                                {layer.content}
                              </div>
                            ) : (
                              <img src={layer.content} alt="" className="w-full h-full object-contain pointer-events-none" />
                            )}

                            {/* Mini toolbar on hover */}
                            {activeLayerId === layer.id && !layer.locked && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-black px-2 py-1 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                <button onClick={e => { e.stopPropagation(); duplicateLayer(layer.id); }} className="p-1 text-white hover:text-cyan-400"><Copy className="w-3 h-3" /></button>
                                <button onClick={e => { e.stopPropagation(); updateLayer(layer.id, { locked: true }); }} className="p-1 text-white hover:text-yellow-400"><Lock className="w-3 h-3" /></button>
                                <button onClick={e => { e.stopPropagation(); removeLayer(layer.id); }} className="p-1 text-white hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        </Rnd>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {layers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-white/30">
                      <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                      <p className="font-black uppercase text-sm">Aggiungi un elemento dal pannello</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* 3D Preview — default for step 1, 3, and step 2 when not in 2D mode */
              <motion.div
                key="3d-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <Product3DPreview
                  baseProductId={selectedBase.id}
                  designTextureUrl={designTextureUrl}
                  baseColor={selectedColorHex}
                  lightingMode="neutral"
                  autoRotate={currentStep === 3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step labels overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
            <div className="bg-black/80 backdrop-blur border border-white/10 px-4 py-2">
              <p className="text-[10px] font-mono text-white/60 uppercase">Step {currentStep}</p>
              <p className="text-sm font-black text-white uppercase">{STEP_LABELS[currentStep].long}</p>
            </div>
            {currentStep === 2 && !show2DCanvas && layers.length > 0 && (
              <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1 font-black uppercase text-xs">
                Torna alla vista 2D per regolare posizione e scala
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HIDDEN CANVAS for texture export ─────────────────────────────────── */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden>
        <div ref={canvasRef} className="w-[512px] h-[512px] bg-transparent overflow-hidden relative">
          {layers.map(layer => {
            const fontSize = layer.fontSize ?? 32;
            const strokeWidth = layer.strokeWidth ?? 0;

            return (
              <div
                key={layer.id}
                style={{
                  position: 'absolute',
                  left:    `${(layer.x / 500) * 512}px`,
                  top:     `${(layer.y / 500) * 512}px`,
                  width:   `${(layer.width  / 500) * 512}px`,
                  height:  `${(layer.height / 500) * 512}px`,
                  opacity:  layer.opacity,
                  filter:   layer.filter,
                  transform:`rotate(${layer.rotate}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                }}
              >
                {layer.type === 'text' ? (
                  <div
                    className="w-full h-full flex items-center justify-center text-center font-black"
                    style={{
                      fontSize:        `${(fontSize / 500) * 512}px`,
                      fontFamily:      layer.fontFamily,
                      color:           layer.color,
                      WebkitTextStroke:`${(strokeWidth / 500) * 512}px ${layer.strokeColor}`,
                      lineHeight: 1,
                    }}
                  >
                    {layer.content}
                  </div>
                ) : (
                  <img src={layer.content} alt="" className="w-full h-full object-contain" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SAVE TEMPLATE MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border-8 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] w-full max-w-md"
            >
              <h3 className="text-3xl font-black uppercase italic mb-6">Salva Template</h3>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmSaveTemplate(); }}
                placeholder="Nome del template..."
                className="w-full border-4 border-black p-3 font-mono text-lg mb-6 focus:outline-none focus:ring-0"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={confirmSaveTemplate}
                  className="flex-1 py-3 border-4 border-black bg-cyan-400 font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  SALVA
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 border-4 border-black bg-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  ANNULLA
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCustomizer;
