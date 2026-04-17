import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import pool from '../data/db.js';

const router = Router();

const MONEROO_API = 'https://api.moneroo.io/v1';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.MONEROO_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// Vérifier que Moneroo est configuré
function isConfigured() {
  return !!(process.env.MONEROO_API_KEY && process.env.MONEROO_CURRENCY);
}

// ===== PRIX AFFICHÉS CÔTÉ CLIENT =====
router.get('/prices', (req, res) => {
  const currency = process.env.MONEROO_CURRENCY || 'XOF';
  const monthly = parseInt(process.env.MONEROO_PRICE_MONTHLY || '2000');
  const annual = parseInt(process.env.MONEROO_PRICE_ANNUAL || '18000');

  const fmt = (n) => `${n.toLocaleString('fr-FR')} ${currency}`;
  res.json({
    monthly: `${fmt(monthly)} / mois`,
    annual: `${fmt(annual)} / an`,
    currency
  });
});

// ===== CRÉER UN PAIEMENT =====
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Moneroo non configuré.' });
    if (!pool) return res.status(503).json({ error: 'Base de données non configurée.' });

    const { plan } = req.body;
    if (!['monthly', 'annual'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide.' });
    }

    const amount = plan === 'annual'
      ? parseInt(process.env.MONEROO_PRICE_ANNUAL || '18000')
      : parseInt(process.env.MONEROO_PRICE_MONTHLY || '2000');

    const currency = process.env.MONEROO_CURRENCY || 'XOF';
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    const body = {
      amount,
      currency,
      description: `Viral Premium — ${plan === 'annual' ? '12 mois' : '1 mois'}`,
      customer: {
        email: req.userEmail
      },
      return_url: `${origin}/app.html?premium=success`,
      cancel_url: `${origin}/app.html`,
      metadata: {
        userId: String(req.userId),
        plan
      }
    };

    const response = await fetch(`${MONEROO_API}/payments/initialize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Moneroo erreur:', data);
      return res.status(502).json({ error: data?.message || 'Erreur lors de la création du paiement.' });
    }

    const paymentId = data?.data?.id;
    const checkoutUrl = data?.data?.checkout_url;

    if (!paymentId || !checkoutUrl) {
      return res.status(502).json({ error: 'Réponse Moneroo invalide.' });
    }

    res.json({ url: checkoutUrl, paymentId });

  } catch (err) {
    next(err);
  }
});

// ===== VÉRIFIER UN PAIEMENT (appelé côté client après retour) =====
router.get('/verify/:paymentId', requireAuth, async (req, res, next) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Moneroo non configuré.' });

    const { paymentId } = req.params;

    const response = await fetch(`${MONEROO_API}/payments/${paymentId}`, {
      headers: getHeaders()
    });

    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'Impossible de vérifier le paiement.' });

    const payment = data?.data;
    const status = payment?.status;
    const metaUserId = payment?.metadata?.userId;

    // Sécurité : le paiement doit appartenir à l'utilisateur connecté
    if (String(metaUserId) !== String(req.userId)) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    if (status === 'success' && pool) {
      await activatePremium(req.userId, payment.metadata?.plan);
    }

    res.json({ status, isPremium: status === 'success' });

  } catch (err) {
    next(err);
  }
});

// ===== WEBHOOK MONEROO =====
// Monté avec express.json() (pas de raw body nécessaire pour Moneroo)
router.post('/webhook', async (req, res) => {
  try {
    if (!isConfigured() || !pool) return res.status(200).json({ received: true });

    const { id: paymentId, status, metadata } = req.body;

    if (!paymentId || status !== 'success') {
      return res.status(200).json({ received: true });
    }

    // Re-fetch depuis l'API pour confirmer — ne jamais faire confiance au seul webhook
    const response = await fetch(`${MONEROO_API}/payments/${paymentId}`, {
      headers: getHeaders()
    });

    if (!response.ok) return res.status(200).json({ received: true });

    const data = await response.json();
    const payment = data?.data;

    if (payment?.status !== 'success') return res.status(200).json({ received: true });

    const userId = payment.metadata?.userId;
    const plan = payment.metadata?.plan;

    if (userId) {
      await activatePremium(userId, plan);
    }

    res.status(200).json({ received: true });

  } catch (err) {
    console.error('Moneroo webhook erreur:', err.message);
    res.status(200).json({ received: true }); // Toujours 200 pour éviter les re-tentatives
  }
});

// ===== HELPER : activer Premium =====
async function activatePremium(userId, plan) {
  const days = plan === 'annual' ? 365 : 30;
  const premiumUntil = new Date();
  premiumUntil.setDate(premiumUntil.getDate() + days);

  await pool.query(
    'UPDATE users SET is_premium = true, premium_until = $1 WHERE id = $2',
    [premiumUntil, userId]
  ).catch(err => console.error('Activation Premium erreur:', err.message));
}

export default router;
