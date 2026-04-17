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

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// En-tête Service-Worker-Allowed pour les PWA
app.use((req, res, next) => {
  if (req.path === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

// Webhook Stripe doit recevoir le body brut — AVANT express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/generate', generateRouter);
app.use('/api/blog', blogRouter);
app.use('/api/analyze', analyzeRouter);

// Widget data endpoint (PWA Widgets — Windows 11)
app.get('/api/widget/data', (req, res) => {
  const tips = [
    'Un hook percutant capte l\'attention en moins de 2 secondes.',
    'Le storytelling émotionnel triple l\'engagement sur Instagram.',
    'Utilisez 3-5 hashtags de niche pour maximiser la portée.',
    'La durée idéale pour TikTok : entre 21 et 34 secondes.',
    'Les contenus qui posent une question obtiennent 2× plus de commentaires.'
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
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur est survenue. Veuillez réessayer.'
    : err.message;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Viral — serveur démarré sur le port ${PORT}`);
});
