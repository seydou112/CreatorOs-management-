import { Router } from 'express';
import OpenAI from 'openai';
import { blogPosts } from '../data/blogPosts.js';

const router = Router();

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

function getClient() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY non configurée');
  return new OpenAI({ apiKey: key });
}

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
  const today = new Date().toISOString().split('T')[0];

  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert en création de contenu pour les réseaux sociaux. Tu rédiges des articles de blog pratiques et actionnables en français. Tu réponds UNIQUEMENT avec du JSON valide, sans texte autour, sans markdown.'
      },
      {
        role: 'user',
        content: `Aujourd'hui nous sommes le ${today}.

Génère 5 articles de blog en français sur la création de contenu pour les réseaux sociaux (TikTok, Instagram, Facebook, YouTube Shorts).
Réponds UNIQUEMENT avec un tableau JSON. Chaque article doit avoir exactement ces champs :
- slug : string (identifiant URL, ex: "algorithme-tiktok-${today}")
- titre : string (titre accrocheur, 50-80 caractères)
- categorie : exactement un de : "astuces", "guides", "nouveautes", "tendances"
- date : "${today}"
- tempsLecture : "X min" (entre 3 et 8 min)
- extrait : string (2-3 phrases engageantes, 100-150 caractères)
- tags : array de 3-4 strings
- contenu : string (article HTML complet avec <h2>, <h3>, <p>, <ul>, <li>, <strong> — environ 400 mots, conseils pratiques)

Articles diversifiés : au moins une plateforme différente par article.`
      }
    ],
    max_tokens: 4096,
    temperature: 0.7
  });

  const raw = parseJsonArray(res.choices[0].message.content);

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
    return blogPosts;
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { categorie } = req.query;
    const all = await getArticles();
    let posts = all.map(({ contenu, ...rest }) => rest);
    if (categorie && categorie !== 'tous') posts = posts.filter(p => p.categorie === categorie);
    res.json(posts);
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const all = await getArticles();
    const post = all.find(p => p.slug === req.params.slug);
    if (!post) return res.status(404).json({ error: 'Article introuvable.' });
    res.json(post);
  } catch (err) { next(err); }
});

export default router;
