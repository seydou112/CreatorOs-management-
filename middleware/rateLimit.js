import pool from '../data/db.js';

export async function rateLimit(req, res, next) {
  try {
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT is_premium, daily_count, daily_reset FROM users WHERE id = $1',
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

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

    const limit = parseInt(process.env.FREE_DAILY_LIMIT || '3');
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
        `UPDATE users
         SET daily_count = $1, daily_reset = $2,
             total_generations = COALESCE(total_generations,0) + 1
         WHERE id = $3`,
        [count + 1, today, req.userId]
      );
    };

    next();
  } catch (err) {
    next(err);
  }
}
