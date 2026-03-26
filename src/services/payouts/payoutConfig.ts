import type { UserProfile } from '../../types';

export const PAYOUT_PROVIDER_OPTIONS = [
  {
    id: 'stripe_connect',
    label: 'Stripe Connect',
    shortLabel: 'Stripe',
    description: 'Scelta consigliata per payout automatici, verifica account e onboarding finale.',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    shortLabel: 'PayPal',
    description: 'Avvio piu rapido, ma con gestione payout meno strutturata del flusso Stripe.',
  },
  {
    id: 'bank_transfer',
    label: 'Bonifico manuale',
    shortLabel: 'Bonifico',
    description: 'Fallback operativo per gestione interna amministrativa e payout manuali.',
  },
  {
    id: 'none',
    label: 'Non impostato',
    shortLabel: 'Nessuno',
    description: 'Nessun metodo payout selezionato.',
  },
] as const;

export const PAYOUT_STATUS_LABELS: Record<NonNullable<UserProfile['payoutSetup']>['status'], string> = {
  not_configured: 'Non configurato',
  pending_setup: 'Setup richiesto',
  pending_verification: 'Verifica in corso',
  active: 'Attivo',
  restricted: 'Limitato',
};

export const DEFAULT_ROYALTY_WALLET = {
  available: 0,
  pending: 0,
  paidTotal: 0,
};

export const DEFAULT_PAYOUT_SETUP = {
  provider: 'none',
  status: 'not_configured',
  payoutCurrency: 'EUR',
  minimumPayoutAmount: 25,
  onboardingReady: false,
} as const;

export const DEFAULT_TAX_PROFILE = {
  legalName: '',
  businessType: 'individual',
  taxCountry: 'Italia',
  taxId: '',
  vatId: '',
} as const;

export function getProfileCompletionScore(profile: UserProfile | null) {
  if (!profile) return 0;

  const checkpoints = [
    Boolean(profile.displayName?.trim()),
    Boolean(profile.username?.trim()),
    Boolean(profile.creatorTagline?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.socialHandle?.trim()),
    Boolean(profile.payoutSetup?.provider && profile.payoutSetup.provider !== 'none'),
    Boolean(profile.payoutEmail?.trim()),
    Boolean(profile.shippingAddress?.address1?.trim()),
    Boolean(profile.shippingAddress?.city?.trim()),
    Boolean(profile.legalAcceptances?.creatorTerms?.accepted),
    Boolean(profile.legalAcceptances?.royaltyPolicy?.accepted),
  ];

  const completed = checkpoints.filter(Boolean).length;
  return Math.round((completed / checkpoints.length) * 100);
}

export function getPayoutReadinessIssues(profile: UserProfile | null) {
  if (!profile) {
    return ['Account non disponibile.'];
  }

  const issues: string[] = [];
  if (!profile.displayName?.trim()) issues.push('Completa il nome profilo.');
  if (!profile.username?.trim()) issues.push('Scegli uno username pubblico.');
  if (!profile.payoutSetup || profile.payoutSetup.provider === 'none') issues.push('Seleziona un metodo payout.');
  if (!profile.payoutEmail?.trim()) issues.push('Inserisci un recapito payout.');
  if (!profile.shippingAddress?.fullName?.trim()) issues.push('Completa il destinatario predefinito.');
  if (!profile.shippingAddress?.address1?.trim() || !profile.shippingAddress?.city?.trim()) issues.push('Aggiungi un indirizzo di spedizione valido.');
  if (!profile.legalAcceptances?.creatorTerms?.accepted) issues.push('Accetta i Creator Terms.');
  if (!profile.legalAcceptances?.royaltyPolicy?.accepted) issues.push('Accetta la Royalty Policy.');

  if (profile.payoutSetup?.provider === 'stripe_connect' && profile.payoutSetup.status !== 'active') {
    issues.push('Il collegamento Stripe finale richiede onboarding o verifica.');
  }

  if (profile.payoutSetup?.provider === 'paypal' && !profile.payoutEmail?.trim()) {
    issues.push('PayPal richiede una payout email valida.');
  }

  return issues;
}

export function getPayoutProviderMeta(provider: UserProfile['payoutSetup'] extends infer T
  ? T extends { provider: infer P }
    ? P
    : never
  : never) {
  return PAYOUT_PROVIDER_OPTIONS.find((option) => option.id === provider) || PAYOUT_PROVIDER_OPTIONS[3];
}

export function canStartPayoutOnboarding(profile: UserProfile | null) {
  return getPayoutReadinessIssues(profile).length === 0;
}
