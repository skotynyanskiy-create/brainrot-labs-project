import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CreditCard, FileText, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import type { AccountPayoutSetup, AccountShippingAddress, AccountTaxProfile, RoyaltyWallet, UserLegalAcceptances, UserProfile } from '../../types';
import {
  DEFAULT_PAYOUT_SETUP,
  DEFAULT_ROYALTY_WALLET,
  DEFAULT_TAX_PROFILE,
  PAYOUT_PROVIDER_OPTIONS,
  PAYOUT_STATUS_LABELS,
  canStartPayoutOnboarding,
  getPayoutReadinessIssues,
  getPayoutProviderMeta,
} from '../../services/payouts/payoutConfig';
import { CREATOR_TERMS_VERSION, DEFAULT_LEGAL_ACCEPTANCES, ROYALTY_POLICY_VERSION } from '../../services/legal/legalConfig';

interface AccountSettingsPanelProps {
  userProfile: UserProfile | null;
  onSave: (updates: Partial<UserProfile>) => Promise<boolean>;
  onOpenCreatorTerms: () => void;
  onOpenRoyaltyPolicy: () => void;
}

const EMPTY_SHIPPING: AccountShippingAddress = {
  fullName: '',
  address1: '',
  city: '',
  province: '',
  zip: '',
  country: 'Italia',
  phone: '',
};

export default function AccountSettingsPanel({
  userProfile,
  onSave,
  onOpenCreatorTerms,
  onOpenRoyaltyPolicy,
}: AccountSettingsPanelProps) {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [username, setUsername] = useState('');
  const [creatorTagline, setCreatorTagline] = useState('');
  const [creatorCategory, setCreatorCategory] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [legalName, setLegalName] = useState('');
  const [payoutEmail, setPayoutEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<AccountShippingAddress>(EMPTY_SHIPPING);
  const [payoutSetup, setPayoutSetup] = useState<AccountPayoutSetup>({ ...DEFAULT_PAYOUT_SETUP });
  const [taxProfile, setTaxProfile] = useState<AccountTaxProfile>({ ...DEFAULT_TAX_PROFILE });
  const [royaltyWallet, setRoyaltyWallet] = useState<RoyaltyWallet>({ ...DEFAULT_ROYALTY_WALLET });
  const [legalAcceptances, setLegalAcceptances] = useState<UserLegalAcceptances>({ ...DEFAULT_LEGAL_ACCEPTANCES });
  const [showCreatorUpgrade, setShowCreatorUpgrade] = useState(false);
  const [acceptCreatorUpgrade, setAcceptCreatorUpgrade] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
    setPhotoURL(userProfile?.photoURL || '');
    setUsername(userProfile?.username || '');
    setCreatorTagline(userProfile?.creatorTagline || '');
    setCreatorCategory(userProfile?.creatorCategory || '');
    setBio(userProfile?.bio || '');
    setLocation(userProfile?.location || '');
    setPortfolioUrl(userProfile?.portfolioUrl || '');
    setSocialHandle(userProfile?.socialHandle || '');
    setLegalName(userProfile?.legalName || userProfile?.taxProfile?.legalName || '');
    setPayoutEmail(userProfile?.payoutEmail || userProfile?.email || '');
    setPhone(userProfile?.phone || '');
    setNewsletterOptIn(Boolean(userProfile?.newsletterOptIn));
    setShippingAddress(userProfile?.shippingAddress || EMPTY_SHIPPING);
    setPayoutSetup({ ...DEFAULT_PAYOUT_SETUP, ...(userProfile?.payoutSetup || {}) });
    setTaxProfile({ ...DEFAULT_TAX_PROFILE, ...(userProfile?.taxProfile || {}) });
    setRoyaltyWallet({ ...DEFAULT_ROYALTY_WALLET, ...(userProfile?.royaltyWallet || {}) });
    setLegalAcceptances({
      ...DEFAULT_LEGAL_ACCEPTANCES,
      ...(userProfile?.legalAcceptances || {}),
    });
  }, [userProfile]);

  const payoutReadinessIssues = useMemo(() => getPayoutReadinessIssues({
    ...(userProfile || {}),
    displayName,
    username,
    creatorTagline,
    creatorCategory,
    bio,
    location,
    portfolioUrl,
    socialHandle,
    legalName,
    payoutEmail,
    phone,
    shippingAddress,
    payoutSetup,
    taxProfile: { ...taxProfile, legalName: taxProfile.legalName || legalName },
    legalAcceptances,
  } as UserProfile), [
    userProfile,
    displayName,
    username,
    creatorTagline,
    creatorCategory,
    bio,
    location,
    portfolioUrl,
    socialHandle,
    legalName,
    payoutEmail,
    phone,
    shippingAddress,
    payoutSetup,
    taxProfile,
    legalAcceptances,
  ]);

  const providerMeta = getPayoutProviderMeta(payoutSetup.provider);
  const isCreator = userProfile?.role === 'creator';
  const onboardingReady = canStartPayoutOnboarding({
    ...(userProfile || {}),
    displayName,
    username,
    creatorTagline,
    creatorCategory,
    bio,
    location,
    portfolioUrl,
    socialHandle,
    legalName,
    payoutEmail,
    phone,
    shippingAddress,
    payoutSetup,
    taxProfile: { ...taxProfile, legalName: taxProfile.legalName || legalName },
    legalAcceptances,
  } as UserProfile);

  const buildAcceptance = (
    key: keyof UserLegalAcceptances,
    accepted: boolean,
    version: string
  ) => {
    const existing = legalAcceptances[key];

    if (!accepted) {
      return { accepted: false, version };
    }

    return {
      accepted: true,
      version,
      acceptedAt: existing?.acceptedAt || new Date().toISOString(),
    };
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
        username: username.trim(),
        creatorTagline: creatorTagline.trim(),
        creatorCategory: creatorCategory.trim(),
        bio: bio.trim(),
        location: location.trim(),
        portfolioUrl: portfolioUrl.trim(),
        socialHandle: socialHandle.trim(),
        legalName: legalName.trim(),
        payoutEmail: payoutEmail.trim(),
        phone: phone.trim(),
        newsletterOptIn,
        shippingAddress,
        payoutSetup: {
          ...payoutSetup,
          onboardingReady,
        },
        taxProfile: {
          ...taxProfile,
          legalName: taxProfile.legalName.trim() || legalName.trim(),
        },
        royaltyWallet,
        legalAcceptances: {
          creatorTerms: buildAcceptance('creatorTerms', Boolean(legalAcceptances.creatorTerms?.accepted), CREATOR_TERMS_VERSION),
          royaltyPolicy: buildAcceptance('royaltyPolicy', Boolean(legalAcceptances.royaltyPolicy?.accepted), ROYALTY_POLICY_VERSION),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeCreator = async () => {
    if (!acceptCreatorUpgrade) return;

    setSaving(true);
    try {
      const success = await onSave({
        role: 'creator',
        legalAcceptances: {
          creatorTerms: buildAcceptance('creatorTerms', true, CREATOR_TERMS_VERSION),
          royaltyPolicy: buildAcceptance('royaltyPolicy', true, ROYALTY_POLICY_VERSION),
        },
      });

      if (success) {
        setShowCreatorUpgrade(false);
        setAcceptCreatorUpgrade(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const shippingFields: Array<{ key: keyof AccountShippingAddress; label: string; placeholder: string }> = [
    { key: 'fullName', label: 'Nome destinatario', placeholder: 'Mario Rossi' },
    { key: 'address1', label: 'Indirizzo', placeholder: 'Via Roma 42' },
    { key: 'city', label: 'Citta', placeholder: 'Milano' },
    { key: 'province', label: 'Provincia', placeholder: 'MI' },
    { key: 'zip', label: 'CAP', placeholder: '20100' },
    { key: 'country', label: 'Paese', placeholder: 'Italia' },
    { key: 'phone', label: 'Telefono', placeholder: '+39 333 1234567' },
  ];

  const walletFields: Array<{ key: keyof RoyaltyWallet; label: string; type?: string }> = [
    { key: 'available', label: 'Saldo disponibile', type: 'number' },
    { key: 'pending', label: 'Saldo in attesa', type: 'number' },
    { key: 'paidTotal', label: 'Totale pagato', type: 'number' },
    { key: 'nextPayoutEstimate', label: 'Prossimo payout stimato', type: 'date' },
    { key: 'lastPayoutAt', label: 'Ultimo payout', type: 'date' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="border-4 border-black bg-cyan-50 p-6">
        <div className="mb-5 flex items-center gap-3">
          <UserRound className="h-6 w-6" />
          <h3 className="text-2xl font-black uppercase">Identita creator</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Nome visualizzato</span>
            <input type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Avatar URL</span>
            <input type="url" value={photoURL} onChange={(event) => setPhotoURL(event.target.value)} placeholder="https://..." className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Username</span>
            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Tagline creator</span>
            <input type="text" value={creatorTagline} onChange={(event) => setCreatorTagline(event.target.value)} placeholder="Concept breve per descrivere stile e tono del creator" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Categoria creator</span>
            <input type="text" value={creatorCategory} onChange={(event) => setCreatorCategory(event.target.value)} placeholder="Meme designer, visual satirico, illustratore" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Località</span>
            <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Milano, Italia" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Portfolio / sito</span>
            <input type="url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} placeholder="https://tuosito.it" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Handle social</span>
            <input type="text" value={socialHandle} onChange={(event) => setSocialHandle(event.target.value)} placeholder="@creator_handle" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Bio creator</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <div className="md:col-span-2 border-4 border-black bg-white p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-black uppercase">Stato creator</p>
                <p className="mt-2 font-mono text-xs uppercase text-gray-600">
                  {isCreator ? 'Account creator attivo' : 'Account client: puoi attivare vendite e royalty creator.'}
                </p>
              </div>
              {!isCreator && (
                <button
                  type="button"
                  onClick={() => setShowCreatorUpgrade(true)}
                  className="border-4 border-black bg-yellow-400 px-4 py-3 font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-yellow-400 hover:shadow-none"
                >
                  Diventa Creator
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-4 border-black bg-green-50 p-6">
        <div className="mb-5 flex items-center gap-3">
          <Mail className="h-6 w-6" />
          <h3 className="text-2xl font-black uppercase">Contatti account</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Email payout</span>
            <input type="email" value={payoutEmail} onChange={(event) => setPayoutEmail(event.target.value)} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Telefono account</span>
            <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="flex items-center gap-3 border-4 border-black bg-white px-4 py-3 font-black uppercase md:col-span-2">
            <input type="checkbox" checked={newsletterOptIn} onChange={(event) => setNewsletterOptIn(event.target.checked)} className="h-5 w-5 border-2 border-black" />
            Ricevi aggiornamenti account, drop e payout
          </label>
        </div>
      </section>

      <section className="border-4 border-black bg-pink-50 p-6">
        <div className="mb-6 border-4 border-black bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <h3 className="text-2xl font-black uppercase">Documenti creator</h3>
          </div>
          <p className="max-w-4xl font-mono text-sm leading-relaxed">
            Prima del collegamento finale payout, l'account deve accettare i documenti che regolano licenza contenuti,
            formula royalty, payout, resi e chargeback.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border-4 border-black bg-cyan-50 p-4">
              <p className="font-black uppercase">Creator Terms</p>
              <p className="mt-2 font-mono text-xs uppercase">Versione {CREATOR_TERMS_VERSION}</p>
              <button type="button" onClick={onOpenCreatorTerms} className="mt-4 border-2 border-black bg-cyan-400 px-4 py-2 text-xs font-black uppercase">
                Apri documento
              </button>
              <label className="mt-4 flex items-start gap-3 border-2 border-black bg-white px-4 py-3 font-mono text-xs uppercase">
                <input
                  type="checkbox"
                  checked={Boolean(legalAcceptances.creatorTerms?.accepted)}
                  onChange={(event) =>
                    setLegalAcceptances((current) => ({
                      ...current,
                      creatorTerms: buildAcceptance('creatorTerms', event.target.checked, CREATOR_TERMS_VERSION),
                    }))
                  }
                  className="mt-0.5 h-4 w-4 border-2 border-black"
                />
                Confermo di aver letto e accettato i Creator Terms.
              </label>
            </div>
            <div className="border-4 border-black bg-green-50 p-4">
              <p className="font-black uppercase">Royalty Policy</p>
              <p className="mt-2 font-mono text-xs uppercase">Versione {ROYALTY_POLICY_VERSION}</p>
              <button type="button" onClick={onOpenRoyaltyPolicy} className="mt-4 border-2 border-black bg-green-400 px-4 py-2 text-xs font-black uppercase">
                Apri documento
              </button>
              <label className="mt-4 flex items-start gap-3 border-2 border-black bg-white px-4 py-3 font-mono text-xs uppercase">
                <input
                  type="checkbox"
                  checked={Boolean(legalAcceptances.royaltyPolicy?.accepted)}
                  onChange={(event) =>
                    setLegalAcceptances((current) => ({
                      ...current,
                      royaltyPolicy: buildAcceptance('royaltyPolicy', event.target.checked, ROYALTY_POLICY_VERSION),
                    }))
                  }
                  className="mt-0.5 h-4 w-4 border-2 border-black"
                />
                Confermo formula royalty, payout e rettifiche operative.
              </label>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <CreditCard className="h-6 w-6" />
          <h3 className="text-2xl font-black uppercase">Pagamenti royalty</h3>
        </div>
        <div className="mb-5 border-4 border-black bg-white p-4">
          <p className="font-black uppercase">{providerMeta.label}</p>
          <p className="mt-2 text-sm font-mono leading-relaxed">{providerMeta.description}</p>
          <p className="mt-3 font-mono text-xs uppercase">Stato corrente: {PAYOUT_STATUS_LABELS[payoutSetup.status]}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Metodo payout</span>
            <select value={payoutSetup.provider} onChange={(event) => setPayoutSetup((current) => ({
              ...current,
              provider: event.target.value as AccountPayoutSetup['provider'],
              status: event.target.value === 'none' ? 'not_configured' : current.status === 'not_configured' ? 'pending_setup' : current.status,
            }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2">
              {PAYOUT_PROVIDER_OPTIONS.filter((option) => option.id !== 'none').map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
              <option value="none">Non impostato</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Stato payout</span>
            <select value={payoutSetup.status} onChange={(event) => setPayoutSetup((current) => ({ ...current, status: event.target.value as AccountPayoutSetup['status'] }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2">
              {Object.entries(PAYOUT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">ID account provider</span>
            <input type="text" value={payoutSetup.accountId || ''} onChange={(event) => setPayoutSetup((current) => ({ ...current, accountId: event.target.value }))} placeholder="acct_..., paypal-account, iban-ref" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Label account</span>
            <input type="text" value={payoutSetup.accountLabel || ''} onChange={(event) => setPayoutSetup((current) => ({ ...current, accountLabel: event.target.value }))} placeholder="Nome account o riferimento payout" className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Valuta payout</span>
            <input type="text" value={payoutSetup.payoutCurrency || 'EUR'} onChange={(event) => setPayoutSetup((current) => ({ ...current, payoutCurrency: event.target.value.toUpperCase() }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Soglia minima payout</span>
            <input type="number" min="0" step="0.01" value={payoutSetup.minimumPayoutAmount || 0} onChange={(event) => setPayoutSetup((current) => ({ ...current, minimumPayoutAmount: Number(event.target.value) }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-4 border-black bg-white p-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5" />
              <p className="font-black uppercase">Readiness collegamento finale</p>
            </div>
            {payoutReadinessIssues.length === 0 ? (
              <p className="mt-3 font-mono text-sm uppercase text-green-700">Setup pronto per onboarding provider.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {payoutReadinessIssues.map((issue) => (
                  <p key={issue} className="border-2 border-black bg-yellow-100 px-3 py-2 font-mono text-xs uppercase">{issue}</p>
                ))}
              </div>
            )}
          </div>
          <div className="border-4 border-black bg-black p-4 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <p className="font-black uppercase">Hook finale</p>
            </div>
            <p className="mt-3 font-mono text-sm leading-relaxed text-gray-300">
              Questa struttura è già pronta per salvare `provider`, `status`, `accountId`, wallet e profilo fiscale.
              Il backend finale dovrà solo generare onboarding e sincronizzare lo stato provider.
            </p>
            <p className="mt-3 font-mono text-xs uppercase text-cyan-300">
              Onboarding pronto: {onboardingReady ? 'si' : 'no'}
            </p>
          </div>
        </div>
      </section>

      <section className="border-4 border-black bg-orange-50 p-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6" />
          <h3 className="text-2xl font-black uppercase">Dati fiscali e wallet</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Nome legale</span>
            <input type="text" value={taxProfile.legalName || legalName} onChange={(event) => setTaxProfile((current) => ({ ...current, legalName: event.target.value }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Profilo fiscale</span>
            <select value={taxProfile.businessType} onChange={(event) => setTaxProfile((current) => ({ ...current, businessType: event.target.value as AccountTaxProfile['businessType'] }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2">
              <option value="individual">Persona fisica</option>
              <option value="business">Business</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Paese fiscale</span>
            <input type="text" value={taxProfile.taxCountry} onChange={(event) => setTaxProfile((current) => ({ ...current, taxCountry: event.target.value }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Codice fiscale / Tax ID</span>
            <input type="text" value={taxProfile.taxId} onChange={(event) => setTaxProfile((current) => ({ ...current, taxId: event.target.value }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Partita IVA</span>
            <input type="text" value={taxProfile.vatId || ''} onChange={(event) => setTaxProfile((current) => ({ ...current, vatId: event.target.value }))} className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2" />
          </label>
          {walletFields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">{field.label}</span>
              <input
                type={field.type || 'text'}
                min={field.type === 'number' ? '0' : undefined}
                step={field.type === 'number' ? '0.01' : undefined}
                value={royaltyWallet[field.key] as string | number | undefined || ''}
                onChange={(event) =>
                  setRoyaltyWallet((current) => ({
                    ...current,
                    [field.key]: field.type === 'number' ? Number(event.target.value) : event.target.value,
                  }))
                }
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="border-4 border-black bg-yellow-50 p-6">
        <h3 className="mb-5 text-2xl font-black uppercase">Indirizzo predefinito</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {shippingFields.map((field) => (
            <label key={field.key} className={`block ${field.key === 'address1' ? 'md:col-span-2' : ''}`}>
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">{field.label}</span>
              <input
                type="text"
                value={shippingAddress[field.key] || ''}
                placeholder={field.placeholder}
                onChange={(event) => setShippingAddress((current) => ({ ...current, [field.key]: event.target.value }))}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
          ))}
        </div>
      </section>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-3 border-4 border-black bg-black px-6 py-4 font-black uppercase text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-2 hover:translate-y-2 hover:bg-cyan-400 hover:text-black hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-5 w-5" />
        {saving ? 'Salvataggio...' : 'Salva impostazioni account'}
      </motion.button>

      {showCreatorUpgrade && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl border-8 border-black bg-white p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-gray-500">Creator onboarding</p>
            <h3 className="mt-3 text-4xl font-black uppercase italic">Diventa Creator</h3>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="border-4 border-black bg-cyan-50 p-4 font-mono text-xs uppercase">Pubblica design nella community con azione esplicita.</div>
              <div className="border-4 border-black bg-green-50 p-4 font-mono text-xs uppercase">Attiva il flusso royalty e il wallet creator.</div>
              <div className="border-4 border-black bg-yellow-50 p-4 font-mono text-xs uppercase">Gestisci payout, documenti e profilo pubblico dalla dashboard.</div>
            </div>
            <label className="mt-6 flex items-start gap-3 border-4 border-black bg-white px-4 py-4 font-mono text-xs uppercase">
              <input
                type="checkbox"
                checked={acceptCreatorUpgrade}
                onChange={(event) => setAcceptCreatorUpgrade(event.target.checked)}
                className="mt-0.5 h-4 w-4 border-2 border-black"
              />
              Confermo Creator Terms e Royalty Policy per attivare il ruolo creator.
            </label>
            <div className="mt-6 flex flex-col gap-4 md:flex-row">
              <button
                type="button"
                onClick={handleBecomeCreator}
                disabled={!acceptCreatorUpgrade || saving}
                className="flex-1 border-4 border-black bg-black px-6 py-4 font-black uppercase text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-green-400 hover:text-black hover:shadow-none disabled:opacity-60"
              >
                Attiva ruolo creator
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreatorUpgrade(false);
                  setAcceptCreatorUpgrade(false);
                }}
                className="flex-1 border-4 border-black bg-white px-6 py-4 font-black uppercase shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-black hover:text-white hover:shadow-none"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
