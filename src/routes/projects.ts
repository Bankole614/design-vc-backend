// src/routes/projects.ts

import { Router } from 'express';
import { pool }   from '../db';

const router = Router();

/**
 * GET /api/projects
 * List projects the authenticated user owns or is a member of.
 */
router.get('/', async (req, res) => {
  const userId = req.user!.userId;

  try {
    // Projects owned by the user
    const { rows: own } = await pool.query(
      `SELECT id, name, description, created_at
       FROM projects
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Projects shared via project_members
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

  try {
    // Insert new project
    const { rows } = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [name, description || null, userId]
    );
    const project = rows[0];

    // Add owner to project_members
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, userId]
    );

    res.status(201).json({ project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
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
    // Check ownership or membership
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
