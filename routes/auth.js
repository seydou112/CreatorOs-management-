import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../data/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (6 caractères minimum).' });
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, is_premium',
      [email.toLowerCase().trim(), hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { email: user.email, isPremium: user.is_premium } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { email: user.email, isPremium: user.is_premium } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Non connecté.' });
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT email, is_premium FROM users WHERE id = $1', [payload.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json({ email: user.email, isPremium: user.is_premium });
  } catch {
    res.status(401).json({ error: 'Session expirée.' });
  }
});

export default router;
