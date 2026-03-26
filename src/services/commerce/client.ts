import { getFunctions, httpsCallable } from 'firebase/functions';
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PublishCommunityDesignRequest,
  PublishCommunityDesignResponse,
  SaveDesignDraftRequest,
  SaveDesignDraftResponse,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from './types';

const getCallable = <Req, Res>(name: string) => {
  const functions = getFunctions();
  return httpsCallable<Req, Res>(functions, name);
};

export async function saveDesignDraft(input: SaveDesignDraftRequest) {
  const callable = getCallable<SaveDesignDraftRequest, SaveDesignDraftResponse>('saveDesignDraft');
  const response = await callable(input);
  return response.data;
}

export async function publishCommunityDesign(input: PublishCommunityDesignRequest) {
  const callable = getCallable<PublishCommunityDesignRequest, PublishCommunityDesignResponse>('publishCommunityDesign');
  const response = await callable(input);
  return response.data;
}

export async function getShippingQuote(input: ShippingQuoteRequest) {
  const callable = getCallable<ShippingQuoteRequest, ShippingQuoteResponse>('getShippingQuote');
  const response = await callable(input);
  return response.data;
}

export async function createCheckoutSession(input: CreateCheckoutSessionRequest) {
  const callable = getCallable<CreateCheckoutSessionRequest, CreateCheckoutSessionResponse>('createCheckoutSession');
  const response = await callable(input);
  return response.data;
}
