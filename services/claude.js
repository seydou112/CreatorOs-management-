import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT_GENERATION } from '../utils/promptBuilder.js';
import { SYSTEM_PROMPT_ANALYZE } from '../utils/analyzeBuilder.js';

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

function getClient() {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) throw new Error('GEMINI_API_KEY non configurée — ajoutez-la dans vos variables d\'environnement Render.');
  return new GoogleGenerativeAI(key);
}

function parseJson(text) {
  let cleaned = text.trim()
    .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse invalide du modèle IA');
  }
}

function isQuotaError(err) {
  return err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('Too Many Requests');
}

async function tryModels(fn) {
  let lastErr;
  for (const model of MODELS) {
    try {
      return await fn(getClient(), model);
    } catch (err) {
      lastErr = err;
      if (isQuotaError(err)) {
        console.warn(`Quota dépassé sur ${model}, essai du modèle suivant...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Quota API dépassé sur tous les modèles. Réessayez dans quelques minutes ou activez la facturation sur console.cloud.google.com.');
}

export async function generateContent(userPrompt) {
  const parsed = await tryModels(async (client, model) => {
    const m = client.getGenerativeModel({
      model,
      systemInstruction: SYSTEM_PROMPT_GENERATION,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.9 }
    });
    const result = await m.generateContent(userPrompt);
    return parseJson(result.response.text());
  });

  if (!parsed.variations || !Array.isArray(parsed.variations) || parsed.variations.length === 0) {
    throw new Error('Structure de réponse incomplète');
  }
  for (const v of parsed.variations) {
    if (!v.hook || !v.script || !v.call_to_action) throw new Error('Variation incomplète dans la réponse IA');
  }
  return parsed;
}

export async function analyzeAccount(userPrompt) {
  const parsed = await tryModels(async (client, model) => {
    const m = client.getGenerativeModel({
      model,
      systemInstruction: SYSTEM_PROMPT_ANALYZE,
      generationConfig: { maxOutputTokens: 1536, temperature: 0.7 }
    });
    const result = await m.generateContent(userPrompt);
    return parseJson(result.response.text());
  });

  const required = ['score_engagement', 'points_forts', 'points_faibles', 'recommandations', 'plan_action', 'type_contenu_optimal'];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`Champ manquant dans l'analyse : ${key}`);
  }
  return parsed;
}
