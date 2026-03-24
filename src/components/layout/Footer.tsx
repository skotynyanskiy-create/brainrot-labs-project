import React, { useState, useRef } from 'react';
import { SOCIAL_LINKS } from '../../constants';

const footerPhrases = [
  "IL TUO FEED TIKTOK È DIVENTATO VESTITI",
  "TAGGACI SU IG (SE HAI IL CORAGGIO)",
  "NESSUN RIMBORSO PER CHI SKIPPA IL LEG DAY",
  "METTERE NEL CARRELLO NON È COMPRARE",
  "ATTENZIONE: ALTO RISCHIO DI CRINGE",
  "I SOLDI NON COMPRANO LA FELICITÀ, MA COMPRANO MEME",
  "HAI DAVVERO LETTO FINO A QUI?",
  "SIAMO IL TUO TERAPISTA ORA",
  "I SOLDI VANNO E VENGONO, I MEME RESTANO",
  "NESSUN RIMBORSO, NESSUNA PIETÀ",
  "HAI SCORSO FINO A QUI PER NON COMPRARE NIENTE?",
  "ENTRA NEL CULTO PRIMA CHE SIA MAINSTREAM",
  "IL SERVIZIO CLIENTI TI GHOSTERÀ",
  "QUESTO SITO È UN ESPERIMENTO SOCIALE",
  "PAGA IN CRYPTO O IN LACRIME",
  "RISCHI DI DIVENTARE TROPPO BASATO",
  "ACCETTIAMO ANCHE LA TUA ANIMA COME PAGAMENTO",
  "SCAPPA FINCHÉ PUOI"
];

// Triplichiamo l'array per supportare schermi Ultra-Wide >4K
const repeatedFooterPhrases = [...footerPhrases, ...footerPhrases, ...footerPhrases];

interface FooterProps {
  onNavigateHome?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export default function Footer({ onNavigateHome, onOpenPrivacy, onOpenTerms }: FooterProps) {
  const handleLinkClick = (_e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        const element = document.querySelector(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const [clickCount, setClickCount] = useState(0);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    clickTimeout.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);

    if (clickCount + 1 >= 5) {
      setIsChaosMode(true);
      setClickCount(0);
    }
  };

  return (
    <footer className="bg-white overflow-hidden flex flex-col">


      {/* Fotter Marquee */}
      <div className="flex overflow-hidden bg-black text-white hover:bg-white hover:text-black transition-colors duration-500 border-y-4 border-black group" aria-label="Disclaimer e Slogan">
        <div className="flex w-full py-5 mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
          <div className="w-max flex items-center font-display font-black uppercase text-xl md:text-2xl tracking-[0.25em] animate-marquee group-hover:[animation-play-state:paused]">
            {repeatedFooterPhrases.map((phrase, i) => (
              <span 
                key={i} 
                className="mx-10 whitespace-nowrap"
                aria-hidden={i >= footerPhrases.length ? "true" : undefined}
              >
                <span className="text-white group-hover:text-black transition-colors duration-500">☠</span> {phrase}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
        {/* Colonna 1: Brand */}
        <div className="p-10 md:p-20 bg-white flex flex-col justify-between">
          <div>
            <div className="cursor-pointer select-none" onClick={handleLogoClick}>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none transform -skew-x-6 hover:scale-105 transition-transform">
                Brainrot<br/>
                <span className="inline-block bg-pink-500 text-white px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-2 italic">Labs</span>
              </h2>
            </div>
            <p className="font-sans text-xl md:text-2xl font-medium text-black leading-relaxed border-l-8 border-black pl-6 italic">
              "Materializziamo il disagio di internet perché il mondo reale non era abbastanza deprimente."
            </p>
          </div>
          <div className="mt-16 font-mono text-sm font-bold uppercase tracking-widest text-black/40">
            <p>© 2026 Brainrot Labs.</p>
            <p>Pls don't sue us, we have no money.</p>
          </div>
        </div>

        {/* Colonna 2: Links */}
        <div className="p-10 md:p-20 bg-[#f0f0f0] flex flex-col gap-10">
          <h3 className="text-3xl font-black uppercase mb-4 bg-black text-white inline-block px-4 py-2 w-max transform rotate-2 tracking-tighter">Burocrazia Inutile</h3>
          <ul className="space-y-6 font-black text-3xl md:text-4xl uppercase tracking-tighter italic">
            <li><a href="#faq" onClick={(e) => handleLinkClick(e, '#faq')} className="hover:bg-yellow-400 hover:pl-6 transition-all inline-block">→ FAQ</a></li>
            <li><a href="#shipping" onClick={(e) => handleLinkClick(e, '#shipping')} className="hover:bg-cyan-400 hover:pl-6 transition-all inline-block">→ Spedizioni</a></li>
            <li><a href="#returns" onClick={(e) => handleLinkClick(e, '#returns')} className="hover:bg-pink-500 hover:text-white hover:pl-6 transition-all inline-block">→ Resi</a></li>
            <li>
              <button
                onClick={() => onOpenPrivacy?.()}
                className="hover:bg-black hover:text-white hover:pl-6 transition-all inline-block text-left"
              >
                → Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenTerms?.()}
                className="hover:bg-yellow-400 hover:pl-6 transition-all inline-block text-left"
              >
                → Termini di Servizio
              </button>
            </li>
          </ul>
        </div>

        {/* Colonna 3: Socials */}
        <div className="p-10 md:p-20 bg-white flex flex-col gap-10">
          <h3 className="text-3xl font-black uppercase mb-4 bg-yellow-400 border-4 border-black inline-block px-4 py-2 w-max transform -rotate-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)] tracking-tighter">Sorveglianza Digitale</h3>
          <div className="flex flex-col gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className={`flex items-center justify-between p-6 border-4 border-black ${social.color} font-black uppercase text-2xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all tracking-tighter italic`}
              >
                <span>{social.label}</span>
                <span className="text-4xl">{social.emoji}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-black text-white text-center py-6 font-mono text-xs uppercase tracking-[0.3em] border-t-8 border-black">
        Codificato con ☕, 😭 e una preoccupante quantità da Brainrot Labs.
      </div>

      {isChaosMode && (
        <>
          <style>{`
            body {
              animation: chaosBg 0.5s infinite alternate;
            }
            @keyframes chaosBg {
              0% { filter: hue-rotate(0deg) contrast(150%); }
              100% { filter: hue-rotate(360deg) contrast(200%); }
            }
            .floating-meme {
              position: fixed;
              pointer-events: none;
              z-index: 9999;
              animation: floatMeme 2s infinite ease-in-out alternate;
            }
            @keyframes floatMeme {
              0% { transform: translateY(0) scale(1) rotate(0deg); }
              100% { transform: translateY(-50vh) scale(1.5) rotate(360deg); }
            }
          `}</style>
          <div className="floating-meme" style={{top: '20%', left: '10%'}}><img src="https://i.imgur.com/7pQ8pQ8.png" className="w-32 h-32" alt="meme" /></div>
          <div className="floating-meme" style={{top: '60%', right: '15%'}}><img src="https://i.imgur.com/r6Sj9m1.png" className="w-32 h-32" alt="meme" /></div>
          <div className="floating-meme" style={{top: '80%', left: '40%'}}><img src="https://i.imgur.com/v8p0mXW.png" className="w-32 h-32" alt="meme" /></div>
          <div className="floating-meme" style={{top: '30%', right: '40%'}}><img src="https://i.imgur.com/6W6H20P.png" className="w-32 h-32" alt="meme" /></div>
          
          <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <h1 className="text-9xl font-black text-yellow-400 rotate-12 drop-shadow-2xl animate-ping border-black lowercase" style={{ WebkitTextStroke: '4px black' }}>
              CHAOS MODE
            </h1>
          </div>
        </>
      )}
    </footer>
  );
}
