import pool from '../data/db.js';

// Limite par IP pour les utilisateurs non connectés (en mémoire)
const ipUsage = new Map();

function getIpCount(ip) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${ip}:${today}`;
  const count = ipUsage.get(key) || 0;
  return { key, count, today };
}

function incrementIp(key) {
  const prev = ipUsage.get(key) || 0;
  ipUsage.set(key, prev + 1);
  // Nettoyage si trop grande
  if (ipUsage.size > 5000) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    for (const [k] of ipUsage) {
      if (k.endsWith(yesterday)) ipUsage.delete(k);
    }
  }
}

export async function rateLimit(req, res, next) {
  const limit = parseInt(process.env.FREE_DAILY_LIMIT || '3');

  // ── Sans base de données : limite par IP en mémoire ──────────────────
  if (!pool) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
    const { key, count } = getIpCount(ip);

    if (count >= limit) {
      return res.status(429).json({
        error: 'Limite journalière atteinte. Passez en Premium pour des générations illimitées.',
        remaining: 0
      });
    }
    res.setHeader('X-Remaining-Generations', String(limit - count - 1));
    req.commitUsage = async () => incrementIp(key);
    return next();
  }

  // ── Utilisateur non connecté : limite par IP en mémoire ──────────────
  if (!req.userId) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
    const { key, count } = getIpCount(ip);

    if (count >= limit) {
      return res.status(429).json({
        error: 'Limite journalière atteinte. Passez en Premium pour des générations illimitées.',
        remaining: 0
      });
    }
    res.setHeader('X-Remaining-Generations', String(limit - count - 1));
    req.commitUsage = async () => incrementIp(key);
    return next();
  }

  // ── Utilisateur connecté : vérification en base de données ───────────
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT is_premium, daily_count, daily_reset FROM users WHERE id = $1',
      [req.userId]
    );
    const user = result.rows[0];

    // Utilisateur introuvable en DB → on le laisse passer librement
    if (!user) {
      res.setHeader('X-Remaining-Generations', String(limit));
      req.commitUsage = async () => {};
      return next();
    }

    if (user.is_premium) {
      res.setHeader('X-Remaining-Generations', 'unlimited');
      req.commitUsage = async () => {
        await pool.query(
          'UPDATE users SET total_generations = COALESCE(total_generations,0) + 1 WHERE id = $1',
          [req.userId]
        );
      };
      return next();
    }

    const userReset = user.daily_reset ? new Date(user.daily_reset).toISOString().split('T')[0] : null;
    const count = userReset === today ? (user.daily_count || 0) : 0;

    if (count >= limit) {
      return res.status(429).json({
        error: 'Limite journalière atteinte. Passez en Premium pour des générations illimitées.',
        remaining: 0
      });
    }

    res.setHeader('X-Remaining-Generations', String(limit - count - 1));
    req.commitUsage = async () => {
      await pool.query(
        `UPDATE users SET daily_count = $1, daily_reset = $2,
             total_generations = COALESCE(total_generations,0) + 1
         WHERE id = $3`,
        [count + 1, today, req.userId]
      );
    };
    next();
  } catch (err) {
    // Erreur DB → on laisse passer plutôt que de bloquer l'utilisateur
    console.warn('rateLimit DB error:', err.message);
    res.setHeader('X-Remaining-Generations', String(limit));
    req.commitUsage = async () => {};
    next();
  }
}
