import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SYSTEM_PROMPT_TRENDS,
  buildTrendsPrompt,
  buildCompetitorPrompt
} from '../utils/trendsBuilder.js';

const router = Router();

function getClient() {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) throw new Error('GEMINI_API_KEY non configurée.');
  return new GoogleGenerativeAI(key);
}

function isQuotaError(err) {
  return err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('Too Many Requests');
}

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function getTrendsResult(prompt) {
  let lastErr;
  for (const model of MODELS) {
    try {
      const client = getClient();
      const m = client.getGenerativeModel({
        model,
        systemInstruction: SYSTEM_PROMPT_TRENDS,
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        tools: [{ googleSearch: {} }]
      });
      const result = await m.generateContent(prompt);
      return parseJson(result.response.text());
    } catch (err) {
      lastErr = err;
      if (isQuotaError(err)) { console.warn(`Quota dépassé sur ${model}, essai suivant...`); continue; }
      throw err;
    }
  }
  throw new Error('Quota journalier Gemini épuisé. Réessayez demain ou activez la facturation sur console.cloud.google.com.');
}

// ===== TENDANCES EN TEMPS RÉEL =====
router.post('/search', async (req, res, next) => {
  try {
    const { sujet, plateforme = 'tiktok' } = req.body;
    if (!sujet?.trim()) return res.status(400).json({ error: 'Sujet requis.' });
    const prompt = buildTrendsPrompt({ sujet: sujet.trim(), plateforme });
    const data = await getTrendsResult(prompt);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ===== ANALYSE CONCURRENT =====
router.post('/competitor', async (req, res, next) => {
  try {
    const { concurrent, plateforme = 'tiktok' } = req.body;
    if (!concurrent?.trim()) return res.status(400).json({ error: 'Concurrent requis.' });

    const prompt = buildCompetitorPrompt({ concurrent: concurrent.trim(), plateforme });
    const data = await getTrendsResult(prompt);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
