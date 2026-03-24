import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const sections = [
    {
      title: '1. Titolare del Trattamento',
      content: `Brainrot Labs (di seguito "il Titolare") è responsabile del trattamento dei dati personali raccolti tramite il presente sito web. Per qualsiasi richiesta relativa alla privacy scrivere a: privacy@brainrotlabs.com`,
    },
    {
      title: '2. Dati Raccolti',
      content: `Raccogliamo esclusivamente i dati necessari per l'erogazione del servizio:

• Dati di autenticazione: nome, cognome, indirizzo email e foto profilo forniti da Google OAuth al momento del login.
• Dati di ordine: indirizzo di spedizione, numero di telefono (opzionale), contenuto del carrello.
• Dati tecnici: indirizzo IP, tipo di browser e sistema operativo, esclusivamente per scopi di sicurezza e diagnostica.
• Contenuti generati: design personalizzati caricati su Firebase Storage.`,
    },
    {
      title: '3. Finalità del Trattamento',
      content: `I dati sono trattati per le seguenti finalità:

• Esecuzione del contratto di vendita e gestione degli ordini (art. 6 par. 1 lett. b GDPR).
• Autenticazione e sicurezza dell'account (interesse legittimo, art. 6 par. 1 lett. f GDPR).
• Adempimento di obblighi di legge (fatturazione, contabilità) ai sensi dell'art. 6 par. 1 lett. c GDPR.
• Miglioramento del servizio tramite dati aggregati e anonimi (interesse legittimo).`,
    },
    {
      title: '4. Base Giuridica',
      content: `Il trattamento è basato su:
• Esecuzione di un contratto o misure precontrattuali (art. 6 par. 1 lett. b GDPR).
• Adempimento di obblighi legali (art. 6 par. 1 lett. c GDPR).
• Interesse legittimo del Titolare (art. 6 par. 1 lett. f GDPR) per la sicurezza e la prevenzione delle frodi.`,
    },
    {
      title: '5. Conservazione dei Dati',
      content: `I dati personali sono conservati per il tempo strettamente necessario:
• Dati di ordine e fatturazione: 10 anni (obblighi fiscali e contabili).
• Dati di autenticazione: fino alla cancellazione dell'account.
• Log tecnici: 90 giorni.`,
    },
    {
      title: '6. Condivisione con Terzi',
      content: `I dati possono essere comunicati a:
• Printful Inc. (fornitore di servizi di stampa e spedizione) — limitatamente ai dati di spedizione necessari all'evasione dell'ordine.
• Google LLC (Firebase / Cloud Functions) — per l'infrastruttura tecnica del servizio, in qualità di responsabile del trattamento ai sensi del Data Processing Agreement.
• Corrieri espressi — per la consegna degli ordini.

I dati NON vengono venduti, ceduti o affittati a terzi per finalità di marketing.`,
    },
    {
      title: '7. Diritti dell\'Interessato',
      content: `Ai sensi degli articoli 15-22 del GDPR hai il diritto di:
• Accedere ai tuoi dati personali (art. 15).
• Rettificarli se inesatti (art. 16).
• Ottenerne la cancellazione ("diritto all'oblio", art. 17).
• Limitare il trattamento (art. 18).
• Ricevere i dati in formato portabile (art. 20).
• Opporti al trattamento (art. 21).

Per esercitare questi diritti: privacy@brainrotlabs.com. Risponderemo entro 30 giorni.`,
    },
    {
      title: '8. Cookie',
      content: `Utilizziamo esclusivamente cookie tecnici strettamente necessari al funzionamento del servizio (sessione di autenticazione Firebase). Non utilizziamo cookie di profilazione o tracciamento di terze parti.`,
    },
    {
      title: '9. Sicurezza',
      content: `Adottiamo misure tecniche e organizzative adeguate per proteggere i dati da accessi non autorizzati, perdita o distruzione, tra cui crittografia TLS in transito, regole di accesso Firestore basate su ruoli e autenticazione a due fattori per gli account amministrativi.`,
    },
    {
      title: '10. Autorità di Controllo',
      content: `Hai il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it) qualora ritieni che il trattamento dei tuoi dati violi il GDPR.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black text-white border-b-8 border-black px-6 md:px-12 py-6 flex items-center gap-6">
        <button
          onClick={onBack}
          aria-label="Torna alla homepage"
          className="p-3 border-4 border-white hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Privacy Policy</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mt-1">Informativa ai sensi del GDPR (Reg. UE 2016/679) — Aggiornata: gennaio 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">
        {/* Intro banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-cyan-400 border-8 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] mb-16"
        >
          <p className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-relaxed">
            Raccogliamo solo ciò che serve. Non vendiamo i tuoi dati. Mai. A nessuno. <span className="italic">(Sì, davvero.)</span>
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-4 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 bg-black text-white inline-block px-4 py-2">{section.title}</h2>
              <p className="font-mono text-base leading-relaxed whitespace-pre-line text-gray-900">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center font-mono text-sm text-gray-500 border-t-4 border-black pt-8">
          © 2026 Brainrot Labs — privacy@brainrotlabs.com
        </div>
      </div>
    </div>
  );
}
