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

function parseJson(text) {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse IA invalide');
  }
}

function getTrendsModel() {
  const client = getClient();
  return client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT_TRENDS,
    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    tools: [{ googleSearch: {} }]
  });
}

// ===== TENDANCES EN TEMPS RÉEL =====
router.post('/search', async (req, res, next) => {
  try {
    const { sujet, plateforme = 'tiktok' } = req.body;
    if (!sujet?.trim()) return res.status(400).json({ error: 'Sujet requis.' });

    const model = getTrendsModel();
    const prompt = buildTrendsPrompt({ sujet: sujet.trim(), plateforme });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJson(text);

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

    const model = getTrendsModel();
    const prompt = buildCompetitorPrompt({ concurrent: concurrent.trim(), plateforme });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJson(text);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
