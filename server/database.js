const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// determine environment; also require DATABASE_URL for prod
let IS_PRODUCTION = process.env.NODE_ENV === 'production' && !!process.env.DATABASE_URL;

let db;
let pool;

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.warn('⚠️  NODE_ENV=production but DATABASE_URL is not set – falling back to SQLite');
}

// ===== POSTGRESQL (Production) =====
if (IS_PRODUCTION) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.on('error', (err) => {
    console.error('❌ Erreur PostgreSQL:', err);
  });

  initDatabasePG();
}

// ===== SQLITE (Development) =====
else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, '../db/app.db');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Erreur SQLite:', err);
    } else {
      console.log('✅ Connecté à SQLite');
      initDatabaseSQLite();
    }
  });
}

// ===== INITIALISATION POSTGRESQL =====
async function initDatabasePG() {
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

    console.log('✅ Tables PostgreSQL créées');
  } catch (error) {
    console.error('❌ Erreur initialisation PostgreSQL:', error);
  }
}

// ===== INITIALISATION SQLITE =====
function initDatabaseSQLite() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        driver TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ Tables SQLite créées');
  });
}

// ===== FONCTIONS POUR LES DEUX BD =====

function createUser(username, password, callback) {
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (IS_PRODUCTION) {
    pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword],
      (error, result) => {
        if (error) callback(error);
        else callback(null, result.rows[0]);
      }
    );
  } else {
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) callback(err);
        else callback(null, { id: this.lastID, username });
      }
    );
  }
}

function getUserByUsername(username, callback) {
  if (IS_PRODUCTION) {
    pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username],
      (error, result) => {
        if (error) callback(error);
        else callback(null, result.rows[0]);
      }
    );
  } else {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        callback(err, row);
      }
    );
  }
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

function saveAlert(userId, action, driver, callback) {
  if (IS_PRODUCTION) {
    pool.query(
      'INSERT INTO alerts (user_id, action, driver) VALUES ($1, $2, $3) RETURNING id',
      [userId, action, driver],
      (error, result) => {
        if (error) callback(error);
        else callback(null, result.rows[0]);
      }
    );
  } else {
    db.run(
      'INSERT INTO alerts (user_id, action, driver) VALUES (?, ?, ?)',
      [userId, action, driver],
      function(err) {
        if (err) callback(err);
        else callback(null, { id: this.lastID });
      }
    );
  }
}

function getAlertHistory(userId, limit = 50, callback) {
  if (IS_PRODUCTION) {
    pool.query(
      'SELECT * FROM alerts WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, limit],
      (error, result) => {
        if (error) callback(error);
        else callback(null, result.rows);
      }
    );
  } else {
    db.all(
      'SELECT * FROM alerts WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit],
      (err, rows) => {
        callback(err, rows);
      }
    );
  }
}

function resetUserPassword(username, password, callback) {
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (IS_PRODUCTION) {
    pool.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, username],
      (error) => {
        if (error) callback(error);
        else callback(null, { success: true });
      }
    );
  } else {
    db.run(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      (err) => {
        if (err) callback(err);
        else callback(null, { success: true });
      }
    );
  }
}

module.exports = {
  db,
  pool,
  createUser,
  getUserByUsername,
  verifyPassword,
  saveAlert,
  getAlertHistory,
  resetUserPassword
};
