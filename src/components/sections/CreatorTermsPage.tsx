import { motion } from 'motion/react';
import { ArrowLeft, FileCheck2 } from 'lucide-react';
import { CREATOR_TERMS_VERSION } from '../../services/legal/legalConfig';

interface CreatorTermsPageProps {
  onBack: () => void;
}

const sections = [
  {
    title: '1. Oggetto',
    content:
      'I Creator Terms regolano il rapporto tra Brainrot Labs e il creator che pubblica design, template o contenuti destinati alla vendita tramite la piattaforma.',
  },
  {
    title: '2. Ruoli delle Parti',
    content:
      "Brainrot Labs gestisce storefront, checkout, produzione, evasione ordini, assistenza cliente e payout. Il creator concede l'uso del design secondo questi termini e resta responsabile dei contenuti caricati.",
  },
  {
    title: '3. Licenza dei Contenuti',
    content:
      "Il creator dichiara di avere i diritti necessari sui contenuti caricati e concede a Brainrot Labs una licenza non esclusiva, mondiale, revocabile per la durata della pubblicazione, necessaria per mostrare, stampare, vendere, promuovere e distribuire il prodotto collegato al design.",
  },
  {
    title: '4. Contenuti Vietati',
    content:
      'Non sono ammessi contenuti che violano diritti di terzi, marchi, copyright, privacy, normative penali o amministrative, o che espongono la piattaforma a rischi reputazionali, legali o di chargeback.',
  },
  {
    title: '5. Pubblicazione e Moderazione',
    content:
      'Brainrot Labs puo rifiutare, sospendere, deindicizzare o rimuovere un design se il contenuto non e adatto al supporto, crea confusione commerciale, genera contestazioni oppure viola questi termini o policy collegate.',
  },
  {
    title: '6. Prezzi e Seller of Record',
    content:
      'Salvo diversa indicazione scritta, Brainrot Labs opera come seller of record verso il cliente finale. Il creator non vende direttamente al cliente, ma riceve royalty secondo la Royalty Policy pubblicata sul sito.',
  },
  {
    title: '7. Dati Fiscali e Identificazione',
    content:
      'Per attivare i payout il creator deve fornire dati identificativi, fiscali e di payout veritieri, aggiornati e coerenti con il provider selezionato. In assenza di verifica completata, i pagamenti possono essere sospesi.',
  },
  {
    title: '8. Chargeback, Resi e Contestazioni',
    content:
      'In caso di rimborso, chargeback, frode, errore materiale o violazione dei termini, Brainrot Labs puo trattenere o stornare royalty gia maturate nella misura necessaria a riequilibrare la posizione economica del design coinvolto.',
  },
  {
    title: '9. Recesso dal Programma Creator',
    content:
      'Il creator puo chiedere la rimozione di un design non ancora ordinato. Brainrot Labs puo mantenere i dati necessari per ordini gia evasi, contestazioni, obblighi fiscali, contabili e di reporting.',
  },
  {
    title: '10. Legge Applicabile',
    content:
      'I presenti termini sono regolati dalla legge italiana. Restano fermi i diritti inderogabili del consumatore e gli obblighi normativi applicabili a marketplace, privacy, fiscalita e reporting piattaforme.',
  },
];

export default function CreatorTermsPage({ onBack }: CreatorTermsPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 flex items-center gap-6 border-b-8 border-black bg-black px-6 py-6 text-white md:px-12">
        <button
          onClick={onBack}
          aria-label="Torna indietro"
          className="border-4 border-white p-3 shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-colors hover:bg-white hover:text-black hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-4">
          <FileCheck2 className="h-10 w-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Creator Terms</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/60">Versione {CREATOR_TERMS_VERSION} - aggiornati: 25 marzo 2026</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16 border-8 border-black bg-cyan-400 p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
        >
          <p className="text-xl font-black uppercase leading-relaxed tracking-tighter md:text-2xl">
            Documento dedicato ai creator: definisce licenza dei design, ruolo della piattaforma, moderazione,
            payout e responsabilita operative prima del collegamento finale ai pagamenti.
          </p>
        </motion.div>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
            >
              <h2 className="mb-5 inline-block bg-black px-4 py-2 text-2xl font-black uppercase tracking-tighter text-white">
                {section.title}
              </h2>
              <p className="whitespace-pre-line font-mono text-base leading-relaxed text-gray-900">{section.content}</p>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
