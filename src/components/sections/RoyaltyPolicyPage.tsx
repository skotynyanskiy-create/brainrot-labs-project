import { motion } from 'motion/react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { CREATOR_ROYALTY_RATE } from '../../constants';
import { ROYALTY_POLICY_VERSION } from '../../services/legal/legalConfig';

interface RoyaltyPolicyPageProps {
  onBack: () => void;
}

const sections = [
  {
    title: '1. Ambito',
    content:
      'Questa policy spiega come vengono calcolate, maturate, trattenute e pagate le royalty dei design pubblicati nella community di Brainrot Labs.',
  },
  {
    title: '2. Aliquota Royalty',
    content: `Per ogni vendita valida di un design pubblicato, il creator matura una royalty pari al ${CREATOR_ROYALTY_RATE}% della base di calcolo definita in questa policy.`,
  },
  {
    title: '3. Base di Calcolo',
    content:
      'Salvo diversa comunicazione scritta, la royalty e calcolata sul prezzo netto effettivamente incassato da Brainrot Labs per il prodotto venduto, esclusi IVA, spedizione, sconti commerciali, rimborsi, chargeback, commissioni di pagamento, costi di fulfillment e importi non riscossi.',
  },
  {
    title: '4. Vendita Valida',
    content:
      'Una vendita e considerata valida quando il pagamento e stato acquisito, non risultano frodi o chargeback aperti e il relativo ordine non e stato annullato o rimborsato integralmente.',
  },
  {
    title: '5. Maturazione e Wallet',
    content:
      "Le royalty possono transitare in stato 'in attesa' fino alla scadenza del periodo di controllo operativo. Solo dopo tale fase l'importo passa a saldo disponibile nel wallet creator.",
  },
  {
    title: '6. Payout',
    content:
      'Il payout viene eseguito solo se il creator ha completato onboarding, verifica account, dati fiscali, metodo di accredito e accettazione dei documenti richiesti. Brainrot Labs puo applicare una soglia minima di payout configurata nel profilo.',
  },
  {
    title: '7. Sospensioni e Rettifiche',
    content:
      'Brainrot Labs puo sospendere o rettificare royalty in caso di chargeback, contestazioni cliente, uso illecito del contenuto, errore di catalogo, frode, violazione IP, errore fiscale o richiesta del provider di pagamento.',
  },
  {
    title: '8. Resi e Chargeback',
    content:
      "Se un ordine viene rimborsato o subisce un chargeback, la royalty associata puo essere annullata o compensata con importi futuri. Se l'importo e gia stato pagato, la piattaforma puo recuperarlo tramite compensazione.",
  },
  {
    title: '9. Fiscalita e Reporting',
    content:
      'Il creator e responsabile della correttezza dei dati fiscali inseriti. Brainrot Labs puo raccogliere, verificare e comunicare dati richiesti da normative applicabili, inclusi obblighi di reporting piattaforme e adempimenti fiscali.',
  },
  {
    title: '10. Modifiche',
    content:
      'La policy puo essere aggiornata per motivi normativi, fiscali, operativi o di provider. La nuova versione si applica alle vendite successive alla pubblicazione, salvo ove la legge richieda un diverso trattamento.',
  },
];

export default function RoyaltyPolicyPage({ onBack }: RoyaltyPolicyPageProps) {
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
          <DollarSign className="h-10 w-10 text-green-400" />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Royalty Policy</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/60">Versione {ROYALTY_POLICY_VERSION} - aggiornata: 25 marzo 2026</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16 border-8 border-black bg-green-400 p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
        >
          <p className="text-xl font-black uppercase leading-relaxed tracking-tighter md:text-2xl">
            Il {CREATOR_ROYALTY_RATE}% va dichiarato bene: questa policy definisce base di calcolo, stato del wallet,
            payout, storni, resi e casi in cui le royalty possono essere sospese o rettificate.
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
