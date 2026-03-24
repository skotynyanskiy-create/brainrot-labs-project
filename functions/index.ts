import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { IntegrationService } from '../src/services/integrations/IntegrationService';
import { MockProvider } from '../src/services/integrations/providers/MockProvider';
import { PrintfulProvider } from '../src/services/integrations/providers/PrintfulProvider';
import { OrderData } from '../src/services/integrations/types';
import { VoicePreset } from '../src/services/aiTypes';

admin.initializeApp();

const VALID_VOICE_PRESETS: VoicePreset[] = ['chaotic', 'sales', 'deadpan'];

// ── Auth ────────────────────────────────────────────────────────────────────

function requireAuth(request: functions.https.CallableRequest<unknown>) {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Devi essere autenticato per usare questa funzione.');
  }
}

// ── Rate limiting ────────────────────────────────────────────────────────────

const AI_DAILY_LIMIT = 30;

async function checkAiRateLimit(uid: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ref = admin.firestore().collection('_rateLimits').doc(`${uid}_${today}`);

  await admin.firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (current >= AI_DAILY_LIMIT) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Hai raggiunto il limite giornaliero di ${AI_DAILY_LIMIT} generazioni AI.`
      );
    }

    tx.set(ref, { count: current + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
}

// ── Gemini ───────────────────────────────────────────────────────────────────

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'Servizio AI temporaneamente non disponibile.');
  }
  return new GoogleGenAI({ apiKey });
}

// ── Validation ───────────────────────────────────────────────────────────────

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
  return trimmed;
}

function validateVoicePreset(preset: unknown): VoicePreset {
  if (!VALID_VOICE_PRESETS.includes(preset as VoicePreset)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `voicePreset non valido. Valori ammessi: ${VALID_VOICE_PRESETS.join(', ')}.`
    );
  }
  return preset as VoicePreset;
}

function validateOrderData(data: unknown): OrderData {
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Dati ordine non validi.');
  }
  const d = data as Record<string, unknown>;

  // Validate customer
  if (!d.customer || typeof d.customer !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Dati cliente mancanti.');
  }
  const customer = d.customer as Record<string, unknown>;
  if (typeof customer.name !== 'string' || !customer.name.trim()) {
    throw new functions.https.HttpsError('invalid-argument', 'Nome cliente mancante.');
  }
  if (typeof customer.email !== 'string' || !customer.email.includes('@')) {
    throw new functions.https.HttpsError('invalid-argument', 'Email cliente non valida.');
  }
  if (!customer.shipping || typeof customer.shipping !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Indirizzo di spedizione mancante.');
  }
  const shipping = customer.shipping as Record<string, unknown>;
  if (!shipping.address1 || !shipping.city || !shipping.zip || !shipping.country_code) {
    throw new functions.https.HttpsError('invalid-argument', 'Campi indirizzo di spedizione incompleti.');
  }

  // Validate items
  if (!Array.isArray(d.items) || d.items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', "L'ordine deve contenere almeno un articolo.");
  }
  if (d.items.length > 50) {
    throw new functions.https.HttpsError('invalid-argument', "L'ordine non può contenere più di 50 articoli.");
  }
  if (typeof d.total !== 'number' || d.total < 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Totale ordine non valido.');
  }

  for (const item of d.items) {
    if (!item || typeof item !== 'object') {
      throw new functions.https.HttpsError('invalid-argument', 'Articolo ordine non valido.');
    }
    const i = item as Record<string, unknown>;
    if (typeof i.productId !== 'string' || !i.productId) {
      throw new functions.https.HttpsError('invalid-argument', 'productId mancante o non valido.');
    }
    if (typeof i.quantity !== 'number' || i.quantity < 1 || i.quantity > 99 || !Number.isInteger(i.quantity)) {
      throw new functions.https.HttpsError('invalid-argument', `Quantità non valida per il prodotto ${i.productId}.`);
    }
  }

  return d as unknown as OrderData;
}

// ── Cloud Functions ──────────────────────────────────────────────────────────

export const processOrder = functions.https.onCall(async (request) => {
  requireAuth(request);
  const orderData = validateOrderData(request.data);

  let calculatedTotal = 0;
  for (const item of orderData.items) {
    let price = 0;

    if (item.productId.startsWith('custom-')) {
      const parts = item.productId.split('-');
      const baseId = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : '';

      const basePrices: Record<string, number> = {
        'base-tshirt': 25.0,
        'base-hoodie': 45.0,
        'base-mug': 12.0,
        'base-phonecase': 15.0,
        'base-poster': 18.0,
        'base-mousepad': 14.0,
      };
      price = basePrices[baseId] ?? 0;

      if (price === 0) {
        throw new functions.https.HttpsError('invalid-argument', `Prodotto base non trovato per: ${item.productId}`);
      }
    } else {
      const productSnap = await admin.firestore().collection('products').doc(item.productId).get();

      if (productSnap.exists) {
        price = productSnap.data()?.price ?? 0;
      } else {
        const communitySnap = await admin.firestore().collection('communityDesigns').doc(item.productId).get();
        if (communitySnap.exists) {
          price = 29.99;
        } else {
          throw new functions.https.HttpsError('invalid-argument', `Prodotto non trovato a catalogo: ${item.productId}`);
        }
      }
    }

    calculatedTotal += price * item.quantity;
  }

  if (Math.abs(calculatedTotal - orderData.total) > 0.01) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Totale non valido. Calcolato: EUR ${calculatedTotal.toFixed(2)}, ricevuto: EUR ${orderData.total.toFixed(2)}`
    );
  }

  const printfulApiKey = process.env.PRINTFUL_API_KEY;
  const provider = printfulApiKey ? new PrintfulProvider(printfulApiKey) : new MockProvider();
  const integrationService = new IntegrationService(provider);
  const result = await integrationService.processOrder(orderData);

  if (!result.success) {
    // Log dettagliato server-side, messaggio generico al client
    console.error('processOrder provider error:', result.error);
    throw new functions.https.HttpsError('internal', "Errore nell'invio dell'ordine. Riprova tra qualche istante.");
  }

  return { success: true, providerOrderId: result.providerOrderId };
});

export const generateMemeImage = functions.https.onCall(async (request) => {
  requireAuth(request);
  await checkAiRateLimit(request.auth!.uid);

  const data = request.data as Record<string, unknown>;
  const prompt = validatePrompt(data.prompt);
  const voicePreset = validateVoicePreset(data.voicePreset);
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
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
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 short captions for a meme about: ${prompt}. Voice preset: ${voicePreset}. Return a simple comma-separated list with no quotes.`,
  });

  const suggestions = (response.text ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (suggestions.length === 0) {
    throw new functions.https.HttpsError('internal', 'Il modello non ha restituito caption valide. Riprova.');
  }

  return { suggestions };
});
