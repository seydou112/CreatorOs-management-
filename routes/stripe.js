import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/authMiddleware.js';
import pool from '../data/db.js';

const router = Router();

function getStripe() {
  return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
}

// Créer une session de paiement Checkout
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: 'Paiement non configuré.' });

    const { plan } = req.body;
    const priceId = plan === 'annual' ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
    if (!priceId) return res.status(503).json({ error: 'Plan de paiement non configuré.' });

    const origin = `${req.protocol}://${req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.userEmail,
      success_url: `${origin}/app.html?premium=success`,
      cancel_url: `${origin}/app.html`,
      metadata: { userId: String(req.userId) }
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Handler webhook (monté avec express.raw dans server.js)
export async function stripeWebhookHandler(req, res) {
  const stripe = getStripe();
  if (!stripe) return res.status(503).end();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return res.status(400).end();
  }

  if (event.type === 'checkout.session.completed' && pool) {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);
      await pool.query(
        'UPDATE users SET is_premium = true, stripe_customer_id = $1, premium_until = $2 WHERE id = $3',
        [session.customer, premiumUntil, userId]
      ).catch(() => {});
    }
  }

  if (event.type === 'customer.subscription.deleted' && pool) {
    await pool.query(
      'UPDATE users SET is_premium = false WHERE stripe_customer_id = $1',
      [event.data.object.customer]
    ).catch(() => {});
  }

  res.json({ received: true });
}

export default router;
