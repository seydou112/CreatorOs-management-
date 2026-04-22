import { Router } from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT_TRENDS, buildTrendsPrompt, buildCompetitorPrompt } from '../utils/trendsBuilder.js';

const router = Router();

function getClient() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY non configurée.');
  return new OpenAI({ apiKey: key });
}

function parseJson(text) {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse IA invalide');
  }
}

async function callOpenAI(prompt) {
  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_TRENDS },
      { role: 'user', content: prompt }
    ],
    max_tokens: 2048,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  return parseJson(res.choices[0].message.content);
}

router.post('/search', async (req, res, next) => {
  try {
    const { sujet, plateforme = 'tiktok' } = req.body;
    if (!sujet?.trim()) return res.status(400).json({ error: 'Sujet requis.' });
    const data = await callOpenAI(buildTrendsPrompt({ sujet: sujet.trim(), plateforme }));
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/competitor', async (req, res, next) => {
  try {
    const { concurrent, plateforme = 'tiktok' } = req.body;
    if (!concurrent?.trim()) return res.status(400).json({ error: 'Concurrent requis.' });
    const data = await callOpenAI(buildCompetitorPrompt({ concurrent: concurrent.trim(), plateforme }));
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
