import { motion } from 'motion/react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  const sections = [
    {
      title: '1. Definizioni e Parti Contrattuali',
      content: `"Brainrot Labs" (di seguito "il Venditore") gestisce il sito brainrotlabs.com e vende prodotti di merchandise personalizzato.
"Cliente" è chiunque utilizzi il sito e/o effettui un acquisto.
"Prodotti Standard" sono i prodotti del catalogo preesistente.
"Prodotti Personalizzati" sono i prodotti realizzati tramite il customizer AI.`,
    },
    {
      title: '2. Accettazione dei Termini',
      content: `L'utilizzo del sito e/o l'effettuazione di un ordine implica l'accettazione integrale dei presenti Termini di Servizio. Se non sei d'accordo con uno qualsiasi dei termini, ti invitiamo a non utilizzare il servizio.`,
    },
    {
      title: '3. Processo d\'Ordine',
      content: `3.1 — Gli ordini si perfezionano con la conferma via email da parte del Venditore successiva al pagamento.
3.2 — I prezzi indicati sono in Euro (€) e includono l'IVA applicabile.
3.3 — Il Venditore si riserva il diritto di annullare un ordine in caso di errori di prezzo manifesti, indisponibilità del prodotto o sospetto di frode, con rimborso integrale al Cliente.`,
    },
    {
      title: '4. Pagamenti',
      content: `I pagamenti sono gestiti tramite fornitori certificati PCI-DSS. Il Venditore non memorizza dati di carta di credito. In caso di mancata autorizzazione del pagamento l'ordine non verrà processato.`,
    },
    {
      title: '5. Spedizioni',
      content: `5.1 — Le spedizioni avvengono tramite corriere tracciato entro 3-5 giorni lavorativi dalla conferma dell'ordine.
5.2 — La spedizione è gratuita per ordini superiori a €49. Per ordini inferiori verrà applicato un contributo spese di spedizione indicato al checkout.
5.3 — Il Venditore non è responsabile per ritardi causati da fattori esterni (forza maggiore, scioperi, condizioni meteo eccezionali).`,
    },
    {
      title: '6. Diritto di Recesso (Prodotti Standard)',
      content: `Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), il Cliente consumatore ha diritto di recedere dal contratto entro 14 giorni dalla ricezione del prodotto senza necessità di fornire motivazioni.

Per esercitare il diritto di recesso inviare comunicazione scritta a: resi@brainrotlabs.com

Il reso è gratuito per difetti di produzione accertati. Per recesso senza causa di difetto le spese di restituzione sono a carico del Cliente.`,
    },
    {
      title: '7. Esclusione del Diritto di Recesso (Prodotti Personalizzati)',
      content: `Ai sensi dell'art. 59, comma 1, lett. c) del D.Lgs. 206/2005, il diritto di recesso è escluso per i prodotti confezionati su misura o chiaramente personalizzati in base alle specifiche del consumatore.

I Prodotti Personalizzati realizzati tramite il customizer AI rientrano in questa categoria e non sono soggetti al diritto di recesso, salvo vizi di conformità o difetti di produzione.`,
    },
    {
      title: '8. Garanzia Legale di Conformità',
      content: `Tutti i prodotti beneficiano della garanzia legale di conformità di 24 mesi prevista dal D.Lgs. 206/2005. In caso di difetto di conformità il Cliente ha diritto alla riparazione, sostituzione, riduzione del prezzo o risoluzione del contratto.`,
    },
    {
      title: '9. Proprietà Intellettuale',
      content: `9.1 — I contenuti del sito (marchio, grafica, testi) sono di proprietà di Brainrot Labs e protetti dalle leggi sul diritto d'autore.
9.2 — I meme utilizzati nei prodotti standard sono di dominio pubblico o utilizzati in regime di fair use/parodia.
9.3 — Il Cliente è responsabile di possedere i diritti necessari per i contenuti caricati tramite il customizer AI. Il Venditore non assume responsabilità per violazioni di diritti di terzi da parte del Cliente.`,
    },
    {
      title: '10. Contenuti Vietati',
      content: `È vietato caricare o ordinare prodotti con contenuti che:
• Violino diritti di proprietà intellettuale di terzi.
• Siano diffamatori, osceni, violenti o incitino all'odio.
• Contengano dati personali di terze persone senza consenso.
• Violino norme di legge applicabili.

Il Venditore si riserva il diritto di rifiutare o annullare ordini con tali contenuti.`,
    },
    {
      title: '11. Limitazione di Responsabilità',
      content: `Nei limiti consentiti dalla legge, il Venditore non è responsabile per danni indiretti, consequenziali o perdita di profitto derivanti dall'utilizzo del servizio. La responsabilità massima del Venditore è limitata al valore dell'ordine specifico che ha dato origine al danno.`,
    },
    {
      title: '12. Legge Applicabile e Foro Competente',
      content: `I presenti Termini sono regolati dalla legge italiana. Per le controversie con consumatori è competente il foro del luogo di residenza o domicilio del consumatore in Italia. Per le controversie con professionisti è competente il Foro di Milano.

Per la risoluzione alternativa delle controversie (ODR) è possibile utilizzare la piattaforma europea: https://ec.europa.eu/odr`,
    },
    {
      title: '13. Modifiche ai Termini',
      content: `Il Venditore si riserva il diritto di modificare i presenti Termini con pubblicazione sul sito. Le modifiche si applicano agli ordini effettuati successivamente alla data di pubblicazione. L'utilizzo continuato del servizio dopo la pubblicazione costituisce accettazione delle modifiche.`,
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
          <FileText className="w-10 h-10 text-yellow-400" />
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Termini di Servizio</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mt-1">Condizioni generali di vendita — Aggiornate: gennaio 2026</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">
        {/* Intro banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-yellow-400 border-8 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] mb-16"
        >
          <p className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-relaxed">
            Documento legale. Noioso per definizione. <span className="italic">Ma importante.</span> Ti consigliamo di leggerlo almeno una volta nella vita.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="border-4 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 bg-black text-white inline-block px-4 py-2">{section.title}</h2>
              <p className="font-mono text-base leading-relaxed whitespace-pre-line text-gray-900">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center font-mono text-sm text-gray-500 border-t-4 border-black pt-8">
          © 2026 Brainrot Labs — legal@brainrotlabs.com
        </div>
      </div>
    </div>
  );
}
