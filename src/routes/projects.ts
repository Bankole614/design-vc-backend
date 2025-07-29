// src/routes/projects.ts

import { Router } from 'express';
import { pool } from '../db';

const router = Router();

/**
 * GET /api/projects
 * List projects the authenticated user owns or is a member of.
 */
router.get('/', async (req, res) => {
  const userId = req.user!.userId;

  try {
    const { rows: own } = await pool.query(
      `SELECT id, name, description, created_at
       FROM projects
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const { rows: shared } = await pool.query(
      `SELECT p.id, p.name, p.description, p.created_at
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ own, shared });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/projects
 * Create a new project. Body: { name, description? }
 */
router.post('/', async (req, res) => {
  const userId = req.user!.userId;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // OPTIONAL: check for existing project before insert
    const { rows: existing } = await client.query(
      `SELECT id FROM projects WHERE owner_id = $1 AND name = $2`,
      [userId, name]
    );

    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Project already exists' });
    }

    // Insert project
    const { rows } = await client.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [name, description || null, userId]
    );

    const project = rows[0];

    // Add to project_members table
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, userId]
    );

    await client.query('COMMIT');
    res.status(201).json({ project });

  } catch (err: any) {
    await client.query('ROLLBACK');

    // Handle duplicate key error (PostgreSQL error code: 23505)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Project already exists' });
    }

    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/projects/:id
 * Retrieve a single project by ID (if user has access).
 */
router.get('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const projectId = Number(req.params.id);

  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.description, p.created_at
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id = $2)`,
      [projectId, userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    res.json({ project: rows[0] });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

export default router;
