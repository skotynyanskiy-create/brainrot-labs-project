
export default function Marquee() {
  const row1Phrases = [
    "IL TUO OUTFIT HA BISOGNO DI AIUTO 🚑",
    "+1000 AURA POINTS ALL'ACQUISTO ✨",
    "SPEDIZIONE GRATIS (FORSE) 📦",
    "DROPPING HEAT OGNI VENERDÌ 🔥",
    "LA TUA BANCA NON APPROVA 💳",
    "VESTITI CHE FANNO PIANGERE I BOOMER 👴",
    "DESIGN RUBATI A CASO 🥷",
    "COMPRA ORA, PENTITI DOMANI 🛒",
    "PROBABILMENTE ANDRÀ SOLD OUT SUBITO ⏳",
    "NON FARLO VEDERE AI TUOI GENITORI 🫣",
    "IL TUO CARRELLO TI STA GIUDICANDO 🤨",
    "SEGUI L'HYPE, PERDI I SOLDI 💰",
    "METTI NEL CARRELLO, NON FARE IL POVERO 💳",
    "OTTIMO PER DELUDERE LA TUA FAMIGLIA 🏆",
    "NESSUN SUPPORTO CLIENTI, ARRANGIATI 📞",
    "LA SPEDIZIONE È LENTA, ABITUATICI 🐢"
  ];
  
  const row2Phrases = [
    "LIVELLO DI RIZZ INACCETTABILE 📈",
    "100% REAL NO CAP 🧢",
    "MEWING DAL 2004 🗿",
    "NON SEI PRONTO PER QUESTO DRIP 💧",
    "HAUTE COUTURE PER DISADATTATI 👽",
    "QUESTA È LETTERALMENTE ARTE 🖼️",
    "TROPPO COSTOSO PER TE 💸",
    "NON CHIEDERE PERCHÉ 🤫",
    "SKIBIDI TOILET APPROVED 🚽",
    "TOCCARE L'ERBA È SOPRAVVALUTATO 🌿",
    "SIAMO TUTTI NPC IN REALTÀ 🤖",
    "ONLY W, MAI L 👑",
    "IL TUO FIT È UN CRIMINE DI GUERRA 🚨",
    "IL BRO CUCINA MA NESSUNO HA FAME 🍳",
    "BASEATO E ROSSOPILOLATO 💊",
    "HO CREATO QUESTO BRAND SU DISCORD 🎧"
  ];

  // Triplichiamo gli array per supportare schermi Ultra-Wide >4K
  const repeatedRow1 = [...row1Phrases, ...row1Phrases, ...row1Phrases];
  const repeatedRow2 = [...row2Phrases, ...row2Phrases, ...row2Phrases];

  return (
    <div className="w-full overflow-hidden flex flex-col pointer-events-auto select-none border-b-4 border-black group" aria-label="Notifiche e Slogan del Brand">
      {/* Row 1 - Left to Right */}
      <div className="flex overflow-hidden bg-black text-[#a3e635] hover:bg-[#a3e635] hover:text-black transition-colors duration-500 border-b-4 border-black">
        <div className="flex w-full py-3 mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
          <div className="w-max animate-marquee flex items-center font-display uppercase font-black text-sm md:text-lg tracking-[0.2em] group-hover:[animation-play-state:paused]">
            {repeatedRow1.map((phrase, i) => (
              <span 
                key={i} 
                className="mx-8 flex items-center gap-4 whitespace-nowrap"
                aria-hidden={i >= row1Phrases.length ? "true" : undefined}
              >
                {phrase} <span className="opacity-30 ml-2">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Row 2 - Right to Left */}
      <div className="flex overflow-hidden bg-[#a3e635] text-black hover:bg-black hover:text-white transition-colors duration-500 shadow-inner shadow-black/20">
        <div className="flex w-full py-2.5 mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]">
          <div className="w-max animate-marquee-reverse flex items-center font-sans font-extrabold uppercase text-xs md:text-sm tracking-[0.3em] group-hover:[animation-play-state:paused]">
            {repeatedRow2.map((phrase, i) => (
              <span 
                key={i} 
                className="mx-10 flex items-center gap-3 whitespace-nowrap"
                aria-hidden={i >= row2Phrases.length ? "true" : undefined}
              >
                <span className="opacity-30 mr-2">✦</span> {phrase}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
