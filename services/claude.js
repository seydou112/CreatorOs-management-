import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT_GENERATION } from '../utils/promptBuilder.js';
import { SYSTEM_PROMPT_ANALYZE } from '../utils/analyzeBuilder.js';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY non configurée — ajoutez-la dans vos variables d\'environnement Render.');
  return new GoogleGenerativeAI(key);
}

function parseJson(text) {
  let cleaned = text.trim();
  // Supprimer les blocs markdown ```json ... ``` si Gemini en ajoute
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse invalide du modèle IA');
  }
}

export async function generateContent(userPrompt) {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT_GENERATION,
    generationConfig: { maxOutputTokens: 2048, temperature: 0.9 }
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  const parsed = parseJson(text);

  if (!parsed.variations || !Array.isArray(parsed.variations) || parsed.variations.length === 0) {
    throw new Error('Structure de réponse incomplète');
  }
  for (const v of parsed.variations) {
    if (!v.hook || !v.script || !v.call_to_action) throw new Error('Variation incomplète dans la réponse IA');
  }

  return parsed;
}

export async function analyzeAccount(userPrompt) {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT_ANALYZE,
    generationConfig: { maxOutputTokens: 1536, temperature: 0.7 }
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  const parsed = parseJson(text);

  const required = ['score_engagement', 'points_forts', 'points_faibles', 'recommandations', 'plan_action', 'type_contenu_optimal'];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`Champ manquant dans l'analyse : ${key}`);
  }

  return parsed;
}
