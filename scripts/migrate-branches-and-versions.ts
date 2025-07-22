// scripts/migrate-branches-and-versions.ts
import { pool } from '../src/db';

async function migrate() {
  try {
    // 1) Branches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✔ branches table');

    // 2) Versions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS versions (
        id SERIAL PRIMARY KEY,
        branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        created_by INTEGER NOT NULL REFERENCES users(id),
        commit_message TEXT NOT NULL,
        file_url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✔ versions table');

    console.log('\n🚀 Branches & Versions migrated successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
