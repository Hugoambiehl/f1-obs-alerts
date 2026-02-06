const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erreur de la base de données:', err);
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        driver VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables créées/vérifiées');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base:', error);
  }
}

// Initialiser au démarrage
initDatabase();

// Fonctions pour les utilisateurs
async function createUser(username, password, callback) {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    callback(null, result.rows[0]);
  } catch (error) {
    callback(error);
  }
}

async function getUserByUsername(username, callback) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    callback(null, result.rows[0]);
  } catch (error) {
    callback(error);
  }
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

// Fonctions pour les alertes
async function saveAlert(userId, action, driver, callback) {
  try {
    const result = await pool.query(
      'INSERT INTO alerts (user_id, action, driver) VALUES ($1, $2, $3) RETURNING id',
      [userId, action, driver]
    );
    callback(null, result.rows[0]);
  } catch (error) {
    callback(error);
  }
}

async function getAlertHistory(userId, limit = 50, callback) {
  try {
    const result = await pool.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, limit]
    );
    callback(null, result.rows);
  } catch (error) {
    callback(error);
  }
}

module.exports = {
  pool,
  createUser,
  getUserByUsername,
  verifyPassword,
  saveAlert,
  getAlertHistory
};
