
// Este archivo contiene la configuración de la base de datos para conectarse a Supabase

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // requerido por Supabase
});

pool.on('connect', () => {
    console.log('Conectado a la base de datos de Supabase');
});

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL', err);
});

module.exports = pool;