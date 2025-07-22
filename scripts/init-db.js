"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/init-db.ts
const db_1 = require("../src/db");
async function init() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
    console.log('✔ users table created');
    process.exit(0);
}
init().catch(err => {
    console.error(err);
    process.exit(1);
});
