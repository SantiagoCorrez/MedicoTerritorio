import { config } from 'dotenv';
import { Pool } from 'pg';

config(); // Carga las variables de .env

const pool = new Pool({
  host:     process.env.PGHOST,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port:     Number(process.env.PGPORT), // convierte a número si lo necesitas
});

export default pool;