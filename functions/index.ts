import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { GoogleGenAI, Type } from '@google/genai';
import type { VoicePreset } from '../src/services/aiTypes';
import {
  createCheckoutSessionHandler,
  getShippingQuoteHandler,
  printfulWebhookHandler,
  publishCommunityDesignHandler,
  retryPendingOrdersHandler,
  saveDesignDraftHandler,
  stripeWebhookHandler,
  syncPrintfulCatalogHandler,
} from './commerce';

admin.initializeApp();

const VALID_VOICE_PRESETS: VoicePreset[] = ['chaotic', 'sales', 'deadpan'];
const AI_DAILY_LIMIT = 30;

function requireAuth(request: functions.https.CallableRequest<unknown>) {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Devi essere autenticato per usare questa funzione.');
  }
}

async function checkAiRateLimit(uid: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const ref = admin.firestore().collection('_rateLimits').doc(`${uid}_${today}`);

  await admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (current >= AI_DAILY_LIMIT) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Hai raggiunto il limite giornaliero di ${AI_DAILY_LIMIT} generazioni AI.`,
      );
    }

    tx.set(ref, { count: current + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Servizio AI temporaneamente non disponibile.');
  }
  return new GoogleGenAI({ apiKey });
}

const PROMPT_INJECTION_PATTERN = /(\bignore\b|\bforget\b|\bsystem\b|\bpretend\b|\bact as\b|<\|.*?\|>|###|---\s*system)/i;
const PROMPT_INJECTION_EXTRAS = /<[^>]+>|\[inst\]|`{3}system|<\|im_start\|>|base64/i;

function validatePrompt(prompt: unknown): string {
  if (typeof prompt !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Il prompt deve essere una stringa.');
  }
  const trimmed = prompt.trim();
  if (trimmed.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Il prompt deve contenere almeno 6 caratteri.');
  }
  if (trimmed.length > 240) {
    throw new functions.https.HttpsError('invalid-argument', 'Il prompt supera il limite di 240 caratteri.');
  }
  const normalized = trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  if (PROMPT_INJECTION_PATTERN.test(normalized) || PROMPT_INJECTION_EXTRAS.test(normalized)) {
    throw new functions.https.HttpsError('invalid-argument', 'Il prompt contiene termini non consentiti.');
  }
  return trimmed;
}

function validateVoicePreset(preset: unknown): VoicePreset {
  if (!VALID_VOICE_PRESETS.includes(preset as VoicePreset)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `voicePreset non valido. Valori ammessi: ${VALID_VOICE_PRESETS.join(', ')}.`,
    );
  }
  return preset as VoicePreset;
}

export const saveDesignDraft = functions.https.onCall(saveDesignDraftHandler);
export const publishCommunityDesign = functions.https.onCall(publishCommunityDesignHandler);
export const getShippingQuote = functions.https.onCall(getShippingQuoteHandler);
export const createCheckoutSession = functions.https.onCall(createCheckoutSessionHandler);
export const syncPrintfulCatalog = functions.https.onCall(syncPrintfulCatalogHandler);
export const stripeWebhook = functions.https.onRequest(stripeWebhookHandler);
export const printfulWebhook = functions.https.onRequest(printfulWebhookHandler);
export const retryPendingOrders = functions.scheduler.onSchedule('every 15 minutes', retryPendingOrdersHandler);

export const processOrder = functions.https.onCall(async () => {
  throw new functions.https.HttpsError(
    'failed-precondition',
    'processOrder è deprecata. Usa createCheckoutSession e i webhook Stripe/Printful.',
  );
});

export const generateMemeImage = functions.https.onCall(async (request) => {
  requireAuth(request);
  await checkAiRateLimit(request.auth!.uid);

  const data = request.data as Record<string, unknown>;
  const prompt = validatePrompt(data.prompt);
  const voicePreset = validateVoicePreset(data.voicePreset);
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-preview-image-generation',
    contents: {
      parts: [
        {
          text: `Create a funny meme image about: ${prompt}. Voice preset: ${voicePreset}. Keep it readable, square and merch-ready.`,
        },
      ],
    },
    config: { imageConfig: { aspectRatio: '1:1', imageSize: '1K' } },
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new functions.https.HttpsError('internal', 'Il modello non ha restituito alcuna immagine. Riprova.');
  }

  return {
    imageDataUrl: `data:image/png;base64,${imagePart.inlineData.data}`,
  };
});

export const suggestMemeCaptions = functions.https.onCall(async (request) => {
  requireAuth(request);
  await checkAiRateLimit(request.auth!.uid);

  const data = request.data as Record<string, unknown>;
  const prompt = validatePrompt(data.prompt);
  const voicePreset = validateVoicePreset(data.voicePreset);
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Suggest 3 short meme captions (max 12 words each) for: ${prompt}. Voice preset: ${voicePreset}.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        maxItems: 3,
      },
    },
  });

  let suggestions: string[] = [];
  try {
    const parsed: unknown = JSON.parse(response.text ?? '[]');
    suggestions = Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === 'string' && s.length > 0).slice(0, 3)
      : [];
  } catch {
    suggestions = [];
  }

  if (suggestions.length === 0) {
    throw new functions.https.HttpsError('internal', 'Il modello non ha restituito caption valide. Riprova.');
  }

  return { suggestions };
});

export const subscribeNewsletter = functions.https.onCall(async (request) => {
  const data = request.data as Record<string, unknown>;
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!EMAIL_REGEX.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Indirizzo email non valido.');
  }

  const docId = Buffer.from(email).toString('base64url');

  await admin.firestore().collection('subscribers').doc(docId).set(
    { email, subscribedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );

  return { success: true };
});
