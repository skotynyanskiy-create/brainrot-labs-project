import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

import { SOCIAL_LINKS } from '../../constants';

interface FooterProps {
  onNavigateHome?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenCreatorTerms?: () => void;
  onOpenRoyaltyPolicy?: () => void;
  onOpenCustomizer?: () => void;
  onOpenCommunity?: () => void;
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
  const handleSectionJump = (targetId: string) => {
    onNavigateHome?.();

    setTimeout(() => {
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const supportLinks = [
    { label: 'FAQ', onClick: () => handleSectionJump('#faq'), icon: ArrowRight },
    { label: 'Spedizioni', onClick: () => handleSectionJump('#shipping-policy'), icon: ArrowRight },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', onClick: () => onOpenPrivacy?.(), icon: ShieldCheck },
    { label: 'Termini di servizio', onClick: () => onOpenTerms?.(), icon: ArrowRight },
    { label: 'Creator Terms', onClick: () => onOpenCreatorTerms?.(), icon: ArrowRight },
    { label: 'Royalty Policy', onClick: () => onOpenRoyaltyPolicy?.(), icon: ArrowRight },
  ];

  return (
    <footer className="border-t-8 border-black bg-[#f3f0ea] text-black">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14">
        <div className="border-4 border-black bg-white shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="border-b-4 border-black p-6 md:p-8 lg:border-b-0 lg:border-r-4">
              <button
                type="button"
                onClick={() => onNavigateHome?.()}
                aria-label="Torna alla home di Brainrot Labs"
                className="group flex items-center gap-3 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-yellow-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none">
                  <Zap className="h-6 w-6 fill-black text-black" />
                </div>
                <h2 className="font-display text-[2.1rem] font-black uppercase leading-none tracking-[-0.045em] md:text-[3rem]">
                  Brainrot Labs
                </h2>
              </button>

              <div className="mt-8 max-w-xl">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">
                  Chiusura di sistema
                </p>
                <p className="mt-4 text-lg font-medium leading-relaxed text-gray-800 md:text-xl">
                  Brainrot Labs unisce archivio digitale, customizer e catalogo fisico in un flusso unico.
                  Qui trovi solo i passaggi utili per chiudere bene il giro.
                </p>
              </div>
            </section>

            <section className="grid gap-0 md:grid-cols-2">
              <div className="border-b-4 border-black p-6 md:border-b-0 md:border-r-4 md:p-8">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">Supporto</p>
                <div className="mt-5 grid gap-3">
                  {supportLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={link.onClick}
                      className="flex items-center justify-between border-4 border-black bg-white px-4 py-4 text-left font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white"
                    >
                      <span>{link.label}</span>
                      <link.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-gray-500">Policy e Social</p>
                <div className="mt-5 grid gap-3">
                  {legalLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={link.onClick}
                      className="flex items-center justify-between border-4 border-black bg-white px-4 py-4 text-left font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white"
                    >
                      <span>{link.label}</span>
                      <link.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className={`inline-flex items-center gap-2 border-4 border-black px-3 py-2 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${social.color}`}
                    >
                      <SocialIcon icon={social.icon} className="h-4 w-4 shrink-0" />
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="border-t-4 border-black bg-black px-6 py-4 text-center font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white md:px-10">
        (C) {new Date().getFullYear()} Brainrot Labs
      </div>
    </footer>
  );
}
