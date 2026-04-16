import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import generateRouter from './routes/generate.js';
import blogRouter from './routes/blog.js';
import analyzeRouter from './routes/analyze.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/generate', generateRouter);
app.use('/api/blog', blogRouter);
app.use('/api/analyze', analyzeRouter);

// Toutes les routes inconnues renvoient index.html (SPA)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Route introuvable.' });
  }
});

// Gestionnaire d'erreurs global — jamais de stack trace en production
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
