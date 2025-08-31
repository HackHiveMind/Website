// db.js
const { Pool } = require('pg');

// Configurare conexiune directă (fără .env)
const pool = new Pool({
  user: 'postgres',         // Numele utilizatorului PostgreSQL
  host: 'localhost',        // Adresa serverului (de obicei localhost)
  database: 'website',      // Numele bazei de date
  password: 'soimilor9',    // Parola utilizatorului PostgreSQL
  port: 5432,               // Portul implicit PostgreSQL
});

module.exports = pool;