import pg from 'pg';
const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.query(`
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
      created_at TIMESTAMP DEFAULT NOW()
    )
  `).catch(err => console.error('Erreur init DB:', err.message));

  // Migration : ajouter moneroo_payment_id si la table existe déjà
  pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS moneroo_payment_id VARCHAR(255)
  `).catch(() => {});
}

export default pool;
