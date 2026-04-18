import { Router } from 'express';
import pool from '../data/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

// ===== PROFIL COMPLET =====
router.get('/profile', async (req, res, next) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const result = await pool.query(
      `SELECT email, is_premium, premium_until, daily_count, daily_reset,
              total_generations, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const today = new Date().toISOString().split('T')[0];
    const dailyReset = user.daily_reset?.toISOString?.().split('T')[0];
    const usedToday = dailyReset === today ? (user.daily_count || 0) : 0;
    const freeLimit = parseInt(process.env.FREE_DAILY_LIMIT || '3');

    res.json({
      email: user.email,
      isPremium: user.is_premium,
      premiumUntil: user.premium_until,
      usedToday,
      remainingToday: user.is_premium ? 'illimité' : Math.max(0, freeLimit - usedToday),
      freeLimit,
      totalGenerations: user.total_generations || 0,
      memberSince: user.created_at
    });
  } catch (err) {
    next(err);
  }
});

// ===== CHANGER MOT DE PASSE =====
router.post('/change-password', async (req, res, next) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Les deux mots de passe sont requis.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
    }

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
