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

// Webhook Stripe doit recevoir le body brut — AVANT express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/generate', generateRouter);
app.use('/api/blog', blogRouter);
app.use('/api/analyze', analyzeRouter);

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
