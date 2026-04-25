import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// Préférer IPv4 pour la résolution DNS (évite les erreurs ENETUNREACH IPv6)
dns.setDefaultResultOrder('ipv4first');

let pool = null;

if (process.env.DATABASE_URL) {
  const candidate = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 10000,
    max: 5
  });

  try {
    await candidate.query('SELECT 1');
    pool = candidate;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_premium BOOLEAN DEFAULT FALSE,
        stripe_customer_id VARCHAR(255),
        moneroo_payment_id VARCHAR(255),
        premium_until TIMESTAMP,
        daily_count INTEGER DEFAULT 0,
        daily_reset DATE DEFAULT CURRENT_DATE,
        total_generations INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS moneroo_payment_id VARCHAR(255)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_generations INTEGER DEFAULT 0`).catch(() => {});

    console.log('✓ Base de données connectée');
  } catch (err) {
    const isIPv6Error = err.message?.includes('ENETUNREACH') || err.message?.includes('IPv6');
    if (isIPv6Error) {
      console.error('⛔ Erreur IPv6 DB — utilisez l\'URL Externe (External Database URL) depuis le dashboard Render → votre base PostgreSQL → Connections → External Database URL');
    } else {
      console.warn('⚠ DB non disponible — mode sans base de données activé:', err.message);
    }
    candidate.end().catch(() => {});
    pool = null;
  }
}

export default pool;
