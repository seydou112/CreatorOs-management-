import OpenAI from 'openai';
import { SYSTEM_PROMPT_GENERATION } from '../utils/promptBuilder.js';
import { SYSTEM_PROMPT_ANALYZE } from '../utils/analyzeBuilder.js';

function getClient() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY non configurée — ajoutez-la dans vos variables d\'environnement Render.');
  return new OpenAI({ apiKey: key });
}

function parseJson(text) {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse invalide du modèle IA');
  }
}

export async function generateContent(userPrompt) {
  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_GENERATION },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 2048,
    temperature: 0.9,
    response_format: { type: 'json_object' }
  });

  const parsed = parseJson(res.choices[0].message.content);

  if (!parsed.variations || !Array.isArray(parsed.variations) || parsed.variations.length === 0) {
    throw new Error('Structure de réponse incomplète');
  }
  for (const v of parsed.variations) {
    if (!v.hook || !v.script || !v.call_to_action) throw new Error('Variation incomplète dans la réponse IA');
  }
  return parsed;
}

export async function analyzeAccount(userPrompt) {
  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_ANALYZE },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1536,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const parsed = parseJson(res.choices[0].message.content);

  const required = ['score_engagement', 'points_forts', 'points_faibles', 'recommandations', 'plan_action', 'type_contenu_optimal'];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`Champ manquant dans l'analyse : ${key}`);
  }
  return parsed;
}
