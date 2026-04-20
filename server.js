import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import generateRouter from './routes/generate.js';
import blogRouter from './routes/blog.js';
import analyzeRouter from './routes/analyze.js';
import authRouter from './routes/auth.js';
import stripeRouter, { stripeWebhookHandler } from './routes/stripe.js';
import monerooRouter from './routes/moneroo.js';
import userRouter from './routes/user.js';
import trendsRouter from './routes/trends.js';
import profileRouter from './routes/profile.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// CORS : autoriser les origines déclarées + requêtes same-origin (pas d'origin header)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Requête same-origin ou sans origin (mobile apps, curl, etc.) : autorisé
    if (!origin) return cb(null, true);
    // Si ALLOWED_ORIGINS est défini, vérifier la liste
    if (allowedOrigins?.length) return cb(null, allowedOrigins.includes(origin));
    // Sinon autoriser (mode dev / premier déploiement)
    cb(null, true);
  },
  credentials: true
}));

app.use((req, res, next) => {
  if (req.path === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/moneroo', monerooRouter);
app.use('/api/user', userRouter);
app.use('/api/trends', trendsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/generate', generateRouter);
app.use('/api/blog', blogRouter);
app.use('/api/analyze', analyzeRouter);

app.get('/api/widget/data', (req, res) => {
  const tips = [
    "Un hook percutant capte l'attention en moins de 2 secondes.",
    "Le storytelling émotionnel triple l'engagement sur Instagram.",
    'Utilisez 3-5 hashtags de niche pour maximiser la portée.',
    'La durée idéale pour TikTok : entre 21 et 34 secondes.',
    "Les contenus qui posent une question obtiennent 2x plus de commentaires."
  ];
  res.json({
    tip: tips[Math.floor(Date.now() / 86400000) % tips.length],
    updated: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Route introuvable.' });
  }
});

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  console.error(`[${status}] ${req.method} ${req.path} —`, err.message);
  res.status(status).json({ error: err.message || 'Une erreur est survenue.' });
});

app.listen(PORT, () => {
  console.log(`Viral — serveur démarré sur le port ${PORT}`);
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!geminiKey) {
    console.error('⛔ GEMINI_API_KEY manquante — la génération IA ne fonctionnera pas.');
  } else {
    console.log(`✓ GEMINI_API_KEY chargée (longueur: ${geminiKey.length}, début: ${geminiKey.slice(0, 6)}...)`);
  }
});
