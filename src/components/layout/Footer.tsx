import React, { useRef, useState } from 'react';
import { CREATOR_ROYALTY_RATE, MEME_BASES, SOCIAL_LINKS } from '../../constants';

const footerPhrases = [
  'IL TUO FEED E DIVENTATO UN WORKFLOW DI PRODOTTO',
  'BASI CURATE, NON IMMAGINI RANDOM',
  'CUSTOMIZER, PREVIEW E COMMUNITY PARLANO LA STESSA LINGUA',
  `ROYALTY DEL ${CREATOR_ROYALTY_RATE}% SUI DESIGN PUBBLICATI`,
  'OGNI DROP DEVE AVERE SENSO SU SEZIONE E SUPPORTO',
  'DAL MEME AL MERCH SENZA PASSAGGI FUORI CONTESTO',
  'LE SCHEDE PRODOTTO NON VIVONO DI PLACEHOLDER',
  'QUI IL BRAINROT HA UNA LOGICA OPERATIVA',
];

const repeatedFooterPhrases = [...footerPhrases, ...footerPhrases, ...footerPhrases];

interface FooterProps {
  onNavigateHome?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenCreatorTerms?: () => void;
  onOpenRoyaltyPolicy?: () => void;
}

function SocialIcon({ icon, className }: { icon: 'instagram' | 'tiktok' | 'x'; className?: string }) {
  if (icon === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (icon === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M14.4 3c.3 2 1.6 3.7 3.6 4.5.9.4 1.8.6 2.7.6v3.3c-1.6 0-3.2-.4-4.6-1.2v5.5a6.2 6.2 0 1 1-6.2-6.2c.3 0 .7 0 1 .1v3.4a3 3 0 1 0 2 2.8V3h1.5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.3-8.4L3 3h6.2l4.3 5.8L18.9 3Zm-1.1 16h1.7L8.3 4.9H6.4L17.8 19Z" />
    </svg>
  );
}

export default function Footer({
  onNavigateHome,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCreatorTerms,
  onOpenRoyaltyPolicy,
}: FooterProps) {
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
      <div className="flex overflow-hidden bg-black text-white transition-colors duration-300 border-y-4 md:border-y-8 border-black group" aria-label="Disclaimer e Slogan">
        <div className="flex w-full py-4 md:py-6 mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
          <div className="w-max flex items-center font-black uppercase text-2xl md:text-4xl tracking-tighter italic animate-marquee group-hover:[animation-play-state:paused] [animation-duration:40s] md:[animation-duration:60s]">
            {repeatedFooterPhrases.map((phrase, i) => (
              <span
                key={i}
                className="mx-6 md:mx-10 whitespace-nowrap flex items-center gap-6 md:gap-10"
                aria-hidden={i >= footerPhrases.length ? 'true' : undefined}
              >
                <span className="text-white transition-colors duration-300 text-3xl md:text-5xl">!</span>
                <span>{phrase}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
        <div className="p-8 md:p-20 bg-white flex flex-col justify-between">
          <div>
            <div className="cursor-pointer select-none" onClick={handleLogoClick}>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 leading-none transform -skew-x-6 hover:scale-105 transition-transform">
                Brainrot
                <br />
                <span className="inline-block bg-pink-500 text-white px-4 md:px-6 py-2 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] md:shadow-[8px_8px_0_0_rgba(0,0,0,1)] rotate-2 italic">Labs</span>
              </h2>
            </div>
            <p className="font-sans text-xl md:text-2xl font-medium text-black leading-relaxed border-l-8 border-black pl-6 italic">
              "Trasformiamo meme, visual e idee della community in prodotti coerenti, con un workflow chiaro dal customizer alla pubblicazione."
            </p>
          </div>
          <div className="mt-16 font-mono text-sm font-bold uppercase tracking-widest text-black/40">
            <p>© {new Date().getFullYear()} Brainrot Labs.</p>
            <p>Design system brutalist, catalogo curato, creator economy al {CREATOR_ROYALTY_RATE}%.</p>
          </div>
        </div>

        <div className="p-8 md:p-20 bg-[#f0f0f0] flex flex-col gap-8 md:gap-10">
          <h3 className="text-2xl md:text-3xl font-black uppercase mb-4 bg-black text-white inline-block px-4 py-2 w-max transform rotate-2 tracking-tighter">Documenti Chiave</h3>
          <ul className="space-y-6 font-black text-2xl md:text-4xl uppercase tracking-tighter italic">
            <li><a href="#faq" onClick={(e) => handleLinkClick(e, '#faq')} className="hover:bg-yellow-400 hover:pl-6 transition-all inline-block">-&gt; FAQ</a></li>
            <li><a href="#shipping" onClick={(e) => handleLinkClick(e, '#shipping')} className="hover:bg-cyan-400 hover:pl-6 transition-all inline-block">-&gt; Spedizioni</a></li>
            <li><a href="#returns" onClick={(e) => handleLinkClick(e, '#returns')} className="hover:bg-pink-500 hover:text-white hover:pl-6 transition-all inline-block">-&gt; Resi</a></li>
            <li>
              <button
                onClick={() => onOpenPrivacy?.()}
                className="hover:bg-black hover:text-white hover:pl-6 transition-all inline-block text-left"
              >
                -&gt; Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenTerms?.()}
                className="hover:bg-yellow-400 hover:pl-6 transition-all inline-block text-left"
              >
                -&gt; Termini di Servizio
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenCreatorTerms?.()}
                className="hover:bg-cyan-400 hover:pl-6 transition-all inline-block text-left"
              >
                -&gt; Creator Terms
              </button>
            </li>
            <li>
              <button
                onClick={() => onOpenRoyaltyPolicy?.()}
                className="hover:bg-green-400 hover:pl-6 transition-all inline-block text-left"
              >
                -&gt; Royalty Policy
              </button>
            </li>
          </ul>
        </div>

        <div className="p-8 md:p-20 bg-white flex flex-col gap-8 md:gap-10">
          <h3 className="text-2xl md:text-3xl font-black uppercase mb-4 bg-yellow-400 border-4 border-black inline-block px-4 py-2 w-max transform -rotate-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)] tracking-tighter">Sorveglianza Digitale</h3>
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
                <SocialIcon icon={social.icon} className="h-9 w-9 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black text-white text-center py-6 font-mono text-xs uppercase tracking-[0.3em] border-t-8 border-black">
        Costruito per far combaciare contenuto, sezione, preview e community.
      </div>

      {isChaosMode && (
        <>
          <style>{`
            .footer-chaos-backdrop {
              background:
                radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.24), transparent 35%),
                radial-gradient(circle at 80% 30%, rgba(236, 72, 153, 0.24), transparent 38%),
                rgba(255, 255, 255, 0.06);
            }
            @media (prefers-reduced-motion: no-preference) {
              .footer-chaos-backdrop {
                animation: footerChaosBg 0.5s infinite alternate;
                backdrop-filter: hue-rotate(0deg) contrast(150%);
                -webkit-backdrop-filter: hue-rotate(0deg) contrast(150%);
              }
              .footer-chaos-meme {
                animation: footerFloatMeme 2s infinite ease-in-out alternate;
              }
              .footer-chaos-title {
                animation: footerChaosPing 1s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
            }
            @keyframes footerChaosBg {
              0% { backdrop-filter: hue-rotate(0deg) contrast(150%); -webkit-backdrop-filter: hue-rotate(0deg) contrast(150%); }
              100% { backdrop-filter: hue-rotate(360deg) contrast(200%); -webkit-backdrop-filter: hue-rotate(360deg) contrast(200%); }
            }
            @keyframes footerFloatMeme {
              0% { transform: translateY(0) scale(1) rotate(0deg); }
              100% { transform: translateY(-50vh) scale(1.5) rotate(360deg); }
            }
            @keyframes footerChaosPing {
              0% { transform: scale(1) rotate(12deg); opacity: 1; }
              75%, 100% { transform: scale(1.08) rotate(12deg); opacity: 0.3; }
            }
          `}</style>
          <div className="footer-chaos-backdrop fixed inset-0 pointer-events-none z-[9998]" />
          {MEME_BASES.slice(0, 4).map((meme, index) => {
            const positions = [
              { top: '20%', left: '10%' },
              { top: '60%', right: '15%' },
              { top: '80%', left: '40%' },
              { top: '30%', right: '40%' },
            ] as const;

            return (
              <div key={meme.id} className="footer-chaos-meme fixed pointer-events-none z-[9999]" style={positions[index]}>
                <img src={meme.url} className="w-32 h-32 object-cover border-4 border-black bg-white" alt={meme.name} />
              </div>
            );
          })}

          <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <h1 className="footer-chaos-title text-9xl font-black text-yellow-400 rotate-12 drop-shadow-2xl border-black lowercase" style={{ WebkitTextStroke: '4px black' }}>
              CHAOS MODE
            </h1>
          </div>
        </>
      )}
    </footer>
  );
}
