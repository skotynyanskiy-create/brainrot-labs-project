import React, { useState, useEffect, useRef } from 'react';
import { BaseProduct, Meme, Product, LayerData as Layer } from '../../types';
import { BASE_PRODUCTS } from '../../constants';
import { db, collection, addDoc, auth, storage } from '../../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import { ArrowLeft, Plus, Search, Loader2, Type, Save, Trash2, Upload, Download, Layers, Sliders, Image as ImageIcon, X, ChevronUp, ChevronDown, Grid, Eye, Copy, Lock, Unlock, FlipHorizontal, FlipVertical, Sparkles, Brain, CheckCircle2, Zap } from 'lucide-react';
import { playBlipSound, playCoinSound } from '../../utils/sounds';
import { motion, AnimatePresence } from 'motion/react';
import { Rnd } from 'react-rnd';
import { toPng } from 'html-to-image';
import { cn } from '../../utils/cn';
import Product3DPreview from './Product3DPreview';
import { GenerateImageRequest, GenerateImageResponse, SuggestCaptionRequest, SuggestCaptionResponse, VoicePreset } from '../../services/aiTypes';

interface ProductCustomizerProps {
  onBack: () => void;
}

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
    layerStyle: {
      fontFamily: 'Impact',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 3,
      fontSize: 34,
    },
  },
  {
    id: 'sales',
    label: 'Hype',
    description: 'Tono da drop, punchline piu pulite e leggibili.',
    layerStyle: {
      fontFamily: "'Playfair Display'",
      color: '#111111',
      strokeColor: '#facc15',
      strokeWidth: 2,
      fontSize: 30,
    },
  },
  {
    id: 'deadpan',
    label: 'Dry',
    description: 'Ironia piatta, minimal e piu editoriale.',
    layerStyle: {
      fontFamily: "'JetBrains Mono'",
      color: '#ffffff',
      strokeColor: '#06b6d4',
      strokeWidth: 1,
      fontSize: 28,
    },
  },
];

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ onBack }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { selectedProduct } = useProduct();
  
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredMemes = memes.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const [selectedBase, setSelectedBase] = useState<BaseProduct>(BASE_PRODUCTS[0]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>(BASE_PRODUCTS[0].sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(BASE_PRODUCTS[0].colors?.[0]?.name);
  const [quantity, setQuantity] = useState(1);

  const [isBaseLoaded, setIsBaseLoaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isMockupView, setIsMockupView] = useState(false);
  const [isBrainrotMode, setIsBrainrotMode] = useState(false);
  
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [voicePreset, setVoicePreset] = useState<VoicePreset>('chaotic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingText, setIsSuggestingText] = useState(false);

  const [is3DMode, setIs3DMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('product');

  const activeLayer = layers.find(l => l.id === activeLayerId);

  const TABS = [
    { id: 'product', icon: ImageIcon, label: 'Basi', color: 'bg-cyan-400' },
    { id: 'meme', icon: Search, label: 'Meme', color: 'bg-pink-500' },
    { id: 'stickers', icon: Sparkles, label: 'Stickers', color: 'bg-yellow-400' },
    { id: 'ai', icon: Brain, label: 'IA', color: 'bg-purple-500' },
    { id: 'layers', icon: Layers, label: 'Livelli', color: 'bg-orange-500' },
    { id: 'templates', icon: Save, label: 'Salvati', color: 'bg-green-400' },
  ] as const;
  const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const [isPublic, setIsPublic] = useState(false);
  const [isTextureUpdating, setIsTextureUpdating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    window.aistudio?.hasSelectedApiKey().then(setHasApiKey).catch(() => setHasApiKey(false));
  }, []);

  const handleSelectKey = async () => {
    await window.aistudio?.openSelectKey();
    const selected = await window.aistudio?.hasSelectedApiKey().catch(() => false);
    setHasApiKey(!!selected);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize with selected product if available
  useEffect(() => {
    if (selectedProduct) {
      // Find matching base product by category
      const base = BASE_PRODUCTS.find(b => b.category === selectedProduct.category) || BASE_PRODUCTS[0];
      setSelectedBase(base);
      setSelectedSize(selectedProduct.sizes?.[0] || base.sizes?.[0]);
      setSelectedColor(selectedProduct.colors?.[0]?.name || base.colors?.[0]?.name);
      
      if (selectedProduct.customData?.layers) {
        setLayers(selectedProduct.customData.layers);
      } else {
        // If it's a seed product, add its image as a layer
        const newLayer: Layer = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'meme',
          content: selectedProduct.image,
          x: 100,
          y: 100,
          width: 250,
          height: 250,
          rotate: 0,
          opacity: 1
        };
        setLayers([newLayer]);
        setActiveLayerId(newLayer.id);
      }
    }
  }, [selectedProduct]);

  const generateMemeWithAI = async () => {
    if (aiPrompt.trim().length < 6) {
      addToast('Scrivi un prompt un po piu chiaro prima di generare.');
      return;
    }
    if (!user) {
      addToast('Fai login per usare gli strumenti AI.');
      return;
    }
    setIsGenerating(true);
    playBlipSound();
    try {
      const functions = getFunctions();
      const generateMemeImage = httpsCallable<GenerateImageRequest, GenerateImageResponse>(functions, 'generateMemeImage');
      const response = await generateMemeImage({
        prompt: aiPrompt.trim(),
        voicePreset,
      });
      addLayer('meme', response.data.imageDataUrl);
      addToast("Meme generato dall'AI.");
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'functions/unauthenticated') {
        addToast('Sessione richiesta. Accedi e riprova.');
      } else if (error?.code === 'functions/failed-precondition') {
        addToast('AI non configurata lato server.');
      } else {
        addToast("Errore nella generazione. L'AI non ha risposto correttamente.");
      }
    } finally {
      setIsGenerating(false);
    }
  };


  useEffect(() => {
    const loaded = localStorage.getItem('brainrot_templates');
    if (loaded) {
      try {
        setSavedTemplates(JSON.parse(loaded));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const STICKERS = [
    { name: 'MLG Glasses', url: 'https://i.imgur.com/v8p0mXW.png' },
    { name: 'Thug Life Hat', url: 'https://i.imgur.com/6W6H20P.png' },
    { name: 'Deal With It', url: 'https://i.imgur.com/r6Sj9m1.png' },
    { name: 'Explosion', url: 'https://i.imgur.com/Z4XzX8V.png' },
    { name: 'Wow', url: 'https://i.imgur.com/8Q8pQ8p.png' },
    { name: 'Doge', url: 'https://i.imgur.com/7pQ8pQ8.png' },
    { name: 'Pepe', url: 'https://i.imgur.com/9pQ8pQ8.png' },
  ];

  const suggestAICaption = async () => {
    if (aiPrompt.trim().length < 6) {
      addToast('Scrivi un tema piu specifico per ottenere una caption utile.');
      return;
    }
    if (!user) {
      addToast('Fai login per usare gli strumenti AI.');
      return;
    }
    setIsSuggestingText(true);
    playBlipSound();
    try {
      const functions = getFunctions();
      const suggestMemeCaptions = httpsCallable<SuggestCaptionRequest, SuggestCaptionResponse>(functions, 'suggestMemeCaptions');
      const response = await suggestMemeCaptions({
        prompt: aiPrompt.trim(),
        voicePreset,
      });
      const suggestions = response.data.suggestions || [];
      if (suggestions.length > 0) {
        const caption = suggestions[Math.floor(Math.random() * suggestions.length)].trim();
        const voiceStyle = VOICE_PRESETS.find((preset) => preset.id === voicePreset)?.layerStyle || {};
        addLayer('text', caption, voiceStyle);
        addToast("Caption suggerita dall'AI.");
      }
    } catch (error: any) {
      console.error(error);
      if (error?.code === 'functions/unauthenticated') {
        addToast('Sessione richiesta. Accedi e riprova.');
      } else if (error?.code === 'functions/failed-precondition') {
        addToast('AI non configurata lato server.');
      } else {
        addToast("L'AI non ha restituito caption valide. Riprova.");
      }
    } finally {
      setIsSuggestingText(false);
    }
  };

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    playBlipSound();
    const newLayer = {
      ...layer,
      id: Math.random().toString(36).substr(2, 9),
      x: layer.x + 20,
      y: layer.y + 20
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const addLayer = (type: 'meme' | 'text' | 'image', content: string, overrides: Partial<Layer> = {}) => {
    playBlipSound();
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 60 : 150,
      rotate: 0,
      opacity: 1,
      fontSize: type === 'text' ? 32 : undefined,
      fontFamily: type === 'text' ? 'Inter' : undefined,
      color: type === 'text' ? '#ffffff' : undefined,
      strokeColor: type === 'text' ? '#000000' : undefined,
      strokeWidth: type === 'text' ? 2 : undefined,
      ...overrides,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    playBlipSound();
    setLayers(layers.filter(l => l.id !== id));
    if (activeLayerId === id) setActiveLayerId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    const newLayers = [...layers];
    if (direction === 'up' && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === 'down' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }
    setLayers(newLayers);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Carica un file immagine valido.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        addLayer('image', event.target?.result as string);
        addToast('Immagine caricata! ����');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const updateTexture = async () => {
      if (layers.length >= 0) {
        setIsTextureUpdating(true);
        const texture = await captureDesignTexture();
        setDesignTextureUrl(texture);
        setIsTextureUpdating(false);
      }
    };

    const timer = setTimeout(updateTexture, 500);
    return () => clearTimeout(timer);
  }, [layers, selectedBase]);

  const captureDesignTexture = async () => {
    if (!canvasRef.current) return null;
    try {
      // We only want the overlay area for the 3D texture
      const overlayElement = canvasRef.current.querySelector('.pointer-events-none') as HTMLElement;
      if (overlayElement) {
        const dataUrl = await toPng(overlayElement, { 
          pixelRatio: 2,
          backgroundColor: 'transparent'
        });
        return dataUrl;
      }
    } catch (e) {
      console.error('Failed to capture texture', e);
    }
    return null;
  };

  const toggle3DMode = async () => {
    if (!is3DMode) {
      setIsExporting(true);
      const texture = await captureDesignTexture();
      setDesignTextureUrl(texture);
      setIsExporting(false);
    }
    setIs3DMode(!is3DMode);
    playBlipSound();
  };

  const handleSaveTemplate = async () => {
    if (layers.length === 0) {
      addToast('Aggiungi qualcosa prima di salvare! ����');
      return;
    }
    setShowSaveModal(true);
    setTemplateName(`Design ${new Date().toLocaleTimeString()}`);
    playBlipSound();
  };

  const confirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      addToast('Dai un nome al template prima di salvarlo.');
      return;
    }

    playBlipSound();
    let thumbnail = '';
    if (canvasRef.current) {
      try {
        thumbnail = await toPng(canvasRef.current, { quality: 0.5, pixelRatio: 0.5 });
      } catch (e) {
        console.error('Thumbnail failed', e);
      }
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim() || `Template ${new Date().toLocaleTimeString()}`,
      baseId: selectedBase.id,
      layers,
      thumbnail
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('brainrot_templates', JSON.stringify(updated));
    addToast('Template salvato! ����');
    setShowSaveModal(false);
  };

  const handleLoadTemplate = (template: any) => {
    playBlipSound();
    setIsBaseLoaded(false);
    const base = BASE_PRODUCTS.find(b => b.id === template.baseId) || BASE_PRODUCTS[0];
    setSelectedBase(base);
    setSelectedSize(base.sizes?.[0]);
    setSelectedColor(base.colors?.[0]?.name);
    setLayers(template.layers || []);
    setActiveLayerId(null);
    addToast('Template caricato! ����');
  };

  const exportDesign = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    playBlipSound();
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `brainrot-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      addToast('Design esportato! �������');
    } catch (err) {
      console.error(err);
      addToast('Errore nell\'esportazione... ����');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playBlipSound();
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('brainrot_templates', JSON.stringify(updated));
    addToast('Template eliminato! �������');
  };

  useEffect(() => {
    fetch('https://api.imgflip.com/get_memes')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemes(data.data.memes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleBaseChange = (base: BaseProduct) => {
    playBlipSound();
    setIsBaseLoaded(false);
    setSelectedBase(base);
    setSelectedSize(base.sizes?.[0]);
    setSelectedColor(base.colors?.[0]?.name);
  };

  const handleAddToCart = async () => {
    if (layers.length === 0) {
      addToast('Devi prima aggiungere qualcosa! ����');
      return;
    }
    
    playCoinSound();
    setIsExporting(true);
    
    try {
      // Capture the final design
      const texture = await captureDesignTexture();
      
      let finalDesignUrl = texture;
      
      // Upload to Firebase Storage if possible
      try {
        const storageRef = ref(storage, `designs/${Date.now()}.png`);
        await uploadString(storageRef, texture ?? '', 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        finalDesignUrl = downloadUrl;
      } catch (error) {
        console.error("Error uploading design to storage:", error);
        // Fallback to data URL (might fail on backend)
      }
      
      if (isPublic) {
        if (!auth.currentUser) {
          addToast("Devi essere loggato per pubblicare!");
        } else {
          await addDoc(collection(db, 'communityDesigns'), {
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName || 'Anonimo',
            image: finalDesignUrl,
            memeDescription: aiPrompt || 'Design personalizzato',
            createdAt: new Date().toISOString(),
            likes: 0
          });
          addToast("Design pubblicato nella community! ����");
        }
      }
      
      const containerWidth = containerRef.current?.offsetWidth || 500;
      const containerHeight = containerRef.current?.offsetHeight || 500;
      
      const customProduct: Product = {
        id: `custom-${selectedBase.id}-${Date.now()}`,
        name: `${selectedBase.name} - Custom Design`,
        price: selectedBase.price,
        image: selectedBase.image,
        category: selectedBase.category,
        memeDescription: aiPrompt || 'Creato da te, genio incompreso.',
        rarity: 'Legendary',
        color: 'bg-green-400',
        sizes: selectedBase.sizes,
        colors: selectedBase.colors,
        customData: {
          baseImage: selectedBase.image,
          layers,
          overlay: selectedBase.overlay,
          containerSize: { width: containerWidth, height: containerHeight },
          designTextureUrl: finalDesignUrl ?? undefined
        }
      };
      
      addToCart(customProduct, quantity, selectedSize, selectedColor);
      addToast(`Capolavoro aggiunto al carrello! ���`);
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
      addToast("Errore durante l'aggiunta al carrello. ����");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f0f0f0] flex flex-col"
    >
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-2 md:p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-sm animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playBlipSound(); onBack(); }}
            className="flex items-center gap-2 px-2 md:px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-black uppercase text-[10px] md:text-sm"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">ESCI DALLO STUDIO</span>
            <span className="sm:hidden">ESCI</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsSidebarOpen(!isSidebarOpen); playBlipSound(); }}
            className="md:hidden flex items-center gap-2 px-2 py-2 border-4 border-black bg-yellow-400 font-black uppercase text-[10px]"
          >
            <Sliders className="w-3 h-3" />
            {isSidebarOpen ? 'CHIUDI' : 'STRUMENTI'}
          </motion.button>
        </div>
        
        <div className="flex items-center gap-1 md:gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsBrainrotMode(!isBrainrotMode); playBlipSound(); }}
            className={cn(
              "px-2 md:px-4 py-2 border-4 border-black font-black uppercase transition-all text-[10px] md:text-xs hidden sm:block",
              isBrainrotMode ? "bg-red-500 text-white animate-pulse" : "bg-white text-black"
            )}
          >
            Brainrot {isBrainrotMode ? 'ON' : 'OFF'}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle3DMode}
            className={cn(
              "flex items-center gap-2 px-2 md:px-4 py-2 border-4 border-black transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] font-black uppercase text-[10px] md:text-sm",
              is3DMode ? "bg-purple-500 text-white" : "bg-white text-black"
            )}
          >
            <Eye className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{is3DMode ? 'TORNA AL 2D' : 'ANTEPRIMA 3D'}</span>
            <span className="sm:hidden">{is3DMode ? '2D' : '3D'}</span>
          </motion.button>
          <button 
            onClick={handleSaveTemplate}
            className="hidden md:flex items-center gap-2 px-4 py-2 border-4 border-black bg-cyan-400 hover:bg-cyan-500 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-black uppercase text-sm"
          >
            <Save className="w-4 h-4" />
            SALVA
          </button>
          <button 
            onClick={exportDesign}
            disabled={isExporting}
            className="hidden md:flex items-center gap-2 px-4 py-2 border-4 border-black bg-pink-400 hover:bg-pink-500 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] font-black uppercase text-sm disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            ESPORTA
          </button>
          <div className="flex items-center gap-2 mr-4">
            <input 
              type="checkbox" 
              id="isPublic" 
              checked={isPublic} 
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 border-4 border-black accent-cyan-500"
            />
            <label htmlFor="isPublic" className="font-black uppercase text-sm">PUBBLICA</label>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-3 md:px-6 py-2 border-4 border-black bg-yellow-400 hover:bg-yellow-500 transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] md:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] font-black uppercase text-[10px] md:text-sm"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">AGGIUNGI</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar - Tools */}
        <div className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-80 md:w-[25%] bg-white border-r-8 border-black flex transition-transform duration-300 ease-in-out md:translate-x-0 order-2",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Toolbox Icons */}
          <div className="w-20 md:w-24 border-r-8 border-black bg-[#1a1a1a] flex flex-col items-center py-6 gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { playBlipSound(); setActiveTab(tab.id); }}
                className={cn(
                  "p-4 border-4 border-black transition-all relative group",
                  activeTab === tab.id 
                    ? `${tab.color} shadow-none translate-x-1 translate-y-1` 
                    : "bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                )}
                title={tab.label}
              >
                <tab.icon className={cn(
                  "w-6 h-6 md:w-8 md:h-8",
                  activeTab === tab.id ? "text-black" : "text-black",
                  tab.id === 'ai' && isGenerating ? 'animate-spin' : ''
                )} />
                <span className="absolute left-full ml-6 px-3 py-1 bg-black text-white text-[10px] font-display uppercase italic opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border-2 border-white">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className={cn(
              "p-6 border-b-8 border-black flex justify-between items-center",
              TABS.find(t => t.id === activeTab)?.color || "bg-white"
            )}>
              <h3 className="font-display uppercase text-4xl tracking-tighter italic leading-none">{TABS.find(t => t.id === activeTab)?.label}</h3>
              <button onClick={() => setIsSidebarOpen(false)} aria-label="Chiudi sidebar" className="md:hidden p-3 border-4 border-black bg-white text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 bg-[#f8f8f8] space-y-8">
              {activeTab === 'product' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  <h3 className="font-display uppercase text-2xl italic">SCEGLI LA BASE</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {BASE_PRODUCTS.map(base => (
                    <button
                      key={base.id}
                      onClick={() => handleBaseChange(base)}
                      className={cn(
                        "p-4 border-4 border-black transition-all group relative overflow-hidden flex flex-col items-center",
                        selectedBase.id === base.id 
                          ? 'bg-cyan-400 shadow-none translate-x-1 translate-y-1' 
                          : 'bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                      )}
                    >
                      <div className="aspect-square w-full border-4 border-black mb-3 overflow-hidden bg-neutral-100 relative">
                        <img src={base.image} alt={base.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        {selectedBase.id === base.id && (
                          <div className="absolute top-2 right-2 bg-black text-white p-1 border-2 border-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-display uppercase block truncate italic font-black">{base.name}</span>
                      <span className="text-[10px] font-mono font-bold text-gray-500 mt-1">���{base.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'meme' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                  <h3 className="font-display uppercase text-2xl italic">MEME LIBRARY</h3>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black z-10" />
                  <input 
                    type="text"
                    placeholder="CERCA IL DISAGIO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-4 border-black p-5 pl-14 font-mono text-sm focus:outline-none bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <label className="col-span-3 h-40 border-8 border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-400 transition-all group relative overflow-hidden bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <div className="relative z-10 flex flex-col items-center">
                      <Upload className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-xl font-display uppercase italic font-black">CARICA IL TUO TRASH</span>
                      <span className="text-[10px] font-mono uppercase mt-1 opacity-50">PNG, JPG, GIF (Max 5MB)</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="absolute inset-0 bg-pink-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </label>
                  
                  {loading ? (
                    <div className="col-span-3 py-20 flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
                      <p className="font-display uppercase text-xs italic animate-pulse">SCAVANDO NELLA SPAZZATURA...</p>
                    </div>
                  ) : (
                    filteredMemes.slice(0, 50).map(meme => (
                      <button
                        key={meme.id}
                        onClick={() => addLayer('meme', meme.url)}
                        className="aspect-square border-4 border-black overflow-hidden hover:scale-105 transition-transform bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none relative group"
                      >
                        <img src={meme.url} alt={meme.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div className="space-y-6">
                <h3 className="font-display uppercase text-2xl border-b-4 border-black pb-2 italic">STICKERS ����</h3>
                <div className="grid grid-cols-2 gap-4">
                  {STICKERS.map((sticker, idx) => (
                    <button
                      key={idx}
                      onClick={() => addLayer('image', sticker.url)}
                      className="aspect-square border-4 border-black p-3 bg-white hover:bg-yellow-400 transition-colors group shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                      <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  <h3 className="font-display uppercase text-2xl italic">GENERATORE IA</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black uppercase text-xs">Voice Customizer</p>
                    <p className="font-mono text-[10px] uppercase text-gray-600">{aiPrompt.trim().length}/240</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {VOICE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => { playBlipSound(); setVoicePreset(preset.id); }}
                        aria-pressed={voicePreset === preset.id}
                        className={cn(
                          'border-4 border-black p-3 text-left transition-all',
                          voicePreset === preset.id ? 'bg-yellow-300 translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                        )}
                      >
                        <p className="font-black uppercase">{preset.label}</p>
                        <p className="mt-2 text-[11px] font-mono leading-relaxed">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute -inset-1 bg-purple-500 rounded-sm blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <textarea 
                    placeholder="DESCRIVI IL TUO DELIRIO (es. 'un gatto che mangia pizza nello spazio')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    maxLength={240}
                    aria-label="Descrivi l immagine o la caption da generare"
                    className="relative w-full border-4 border-black p-5 font-mono text-sm h-48 resize-none focus:outline-none bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-6">
                  {hasApiKey ? (
                    <>
                      <button
                        onClick={generateMemeWithAI}
                        disabled={isGenerating}
                        className="w-full bg-purple-500 text-white border-4 border-black p-5 font-display uppercase text-2xl italic shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all disabled:opacity-50 group overflow-hidden relative"
                      >
                        <span className="relative z-10">{isGenerating ? 'GENERAZIONE...' : 'GENERA MEME'}</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </button>
                      <button
                        onClick={suggestAICaption}
                        disabled={isSuggestingText}
                        className="w-full bg-cyan-400 text-black border-4 border-black p-5 font-display uppercase text-2xl italic shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all disabled:opacity-50 group overflow-hidden relative"
                      >
                        <span className="relative z-10">{isSuggestingText ? 'PENSANDO...' : 'SUGGERISCI CAPTION'}</span>
                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSelectKey}
                      className="w-full bg-yellow-400 text-black border-4 border-black p-6 font-display uppercase text-2xl italic shadow-[12px_12px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[12px] hover:translate-y-[12px] transition-all flex flex-col items-center gap-2"
                    >
                      <Zap className="w-8 h-8" />
                      ATTIVA IA (CHIAVE API)
                    </button>
                  )}
                </div>
                
                <div className="p-4 bg-black text-green-400 font-mono text-[10px] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <p className="mb-2">{`> SYSTEM_STATUS: OPERATIONAL`}</p>
                  <p className="mb-2">{`> AI_MODEL: GEMINI_3_FLASH`}</p>
                  <p className="italic opacity-70">
                    *L'IA potrebbe generare cose strane. �� parte del divertimento, non denunciarci.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <h3 className="font-display uppercase text-2xl border-b-4 border-black pb-2 italic">I TUOI DESIGN</h3>
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-16 border-4 border-dashed border-black/10 bg-white">
                    <Save className="w-16 h-16 mx-auto mb-4 text-black/10" />
                    <p className="font-mono text-xs font-bold text-gray-400 italic">NESSUN TEMPLATE SALVATO, PIGRO.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {savedTemplates.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => handleLoadTemplate(template)}
                        className="border-4 border-black bg-white p-3 cursor-pointer hover:bg-yellow-50 transition-colors group relative shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      >
                        <div className="aspect-square border-4 border-black mb-3 overflow-hidden">
                          <img src={template.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-display uppercase truncate italic">{template.name}</span>
                          <button 
                            onClick={(e) => handleDeleteTemplate(template.id, e)}
                            aria-label="Elimina template"
                            className="p-2 text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-display uppercase text-gray-500 italic">GESTIONE LIVELLI</span>
                  <button 
                    onClick={() => { playBlipSound(); setLayers([]); }}
                    aria-label="Svuota tutti i livelli"
                    className="text-[10px] font-display uppercase text-red-500 hover:underline italic font-black"
                  >
                    SVUOTA TUTTO ����
                  </button>
                </div>
                <button 
                  onClick={() => addLayer('text', 'NUOVO TESTO')}
                  aria-label="Aggiungi livello di testo"
                  className="w-full border-4 border-black p-5 flex items-center justify-center gap-3 font-display uppercase text-2xl italic bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Type className="w-8 h-8" /> AGGIUNGI TESTO
                </button>
                <div className="space-y-6">
                  {layers.length === 0 ? (
                    <div className="text-center py-24 border-8 border-dashed border-black/10 bg-white">
                      <Layers className="w-24 h-24 mx-auto mb-6 text-black/10" />
                      <p className="font-mono text-sm font-black text-gray-400 italic uppercase">NESSUN LIVELLO AGGIUNTO</p>
                    </div>
                  ) : (
                    [...layers].reverse().map((layer) => (
                      <div 
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={cn(
                          "group flex items-center gap-4 p-5 border-4 border-black transition-all cursor-pointer relative overflow-hidden",
                          activeLayerId === layer.id 
                            ? "bg-yellow-400 shadow-none translate-x-1 translate-y-1" 
                            : "bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        )}
                      >
                        <div className="w-16 h-16 border-4 border-black bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                          {layer.type === 'text' ? (
                            <span className="font-display text-4xl italic">T</span>
                          ) : (
                            <img src={layer.content} className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-display uppercase text-sm truncate italic leading-none mb-1">
                            {layer.type === 'text' ? layer.content : 'Immagine'}
                          </p>
                          <p className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">
                            {layer.type === 'text' ? 'Testo' : 'Grafica'}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); playBlipSound(); moveLayer(layer.id, 'up'); }}
                            aria-label="Sposta livello su"
                            className="p-2 hover:bg-black hover:text-white border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none"
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); playBlipSound(); removeLayer(layer.id); }}
                            aria-label="Elimina livello"
                            className="p-2 hover:bg-red-500 hover:text-white border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center - 3D Studio */}
      <div className="w-full md:w-[50%] relative flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-[#1a1a1a] order-1 border-b-8 md:border-b-0 md:border-r-8 border-black">
          {/* Quick Actions Bar (Floating) */}
          <AnimatePresence>
            {activeLayer && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white border-8 border-black p-4 shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-2 border-r-4 border-black pr-4">
                  <button 
                    onClick={() => { playBlipSound(); duplicateLayer(activeLayer.id); }}
                    aria-label="Duplica livello"
                    className="p-3 bg-cyan-400 hover:bg-cyan-500 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Duplica"
                  >
                    <Copy className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => { playBlipSound(); removeLayer(activeLayer.id); }}
                    aria-label="Elimina livello"
                    className="p-3 bg-red-500 text-white hover:bg-red-600 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Elimina"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 border-r-4 border-black pr-4">
                  <button 
                    onClick={() => { playBlipSound(); updateLayer(activeLayer.id, { rotate: (activeLayer.rotate || 0) - 90 }); }}
                    aria-label="Ruota livello di -90 gradi"
                    className="p-3 bg-yellow-400 hover:bg-yellow-50 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Ruota -90��"
                  >
                    <ChevronUp className="w-6 h-6 -rotate-90" />
                  </button>
                  <button 
                    onClick={() => { playBlipSound(); updateLayer(activeLayer.id, { rotate: (activeLayer.rotate || 0) + 90 }); }}
                    aria-label="Ruota livello di +90 gradi"
                    className="p-3 bg-yellow-400 hover:bg-yellow-50 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Ruota +90��"
                  >
                    <ChevronUp className="w-6 h-6 rotate-90" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { playBlipSound(); moveLayer(activeLayer.id, 'up'); }}
                    aria-label="Porta livello avanti"
                    className="p-3 bg-purple-500 text-white hover:bg-purple-600 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Porta Avanti"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => { playBlipSound(); moveLayer(activeLayer.id, 'down'); }}
                    aria-label="Porta livello indietro"
                    className="p-3 bg-purple-500 text-white hover:bg-purple-600 transition-colors border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Porta Indietro"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Studio Header */}
          <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-30 pointer-events-none">
            <div className="pointer-events-auto bg-black p-4 border-4 border-white shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
              <h2 className="text-3xl md:text-5xl font-display text-white uppercase tracking-tighter mb-1 flex items-center gap-3 italic leading-none">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                3D <span className="text-pink-500">Studio</span>
              </h2>
              <p className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-black">Rendering Live ��� 60 FPS ��� {selectedBase.name}</p>
            </div>

            <div className="flex flex-col gap-4 pointer-events-auto">
              <button 
                onClick={() => { setShowGrid(!showGrid); playBlipSound(); }}
                aria-label={showGrid ? "Disattiva griglia" : "Attiva griglia"}
                className={cn(
                  "p-3 md:p-4 border-4 border-white bg-black text-white shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-display uppercase text-sm italic",
                  showGrid && "bg-yellow-400 text-black border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                )}
              >
                <Grid className="w-5 h-5" /> 
                <span className="hidden sm:inline">{showGrid ? 'Griglia ON' : 'Griglia OFF'}</span>
              </button>
              <button 
                onClick={() => { setIsMockupView(!isMockupView); playBlipSound(); }}
                aria-label={isMockupView ? "Passa alla vista 3D" : "Passa alla vista 2D"}
                className={cn(
                  "p-3 md:p-4 border-4 border-white bg-black text-white shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-3 font-display uppercase text-sm italic",
                  isMockupView && "bg-pink-500 text-white border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                )}
              >
                <Eye className="w-5 h-5" />
                <span className="hidden sm:inline">{isMockupView ? 'Vista 2D' : 'Vista 3D'}</span>
              </button>
            </div>
          </div>

          {/* Viewfinder Corners */}
          <div className="absolute inset-10 pointer-events-none z-20 border-[20px] border-transparent">
            <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-white/20" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-8 border-r-8 border-white/20" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-8 border-l-8 border-white/20" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-white/20" />
            
            {/* Viewfinder Center Cross */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-20">
              <div className="w-full h-1 bg-white" />
              <div className="h-full w-1 bg-white absolute" />
            </div>
          </div>

          {/* Main 3D Viewport */}
          <div className="w-full h-full relative z-10">
            {/* Mobile Quick Controls */}
            <AnimatePresence>
              {activeLayer && !is3DMode && (
                <motion.div 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className="absolute bottom-4 left-4 right-4 z-40 md:hidden bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center border-b-2 border-black pb-2">
                    <span className="font-black uppercase text-xs">PROPRIET�� LIVELLO</span>
                    <button onClick={() => setActiveLayerId(null)} aria-label="Deseleziona livello" className="p-1 border-2 border-black bg-red-500 text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {activeLayer.type === 'text' && (
                      <>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-[8px] font-black uppercase">DIMENSIONE</span>
                          <input 
                            type="range" min="10" max="200" 
                            value={activeLayer.fontSize} 
                            onChange={(e) => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                        </div>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-[8px] font-black uppercase">COLORE</span>
                          <input 
                            type="color" 
                            value={activeLayer.color} 
                            onChange={(e) => updateLayer(activeLayer.id, { color: e.target.value })}
                            className="w-full h-8 border-2 border-black cursor-pointer"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className="text-[8px] font-black uppercase">ROTAZIONE</span>
                      <input 
                        type="range" min="0" max="360" 
                        value={activeLayer.rotate} 
                        onChange={(e) => updateLayer(activeLayer.id, { rotate: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className="text-[8px] font-black uppercase">OPACIT��</span>
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={activeLayer.opacity} 
                        onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => duplicateLayer(activeLayer.id)}
                      aria-label="Duplica livello"
                      className="flex-1 py-2 border-2 border-black bg-cyan-400 font-black uppercase text-[10px] flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> DUPLICA
                    </button>
                    <button 
                      onClick={() => removeLayer(activeLayer.id)}
                      aria-label="Elimina livello"
                      className="flex-1 py-2 border-2 border-black bg-red-500 text-white font-black uppercase text-[10px] flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> ELIMINA
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isMockupView ? (
                <motion.div 
                  key="3d-view"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="w-full h-full"
                >
                  <Product3DPreview 
                    baseProductId={selectedBase.id} 
                    designTextureUrl={designTextureUrl} 
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="2d-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div 
                    ref={containerRef} 
                    className={cn(
                      "relative bg-white border-8 border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] transition-all duration-500 overflow-hidden",
                      "w-full max-w-[500px] aspect-square",
                      isBrainrotMode && "animate-bounce"
                    )}
                  >
                    <div ref={canvasRef} className="absolute inset-0 w-full h-full">
                      <img 
                        src={selectedBase.image} 
                        alt={selectedBase.name} 
                        onLoad={() => setIsBaseLoaded(true)}
                        className={cn(
                          "w-full h-full object-cover pointer-events-none transition-all duration-300",
                          !isBaseLoaded ? 'opacity-0' : 'opacity-100'
                        )}
                      />
                      
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          top: selectedBase.overlay.top,
                          left: selectedBase.overlay.left,
                          width: selectedBase.overlay.width,
                          height: selectedBase.overlay.height,
                          transform: selectedBase.overlay.rotate ? `rotate(${selectedBase.overlay.rotate})` : 'none',
                        }}
                      >
                        {layers.map((layer) => (
                          <Rnd
                            key={layer.id}
                            position={{ x: layer.x, y: layer.y }}
                            size={{ width: layer.width, height: layer.height }}
                            onDragStop={(_e, d) => updateLayer(layer.id, { x: d.x, y: d.y })}
                            onResizeStop={(_e, _direction, ref, _delta, position) => {
                              updateLayer(layer.id, { 
                                width: parseInt(ref.style.width), 
                                height: parseInt(ref.style.height),
                                ...position 
                              });
                            }}
                            bounds="parent"
                            disableDragging={layer.locked}
                            enableResizing={!layer.locked}
                            className={`absolute pointer-events-auto ${activeLayerId === layer.id ? 'z-20' : 'z-10'}`}
                            onClick={() => setActiveLayerId(layer.id)}
                          >
                            <div 
                              className={cn(
                                "w-full h-full relative group transition-transform duration-200",
                                activeLayerId === layer.id ? 'ring-4 ring-pink-500 ring-offset-2' : 'hover:ring-2 hover:ring-black/50'
                              )}
                              style={{ 
                                opacity: layer.opacity,
                                filter: layer.filter,
                                transform: `rotate(${layer.rotate}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                              }}
                            >
                              {layer.type === 'text' ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center text-center p-2 select-none"
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
                                <img src={layer.content} alt="Layer" className="w-full h-full object-contain pointer-events-none" />
                              )}

                              {activeLayerId === layer.id && !layer.locked && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black text-white p-1 rounded border-2 border-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                  <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} aria-label="Duplica livello" className="p-1 hover:bg-white/20" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: true }); }} aria-label="Blocca livello" className="p-1 hover:bg-white/20" title="Lock"><Lock className="w-4 h-4" /></button>
                                  <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} aria-label="Elimina livello" className="p-1 hover:bg-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              )}
                            </div>
                          </Rnd>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden 2D Canvas for Texture Generation (always active in background) */}
          <div className="fixed -left-[2000px] -top-[2000px] pointer-events-none">
            <div 
              ref={canvasRef} 
              className="w-[1024px] h-[1024px] bg-transparent overflow-hidden relative"
            >
              <div 
                className="absolute inset-0"
                style={{
                  // No base image here, we only want the design
                  width: '100%',
                  height: '100%',
                }}
              >
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    style={{
                      position: 'absolute',
                      left: `${(layer.x / 500) * 1024}px`,
                      top: `${(layer.y / 500) * 1024}px`,
                      width: `${(layer.width / 500) * 1024}px`,
                      height: `${(layer.height / 500) * 1024}px`,
                      opacity: layer.opacity,
                      filter: layer.filter,
                      transform: `rotate(${layer.rotate}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                    }}
                  >
                    {layer.type === 'text' ? (
                      <div 
                        className="w-full h-full flex items-center justify-center text-center font-black"
                        style={{ 
                          fontSize: `${(layer.fontSize! / 500) * 1024}px`,
                          fontFamily: layer.fontFamily,
                          color: layer.color,
                          WebkitTextStroke: `${(layer.strokeWidth! / 500) * 1024}px ${layer.strokeColor}`,
                          lineHeight: 1
                        }}
                      >
                        {layer.content}
                      </div>
                    ) : (
                      <img src={layer.content} alt="Layer" className="w-full h-full object-contain" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-30 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border-2 border-white/20 px-4 py-2 rounded-full flex items-center gap-3 pointer-events-auto">
              <div className={cn("w-2 h-2 rounded-full", isTextureUpdating ? "bg-yellow-400 animate-spin" : "bg-green-500")} />
              <span className="text-[10px] font-mono text-white uppercase tracking-widest">
                {isTextureUpdating ? 'Aggiornamento Texture...' : 'Sistema Sincronizzato'}
              </span>
            </div>
            
            <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] pointer-events-auto">
              <span className="text-xs font-black uppercase">Usa la vista 2D per posizionare i livelli</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="hidden md:flex w-[25%] bg-white flex-col h-[calc(100vh-84px)] order-3">
          <div className="p-4 border-b-4 border-black bg-black text-white">
            <h3 className="font-black uppercase text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4" /> PROPRIET�� LIVELLO
            </h3>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {activeLayer ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-black uppercase text-xs">AZIONI RAPIDE</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateLayer(activeLayer.id, { flipX: !activeLayer.flipX })}
                      aria-label="Rifletti livello orizzontalmente"
                      className={cn("p-2 border-2 border-black bg-white hover:bg-cyan-400 transition-colors", activeLayer.flipX && "bg-cyan-400")}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateLayer(activeLayer.id, { flipY: !activeLayer.flipY })}
                      aria-label="Rifletti livello verticalmente"
                      className={cn("p-2 border-2 border-black bg-white hover:bg-cyan-400 transition-colors", activeLayer.flipY && "bg-cyan-400")}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateLayer(activeLayer.id, { locked: !activeLayer.locked })}
                      aria-label={activeLayer.locked ? "Sblocca livello" : "Blocca livello"}
                      className={cn("p-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white transition-colors", activeLayer.locked && "bg-red-500 text-white")}
                      title={activeLayer.locked ? "Unlock" : "Lock"}
                    >
                      {activeLayer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {activeLayer.type === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase mb-1 block">TESTO</label>
                      <input 
                        type="text"
                        value={activeLayer.content}
                        onChange={(e) => updateLayer(activeLayer.id, { content: e.target.value })}
                        className="w-full border-2 border-black p-2 font-black uppercase text-xs focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">FONT SIZE</label>
                        <input 
                          type="number"
                          value={activeLayer.fontSize}
                          onChange={(e) => updateLayer(activeLayer.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full border-2 border-black p-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">FONT</label>
                        <select 
                          value={activeLayer.fontFamily}
                          onChange={(e) => updateLayer(activeLayer.id, { fontFamily: e.target.value })}
                          className="w-full border-2 border-black p-1 text-xs font-black uppercase"
                        >
                          <option value="Inter">Inter</option>
                          <option value="'Playfair Display'">Playfair</option>
                          <option value="'JetBrains Mono'">Mono</option>
                          <option value="Impact">Impact</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">COLORE</label>
                        <input 
                          type="color"
                          value={activeLayer.color}
                          onChange={(e) => updateLayer(activeLayer.id, { color: e.target.value })}
                          className="w-full h-8 border-2 border-black p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase mb-1 block">BORDO</label>
                        <input 
                          type="color"
                          value={activeLayer.strokeColor}
                          onChange={(e) => updateLayer(activeLayer.id, { strokeColor: e.target.value })}
                          className="w-full h-8 border-2 border-black p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block flex justify-between">
                      ROTAZIONE <span>{activeLayer.rotate}��</span>
                    </label>
                    <input 
                      type="range"
                      min="-180"
                      max="180"
                      value={activeLayer.rotate}
                      onChange={(e) => updateLayer(activeLayer.id, { rotate: parseInt(e.target.value) })}
                      className="w-full accent-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block flex justify-between">
                      OPACIT�� <span>{Math.round(activeLayer.opacity * 100)}%</span>
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={activeLayer.opacity}
                      onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) })}
                      className="w-full accent-black"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">FILTRI</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Nessuno', value: 'none' },
                        { name: 'Grigio', value: 'grayscale(100%)' },
                        { name: 'Seppia', value: 'sepia(100%)' },
                        { name: 'Inverti', value: 'invert(100%)' },
                        { name: 'Sfocatura', value: 'blur(2px)' },
                        { name: 'Contrasto', value: 'contrast(150%)' }
                      ].map(filter => (
                        <button
                          key={filter.value}
                          onClick={() => updateLayer(activeLayer.id, { filter: filter.value })}
                          aria-label={`Applica filtro ${filter.name}`}
                          className={`p-1 text-[8px] font-black uppercase border-2 border-black transition-colors ${
                            activeLayer.filter === filter.value ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeLayer(activeLayer.id)}
                  aria-label="Elimina livello selezionato"
                  className="w-full border-4 border-black bg-red-500 text-white p-2 font-black uppercase text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> ELIMINA LIVELLO
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 space-y-4 border-4 border-dashed border-gray-200">
                  <Layers className="w-12 h-12 text-gray-300" />
                  <p className="font-mono text-[10px] text-gray-400 italic">SELEZIONA UN LIVELLO PER MODIFICARLO</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black uppercase text-xs border-b-2 border-black pb-1">VIBE GLOBALE ���</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Normal', filter: 'none' },
                      { name: 'Retro', filter: 'sepia(0.5) contrast(1.2)' },
                      { name: 'Cyber', filter: 'hue-rotate(90deg) saturate(2)' },
                      { name: 'Deep Fried', filter: 'contrast(3) saturate(3) brightness(1.2)' },
                      { name: 'Ghost', filter: 'opacity(0.5) blur(1px)' },
                      { name: 'Vintage', filter: 'grayscale(0.5) brightness(0.9)' }
                    ].map(vibe => (
                      <button
                        key={vibe.name}
                        onClick={() => {
                          playBlipSound();
                          layers.forEach(l => updateLayer(l.id, { filter: vibe.filter }));
                        }}
                        aria-label={`Applica vibe ${vibe.name}`}
                        className="p-2 text-[10px] font-black uppercase border-2 border-black bg-white hover:bg-yellow-400 transition-all"
                      >
                        {vibe.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-black text-white border-4 border-black shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
                  <p className="text-[10px] font-mono italic">"Il design �� l'anima di tutto ci�� che �� creato dall'uomo." ��� Steve Jobs (probabilmente parlando di meme)</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-black bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black uppercase text-xs">DETTAGLI ORDINE</span>
              <span className="font-mono font-bold text-red-600">���{selectedBase.price.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 mb-4">
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="flex-grow border-2 border-black p-1 text-xs font-black uppercase"
              >
                {selectedBase.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex items-center border-2 border-black bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Diminuisci quantit��" className="px-2 border-r-2 border-black">-</button>
                <span className="px-3 text-xs font-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Aumenta quantit��" className="px-2 border-l-2 border-black">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar - Tab Switching */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-black flex items-center justify-around p-2 h-16">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { playBlipSound(); setActiveTab(tab.id); setIsSidebarOpen(true); }}
            aria-label={`Apri scheda ${tab.label}`}
            className={cn(
              "flex flex-col items-center gap-1 p-1 transition-all",
              activeTab === tab.id ? "text-yellow-500 scale-110" : "text-black"
            )}
          >
            <tab.icon className={cn(
              "w-5 h-5",
              tab.id === 'ai' && isGenerating ? 'animate-spin' : ''
            )} />
            <span className="text-[8px] font-black uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white border-8 border-black p-8 w-full max-w-md shadow-[20px_20px_0_0_rgba(0,0,0,1)]"
            >
              <h3 className="text-3xl font-black uppercase mb-6">SALVA IL TUO CAPOLAVORO</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase mb-2 block">NOME DEL DESIGN</label>
                  <input 
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full border-4 border-black p-3 font-black uppercase focus:outline-none bg-yellow-50"
                    placeholder="ES: IL MIO MEME SUPREMO"
                    autoFocus
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowSaveModal(false)}
                    aria-label="Annulla salvataggio"
                    className="flex-1 border-4 border-black p-3 font-black uppercase hover:bg-gray-100 transition-colors"
                  >
                    ANNULLA
                  </button>
                  <button 
                    onClick={confirmSaveTemplate}
                    aria-label="Conferma salvataggio template"
                    className="flex-1 bg-yellow-400 border-4 border-black p-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                  >
                    SALVA ORA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Templates Modal/Section (Advanced) */}
      {savedTemplates.length > 0 && (
        <div className="bg-white border-t-4 border-black p-6">
          <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <Save className="w-6 h-6" /> I TUOI TEMPLATE SALVATI
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {savedTemplates.map(template => (
              <div 
                key={template.id}
                onClick={() => handleLoadTemplate(template)}
                className="flex-shrink-0 w-48 border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer group relative"
              >
                <div className="aspect-square bg-gray-100 border-b-4 border-black relative overflow-hidden">
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon /></div>
                  )}
                  <button 
                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                    aria-label={`Elimina template ${template.name}`}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-black uppercase truncate">{template.name}</p>
                  <p className="text-[8px] font-mono text-gray-500">{new Date(parseInt(template.id)).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductCustomizer;

