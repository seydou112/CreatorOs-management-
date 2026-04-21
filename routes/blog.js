import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { blogPosts } from '../data/blogPosts.js';

const router = Router();

// 24h in-memory cache
let blogCache = null;
let blogCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

const CATEGORY_IMAGES = {
  astuces: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
  guides: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
  nouveautes: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  tendances: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80'
};

const VALID_CATEGORIES = ['astuces', 'guides', 'nouveautes', 'tendances'];

function parseJsonArray(text) {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : parsed.articles || [];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Réponse IA invalide');
  }
}

async function generateBlogArticles() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY non configurée');

  const today = new Date().toISOString().split('T')[0];
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Aujourd'hui nous sommes le ${today}.

Génère 5 articles de blog en français sur la création de contenu pour les réseaux sociaux (TikTok, Instagram, Facebook, YouTube Shorts, Pinterest).
Base-toi sur les dernières actualités réelles du moment : nouvelles fonctionnalités des plateformes, changements d'algorithmes, tendances virales actuelles, outils populaires.

Réponds UNIQUEMENT avec un tableau JSON valide (pas de texte avant ou après). Chaque article doit avoir exactement ces champs :
- slug : string (identifiant URL, minuscules, tirets, unique, ex: "algorithme-tiktok-avril-2026")
- titre : string (titre accrocheur en français, 50-80 caractères)
- categorie : exactement un de : "astuces", "guides", "nouveautes", "tendances"
- date : "${today}"
- tempsLecture : "X min" (entre 3 et 8 min)
- extrait : string (2-3 phrases engageantes en français, 100-150 caractères)
- tags : array de 3-4 strings (mots-clés courts, sans #, sans espaces de préférence)
- contenu : string (article complet HTML — utiliser <h2>, <h3>, <p>, <ul>, <li>, <strong> — environ 400 mots, conseils pratiques et concrets basés sur des faits réels)

Les articles doivent être diversifiés : au moins un par plateforme différente, contenus pratiques et actionnables immédiatement.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = parseJsonArray(text);

  return raw.map((a, i) => ({
    id: Date.now() + i,
    slug: String(a.slug || `article-${today}-${i + 1}`).toLowerCase().replace(/\s+/g, '-'),
    titre: a.titre || 'Article',
    categorie: VALID_CATEGORIES.includes(a.categorie) ? a.categorie : 'astuces',
    date: today,
    tempsLecture: a.tempsLecture || '4 min',
    image: CATEGORY_IMAGES[a.categorie] || CATEGORY_IMAGES.astuces,
    extrait: a.extrait || '',
    tags: Array.isArray(a.tags) ? a.tags.slice(0, 5) : [],
    contenu: a.contenu || ''
  }));
}

async function getArticles() {
  const now = Date.now();
  if (blogCache && (now - blogCacheTime) < CACHE_TTL) return blogCache;

  try {
    const articles = await generateBlogArticles();
    blogCache = articles;
    blogCacheTime = now;
    return articles;
  } catch {
    if (blogCache) return blogCache;
    // Fallback sur les articles statiques
    return blogPosts;
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { categorie } = req.query;
    const all = await getArticles();
    let posts = all.map(({ contenu, ...rest }) => rest);
    if (categorie && categorie !== 'tous') {
      posts = posts.filter(p => p.categorie === categorie);
    }
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const all = await getArticles();
    const post = all.find(p => p.slug === req.params.slug);
    if (!post) return res.status(404).json({ error: 'Article introuvable.' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

export default router;
