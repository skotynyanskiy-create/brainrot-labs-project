import type { UserLegalAcceptances } from '../../types';

export const CREATOR_TERMS_VERSION = '2026-03';
export const ROYALTY_POLICY_VERSION = '2026-03';

export const DEFAULT_LEGAL_ACCEPTANCES: UserLegalAcceptances = {
  creatorTerms: {
    accepted: false,
    version: CREATOR_TERMS_VERSION,
  },
  royaltyPolicy: {
    accepted: false,
    version: ROYALTY_POLICY_VERSION,
  },
};
