import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT_GENERATION } from '../utils/promptBuilder.js';
import { SYSTEM_PROMPT_ANALYZE } from '../utils/analyzeBuilder.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 45000
});

function parseJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Extraire le JSON si du texte parasite entoure la réponse
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse invalide du modèle IA');
  }
}

export async function generateContent(userPrompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT_GENERATION,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: userPrompt }]
  });

  const text = response.content[0].text;
  const parsed = parseJson(text);

  if (!parsed.hook || !parsed.script || !parsed.call_to_action) {
    throw new Error('Structure de réponse incomplète');
  }

  return parsed;
}

export async function analyzeAccount(userPrompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1536,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT_ANALYZE,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: userPrompt }]
  });

  const text = response.content[0].text;
  const parsed = parseJson(text);

  const required = ['score_engagement', 'points_forts', 'points_faibles', 'recommandations', 'plan_action', 'type_contenu_optimal'];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`Champ manquant dans l'analyse : ${key}`);
  }

  return parsed;
}
