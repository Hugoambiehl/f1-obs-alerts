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
function createUser(username, password, callback) {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword],
      (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result.rows[0]);
        }
      }
    );
  } catch (error) {
    callback(error);
  }
}

function getUserByUsername(username, callback) {
  pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
    (error, result) => {
      if (error) {
        callback(error);
      } else {
        callback(null, result.rows[0]);
      }
    }
  );
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

// Fonctions pour les alertes
function saveAlert(userId, action, driver, callback) {
  pool.query(
    'INSERT INTO alerts (user_id, action, driver) VALUES ($1, $2, $3) RETURNING id',
    [userId, action, driver],
    (error, result) => {
      if (error) {
        callback(error);
      } else {
        callback(null, result.rows[0]);
      }
    }
  );
}

function getAlertHistory(userId, limit = 50, callback) {
  pool.query(
    'SELECT * FROM alerts WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
    [userId, limit],
    (error, result) => {
      if (error) {
        callback(error);
      } else {
        callback(null, result.rows);
      }
    }
  );
}

module.exports = {
  pool,
  createUser,
  getUserByUsername,
  verifyPassword,
  saveAlert,
  getAlertHistory
};
