import * as store from '../data/usageStore.js';

function getResetAt() {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return midnight.getTime();
}

function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  return `ip:${ip}`;
}

export function rateLimit(req, res, next) {
  // Bypass premium
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token && process.env.PREMIUM_TOKEN && token === process.env.PREMIUM_TOKEN) {
    res.setHeader('X-Remaining-Generations', 'unlimited');
    return next();
  }

  const limit = parseInt(process.env.FREE_DAILY_LIMIT || '3');
  const key = getClientKey(req);
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: getResetAt() };
  }

  if (entry.count >= limit) {
    const resetAt = new Date(entry.resetAt).toISOString();
    return res.status(429).json({
      error: 'Limite journalière atteinte. Passez en Premium pour des générations illimitées.',
      remaining: 0,
      resetAt
    });
  }

  res.setHeader('X-Remaining-Generations', String(limit - entry.count - 1));

  // Le quota n'est consommé qu'après une génération réussie
  req.commitUsage = () => {
    entry.count += 1;
    store.set(key, entry);
  };

  next();
}
