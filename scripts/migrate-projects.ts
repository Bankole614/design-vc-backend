// scripts/migrate-projects.ts
import { pool } from '../src/db';

async function migrateProjects() {
  try {
    // Plugin sessions (if not already handled)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plugin_sessions (
        email TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL
      );
    `);
    console.log('✔ plugin_sessions table');

    // Projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✔ projects table');

    // Project members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL REFERENCES projects(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'editor',
        joined_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (project_id, user_id)
      );
    `);
    console.log('✔ project_members table');

    console.log('\n🚀 Project-related tables migrated successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrateProjects();
