import { useEffect, useMemo, useState } from 'react';
import { MapPin, Save, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

import type { AccountPayoutSetup, AccountShippingAddress, UserLegalAcceptances, UserProfile } from '../../types';
import {
  DEFAULT_PAYOUT_SETUP,
  PAYOUT_PROVIDER_OPTIONS,
  PAYOUT_STATUS_LABELS,
  getPayoutReadinessIssues,
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
  const [username, setUsername] = useState('');
  const [creatorTagline, setCreatorTagline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [payoutEmail, setPayoutEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState<AccountShippingAddress>(EMPTY_SHIPPING);
  const [payoutSetup, setPayoutSetup] = useState<AccountPayoutSetup>({ ...DEFAULT_PAYOUT_SETUP });
  const [legalAcceptances, setLegalAcceptances] = useState<UserLegalAcceptances>({ ...DEFAULT_LEGAL_ACCEPTANCES });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
    setUsername(userProfile?.username || '');
    setCreatorTagline(userProfile?.creatorTagline || '');
    setBio(userProfile?.bio || '');
    setLocation(userProfile?.location || '');
    setSocialHandle(userProfile?.socialHandle || '');
    setPayoutEmail(userProfile?.payoutEmail || userProfile?.email || '');
    setShippingAddress(userProfile?.shippingAddress || EMPTY_SHIPPING);
    setPayoutSetup({ ...DEFAULT_PAYOUT_SETUP, ...(userProfile?.payoutSetup || {}) });
    setLegalAcceptances({
      ...DEFAULT_LEGAL_ACCEPTANCES,
      ...(userProfile?.legalAcceptances || {}),
    });
  }, [userProfile]);

  const previewProfile = useMemo(() => ({
    ...(userProfile || {}),
    displayName,
    username,
    creatorTagline,
    bio,
    location,
    socialHandle,
    payoutEmail,
    shippingAddress,
    payoutSetup,
    legalAcceptances,
  }) as UserProfile, [
    userProfile,
    displayName,
    username,
    creatorTagline,
    bio,
    location,
    socialHandle,
    payoutEmail,
    shippingAddress,
    payoutSetup,
    legalAcceptances,
  ]);

  const readinessIssues = useMemo(() => getPayoutReadinessIssues(previewProfile), [previewProfile]);

  const buildAcceptance = (
    key: keyof UserLegalAcceptances,
    accepted: boolean,
    version: string,
  ) => ({
    accepted,
    version,
    acceptedAt: accepted ? legalAcceptances[key]?.acceptedAt || new Date().toISOString() : undefined,
  });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        displayName: displayName.trim() || null,
        username: username.trim(),
        creatorTagline: creatorTagline.trim(),
        bio: bio.trim(),
        location: location.trim(),
        socialHandle: socialHandle.trim(),
        payoutEmail: payoutEmail.trim(),
        shippingAddress,
        payoutSetup,
        legalAcceptances: {
          creatorTerms: buildAcceptance('creatorTerms', Boolean(legalAcceptances.creatorTerms?.accepted), CREATOR_TERMS_VERSION),
          royaltyPolicy: buildAcceptance('royaltyPolicy', Boolean(legalAcceptances.royaltyPolicy?.accepted), ROYALTY_POLICY_VERSION),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="border-4 border-black bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <UserRound className="h-5 w-5" />
            <h3 className="text-2xl font-black uppercase">Profilo Pubblico</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Nome</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Tagline</span>
              <input
                type="text"
                value={creatorTagline}
                onChange={(event) => setCreatorTagline(event.target.value)}
                placeholder="Cosa fai e che tipo di design pubblichi"
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Location</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Handle social</span>
              <input
                type="text"
                value={socialHandle}
                onChange={(event) => setSocialHandle(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Bio</span>
              <textarea
                rows={4}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
          </div>
        </div>

        <div className="border-4 border-black bg-black p-6 text-white">
          <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Preview profilo</p>
          <h3 className="mt-4 text-4xl font-black uppercase tracking-tighter">
            @{username || userProfile?.email?.split('@')[0] || 'creator'}
          </h3>
          <p className="mt-3 text-lg font-black uppercase">{displayName || 'Nome profilo'}</p>
          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-gray-300">
            {creatorTagline || 'Aggiungi una tagline corta per chiarire subito stile e ruolo del creator.'}
          </p>
          <div className="mt-6 space-y-2 font-mono text-xs uppercase text-gray-300">
            <p>{location || 'Location non impostata'}</p>
            <p>{socialHandle || 'Handle non impostato'}</p>
            <p>{payoutSetup.provider !== 'none' ? `Payout: ${PAYOUT_STATUS_LABELS[payoutSetup.status]}` : 'Payout non configurato'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <div className="border-4 border-black bg-yellow-50 p-6">
          <div className="mb-5 flex items-center gap-3">
            <MapPin className="h-5 w-5" />
            <h3 className="text-2xl font-black uppercase">Spedizione Predefinita</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {([
              { key: 'fullName', label: 'Nome destinatario' },
              { key: 'address1', label: 'Indirizzo', span: true },
              { key: 'city', label: 'Citta' },
              { key: 'province', label: 'Provincia' },
              { key: 'zip', label: 'CAP' },
              { key: 'country', label: 'Paese' },
              { key: 'phone', label: 'Telefono' },
            ] as const).map((field) => (
              <label key={field.key} className={'span' in field ? 'block md:col-span-2' : 'block'}>
                <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">{field.label}</span>
                <input
                  type="text"
                  value={shippingAddress[field.key] || ''}
                  onChange={(event) => setShippingAddress((current) => ({ ...current, [field.key]: event.target.value }))}
                  className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="border-4 border-black bg-cyan-50 p-6">
          <div className="mb-5 flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            <h3 className="text-2xl font-black uppercase">Creator e Royalty</h3>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Email payout</span>
              <input
                type="email"
                value={payoutEmail}
                onChange={(event) => setPayoutEmail(event.target.value)}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.2em]">Metodo payout</span>
              <select
                value={payoutSetup.provider}
                onChange={(event) => setPayoutSetup((current) => ({
                  ...current,
                  provider: event.target.value as AccountPayoutSetup['provider'],
                  status: event.target.value === 'none' ? 'not_configured' : current.status === 'not_configured' ? 'pending_setup' : current.status,
                }))}
                className="w-full border-4 border-black bg-white px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-offset-2"
              >
                {PAYOUT_PROVIDER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-3">
              <div className="border-4 border-black bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase">Creator Terms</p>
                    <p className="mt-1 font-mono text-xs uppercase text-gray-500">Versione {CREATOR_TERMS_VERSION}</p>
                  </div>
                  <button type="button" onClick={onOpenCreatorTerms} className="border-2 border-black bg-cyan-400 px-3 py-2 text-xs font-black uppercase">
                    Apri
                  </button>
                </div>
                <label className="mt-4 flex items-start gap-3 font-mono text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={Boolean(legalAcceptances.creatorTerms?.accepted)}
                    onChange={(event) => setLegalAcceptances((current) => ({
                      ...current,
                      creatorTerms: buildAcceptance('creatorTerms', event.target.checked, CREATOR_TERMS_VERSION),
                    }))}
                    className="mt-0.5 h-4 w-4 border-2 border-black"
                  />
                  Confermo i termini creator per pubblicare design e ricevere royalty.
                </label>
              </div>

              <div className="border-4 border-black bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase">Royalty Policy</p>
                    <p className="mt-1 font-mono text-xs uppercase text-gray-500">Versione {ROYALTY_POLICY_VERSION}</p>
                  </div>
                  <button type="button" onClick={onOpenRoyaltyPolicy} className="border-2 border-black bg-green-400 px-3 py-2 text-xs font-black uppercase">
                    Apri
                  </button>
                </div>
                <label className="mt-4 flex items-start gap-3 font-mono text-xs uppercase">
                  <input
                    type="checkbox"
                    checked={Boolean(legalAcceptances.royaltyPolicy?.accepted)}
                    onChange={(event) => setLegalAcceptances((current) => ({
                      ...current,
                      royaltyPolicy: buildAcceptance('royaltyPolicy', event.target.checked, ROYALTY_POLICY_VERSION),
                    }))}
                    className="mt-0.5 h-4 w-4 border-2 border-black"
                  />
                  Confermo payout, soglie, rettifiche e stato delle royalty maturate.
                </label>
              </div>
            </div>

            <div className="border-4 border-black bg-black p-4 text-white">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <p className="font-black uppercase">Readiness</p>
              </div>
              {readinessIssues.length === 0 ? (
                <p className="font-mono text-xs uppercase text-green-300">Profilo pronto per creator, ordini e payout.</p>
              ) : (
                <div className="space-y-2">
                  {readinessIssues.map((issue) => (
                    <p key={issue} className="border border-white/20 px-3 py-2 font-mono text-xs uppercase text-gray-200">
                      {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
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
        {saving ? 'Salvataggio...' : 'Salva impostazioni'}
      </motion.button>
    </form>
  );
}
