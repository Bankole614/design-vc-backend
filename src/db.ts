// src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Use the DATABASE_URL from your environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in environment');
}

export const pool = new Pool({
  connectionString,
  // Optional: if your Railway DB requires SSL
  ssl: {
    rejectUnauthorized: false
  }
});
